export interface Trade {
  id: string;
  symbol: string;
  side: "long" | "short";
  market?: "Stock" | "Futures" | "Crypto" | "Option" | "Forex" | "Index";
  qty: number;
  entryPrice: number;
  exitPrice: number;
  entryTime: string;
  exitTime: string;
  fees: number;
  pnlNet: number;
  r?: number;
  tags: string[];
  setup?: string;
  note?: string;
  screenshotUrl?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  linkedTradeIds: string[];
}

export interface Settings {
  id: string;
  baseCurrency: string;
  timezone: string;
  defaultFees: number;
  setups: string[];
  tags: string[];
}
