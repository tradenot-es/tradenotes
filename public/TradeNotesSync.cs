// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 nevs84 / tradenot.es
// TradeNot.es Sync – NinjaTrader 8 add-on
//
// Sends every fill of every connected account to your TradeNot.es journal. TradeNot.es
// turns the fills into trades (partial fills, scaling in/out and reversals included).
// Runs in the background as soon as NinjaTrader starts; no chart or strategy needed.
//
// Install: download the ZIP from the TradeNot.es import page, then in NinjaTrader
// Control Center → Tools → Import → NinjaScript Add-On. Your API key is already inside.
// Status messages appear in New → NinjaScript Output.
//
// Fills that cannot be sent (no internet) are kept in TradeNotesOutbox.txt in the
// NinjaTrader user folder and sent later. On start the add-on resends the fills of the
// current session; TradeNot.es skips the ones it already has.

#region Using declarations
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using NinjaTrader.Cbi;
using NinjaTrader.Data;
#endregion

namespace NinjaTrader.NinjaScript.AddOns
{
	public class TradeNotesSync : AddOnBase
	{
		// filled in by the TradeNot.es import page when you download the add-on
		private const string ApiKey = "YOUR_API_KEY_HERE";
		private const string Endpoint = "https://tradenot.es/api/import-trades";
		private const string ClientVersion = "2.0";
		private const int BatchSize = 200;

		private static readonly HttpClient http = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };

		private readonly object sync = new object();
		private readonly HashSet<Account> attached = new HashSet<Account>();
		// open position per account + instrument, for the high/low while it is open (MFE/MAE)
		private readonly Dictionary<string, Tracker> trackers = new Dictionary<string, Tracker>();
		private readonly Dictionary<Instrument, MarketData> feeds = new Dictionary<Instrument, MarketData>();
		// JSON objects waiting to be sent
		private readonly List<string> outbox = new List<string>();
		private string outboxPath;
		private Timer flushTimer;
		private int flushing;

		private class Tracker
		{
			public Instrument Instrument;
			public double Net;
			public double High;
			public double Low;
		}

		protected override void OnStateChange()
		{
			if (State == State.SetDefaults)
			{
				Name = "TradeNotesSync";
				Description = "Sends your fills to TradeNot.es";
			}
			else if (State == State.Active)
			{
				ServicePointManager.SecurityProtocol |= SecurityProtocolType.Tls12;
				outboxPath = Path.Combine(NinjaTrader.Core.Globals.UserDataDir, "TradeNotesOutbox.txt");
				LoadOutbox();

				Account.AccountStatusUpdate += OnAccountStatusUpdate;
				List<Account> accounts;
				lock (Account.All)
					accounts = Account.All.ToList();
				foreach (Account account in accounts)
					Attach(account);

				flushTimer = new Timer(_ => Flush(), null, TimeSpan.FromSeconds(5), TimeSpan.FromSeconds(30));
				Log("TradeNot.es Sync " + ClientVersion + " aktiv / active (" + accounts.Count + " Konten / accounts)");
			}
			else if (State == State.Terminated)
			{
				Account.AccountStatusUpdate -= OnAccountStatusUpdate;
				if (flushTimer != null)
					flushTimer.Dispose();
				lock (sync)
				{
					foreach (Account account in attached)
						account.ExecutionUpdate -= OnExecutionUpdate;
					attached.Clear();
					foreach (MarketData feed in feeds.Values)
						feed.Update -= OnMarketData;
					feeds.Clear();
					trackers.Clear();
					SaveOutbox();
				}
			}
		}

		// accounts that connect later (e.g. after a connection loss)
		private void OnAccountStatusUpdate(object sender, AccountStatusEventArgs e)
		{
			if (e.Account != null)
				Attach(e.Account);
		}

