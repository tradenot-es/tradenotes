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

		protected override void OnStateChange()
		{
			if (State == State.SetDefaults)
			{
				Description = @"Automatically syncs ALL account trades to TradeNot.es. Install by adding System.Net.Http.dll reference.";
				Name = "TradeNotesSync";
				Calculate = Calculate.OnBarClose;
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
				WebhookUrl = "https://REDACTED.supabase.co/functions/v1/import-trades";
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
					Print("TradeNot.es Sync: Subscribed to account executions");
				}
			}
			else if (State == State.Terminated)
			{
				// Unsubscribe when strategy is disabled
				if (Account != null)
				{
					Account.ExecutionUpdate -= OnAccountExecutionUpdate;
				}
			}
		}

		protected override void OnBarUpdate()
		{
			// This strategy does not trade, it only listens to executions
			// OnBarUpdate must be implemented but can be empty
		}

		private void OnAccountExecutionUpdate(object sender, ExecutionEventArgs e)
		{
			// This captures ALL executions from the account, not just strategy orders
			if (e.Execution == null || e.Execution.Order == null)
				return;

			// Only send on actual fills (not working orders)
			if (e.Execution.Order.OrderState == OrderState.Filled || e.Execution.Order.OrderState == OrderState.PartFilled)
			{
				// Determine market position from execution
				MarketPosition marketPosition = MarketPosition.Flat;
				
				// Check if this is an entry or exit based on order action
				if (e.Execution.Order.OrderAction == OrderAction.Buy)
				{
					marketPosition = MarketPosition.Long;
				}
				else if (e.Execution.Order.OrderAction == OrderAction.Sell)
				{
					marketPosition = MarketPosition.Short;
				}
				
				// Send webhook asynchronously to avoid blocking UI
				Task.Run(() => SendWebhookAsync(
					e.Execution, 
					e.Execution.Price, 
					e.Execution.Quantity, 
					e.Execution.Time,
					marketPosition
				));
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

	private async Task SendWebhookAsync(Execution execution, double price, int quantity, DateTime time, MarketPosition marketPosition)
	{
		try 
		{
			string action = execution.Order.OrderAction.ToString(); // "Buy" or "Sell"
			string instrument = execution.Order.Instrument.FullName;
			string account = execution.Order.Account.Name;
			string accountType = DetectAccountType(account); // Detect account type
			
			// ISO 8601 timestamp format - convert local time to UTC
			string timeStr = time.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture);

			// Build JSON payload with accountType
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
				"\"accountType\": \"{9}\"" +
				"}}",
				account,
				instrument,
				action,
				quantity,
				price.ToString(CultureInfo.InvariantCulture),
				timeStr,
				execution.ExecutionId,
				execution.Order.OrderId,
				marketPosition.ToString(),
				accountType // "sim", "evaluation", "performance", or "live"
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
					Print(string.Format("Trade synced to TradeNot.es: {0} {1} @ {2} - Response: {3}", 
						action, instrument, price, responseBody));
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