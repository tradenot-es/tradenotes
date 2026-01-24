// Static Economic Calendar for 2025-2026
// Contains scheduled high-impact events from central banks, economic reports, and global summits

export interface EconomicEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  time?: string; // Optional time in EST
  title: string;
  category: 'fomc' | 'cpi' | 'nfp' | 'gdp' | 'fed_speech' | 'summit' | 'ecb' | 'opec' | 'election' | 'boe' | 'boj' | 'ism' | 'retail' | 'pce' | 'ppi' | 'other';
  impact: 'high' | 'medium' | 'low';
  description: string;
}

// 2025-2026 Economic Calendar
// Sources: Federal Reserve, ECB, BoE, BoJ, OPEC, G7/G20 schedules
export const ECONOMIC_CALENDAR_2025_2026: EconomicEvent[] = [
  // ==================== 2025 EVENTS ====================
  
  // --- JANUARY 2025 ---
  { id: 'fomc-2025-01', date: '2025-01-29', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and statement' },
  { id: 'ecb-2025-01', date: '2025-01-30', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'nfp-2025-01', date: '2025-01-10', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-01', date: '2025-01-15', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2025-q4-adv', date: '2025-01-30', time: '08:30', title: 'US GDP Q4 (Advance)', category: 'gdp', impact: 'high', description: 'Q4 2024 GDP first estimate' },
  { id: 'davos-2025', date: '2025-01-20', title: 'WEF Davos 2025', category: 'summit', impact: 'medium', description: 'World Economic Forum Annual Meeting' },
  { id: 'ism-mfg-2025-01', date: '2025-01-03', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-01', date: '2025-01-07', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-01', date: '2025-01-16', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-01', date: '2025-01-14', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-01', date: '2025-01-31', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- FEBRUARY 2025 ---
  { id: 'boe-2025-02', date: '2025-02-06', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2025-02', date: '2025-02-07', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-02', date: '2025-02-12', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'ism-mfg-2025-02', date: '2025-02-03', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-02', date: '2025-02-05', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-02', date: '2025-02-14', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-02', date: '2025-02-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-02', date: '2025-02-28', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },
  { id: 'gdp-2025-q4-2nd', date: '2025-02-27', time: '08:30', title: 'US GDP Q4 (Second)', category: 'gdp', impact: 'medium', description: 'Q4 2024 GDP second estimate' },

  // --- MARCH 2025 ---
  { id: 'fomc-2025-03', date: '2025-03-19', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2025-03', date: '2025-03-06', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2025-03', date: '2025-03-14', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'boe-2025-03', date: '2025-03-20', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2025-03', date: '2025-03-07', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-03', date: '2025-03-12', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'opec-2025-03', date: '2025-03-01', title: 'OPEC+ Meeting', category: 'opec', impact: 'medium', description: 'OPEC+ production decision meeting' },
  { id: 'gdp-2025-q4-3rd', date: '2025-03-27', time: '08:30', title: 'US GDP Q4 (Final)', category: 'gdp', impact: 'medium', description: 'Q4 2024 GDP final estimate' },
  { id: 'ism-mfg-2025-03', date: '2025-03-03', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-03', date: '2025-03-05', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-03', date: '2025-03-14', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-03', date: '2025-03-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-03', date: '2025-03-28', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- APRIL 2025 ---
  { id: 'ecb-2025-04', date: '2025-04-17', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'nfp-2025-04', date: '2025-04-04', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-04', date: '2025-04-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2025-q1-adv', date: '2025-04-30', time: '08:30', title: 'US GDP Q1 (Advance)', category: 'gdp', impact: 'high', description: 'Q1 2025 GDP first estimate' },
  { id: 'ism-mfg-2025-04', date: '2025-04-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-04', date: '2025-04-03', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-04', date: '2025-04-15', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-04', date: '2025-04-11', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-04', date: '2025-04-25', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- MAY 2025 ---
  { id: 'fomc-2025-05', date: '2025-05-07', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'boe-2025-05', date: '2025-05-08', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2025-05', date: '2025-05-02', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-05', date: '2025-05-13', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'opec-2025-05', date: '2025-05-28', title: 'OPEC+ Meeting', category: 'opec', impact: 'medium', description: 'OPEC+ production decision meeting' },
  { id: 'gdp-2025-q1-2nd', date: '2025-05-29', time: '08:30', title: 'US GDP Q1 (Second)', category: 'gdp', impact: 'medium', description: 'Q1 2025 GDP second estimate' },
  { id: 'ism-mfg-2025-05', date: '2025-05-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-05', date: '2025-05-05', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-05', date: '2025-05-15', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-05', date: '2025-05-14', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-05', date: '2025-05-30', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- JUNE 2025 ---
  { id: 'fomc-2025-06', date: '2025-06-18', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2025-06', date: '2025-06-05', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2025-06', date: '2025-06-13', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'boe-2025-06', date: '2025-06-19', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2025-06', date: '2025-06-06', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-06', date: '2025-06-11', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'g7-2025', date: '2025-06-15', title: 'G7 Summit', category: 'summit', impact: 'medium', description: 'G7 Leaders Summit - Canada' },
  { id: 'gdp-2025-q1-3rd', date: '2025-06-26', time: '08:30', title: 'US GDP Q1 (Final)', category: 'gdp', impact: 'medium', description: 'Q1 2025 GDP final estimate' },
  { id: 'ism-mfg-2025-06', date: '2025-06-02', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-06', date: '2025-06-04', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-06', date: '2025-06-17', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-06', date: '2025-06-12', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-06', date: '2025-06-27', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- JULY 2025 ---
  { id: 'fomc-2025-07', date: '2025-07-30', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2025-07', date: '2025-07-24', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2025-07', date: '2025-07-31', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'nfp-2025-07', date: '2025-07-03', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-07', date: '2025-07-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2025-q2-adv', date: '2025-07-30', time: '08:30', title: 'US GDP Q2 (Advance)', category: 'gdp', impact: 'high', description: 'Q2 2025 GDP first estimate' },
  { id: 'ism-mfg-2025-07', date: '2025-07-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-07', date: '2025-07-03', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-07', date: '2025-07-16', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-07', date: '2025-07-15', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-07', date: '2025-07-25', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- AUGUST 2025 ---
  { id: 'boe-2025-08', date: '2025-08-07', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2025-08', date: '2025-08-01', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-08', date: '2025-08-13', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'jackson-hole-2025', date: '2025-08-21', title: 'Jackson Hole Symposium', category: 'fomc', impact: 'high', description: 'Fed Chair Powell speech at Jackson Hole' },
  { id: 'gdp-2025-q2-2nd', date: '2025-08-28', time: '08:30', title: 'US GDP Q2 (Second)', category: 'gdp', impact: 'medium', description: 'Q2 2025 GDP second estimate' },
  { id: 'ism-mfg-2025-08', date: '2025-08-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-08', date: '2025-08-05', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-08', date: '2025-08-14', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-08', date: '2025-08-12', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-08', date: '2025-08-29', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- SEPTEMBER 2025 ---
  { id: 'fomc-2025-09', date: '2025-09-17', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2025-09', date: '2025-09-11', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2025-09', date: '2025-09-19', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'boe-2025-09', date: '2025-09-18', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2025-09', date: '2025-09-05', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-09', date: '2025-09-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'un-ga-2025', date: '2025-09-16', title: 'UN General Assembly', category: 'summit', impact: 'medium', description: 'United Nations General Assembly - New York' },
  { id: 'gdp-2025-q2-3rd', date: '2025-09-25', time: '08:30', title: 'US GDP Q2 (Final)', category: 'gdp', impact: 'medium', description: 'Q2 2025 GDP final estimate' },
  { id: 'ism-mfg-2025-09', date: '2025-09-02', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-09', date: '2025-09-04', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-09', date: '2025-09-16', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-09', date: '2025-09-11', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-09', date: '2025-09-26', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- OCTOBER 2025 ---
  { id: 'ecb-2025-10', date: '2025-10-30', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2025-10', date: '2025-10-31', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'nfp-2025-10', date: '2025-10-03', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-10', date: '2025-10-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2025-q3-adv', date: '2025-10-30', time: '08:30', title: 'US GDP Q3 (Advance)', category: 'gdp', impact: 'high', description: 'Q3 2025 GDP first estimate' },
  { id: 'ism-mfg-2025-10', date: '2025-10-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-10', date: '2025-10-03', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-10', date: '2025-10-16', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-10', date: '2025-10-14', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-10', date: '2025-10-31', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- NOVEMBER 2025 ---
  { id: 'fomc-2025-11', date: '2025-11-05', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'boe-2025-11', date: '2025-11-06', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2025-11', date: '2025-11-07', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-11', date: '2025-11-12', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'g20-2025', date: '2025-11-15', title: 'G20 Summit', category: 'summit', impact: 'medium', description: 'G20 Leaders Summit - South Africa' },
  { id: 'opec-2025-11', date: '2025-11-26', title: 'OPEC+ Meeting', category: 'opec', impact: 'medium', description: 'OPEC+ production decision meeting' },
  { id: 'gdp-2025-q3-2nd', date: '2025-11-26', time: '08:30', title: 'US GDP Q3 (Second)', category: 'gdp', impact: 'medium', description: 'Q3 2025 GDP second estimate' },
  { id: 'ism-mfg-2025-11', date: '2025-11-03', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-11', date: '2025-11-05', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-11', date: '2025-11-14', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-11', date: '2025-11-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-11', date: '2025-11-26', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- DECEMBER 2025 ---
  { id: 'fomc-2025-12', date: '2025-12-17', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2025-12', date: '2025-12-18', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2025-12', date: '2025-12-19', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'boe-2025-12', date: '2025-12-18', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2025-12', date: '2025-12-05', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2025-12', date: '2025-12-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'opec-2025-12', date: '2025-12-04', title: 'OPEC+ Meeting', category: 'opec', impact: 'medium', description: 'OPEC+ year-end production meeting' },
  { id: 'gdp-2025-q3-3rd', date: '2025-12-23', time: '08:30', title: 'US GDP Q3 (Final)', category: 'gdp', impact: 'medium', description: 'Q3 2025 GDP final estimate' },
  { id: 'ism-mfg-2025-12', date: '2025-12-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2025-12', date: '2025-12-03', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2025-12', date: '2025-12-16', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2025-12', date: '2025-12-11', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2025-12', date: '2025-12-19', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // ==================== 2026 EVENTS ====================

  // --- JANUARY 2026 ---
  { id: 'fomc-2026-01', date: '2026-01-28', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and statement' },
  { id: 'ecb-2026-01', date: '2026-01-22', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'nfp-2026-01', date: '2026-01-09', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-01', date: '2026-01-14', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2026-q4-adv', date: '2026-01-29', time: '08:30', title: 'US GDP Q4 (Advance)', category: 'gdp', impact: 'high', description: 'Q4 2025 GDP first estimate' },
  { id: 'davos-2026', date: '2026-01-19', title: 'WEF Davos 2026', category: 'summit', impact: 'medium', description: 'World Economic Forum Annual Meeting' },
  { id: 'ism-mfg-2026-01', date: '2026-01-05', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-01', date: '2026-01-07', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-01', date: '2026-01-15', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-01', date: '2026-01-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-01', date: '2026-01-30', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- FEBRUARY 2026 ---
  { id: 'boe-2026-02', date: '2026-02-05', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-02', date: '2026-02-06', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-02', date: '2026-02-11', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2026-q4-2nd', date: '2026-02-26', time: '08:30', title: 'US GDP Q4 (Second)', category: 'gdp', impact: 'medium', description: 'Q4 2025 GDP second estimate' },
  { id: 'ism-mfg-2026-02', date: '2026-02-02', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-02', date: '2026-02-04', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-02', date: '2026-02-13', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-02', date: '2026-02-12', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-02', date: '2026-02-27', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- MARCH 2026 ---
  { id: 'fomc-2026-03', date: '2026-03-18', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2026-03', date: '2026-03-05', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2026-03', date: '2026-03-13', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'boe-2026-03', date: '2026-03-19', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-03', date: '2026-03-06', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-03', date: '2026-03-11', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'opec-2026-03', date: '2026-03-01', title: 'OPEC+ Meeting', category: 'opec', impact: 'medium', description: 'OPEC+ production decision meeting' },
  { id: 'gdp-2026-q4-3rd', date: '2026-03-26', time: '08:30', title: 'US GDP Q4 (Final)', category: 'gdp', impact: 'medium', description: 'Q4 2025 GDP final estimate' },
  { id: 'ism-mfg-2026-03', date: '2026-03-02', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-03', date: '2026-03-04', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-03', date: '2026-03-13', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-03', date: '2026-03-12', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-03', date: '2026-03-27', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- APRIL 2026 ---
  { id: 'ecb-2026-04', date: '2026-04-16', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'nfp-2026-04', date: '2026-04-03', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-04', date: '2026-04-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2026-q1-adv', date: '2026-04-29', time: '08:30', title: 'US GDP Q1 (Advance)', category: 'gdp', impact: 'high', description: 'Q1 2026 GDP first estimate' },
  { id: 'ism-mfg-2026-04', date: '2026-04-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-04', date: '2026-04-03', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-04', date: '2026-04-15', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-04', date: '2026-04-14', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-04', date: '2026-04-24', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- MAY 2026 ---
  { id: 'fomc-2026-05', date: '2026-05-06', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'boe-2026-05', date: '2026-05-07', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-05', date: '2026-05-01', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-05', date: '2026-05-12', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'opec-2026-05', date: '2026-05-27', title: 'OPEC+ Meeting', category: 'opec', impact: 'medium', description: 'OPEC+ production decision meeting' },
  { id: 'gdp-2026-q1-2nd', date: '2026-05-28', time: '08:30', title: 'US GDP Q1 (Second)', category: 'gdp', impact: 'medium', description: 'Q1 2026 GDP second estimate' },
  { id: 'ism-mfg-2026-05', date: '2026-05-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-05', date: '2026-05-05', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-05', date: '2026-05-14', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-05', date: '2026-05-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-05', date: '2026-05-29', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- JUNE 2026 ---
  { id: 'fomc-2026-06', date: '2026-06-17', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2026-06', date: '2026-06-04', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2026-06', date: '2026-06-12', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'boe-2026-06', date: '2026-06-18', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-06', date: '2026-06-05', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-06', date: '2026-06-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'g7-2026', date: '2026-06-13', title: 'G7 Summit', category: 'summit', impact: 'medium', description: 'G7 Leaders Summit - Italy' },
  { id: 'gdp-2026-q1-3rd', date: '2026-06-25', time: '08:30', title: 'US GDP Q1 (Final)', category: 'gdp', impact: 'medium', description: 'Q1 2026 GDP final estimate' },
  { id: 'ism-mfg-2026-06', date: '2026-06-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-06', date: '2026-06-03', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-06', date: '2026-06-16', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-06', date: '2026-06-11', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-06', date: '2026-06-26', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- JULY 2026 ---
  { id: 'fomc-2026-07', date: '2026-07-29', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2026-07', date: '2026-07-23', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2026-07', date: '2026-07-17', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'nfp-2026-07', date: '2026-07-02', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-07', date: '2026-07-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2026-q2-adv', date: '2026-07-30', time: '08:30', title: 'US GDP Q2 (Advance)', category: 'gdp', impact: 'high', description: 'Q2 2026 GDP first estimate' },
  { id: 'ism-mfg-2026-07', date: '2026-07-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-07', date: '2026-07-06', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-07', date: '2026-07-15', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-07', date: '2026-07-14', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-07', date: '2026-07-31', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- AUGUST 2026 ---
  { id: 'boe-2026-08', date: '2026-08-06', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-08', date: '2026-08-07', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-08', date: '2026-08-12', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'jackson-hole-2026', date: '2026-08-27', title: 'Jackson Hole Symposium', category: 'fomc', impact: 'high', description: 'Fed Chair Powell speech at Jackson Hole' },
  { id: 'gdp-2026-q2-2nd', date: '2026-08-27', time: '08:30', title: 'US GDP Q2 (Second)', category: 'gdp', impact: 'medium', description: 'Q2 2026 GDP second estimate' },
  { id: 'ism-mfg-2026-08', date: '2026-08-03', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-08', date: '2026-08-05', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-08', date: '2026-08-14', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-08', date: '2026-08-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-08', date: '2026-08-28', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- SEPTEMBER 2026 ---
  { id: 'fomc-2026-09', date: '2026-09-16', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2026-09', date: '2026-09-10', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2026-09', date: '2026-09-18', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'boe-2026-09', date: '2026-09-17', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-09', date: '2026-09-04', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-09', date: '2026-09-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'un-ga-2026', date: '2026-09-15', title: 'UN General Assembly', category: 'summit', impact: 'medium', description: 'United Nations General Assembly - New York' },
  { id: 'gdp-2026-q2-3rd', date: '2026-09-24', time: '08:30', title: 'US GDP Q2 (Final)', category: 'gdp', impact: 'medium', description: 'Q2 2026 GDP final estimate' },
  { id: 'ism-mfg-2026-09', date: '2026-09-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-09', date: '2026-09-03', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-09', date: '2026-09-15', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-09', date: '2026-09-11', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-09', date: '2026-09-25', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- OCTOBER 2026 ---
  { id: 'ecb-2026-10', date: '2026-10-29', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2026-10', date: '2026-10-30', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'nfp-2026-10', date: '2026-10-02', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-10', date: '2026-10-14', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2026-q3-adv', date: '2026-10-29', time: '08:30', title: 'US GDP Q3 (Advance)', category: 'gdp', impact: 'high', description: 'Q3 2026 GDP first estimate' },
  { id: 'ism-mfg-2026-10', date: '2026-10-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-10', date: '2026-10-05', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-10', date: '2026-10-15', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-10', date: '2026-10-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-10', date: '2026-10-30', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- NOVEMBER 2026 ---
  { id: 'fomc-2026-11', date: '2026-11-04', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'us-midterm-2026', date: '2026-11-03', title: 'US Midterm Elections', category: 'election', impact: 'high', description: 'US Congressional midterm elections' },
  { id: 'boe-2026-11', date: '2026-11-05', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-11', date: '2026-11-06', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-11', date: '2026-11-12', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'g20-2026', date: '2026-11-21', title: 'G20 Summit', category: 'summit', impact: 'medium', description: 'G20 Leaders Summit - Brazil' },
  { id: 'opec-2026-11', date: '2026-11-25', title: 'OPEC+ Meeting', category: 'opec', impact: 'medium', description: 'OPEC+ production decision meeting' },
  { id: 'gdp-2026-q3-2nd', date: '2026-11-25', time: '08:30', title: 'US GDP Q3 (Second)', category: 'gdp', impact: 'medium', description: 'Q3 2026 GDP second estimate' },
  { id: 'ism-mfg-2026-11', date: '2026-11-02', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-11', date: '2026-11-04', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-11', date: '2026-11-13', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-11', date: '2026-11-12', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-11', date: '2026-11-25', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },

  // --- DECEMBER 2026 ---
  { id: 'fomc-2026-12', date: '2026-12-16', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2026-12', date: '2026-12-17', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2026-12', date: '2026-12-18', time: '03:00', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision' },
  { id: 'boe-2026-12', date: '2026-12-17', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-12', date: '2026-12-04', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-12', date: '2026-12-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'opec-2026-12', date: '2026-12-03', title: 'OPEC+ Meeting', category: 'opec', impact: 'medium', description: 'OPEC+ year-end production meeting' },
  { id: 'gdp-2026-q3-3rd', date: '2026-12-22', time: '08:30', title: 'US GDP Q3 (Final)', category: 'gdp', impact: 'medium', description: 'Q3 2026 GDP final estimate' },
  { id: 'ism-mfg-2026-12', date: '2026-12-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-12', date: '2026-12-03', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-12', date: '2026-12-15', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-12', date: '2026-12-10', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-12', date: '2026-12-18', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },
];

// Helper function to get events within a date range
export function getEconomicEventsInRange(startDate: Date, endDate: Date): EconomicEvent[] {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  return ECONOMIC_CALENDAR_2025_2026.filter(event => {
    return event.date >= start && event.date <= end;
  });
}

// Helper function to get events for a specific date
export function getEconomicEventsForDate(date: Date): EconomicEvent[] {
  const dateStr = date.toISOString().split('T')[0];
  return ECONOMIC_CALENDAR_2025_2026.filter(event => event.date === dateStr);
}

// Category icons for UI display
export function getCategoryIcon(category: EconomicEvent['category']): string {
  const icons: Record<EconomicEvent['category'], string> = {
    fomc: '🏛️',
    cpi: '📊',
    nfp: '👥',
    gdp: '📈',
    fed_speech: '🎤',
    summit: '🌍',
    ecb: '🇪🇺',
    opec: '🛢️',
    election: '🗳️',
    boe: '🇬🇧',
    boj: '🇯🇵',
    ism: '🏭',
    retail: '🛒',
    pce: '💲',
    ppi: '🏭',
    other: '📅'
  };
  return icons[category] || '📅';
}

// Category labels for UI display
export function getCategoryLabel(category: EconomicEvent['category']): string {
  const labels: Record<EconomicEvent['category'], string> = {
    fomc: 'FOMC',
    cpi: 'CPI',
    nfp: 'Jobs Report',
    gdp: 'GDP',
    fed_speech: 'Fed Speech',
    summit: 'Summit',
    ecb: 'ECB',
    opec: 'OPEC+',
    election: 'Election',
    boe: 'Bank of England',
    boj: 'Bank of Japan',
    ism: 'ISM PMI',
    retail: 'Retail Sales',
    pce: 'PCE Inflation',
    ppi: 'Producer Prices',
    other: 'Other'
  };
  return labels[category] || 'Other';
}
