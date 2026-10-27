#region Using declarations
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Xml.Serialization;
using System.Globalization;
using NinjaTrader.Cbi;
using NinjaTrader.Gui;
using NinjaTrader.Gui.Chart;
using NinjaTrader.Gui.SuperDom;
using NinjaTrader.Gui.Tools;
using NinjaTrader.Data;
using NinjaTrader.NinjaScript;
using NinjaTrader.Core.FloatingPoint;
using NinjaTrader.NinjaScript.Indicators;
using NinjaTrader.NinjaScript.DrawingTools;
using System.Net.Http;
#endregion

//This namespace holds Strategies in this folder and is required. Do not change it.
namespace NinjaTrader.NinjaScript.Strategies
{
	/// <summary>
	/// TradeNot.es Sync for NinjaTrader 8
	/// Automatically syncs all account trades to your TradeNot.es journal
	/// 
	/// Installation:
	/// 1. Open NinjaScript Editor
	/// 2. Right-click in the editor and select "References..."
	/// 3. Click "Add" and add System.Net.Http.dll
	/// 4. Create new Strategy and paste this code
	/// 5. Press F5 to compile
	/// 
	/// Configuration:
	/// 1. Get your API Key from TradeNot.es Import page
	/// 2. Add this strategy to your chart (does not trade, only listens)
	/// 3. Enter your API Key in the strategy parameters
	/// 4. All your trades will be automatically synced to TradeNot.es
	/// </summary>
	public class TradeNotesSync : Strategy
	{
		private static readonly HttpClient httpClient = new HttpClient();
		private object lockObject = new object();
		
		// MFE/MAE Tracking: Track high/low prices during open positions
		private Dictionary<string, PositionTracker> positionTrackers = new Dictionary<string, PositionTracker>();
		
		private class PositionTracker
		{
			public double EntryPrice { get; set; }
			public double HighPrice { get; set; }
			public double LowPrice { get; set; }
			public DateTime EntryTime { get; set; }
			public string Side { get; set; } // "Long" or "Short"
		}

		protected override void OnStateChange()
		{
			if (State == State.SetDefaults)
			{
				Description = @"Automatically syncs ALL account trades to TradeNot.es with MFE/MAE tracking. Install by adding System.Net.Http.dll reference.";
				Name = "TradeNotesSync";
				Calculate = Calculate.OnEachTick; // Changed to OnEachTick for MFE/MAE tracking
				EntriesPerDirection = 1;
				EntryHandling = EntryHandling.AllEntries;
				IsExitOnSessionCloseStrategy = true;
				ExitOnSessionCloseSeconds = 30;
				IsFillLimitOnTouch = false;
				MaximumBarsLookBack = MaximumBarsLookBack.TwoHundredFiftySix;
				OrderFillResolution = OrderFillResolution.Standard;
				Slippage = 0;
				StartBehavior = StartBehavior.WaitUntilFlat;
				TimeInForce = TimeInForce.Gtc;
				TraceOrders = false;
				RealtimeErrorHandling = RealtimeErrorHandling.StopCancelClose;
				StopTargetHandling = StopTargetHandling.PerEntryExecution;
				BarsRequiredToTrade = 20;
				
				// Default values (must be configured by user)
				WebhookUrl = "https://tradenot.es/api/import-trades";
				ApiKey = "YOUR_API_KEY_HERE"; // Get from TradeNot.es Import page
			}
		else if (State == State.Configure)
		{
			// Configuration is done per-request in SendWebhookAsync
		}
			else if (State == State.Realtime)
			{
				// Subscribe to account executions to capture ALL trades (not just strategy trades)
				if (Account != null && Account.Executions != null)
				{
					Account.ExecutionUpdate += OnAccountExecutionUpdate;
					Print("TradeNot.es Sync: Subscribed to account executions (with MFE/MAE tracking)");
				}
			}
			else if (State == State.Terminated)
			{
				// Unsubscribe when strategy is disabled
				if (Account != null)
				{
					Account.ExecutionUpdate -= OnAccountExecutionUpdate;
				}
				positionTrackers.Clear();
			}
		}

