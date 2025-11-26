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

// Futures point values (value of 1 point movement)
export const FUTURES_POINT_VALUES: Record<string, number> = {
  // Equity Index Futures
  ES: 50,    // E-mini S&P 500
  MES: 5,    // Micro E-mini S&P 500
  NQ: 20,    // E-mini NASDAQ-100
  MNQ: 2,    // Micro E-mini NASDAQ-100
  YM: 5,     // E-mini Dow
  MYM: 0.5,  // Micro E-mini Dow
  RTY: 50,   // E-mini Russell 2000
  M2K: 5,    // Micro E-mini Russell 2000
  
  // Metals
  GC: 100,   // Gold
  MGC: 10,   // Micro Gold
  SI: 5000,  // Silver
  SIL: 1000, // Micro Silver
  HG: 25000, // Copper
  QC: 12500, // E-mini Copper
  
  // Energy
  CL: 1000,  // Crude Oil
  MCL: 100,  // Micro Crude Oil
  NG: 10000, // Natural Gas
  QG: 2500,  // E-mini Natural Gas
  RB: 42000, // RBOB Gasoline
  HO: 42000, // Heating Oil
  
  // Treasury Futures
  ZB: 1000,  // 30-Year T-Bond
  ZN: 1000,  // 10-Year T-Note
  ZF: 1000,  // 5-Year T-Note
  ZT: 2000,  // 2-Year T-Note
  UB: 1000,  // Ultra T-Bond
  
  // Agricultural
  ZC: 50,    // Corn
  ZS: 50,    // Soybeans
  ZW: 50,    // Wheat
  ZL: 600,   // Soybean Oil
  ZM: 100,   // Soybean Meal
  
  // Currency Futures
  "6E": 125000, // Euro FX
  "6B": 62500,  // British Pound
  "6J": 12500000, // Japanese Yen
  "6A": 100000, // Australian Dollar
  "6C": 100000, // Canadian Dollar
  "6S": 125000, // Swiss Franc
};

// Market-specific default fees
export const MARKET_DEFAULT_FEES: Record<string, number> = {
  Stock: 2.00,
  Futures: 2.50,
  Forex: 0.00,
  Crypto: 0.10,
  Option: 1.00,
  Index: 0.00,
};

// Options multiplier (standard contracts)
export const OPTIONS_MULTIPLIER = 100;

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

// Get point value for a futures symbol
export function getFuturesPointValue(symbol: string): number | null {
  return FUTURES_POINT_VALUES[symbol] || null;
}

// Get default fee for a market
export function getMarketDefaultFee(market: string): number {
  return MARKET_DEFAULT_FEES[market] || 2.00;
}

// Detect market from symbol
export function detectMarketFromSymbol(symbol: string): string | null {
  if (!symbol) return null;
  
  const upperSymbol = symbol.toUpperCase();
  
  // Check each market for the symbol
  for (const [market, symbols] of Object.entries(SYMBOL_DATA)) {
    if (symbols.includes(upperSymbol)) {
      return market;
    }
  }
  
  return null;
}

// Get symbol information
export function getSymbolInfo(symbol: string, market: string): {
  pointValue?: number;
  multiplier?: number;
  info?: string;
} {
  const info: any = {};
  
  if (market === "Futures" && FUTURES_POINT_VALUES[symbol]) {
    info.pointValue = FUTURES_POINT_VALUES[symbol];
    info.info = `Point Value: $${info.pointValue}`;
  }
  
  if (market === "Option") {
    info.multiplier = OPTIONS_MULTIPLIER;
    info.info = `Multiplier: ${info.multiplier}`;
  }
  
  return info;
}
