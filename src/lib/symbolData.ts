// Standard symbols by market
export const SYMBOL_DATA: Record<string, string[]> = {
  Stock: [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM", "V", "JNJ",
    "WMT", "PG", "MA", "UNH", "HD", "DIS", "BAC", "CSCO", "ADBE", "CRM",
    "NFLX", "INTC", "PFE", "KO", "PEP", "TMO", "ABBV", "NKE", "MRK", "COST"
  ],
  Futures: [
    "ES", "MES", "NQ", "MNQ", "YM", "MYM", "RTY", "M2K",
    "GC", "MGC", "SI", "SIL", "HG", "QC",
    "CL", "MCL", "NG", "QG", "RB", "HO",
    "ZB", "ZN", "ZF", "ZT", "UB",
    "ZC", "ZS", "ZW", "ZL", "ZM",
    "6E", "6B", "6J", "6A", "6C", "6S"
  ],
  Forex: [
    "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
    "EURJPY", "GBPJPY", "EURGBP", "AUDJPY", "EURAUD", "EURCHF", "AUDCAD",
    "GBPAUD", "GBPCAD", "GBPCHF", "CADJPY", "AUDNZD", "NZDJPY"
  ],
  Crypto: [
    "BTCUSD", "ETHUSD", "BNBUSD", "ADAUSD", "SOLUSD", "XRPUSD", "DOTUSD",
    "DOGEUSD", "AVAXUSD", "MATICUSD", "LINKUSD", "UNIUSD", "LTCUSD", "BCHUSD",
    "ATOMUSD", "XLMUSD", "ALGOUSD", "VETUSD", "FILUSD", "TRXUSD"
  ],
  Option: [
    "SPY", "QQQ", "IWM", "AAPL", "TSLA", "AMZN", "NVDA", "META", "GOOGL", "MSFT",
    "AMD", "NFLX", "DIS", "BA", "GE", "F", "AAL", "CCL", "BABA", "NIO"
  ],
  Index: [
    "SPX", "NDX", "DJI", "RUT", "VIX", "DAX", "FTSE", "CAC", "NIKKEI", "HSI",
    "ASX", "KOSPI", "SENSEX", "IBOV", "MEXBOL", "TSX", "AEX", "SMI", "BEL20"
  ]
};

// Fuzzy search implementation
export function fuzzySearch(query: string, text: string): boolean {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes(lowerQuery)) return true;
  
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === lowerQuery.length;
}

// Get symbols for a specific market
export function getSymbolsForMarket(market: string): string[] {
  return SYMBOL_DATA[market] || [];
}