		protected override void OnBarUpdate()
		{
			// MFE/MAE Tracking: Update high/low prices for all open positions
			if (State != State.Realtime)
				return;
			
			lock (lockObject)
			{
				foreach (var kvp in positionTrackers)
				{
					var tracker = kvp.Value;
					double currentPrice = Close[0];
					
					if (currentPrice > tracker.HighPrice)
						tracker.HighPrice = currentPrice;
					if (currentPrice < tracker.LowPrice)
						tracker.LowPrice = currentPrice;
				}
			}
		}
		
		protected override void OnMarketData(MarketDataEventArgs marketDataUpdate)
		{
			// More granular MFE/MAE tracking on every tick
			if (marketDataUpdate.MarketDataType != MarketDataType.Last)
				return;
			
			double currentPrice = marketDataUpdate.Price;
			
			lock (lockObject)
			{
				foreach (var kvp in positionTrackers)
				{
					var tracker = kvp.Value;
					
					if (currentPrice > tracker.HighPrice)
						tracker.HighPrice = currentPrice;
					if (currentPrice < tracker.LowPrice)
						tracker.LowPrice = currentPrice;
				}
			}
		}

		private void OnAccountExecutionUpdate(object sender, ExecutionEventArgs e)
		{
			// This captures ALL executions from the account, not just strategy orders
			if (e.Execution == null || e.Execution.Order == null)
				return;

			// Only send on actual fills (not working orders)
			if (e.Execution.Order.OrderState == OrderState.Filled || e.Execution.Order.OrderState == OrderState.PartFilled)
			{
				// Get the ACTUAL account position for this instrument AFTER the execution
				// This is the key fix - we query the real position, not derive it from the action
				MarketPosition actualPosition = MarketPosition.Flat;
				
				try
				{
					// Access the account's positions collection to get the real position
					var instrument = e.Execution.Order.Instrument;
					var account = e.Execution.Order.Account;
					string positionKey = account.Name + "_" + instrument.FullName;
					
					// Get the actual position from the account
					// This reflects the position AFTER the execution has been processed
					if (account != null && account.Positions != null)
					{
						foreach (var position in account.Positions)
						{
							if (position.Instrument == instrument)
							{
								actualPosition = position.MarketPosition;
								break;
							}
						}
					}
					
					// MFE/MAE Tracking Logic
					double highDuringTrade = 0;
					double lowDuringTrade = 0;
					
					if (actualPosition == MarketPosition.Flat)
					{
						// Position closed - get MFE/MAE data and clean up tracker
						lock (lockObject)
						{
							if (positionTrackers.ContainsKey(positionKey))
							{
								var tracker = positionTrackers[positionKey];
								highDuringTrade = tracker.HighPrice;
								lowDuringTrade = tracker.LowPrice;
								positionTrackers.Remove(positionKey);
								Print(string.Format("TradeNot.es MFE/MAE: High={0}, Low={1}", highDuringTrade, lowDuringTrade));
							}
						}
					}
					else
					{
						// Position opened or added to - start or update tracking
						lock (lockObject)
						{
							if (!positionTrackers.ContainsKey(positionKey))
							{
								positionTrackers[positionKey] = new PositionTracker
								{
									EntryPrice = e.Execution.Price,
									HighPrice = e.Execution.Price,
									LowPrice = e.Execution.Price,
									EntryTime = e.Execution.Time,
									Side = actualPosition.ToString()
								};
								Print(string.Format("TradeNot.es: Started MFE/MAE tracking for {0}", positionKey));
							}
						}
					}
					
					Print(string.Format("TradeNot.es: Execution {0} {1}, Actual Position: {2}", 
						e.Execution.Order.OrderAction, 
						instrument.FullName, 
						actualPosition));
					
					// Send webhook asynchronously with MFE/MAE data
					Task.Run(() => SendWebhookAsync(
						e.Execution, 
						e.Execution.Price, 
						e.Execution.Quantity, 
						e.Execution.Time,
						actualPosition,
						highDuringTrade,
						lowDuringTrade
					));
				}
				catch (Exception ex)
				{
					Print("TradeNot.es: Error getting position: " + ex.Message);
					// Fallback: derive from action (less reliable but better than nothing)
					if (e.Execution.Order.OrderAction == OrderAction.Buy || e.Execution.Order.OrderAction == OrderAction.BuyToCover)
						actualPosition = MarketPosition.Long;
					else if (e.Execution.Order.OrderAction == OrderAction.Sell || e.Execution.Order.OrderAction == OrderAction.SellShort)
						actualPosition = MarketPosition.Short;
					
					Task.Run(() => SendWebhookAsync(
						e.Execution, 
						e.Execution.Price, 
						e.Execution.Quantity, 
						e.Execution.Time,
						actualPosition,
						0,
						0
					));
				}
			}
		}