		private void Attach(Account account)
		{
			lock (sync)
			{
				if (account == null || attached.Contains(account))
					return;
				attached.Add(account);
			}
			account.ExecutionUpdate += OnExecutionUpdate;

			// positions that are already open: start the high/low from the average price
			lock (account.Positions)
			{
				foreach (Position position in account.Positions)
				{
					if (position.MarketPosition == MarketPosition.Flat)
						continue;
					lock (sync)
						trackers[Key(account, position.Instrument)] = new Tracker
						{
							Instrument = position.Instrument,
							Net = position.MarketPosition == MarketPosition.Long ? position.Quantity : -position.Quantity,
							High = position.AveragePrice,
							Low = position.AveragePrice,
						};
				}
			}
			UpdateFeeds();

			// resend the session's fills; TradeNot.es skips known ones
			List<Execution> executions;
			lock (account.Executions)
				executions = account.Executions.OrderBy(x => x.Time).ToList();
			foreach (Execution execution in executions)
				Enqueue(ToJson(execution, double.NaN, double.NaN));
		}

		private void OnExecutionUpdate(object sender, ExecutionEventArgs e)
		{
			Execution execution = e.Execution;
			if (execution == null || execution.Instrument == null || execution.Account == null || execution.Quantity <= 0)
				return;

			string key = Key(execution.Account, execution.Instrument);
			double signed = execution.MarketPosition == MarketPosition.Long ? execution.Quantity : -execution.Quantity;
			double high, low;
			lock (sync)
			{
				Tracker tracker;
				if (!trackers.TryGetValue(key, out tracker))
				{
					tracker = new Tracker { Instrument = execution.Instrument, Net = 0, High = execution.Price, Low = execution.Price };
					trackers[key] = tracker;
				}
				tracker.High = Math.Max(tracker.High, execution.Price);
				tracker.Low = Math.Min(tracker.Low, execution.Price);
				high = tracker.High;
				low = tracker.Low;

				double before = tracker.Net;
				tracker.Net += signed;
				if (Math.Abs(tracker.Net) < 1e-9)
					trackers.Remove(key);
				else if (Math.Sign(before) != 0 && Math.Sign(before) != Math.Sign(tracker.Net))
				{
					// reversed: the new position starts at this price
					tracker.High = execution.Price;
					tracker.Low = execution.Price;
				}
			}
			UpdateFeeds();
			Enqueue(ToJson(execution, high, low));
		}

		// last-price feed for every instrument with an open position
		private void UpdateFeeds()
		{
			lock (sync)
			{
				HashSet<Instrument> needed = new HashSet<Instrument>(trackers.Values.Select(t => t.Instrument));
				foreach (Instrument instrument in needed)
				{
					if (feeds.ContainsKey(instrument))
						continue;
					MarketData feed = new MarketData(instrument);
					feed.Update += OnMarketData;
					feeds[instrument] = feed;
				}
				foreach (Instrument instrument in feeds.Keys.Where(i => !needed.Contains(i)).ToList())
				{
					feeds[instrument].Update -= OnMarketData;
					feeds.Remove(instrument);
				}
			}
		}

		private void OnMarketData(object sender, MarketDataEventArgs e)
		{
			if (e.MarketDataType != MarketDataType.Last || e.Price <= 0)
				return;
			lock (sync)
			{
				foreach (Tracker tracker in trackers.Values)
				{
					if (tracker.Instrument != e.Instrument)
						continue;
					tracker.High = Math.Max(tracker.High, e.Price);
					tracker.Low = Math.Min(tracker.Low, e.Price);
				}
			}
		}

		private static string Key(Account account, Instrument instrument)
		{
			return account.Name + "|" + instrument.FullName;
		}

