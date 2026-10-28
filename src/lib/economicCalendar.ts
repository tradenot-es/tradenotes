// Static Economic Calendar for 2025-2027
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

// 2025-2027 Economic Calendar
// Sources: Federal Reserve, ECB, BoE, BoJ, OPEC, G7/G20 schedules
export const ECONOMIC_CALENDAR: EconomicEvent[] = [
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
  // EU/UK Events January 2025
  { id: 'eu-hicp-2025-01', date: '2025-01-07', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-01', date: '2025-01-15', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-01', date: '2025-01-17', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q4', date: '2025-01-30', time: '05:00', title: 'EU GDP Q4 (Flash)', category: 'gdp', impact: 'high', description: 'Eurozone GDP flash estimate - Q4 2024' },
  { id: 'uk-gdp-2025-01', date: '2025-01-16', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

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
  // EU/UK Events February 2025
  { id: 'eu-hicp-2025-02', date: '2025-02-03', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-02', date: '2025-02-19', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-02', date: '2025-02-21', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'uk-gdp-2025-02', date: '2025-02-13', time: '02:00', title: 'UK GDP Q4 (Prelim)', category: 'gdp', impact: 'high', description: 'UK GDP preliminary estimate - Q4 2024' },

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
  // EU/UK Events March 2025
  { id: 'eu-hicp-2025-03', date: '2025-03-03', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-03', date: '2025-03-19', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-03', date: '2025-03-21', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q4-2nd', date: '2025-03-07', time: '05:00', title: 'EU GDP Q4 (Second)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP second estimate - Q4 2024' },
  { id: 'uk-gdp-2025-03', date: '2025-03-12', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

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
  // EU/UK Events April 2025
  { id: 'eu-hicp-2025-04', date: '2025-04-01', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-04', date: '2025-04-16', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-04', date: '2025-04-25', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q1', date: '2025-04-30', time: '05:00', title: 'EU GDP Q1 (Flash)', category: 'gdp', impact: 'high', description: 'Eurozone GDP flash estimate - Q1 2025' },
  { id: 'uk-gdp-2025-04', date: '2025-04-11', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

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
  // EU/UK Events May 2025
  { id: 'eu-hicp-2025-05', date: '2025-05-02', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-05', date: '2025-05-21', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-05', date: '2025-05-23', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q1-2nd', date: '2025-05-15', time: '05:00', title: 'EU GDP Q1 (Second)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP second estimate - Q1 2025' },
  { id: 'uk-gdp-2025-q1', date: '2025-05-15', time: '02:00', title: 'UK GDP Q1 (Prelim)', category: 'gdp', impact: 'high', description: 'UK GDP preliminary estimate - Q1 2025' },

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
  // EU/UK Events June 2025
  { id: 'eu-hicp-2025-06', date: '2025-06-03', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-06', date: '2025-06-18', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-06', date: '2025-06-20', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q1-3rd', date: '2025-06-06', time: '05:00', title: 'EU GDP Q1 (Final)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP final estimate - Q1 2025' },
  { id: 'uk-gdp-2025-06', date: '2025-06-11', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

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
  // EU/UK Events July 2025
  { id: 'eu-hicp-2025-07', date: '2025-07-01', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-07', date: '2025-07-16', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-07', date: '2025-07-18', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q2', date: '2025-07-30', time: '05:00', title: 'EU GDP Q2 (Flash)', category: 'gdp', impact: 'high', description: 'Eurozone GDP flash estimate - Q2 2025' },
  { id: 'uk-gdp-2025-q2', date: '2025-07-11', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

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
  // EU/UK Events August 2025
  { id: 'eu-hicp-2025-08', date: '2025-08-01', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-08', date: '2025-08-20', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-08', date: '2025-08-22', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q2-2nd', date: '2025-08-14', time: '05:00', title: 'EU GDP Q2 (Second)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP second estimate - Q2 2025' },
  { id: 'uk-gdp-2025-08', date: '2025-08-13', time: '02:00', title: 'UK GDP Q2 (Prelim)', category: 'gdp', impact: 'high', description: 'UK GDP preliminary estimate - Q2 2025' },

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
  // EU/UK Events September 2025
  { id: 'eu-hicp-2025-09', date: '2025-09-02', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-09', date: '2025-09-17', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-09', date: '2025-09-19', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q2-3rd', date: '2025-09-05', time: '05:00', title: 'EU GDP Q2 (Final)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP final estimate - Q2 2025' },
  { id: 'uk-gdp-2025-09', date: '2025-09-12', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

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
  // EU/UK Events October 2025
  { id: 'eu-hicp-2025-10', date: '2025-10-01', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-10', date: '2025-10-15', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-10', date: '2025-10-17', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q3', date: '2025-10-30', time: '05:00', title: 'EU GDP Q3 (Flash)', category: 'gdp', impact: 'high', description: 'Eurozone GDP flash estimate - Q3 2025' },
  { id: 'uk-gdp-2025-10', date: '2025-10-10', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

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
  // EU/UK Events November 2025
  { id: 'eu-hicp-2025-11', date: '2025-11-03', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-11', date: '2025-11-19', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-11', date: '2025-11-21', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q3-2nd', date: '2025-11-14', time: '05:00', title: 'EU GDP Q3 (Second)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP second estimate - Q3 2025' },
  { id: 'uk-gdp-2025-q3', date: '2025-11-14', time: '02:00', title: 'UK GDP Q3 (Prelim)', category: 'gdp', impact: 'high', description: 'UK GDP preliminary estimate - Q3 2025' },

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
  // EU/UK Events December 2025
  { id: 'eu-hicp-2025-12', date: '2025-12-02', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2025-12', date: '2025-12-17', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2025-12', date: '2025-12-19', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q3-3rd', date: '2025-12-05', time: '05:00', title: 'EU GDP Q3 (Final)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP final estimate - Q3 2025' },
  { id: 'uk-gdp-2025-12', date: '2025-12-12', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },


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
  // EU/UK Events January 2026
  { id: 'eu-hicp-2026-01', date: '2026-01-06', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-01', date: '2026-01-14', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-01', date: '2026-01-16', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q4', date: '2026-01-30', time: '05:00', title: 'EU GDP Q4 (Flash)', category: 'gdp', impact: 'high', description: 'Eurozone GDP flash estimate - Q4 2025' },
  { id: 'uk-gdp-2026-01', date: '2026-01-15', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

  { id: 'boe-2026-02', date: '2026-02-05', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-02', date: '2026-02-06', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-02', date: '2026-02-11', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2026-q4-2nd', date: '2026-02-26', time: '08:30', title: 'US GDP Q4 (Second)', category: 'gdp', impact: 'medium', description: 'Q4 2025 GDP second estimate' },
  { id: 'ism-mfg-2026-02', date: '2026-02-02', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-02', date: '2026-02-04', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-02', date: '2026-02-13', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-02', date: '2026-02-12', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-02', date: '2026-02-27', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },
  // EU/UK Events February 2026
  { id: 'eu-hicp-2026-02', date: '2026-02-03', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-02', date: '2026-02-18', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-02', date: '2026-02-20', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'uk-gdp-2026-q4', date: '2026-02-12', time: '02:00', title: 'UK GDP Q4 (Prelim)', category: 'gdp', impact: 'high', description: 'UK GDP preliminary estimate - Q4 2025' },

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
  // EU/UK Events March 2026
  { id: 'eu-hicp-2026-03', date: '2026-03-03', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-03', date: '2026-03-18', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-03', date: '2026-03-20', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2025-q4-2nd', date: '2026-03-06', time: '05:00', title: 'EU GDP Q4 (Second)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP second estimate - Q4 2025' },
  { id: 'uk-gdp-2026-03', date: '2026-03-11', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

  { id: 'ecb-2026-04', date: '2026-04-16', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'nfp-2026-04', date: '2026-04-03', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-04', date: '2026-04-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'gdp-2026-q1-adv', date: '2026-04-29', time: '08:30', title: 'US GDP Q1 (Advance)', category: 'gdp', impact: 'high', description: 'Q1 2026 GDP first estimate' },
  { id: 'ism-mfg-2026-04', date: '2026-04-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-04', date: '2026-04-03', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-04', date: '2026-04-15', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-04', date: '2026-04-14', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-04', date: '2026-04-24', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },
  // EU/UK Events April 2026
  { id: 'eu-hicp-2026-04', date: '2026-04-01', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-04', date: '2026-04-15', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-04', date: '2026-04-24', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2026-q1', date: '2026-04-30', time: '05:00', title: 'EU GDP Q1 (Flash)', category: 'gdp', impact: 'high', description: 'Eurozone GDP flash estimate - Q1 2026' },
  { id: 'uk-gdp-2026-04', date: '2026-04-10', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

  { id: 'fomc-2026-04', date: '2026-04-29', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'boe-2026-04', date: '2026-04-30', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-05', date: '2026-05-01', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-05', date: '2026-05-12', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'opec-2026-05', date: '2026-05-27', title: 'OPEC+ Meeting', category: 'opec', impact: 'medium', description: 'OPEC+ production decision meeting' },
  { id: 'gdp-2026-q1-2nd', date: '2026-05-28', time: '08:30', title: 'US GDP Q1 (Second)', category: 'gdp', impact: 'medium', description: 'Q1 2026 GDP second estimate' },
  { id: 'ism-mfg-2026-05', date: '2026-05-01', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-05', date: '2026-05-05', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-05', date: '2026-05-14', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-05', date: '2026-05-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-05', date: '2026-05-29', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },
  // EU/UK Events May 2026
  { id: 'eu-hicp-2026-05', date: '2026-05-04', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-05', date: '2026-05-20', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-05', date: '2026-05-22', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2026-q1-2nd', date: '2026-05-15', time: '05:00', title: 'EU GDP Q1 (Second)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP second estimate - Q1 2026' },
  { id: 'uk-gdp-2026-q1', date: '2026-05-14', time: '02:00', title: 'UK GDP Q1 (Prelim)', category: 'gdp', impact: 'high', description: 'UK GDP preliminary estimate - Q1 2026' },

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
  // EU/UK Events June 2026
  { id: 'eu-hicp-2026-06', date: '2026-06-02', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-06', date: '2026-06-17', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-06', date: '2026-06-19', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2026-q1-3rd', date: '2026-06-05', time: '05:00', title: 'EU GDP Q1 (Final)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP final estimate - Q1 2026' },
  { id: 'uk-gdp-2026-06', date: '2026-06-10', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

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
  // EU/UK Events July 2026
  { id: 'eu-hicp-2026-07', date: '2026-07-01', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-07', date: '2026-07-15', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-07', date: '2026-07-17', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2026-q2', date: '2026-07-30', time: '05:00', title: 'EU GDP Q2 (Flash)', category: 'gdp', impact: 'high', description: 'Eurozone GDP flash estimate - Q2 2026' },
  { id: 'uk-gdp-2026-07', date: '2026-07-10', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

  { id: 'boe-2026-07', date: '2026-07-30', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-08', date: '2026-08-07', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-08', date: '2026-08-12', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'jackson-hole-2026', date: '2026-08-27', title: 'Jackson Hole Symposium', category: 'fomc', impact: 'high', description: 'Fed Chair Powell speech at Jackson Hole' },
  { id: 'gdp-2026-q2-2nd', date: '2026-08-27', time: '08:30', title: 'US GDP Q2 (Second)', category: 'gdp', impact: 'medium', description: 'Q2 2026 GDP second estimate' },
  { id: 'ism-mfg-2026-08', date: '2026-08-03', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-08', date: '2026-08-05', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-08', date: '2026-08-14', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-08', date: '2026-08-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-08', date: '2026-08-28', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },
  // EU/UK Events August 2026
  { id: 'eu-hicp-2026-08', date: '2026-08-03', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-08', date: '2026-08-19', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-08', date: '2026-08-21', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2026-q2-2nd', date: '2026-08-14', time: '05:00', title: 'EU GDP Q2 (Second)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP second estimate - Q2 2026' },
  { id: 'uk-gdp-2026-q2', date: '2026-08-12', time: '02:00', title: 'UK GDP Q2 (Prelim)', category: 'gdp', impact: 'high', description: 'UK GDP preliminary estimate - Q2 2026' },

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
  // EU/UK Events September 2026
  { id: 'eu-hicp-2026-09', date: '2026-09-01', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-09', date: '2026-09-16', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-09', date: '2026-09-18', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2026-q2-3rd', date: '2026-09-04', time: '05:00', title: 'EU GDP Q2 (Final)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP final estimate - Q2 2026' },
  { id: 'uk-gdp-2026-09', date: '2026-09-11', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

  { id: 'fomc-2026-10', date: '2026-10-28', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
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
  // EU/UK Events October 2026
  { id: 'eu-hicp-2026-10', date: '2026-10-01', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-10', date: '2026-10-14', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-10', date: '2026-10-16', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2026-q3', date: '2026-10-30', time: '05:00', title: 'EU GDP Q3 (Flash)', category: 'gdp', impact: 'high', description: 'Eurozone GDP flash estimate - Q3 2026' },
  { id: 'uk-gdp-2026-10', date: '2026-10-09', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

  { id: 'us-midterm-2026', date: '2026-11-03', title: 'US Midterm Elections', category: 'election', impact: 'high', description: 'US Congressional midterm elections' },
  { id: 'boe-2026-11', date: '2026-11-05', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2026-11', date: '2026-11-06', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2026-11', date: '2026-11-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'opec-2026-11', date: '2026-11-25', title: 'OPEC+ Meeting', category: 'opec', impact: 'medium', description: 'OPEC+ production decision meeting' },
  { id: 'gdp-2026-q3-2nd', date: '2026-11-25', time: '08:30', title: 'US GDP Q3 (Second)', category: 'gdp', impact: 'medium', description: 'Q3 2026 GDP second estimate' },
  { id: 'ism-mfg-2026-11', date: '2026-11-02', time: '10:00', title: 'ISM Manufacturing PMI', category: 'ism', impact: 'high', description: 'Institute for Supply Management Manufacturing Index' },
  { id: 'ism-svc-2026-11', date: '2026-11-04', time: '10:00', title: 'ISM Services PMI', category: 'ism', impact: 'medium', description: 'Institute for Supply Management Services Index' },
  { id: 'retail-2026-11', date: '2026-11-13', time: '08:30', title: 'US Retail Sales', category: 'retail', impact: 'high', description: 'Monthly retail and food services sales' },
  { id: 'ppi-2026-11', date: '2026-11-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-11', date: '2026-11-25', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },
  // EU/UK Events November 2026
  { id: 'eu-hicp-2026-11', date: '2026-11-02', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-11', date: '2026-11-18', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-11', date: '2026-11-20', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2026-q3-2nd', date: '2026-11-13', time: '05:00', title: 'EU GDP Q3 (Second)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP second estimate - Q3 2026' },
  { id: 'uk-gdp-2026-q3', date: '2026-11-13', time: '02:00', title: 'UK GDP Q3 (Prelim)', category: 'gdp', impact: 'high', description: 'UK GDP preliminary estimate - Q3 2026' },

  { id: 'fomc-2026-12', date: '2026-12-09', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
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
  { id: 'ppi-2026-12', date: '2026-12-15', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'pce-2026-12', date: '2026-12-18', time: '08:30', title: 'PCE Price Index', category: 'pce', impact: 'high', description: "Fed's preferred inflation measure" },
  // EU/UK Events December 2026
  { id: 'eu-hicp-2026-12', date: '2026-12-01', time: '05:00', title: 'EU HICP Inflation (Flash)', category: 'cpi', impact: 'high', description: 'Eurozone Harmonized Index of Consumer Prices - Flash estimate' },
  { id: 'uk-cpi-2026-12', date: '2026-12-16', time: '02:00', title: 'UK CPI Inflation', category: 'cpi', impact: 'high', description: 'UK Consumer Price Index - Key inflation measure' },
  { id: 'uk-retail-2026-12', date: '2026-12-18', time: '02:00', title: 'UK Retail Sales', category: 'retail', impact: 'medium', description: 'UK Monthly retail sales data' },
  { id: 'eu-gdp-2026-q3-3rd', date: '2026-12-04', time: '05:00', title: 'EU GDP Q3 (Final)', category: 'gdp', impact: 'medium', description: 'Eurozone GDP final estimate - Q3 2026' },
  { id: 'uk-gdp-2026-12', date: '2026-12-11', time: '02:00', title: 'UK GDP (Monthly)', category: 'gdp', impact: 'medium', description: 'UK Monthly GDP estimate' },

  // ==================== 2027 EVENTS ====================
  // Only officially published schedules (as of 28.10.2026): FOMC (federalreserve.gov, tentative until the
  // preceding meeting), ECB (ecb.europa.eu), BoE (bankofengland.co.uk), BoJ (boj.or.jp, 31.07.2026),
  // Employment Situation, CPI and PPI (bls.gov/schedule/2027). Other releases follow once their dates are out.

  // --- JANUARY 2027 ---
  { id: 'nfp-2027-01', date: '2027-01-08', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2027-01', date: '2027-01-13', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'ppi-2027-01', date: '2027-01-14', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'boj-2027-01', date: '2027-01-22', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision (second meeting day)' },
  { id: 'fomc-2027-01', date: '2027-01-27', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },

  // --- FEBRUARY 2027 ---
  { id: 'ecb-2027-02', date: '2027-02-04', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boe-2027-02', date: '2027-02-04', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2027-02', date: '2027-02-05', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2027-02', date: '2027-02-11', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'ppi-2027-02', date: '2027-02-12', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },

  // --- MARCH 2027 ---
  { id: 'nfp-2027-03', date: '2027-03-05', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2027-03', date: '2027-03-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'ppi-2027-03', date: '2027-03-12', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'fomc-2027-03', date: '2027-03-17', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2027-03', date: '2027-03-18', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boe-2027-03', date: '2027-03-18', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'boj-2027-03', date: '2027-03-18', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision (second meeting day)' },

  // --- APRIL 2027 ---
  { id: 'nfp-2027-04', date: '2027-04-02', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2027-04', date: '2027-04-13', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'ppi-2027-04', date: '2027-04-14', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'fomc-2027-04', date: '2027-04-28', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'boj-2027-04', date: '2027-04-28', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision (second meeting day)' },
  { id: 'ecb-2027-04', date: '2027-04-29', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boe-2027-04', date: '2027-04-29', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },

  // --- MAY 2027 ---
  { id: 'nfp-2027-05', date: '2027-05-07', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2027-05', date: '2027-05-12', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'ppi-2027-05', date: '2027-05-13', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },

  // --- JUNE 2027 ---
  { id: 'nfp-2027-06', date: '2027-06-04', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'fomc-2027-06', date: '2027-06-09', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2027-06', date: '2027-06-10', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'cpi-2027-06', date: '2027-06-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'boj-2027-06', date: '2027-06-11', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision (second meeting day)' },
  { id: 'ppi-2027-06', date: '2027-06-11', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'boe-2027-06', date: '2027-06-17', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },

  // --- JULY 2027 ---
  { id: 'nfp-2027-07', date: '2027-07-02', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2027-07', date: '2027-07-14', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'ppi-2027-07', date: '2027-07-15', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'ecb-2027-07', date: '2027-07-22', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2027-07', date: '2027-07-22', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision (second meeting day)' },
  { id: 'fomc-2027-07', date: '2027-07-28', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'boe-2027-07', date: '2027-07-29', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },

  // --- AUGUST 2027 ---
  { id: 'nfp-2027-08', date: '2027-08-06', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'ppi-2027-08', date: '2027-08-10', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'cpi-2027-08', date: '2027-08-11', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },

  // --- SEPTEMBER 2027 ---
  { id: 'nfp-2027-09', date: '2027-09-03', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'ecb-2027-09', date: '2027-09-09', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'ppi-2027-09', date: '2027-09-10', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'cpi-2027-09', date: '2027-09-14', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'fomc-2027-09', date: '2027-09-15', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'boe-2027-09', date: '2027-09-16', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'boj-2027-09', date: '2027-09-22', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision (second meeting day)' },

  // --- OCTOBER 2027 ---
  { id: 'nfp-2027-10', date: '2027-10-08', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2027-10', date: '2027-10-14', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'ppi-2027-10', date: '2027-10-15', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'fomc-2027-10', date: '2027-10-27', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'ecb-2027-10', date: '2027-10-28', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boj-2027-10', date: '2027-10-29', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision (second meeting day)' },

  // --- NOVEMBER 2027 ---
  { id: 'boe-2027-11', date: '2027-11-04', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'nfp-2027-11', date: '2027-11-05', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'cpi-2027-11', date: '2027-11-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'ppi-2027-11', date: '2027-11-12', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },

  // --- DECEMBER 2027 ---
  { id: 'nfp-2027-12', date: '2027-12-03', time: '08:30', title: 'US Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - Key employment data' },
  { id: 'fomc-2027-12', date: '2027-12-08', time: '14:00', title: 'FOMC Rate Decision', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision and press conference' },
  { id: 'cpi-2027-12', date: '2027-12-10', time: '08:30', title: 'US CPI Inflation', category: 'cpi', impact: 'high', description: 'Consumer Price Index - Key inflation measure' },
  { id: 'ppi-2027-12', date: '2027-12-15', time: '08:30', title: 'US PPI', category: 'ppi', impact: 'medium', description: 'Producer Price Index - Wholesale inflation' },
  { id: 'ecb-2027-12', date: '2027-12-16', time: '08:15', title: 'ECB Rate Decision', category: 'ecb', impact: 'high', description: 'European Central Bank monetary policy decision' },
  { id: 'boe-2027-12', date: '2027-12-16', time: '07:00', title: 'BoE Rate Decision', category: 'boe', impact: 'high', description: 'Bank of England monetary policy decision' },
  { id: 'boj-2027-12', date: '2027-12-17', title: 'BoJ Rate Decision', category: 'boj', impact: 'high', description: 'Bank of Japan monetary policy decision (second meeting day)' },
];

// Helper function to get events within a date range
export function getEconomicEventsInRange(startDate: Date, endDate: Date): EconomicEvent[] {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  return ECONOMIC_CALENDAR.filter(event => {
    return event.date >= start && event.date <= end;
  });
}

// Helper function to get events for a specific date
export function getEconomicEventsForDate(date: Date): EconomicEvent[] {
  const dateStr = date.toISOString().split('T')[0];
  return ECONOMIC_CALENDAR.filter(event => event.date === dateStr);
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