	private string DetectAccountType(string accountName)
	{
		string accName = accountName.ToUpper();
		
		// 1. Simulation (Standard NT8)
		if (accName.StartsWith("SIM") || accName.Contains("REPLAY") || accName.Contains("DEMO") || accName.Contains("PAPER"))
			return "sim";
		
		// 2. Apex Trader Funding
		if (accName.Contains("APEX"))
		{
			if (accName.Contains("PA") || accName.Contains("FUNDED")) return "performance";
			return "evaluation";
		}
		
		// 3. Topstep
		if (accName.Contains("TOPSTEP") || accName.StartsWith("TS"))
		{
			if (accName.Contains("XFA") || accName.Contains("FUNDED") || accName.Contains("PRO")) return "performance";
			return "evaluation";
		}
		
		// 4. Tradeify
		if (accName.Contains("TRADEIFY") || accName.StartsWith("TF"))
		{
			if (accName.Contains("PA") || accName.Contains("FUNDED")) return "performance";
			return "evaluation";
		}
		
		// 5. MyFundedFutures (MFF)
		if (accName.Contains("MFF") || accName.Contains("MYFUNDEDFUTURES"))
		{
			if (accName.Contains("PRO") || accName.Contains("LIVE")) return "performance";
			return "evaluation";
		}
		
		// 6. TakeProfitTrader
		if (accName.Contains("TPT") || accName.Contains("TAKEPROFIT"))
		{
			if (accName.Contains("PRO")) return "performance";
			return "evaluation";
		}
		
		// 7. Bulenox
		if (accName.Contains("BULENOX"))
		{
			if (accName.Contains("MASTER")) return "performance";
			return "evaluation";
		}
		
		// 8. Earn2Trade
		if (accName.Contains("E2T") || accName.Contains("EARN2TRADE"))
		{
			if (accName.Contains("FUNDED") || accName.Contains("GAUNTLET")) return "performance";
			return "evaluation";
		}
		
		// 9. Leeloo Trading
		if (accName.Contains("LEELOO"))
		{
			if (accName.Contains("INVESTOR")) return "performance";
			return "evaluation";
		}
		
		// 10. TradeDay
		if (accName.Contains("TRADEDAY") || accName.StartsWith("TD"))
		{
			if (accName.Contains("FUNDED") || accName.Contains("LIVE")) return "performance";
			return "evaluation";
		}
		
		// 11. Uprofit
		if (accName.Contains("UPROFIT"))
		{
			if (accName.Contains("FUNDED")) return "performance";
			return "evaluation";
		}
		
		// 12. TheTradingPit
		if (accName.Contains("TRADINGPIT") || accName.Contains("TTP"))
		{
			if (accName.Contains("FUNDED")) return "performance";
			return "evaluation";
		}
		
		// Default: Live broker account
		return "live";
	}