		private static string ToJson(Execution execution, double high, double low)
		{
			Instrument instrument = execution.Instrument;
			// execution times are in the time zone set in NinjaTrader's options
			DateTime utc = TimeZoneInfo.ConvertTimeToUtc(
				DateTime.SpecifyKind(execution.Time, DateTimeKind.Unspecified),
				NinjaTrader.Core.Globals.GeneralOptions.TimeZoneInfo);

			StringBuilder json = new StringBuilder("{");
			Field(json, "id", execution.ExecutionId);
			Field(json, "account", execution.Account.Name);
			Field(json, "instrument", instrument.FullName);
			Field(json, "symbol", instrument.MasterInstrument.Name);
			Field(json, "instrumentType", instrument.MasterInstrument.InstrumentType.ToString());
			Field(json, "side", execution.MarketPosition == MarketPosition.Long ? "buy" : "sell");
			Number(json, "qty", execution.Quantity);
			Number(json, "price", execution.Price);
			Field(json, "time", utc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture));
			Number(json, "commission", Math.Abs(execution.Commission));
			Number(json, "pointValue", instrument.MasterInstrument.PointValue);
			if (!double.IsNaN(high))
				Number(json, "high", high);
			if (!double.IsNaN(low))
				Number(json, "low", low);
			json.Length--; // trailing comma
			return json.Append('}').ToString();
		}

		private static void Field(StringBuilder json, string name, string value)
		{
			json.Append('"').Append(name).Append("\":\"");
			foreach (char c in value ?? "")
			{
				if (c == '"' || c == '\\')
					json.Append('\\').Append(c);
				else if (c < ' ')
					json.Append("\\u").Append(((int)c).ToString("x4"));
				else
					json.Append(c);
			}
			json.Append("\",");
		}

		private static void Number(StringBuilder json, string name, double value)
		{
			json.Append('"').Append(name).Append("\":").Append(value.ToString("R", CultureInfo.InvariantCulture)).Append(',');
		}

		private void Enqueue(string json)
		{
			lock (sync)
			{
				outbox.Add(json);
				SaveOutbox();
			}
			ThreadPool.QueueUserWorkItem(_ => Flush());
		}

		// sends the outbox in batches; on failure everything stays for the next try
		private void Flush()
		{
			if (Interlocked.Exchange(ref flushing, 1) == 1)
				return;
			try
			{
				while (true)
				{
					List<string> batch;
					lock (sync)
					{
						if (outbox.Count == 0)
							return;
						batch = outbox.Take(BatchSize).ToList();
					}

					string body = "{\"source\":\"ninjatrader\",\"client\":\"addon-" + ClientVersion + "\",\"executions\":["
						+ string.Join(",", batch) + "]}";
					using (HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, Endpoint))
					{
						request.Headers.Add("X-API-Key", ApiKey);
						request.Content = new StringContent(body, Encoding.UTF8, "application/json");
						HttpResponseMessage response = http.SendAsync(request).Result;
						string answer = response.Content.ReadAsStringAsync().Result;
						if (!response.IsSuccessStatusCode)
						{
							if (response.StatusCode == HttpStatusCode.Unauthorized)
								Log("API-Schlüssel ungültig. Lade das Add-on auf der Import-Seite neu herunter. / Invalid API key, download the add-on again.");
							else
								Log("Fehler / error " + (int)response.StatusCode + ": " + answer);
							if (response.StatusCode != HttpStatusCode.BadRequest)
								return;
							// a batch the server rejects would block the queue forever
						}
						else if (!answer.Contains("\"tradesCreated\":0"))
						{
							Log("Trades an TradeNot.es übertragen / sent: " + answer.Substring(0, Math.Min(answer.Length, 120)));
						}
					}
					lock (sync)
					{
						outbox.RemoveRange(0, Math.Min(batch.Count, outbox.Count));
						SaveOutbox();
					}
				}
			}
			catch (Exception ex)
			{
				Exception inner = ex.InnerException ?? ex;
				Log("Keine Verbindung, neuer Versuch in 30 s / offline, retrying: " + inner.Message);
			}
			finally
			{
				Interlocked.Exchange(ref flushing, 0);
			}
		}

		private void LoadOutbox()
		{
			try
			{
				if (File.Exists(outboxPath))
					lock (sync)
						outbox.AddRange(File.ReadAllLines(outboxPath).Where(l => l.StartsWith("{")));
			}
			catch (Exception ex)
			{
				Log("Outbox nicht lesbar / unreadable: " + ex.Message);
			}
		}

		// caller holds the lock
		private void SaveOutbox()
		{
			try
			{
				File.WriteAllLines(outboxPath, outbox);
			}
			catch (Exception ex)
			{
				Log("Outbox nicht speicherbar / not saved: " + ex.Message);
			}
		}

		private void Log(string message)
		{
			NinjaTrader.Code.Output.Process("TradeNot.es: " + message, PrintTo.OutputTab1);
		}
	}
}