	private async Task SendWebhookAsync(Execution execution, double price, int quantity, DateTime time, MarketPosition marketPosition, double highDuringTrade, double lowDuringTrade)
	{
		try 
		{
			string action = execution.Order.OrderAction.ToString(); // "Buy", "Sell", "BuyToCover", "SellShort"
			string instrument = execution.Order.Instrument.FullName;
			string account = execution.Order.Account.Name;
			string accountType = DetectAccountType(account); // Detect account type
			
			// ISO 8601 timestamp format - convert local time to UTC
			string timeStr = time.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture);

			// Build JSON payload with accountType, actual marketPosition, and MFE/MAE data
			// marketPosition now reflects the ACTUAL position after execution:
			// - "Flat" = position was closed (this is an EXIT) → includes highDuringTrade/lowDuringTrade
			// - "Long" = position is long (this is an ENTRY or add-on)
			// - "Short" = position is short (this is an ENTRY or add-on)
			string jsonPayload = string.Format(
				"{{" +
				"\"source\": \"ninjatrader\"," +
				"\"account\": \"{0}\"," +
				"\"instrument\": \"{1}\"," +
				"\"action\": \"{2}\"," +
				"\"quantity\": {3}," +
				"\"price\": {4}," +
				"\"timestamp\": \"{5}\"," +
				"\"executionId\": \"{6}\"," +
				"\"orderId\": \"{7}\"," +
				"\"marketPosition\": \"{8}\"," +
				"\"accountType\": \"{9}\"," +
				"\"highDuringTrade\": {10}," +
				"\"lowDuringTrade\": {11}" +
				"}}",
				account,
				instrument,
				action,
				quantity,
				price.ToString(CultureInfo.InvariantCulture),
				timeStr,
				execution.ExecutionId,
				execution.Order.OrderId,
				marketPosition.ToString(), // Now contains the ACTUAL position: "Flat", "Long", or "Short"
				accountType, // "sim", "evaluation", "performance", or "live"
				highDuringTrade.ToString(CultureInfo.InvariantCulture), // MFE/MAE: Highest price during trade
				lowDuringTrade.ToString(CultureInfo.InvariantCulture)   // MFE/MAE: Lowest price during trade
			);

			var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
			
			// Create request with explicit API key header
			using (var request = new HttpRequestMessage(HttpMethod.Post, WebhookUrl))
			{
				request.Content = content;
				
				// Add API key header for authentication
				if (!string.IsNullOrEmpty(ApiKey) && ApiKey != "YOUR_API_KEY_HERE")
				{
					request.Headers.Add("X-API-Key", ApiKey);
				}
				
				// Send webhook to TradeNot.es
				HttpResponseMessage response = await httpClient.SendAsync(request);
				
				if (!response.IsSuccessStatusCode)
				{
					string errorBody = await response.Content.ReadAsStringAsync();
					Print(string.Format("TradeNot.es Sync Error: {0} - {1}", response.StatusCode, errorBody));
				}
				else 
				{
					string responseBody = await response.Content.ReadAsStringAsync();
					// Include MFE/MAE in log if available
					if (highDuringTrade > 0 || lowDuringTrade > 0)
					{
						Print(string.Format("Trade synced to TradeNot.es: {0} {1} @ {2} (Position: {3}, High: {4}, Low: {5}) - Response: {6}", 
							action, instrument, price, marketPosition, highDuringTrade, lowDuringTrade, responseBody));
					}
					else
					{
						Print(string.Format("Trade synced to TradeNot.es: {0} {1} @ {2} (Position: {3}) - Response: {4}", 
							action, instrument, price, marketPosition, responseBody));
					}
				}
			}
			}
			catch (Exception ex)
			{
				Print("TradeNot.es Sync Exception: " + ex.Message);
			}
		}

		#region Properties
		[NinjaScriptProperty]
		[Display(Name="Webhook URL", Description="The TradeNot.es webhook endpoint (do not change)", Order=1, GroupName="TradeNot.es")]
		public string WebhookUrl { get; set; }

		[NinjaScriptProperty]
		[Display(Name="API Key", Description="Your personal TradeNot.es API Key (get from Import page)", Order=2, GroupName="TradeNot.es")]
		public string ApiKey { get; set; }
		#endregion
	}
}
