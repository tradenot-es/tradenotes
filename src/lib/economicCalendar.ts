export interface EconomicEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM EST
  title: string;
  category: 'fomc' | 'cpi' | 'nfp' | 'gdp' | 'fed_speech' | 'summit' | 'other';
  impact: 'high' | 'medium' | 'low';
  description: string;
}

// Economic Calendar 2025-2026
// Sources: Federal Reserve, BLS, BEA official schedules
export const ECONOMIC_CALENDAR_2025_2026: EconomicEvent[] = [
  // ========== FOMC Meetings 2025 ==========
  { id: 'fomc-jan-2025', date: '2025-01-29', time: '14:00', title: 'FOMC Meeting', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision' },
  { id: 'fomc-mar-2025', date: '2025-03-19', time: '14:00', title: 'FOMC Meeting + Projections', category: 'fomc', impact: 'high', description: 'Fed rate decision with economic projections (SEP)' },
  { id: 'fomc-may-2025', date: '2025-05-07', time: '14:00', title: 'FOMC Meeting', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision' },
  { id: 'fomc-jun-2025', date: '2025-06-18', time: '14:00', title: 'FOMC Meeting + Projections', category: 'fomc', impact: 'high', description: 'Fed rate decision with economic projections (SEP)' },
  { id: 'fomc-jul-2025', date: '2025-07-30', time: '14:00', title: 'FOMC Meeting', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision' },
  { id: 'fomc-sep-2025', date: '2025-09-17', time: '14:00', title: 'FOMC Meeting + Projections', category: 'fomc', impact: 'high', description: 'Fed rate decision with economic projections (SEP)' },
  { id: 'fomc-nov-2025', date: '2025-11-05', time: '14:00', title: 'FOMC Meeting', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision' },
  { id: 'fomc-dec-2025', date: '2025-12-17', time: '14:00', title: 'FOMC Meeting + Projections', category: 'fomc', impact: 'high', description: 'Fed rate decision with economic projections (SEP)' },
  
  // ========== FOMC Meetings 2026 (Tentative) ==========
  { id: 'fomc-jan-2026', date: '2026-01-28', time: '14:00', title: 'FOMC Meeting', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision' },
  { id: 'fomc-mar-2026', date: '2026-03-18', time: '14:00', title: 'FOMC Meeting + Projections', category: 'fomc', impact: 'high', description: 'Fed rate decision with economic projections (SEP)' },
  { id: 'fomc-may-2026', date: '2026-05-06', time: '14:00', title: 'FOMC Meeting', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision' },
  { id: 'fomc-jun-2026', date: '2026-06-17', time: '14:00', title: 'FOMC Meeting + Projections', category: 'fomc', impact: 'high', description: 'Fed rate decision with economic projections (SEP)' },
  { id: 'fomc-jul-2026', date: '2026-07-29', time: '14:00', title: 'FOMC Meeting', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision' },
  { id: 'fomc-sep-2026', date: '2026-09-16', time: '14:00', title: 'FOMC Meeting + Projections', category: 'fomc', impact: 'high', description: 'Fed rate decision with economic projections (SEP)' },
  { id: 'fomc-nov-2026', date: '2026-11-04', time: '14:00', title: 'FOMC Meeting', category: 'fomc', impact: 'high', description: 'Federal Reserve interest rate decision' },
  { id: 'fomc-dec-2026', date: '2026-12-16', time: '14:00', title: 'FOMC Meeting + Projections', category: 'fomc', impact: 'high', description: 'Fed rate decision with economic projections (SEP)' },

  // ========== CPI Reports 2025 (Released ~10th-15th of each month) ==========
  { id: 'cpi-jan-2025', date: '2025-01-15', time: '08:30', title: 'CPI Report (Dec)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - December 2024 data' },
  { id: 'cpi-feb-2025', date: '2025-02-12', time: '08:30', title: 'CPI Report (Jan)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - January 2025 data' },
  { id: 'cpi-mar-2025', date: '2025-03-12', time: '08:30', title: 'CPI Report (Feb)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - February 2025 data' },
  { id: 'cpi-apr-2025', date: '2025-04-10', time: '08:30', title: 'CPI Report (Mar)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - March 2025 data' },
  { id: 'cpi-may-2025', date: '2025-05-13', time: '08:30', title: 'CPI Report (Apr)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - April 2025 data' },
  { id: 'cpi-jun-2025', date: '2025-06-11', time: '08:30', title: 'CPI Report (May)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - May 2025 data' },
  { id: 'cpi-jul-2025', date: '2025-07-11', time: '08:30', title: 'CPI Report (Jun)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - June 2025 data' },
  { id: 'cpi-aug-2025', date: '2025-08-13', time: '08:30', title: 'CPI Report (Jul)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - July 2025 data' },
  { id: 'cpi-sep-2025', date: '2025-09-11', time: '08:30', title: 'CPI Report (Aug)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - August 2025 data' },
  { id: 'cpi-oct-2025', date: '2025-10-10', time: '08:30', title: 'CPI Report (Sep)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - September 2025 data' },
  { id: 'cpi-nov-2025', date: '2025-11-13', time: '08:30', title: 'CPI Report (Oct)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - October 2025 data' },
  { id: 'cpi-dec-2025', date: '2025-12-10', time: '08:30', title: 'CPI Report (Nov)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - November 2025 data' },

  // ========== CPI Reports 2026 ==========
  { id: 'cpi-jan-2026', date: '2026-01-14', time: '08:30', title: 'CPI Report (Dec)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - December 2025 data' },
  { id: 'cpi-feb-2026', date: '2026-02-11', time: '08:30', title: 'CPI Report (Jan)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - January 2026 data' },
  { id: 'cpi-mar-2026', date: '2026-03-11', time: '08:30', title: 'CPI Report (Feb)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - February 2026 data' },
  { id: 'cpi-apr-2026', date: '2026-04-10', time: '08:30', title: 'CPI Report (Mar)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - March 2026 data' },
  { id: 'cpi-may-2026', date: '2026-05-12', time: '08:30', title: 'CPI Report (Apr)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - April 2026 data' },
  { id: 'cpi-jun-2026', date: '2026-06-10', time: '08:30', title: 'CPI Report (May)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - May 2026 data' },
  { id: 'cpi-jul-2026', date: '2026-07-14', time: '08:30', title: 'CPI Report (Jun)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - June 2026 data' },
  { id: 'cpi-aug-2026', date: '2026-08-12', time: '08:30', title: 'CPI Report (Jul)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - July 2026 data' },
  { id: 'cpi-sep-2026', date: '2026-09-10', time: '08:30', title: 'CPI Report (Aug)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - August 2026 data' },
  { id: 'cpi-oct-2026', date: '2026-10-13', time: '08:30', title: 'CPI Report (Sep)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - September 2026 data' },
  { id: 'cpi-nov-2026', date: '2026-11-12', time: '08:30', title: 'CPI Report (Oct)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - October 2026 data' },
  { id: 'cpi-dec-2026', date: '2026-12-10', time: '08:30', title: 'CPI Report (Nov)', category: 'cpi', impact: 'high', description: 'Consumer Price Index - November 2026 data' },

  // ========== NFP/Jobs Reports 2025 (First Friday of each month) ==========
  { id: 'nfp-jan-2025', date: '2025-01-10', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - December 2024 data' },
  { id: 'nfp-feb-2025', date: '2025-02-07', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - January 2025 data' },
  { id: 'nfp-mar-2025', date: '2025-03-07', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - February 2025 data' },
  { id: 'nfp-apr-2025', date: '2025-04-04', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - March 2025 data' },
  { id: 'nfp-may-2025', date: '2025-05-02', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - April 2025 data' },
  { id: 'nfp-jun-2025', date: '2025-06-06', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - May 2025 data' },
  { id: 'nfp-jul-2025', date: '2025-07-03', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - June 2025 data' },
  { id: 'nfp-aug-2025', date: '2025-08-01', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - July 2025 data' },
  { id: 'nfp-sep-2025', date: '2025-09-05', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - August 2025 data' },
  { id: 'nfp-oct-2025', date: '2025-10-03', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - September 2025 data' },
  { id: 'nfp-nov-2025', date: '2025-11-07', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - October 2025 data' },
  { id: 'nfp-dec-2025', date: '2025-12-05', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - November 2025 data' },

  // ========== NFP/Jobs Reports 2026 ==========
  { id: 'nfp-jan-2026', date: '2026-01-09', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - December 2025 data' },
  { id: 'nfp-feb-2026', date: '2026-02-06', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - January 2026 data' },
  { id: 'nfp-mar-2026', date: '2026-03-06', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - February 2026 data' },
  { id: 'nfp-apr-2026', date: '2026-04-03', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - March 2026 data' },
  { id: 'nfp-may-2026', date: '2026-05-01', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - April 2026 data' },
  { id: 'nfp-jun-2026', date: '2026-06-05', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - May 2026 data' },
  { id: 'nfp-jul-2026', date: '2026-07-02', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - June 2026 data' },
  { id: 'nfp-aug-2026', date: '2026-08-07', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - July 2026 data' },
  { id: 'nfp-sep-2026', date: '2026-09-04', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - August 2026 data' },
  { id: 'nfp-oct-2026', date: '2026-10-02', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - September 2026 data' },
  { id: 'nfp-nov-2026', date: '2026-11-06', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - October 2026 data' },
  { id: 'nfp-dec-2026', date: '2026-12-04', time: '08:30', title: 'Jobs Report (NFP)', category: 'nfp', impact: 'high', description: 'Non-Farm Payrolls - November 2026 data' },

  // ========== GDP Reports 2025 (Quarterly) ==========
  { id: 'gdp-q4-2024-adv', date: '2025-01-30', time: '08:30', title: 'GDP Q4 2024 (Advance)', category: 'gdp', impact: 'high', description: 'Advance estimate GDP Q4 2024' },
  { id: 'gdp-q4-2024-sec', date: '2025-02-27', time: '08:30', title: 'GDP Q4 2024 (Second)', category: 'gdp', impact: 'medium', description: 'Second estimate GDP Q4 2024' },
  { id: 'gdp-q4-2024-fin', date: '2025-03-27', time: '08:30', title: 'GDP Q4 2024 (Final)', category: 'gdp', impact: 'medium', description: 'Final estimate GDP Q4 2024' },
  { id: 'gdp-q1-2025-adv', date: '2025-04-30', time: '08:30', title: 'GDP Q1 2025 (Advance)', category: 'gdp', impact: 'high', description: 'Advance estimate GDP Q1 2025' },
  { id: 'gdp-q1-2025-sec', date: '2025-05-29', time: '08:30', title: 'GDP Q1 2025 (Second)', category: 'gdp', impact: 'medium', description: 'Second estimate GDP Q1 2025' },
  { id: 'gdp-q1-2025-fin', date: '2025-06-26', time: '08:30', title: 'GDP Q1 2025 (Final)', category: 'gdp', impact: 'medium', description: 'Final estimate GDP Q1 2025' },
  { id: 'gdp-q2-2025-adv', date: '2025-07-30', time: '08:30', title: 'GDP Q2 2025 (Advance)', category: 'gdp', impact: 'high', description: 'Advance estimate GDP Q2 2025' },
  { id: 'gdp-q2-2025-sec', date: '2025-08-28', time: '08:30', title: 'GDP Q2 2025 (Second)', category: 'gdp', impact: 'medium', description: 'Second estimate GDP Q2 2025' },
  { id: 'gdp-q2-2025-fin', date: '2025-09-25', time: '08:30', title: 'GDP Q2 2025 (Final)', category: 'gdp', impact: 'medium', description: 'Final estimate GDP Q2 2025' },
  { id: 'gdp-q3-2025-adv', date: '2025-10-30', time: '08:30', title: 'GDP Q3 2025 (Advance)', category: 'gdp', impact: 'high', description: 'Advance estimate GDP Q3 2025' },
  { id: 'gdp-q3-2025-sec', date: '2025-11-26', time: '08:30', title: 'GDP Q3 2025 (Second)', category: 'gdp', impact: 'medium', description: 'Second estimate GDP Q3 2025' },
  { id: 'gdp-q3-2025-fin', date: '2025-12-23', time: '08:30', title: 'GDP Q3 2025 (Final)', category: 'gdp', impact: 'medium', description: 'Final estimate GDP Q3 2025' },

  // ========== GDP Reports 2026 ==========
  { id: 'gdp-q4-2025-adv', date: '2026-01-29', time: '08:30', title: 'GDP Q4 2025 (Advance)', category: 'gdp', impact: 'high', description: 'Advance estimate GDP Q4 2025' },
  { id: 'gdp-q4-2025-sec', date: '2026-02-26', time: '08:30', title: 'GDP Q4 2025 (Second)', category: 'gdp', impact: 'medium', description: 'Second estimate GDP Q4 2025' },
  { id: 'gdp-q4-2025-fin', date: '2026-03-26', time: '08:30', title: 'GDP Q4 2025 (Final)', category: 'gdp', impact: 'medium', description: 'Final estimate GDP Q4 2025' },
  { id: 'gdp-q1-2026-adv', date: '2026-04-29', time: '08:30', title: 'GDP Q1 2026 (Advance)', category: 'gdp', impact: 'high', description: 'Advance estimate GDP Q1 2026' },
  { id: 'gdp-q1-2026-sec', date: '2026-05-28', time: '08:30', title: 'GDP Q1 2026 (Second)', category: 'gdp', impact: 'medium', description: 'Second estimate GDP Q1 2026' },
  { id: 'gdp-q1-2026-fin', date: '2026-06-25', time: '08:30', title: 'GDP Q1 2026 (Final)', category: 'gdp', impact: 'medium', description: 'Final estimate GDP Q1 2026' },
  { id: 'gdp-q2-2026-adv', date: '2026-07-29', time: '08:30', title: 'GDP Q2 2026 (Advance)', category: 'gdp', impact: 'high', description: 'Advance estimate GDP Q2 2026' },
  { id: 'gdp-q2-2026-sec', date: '2026-08-27', time: '08:30', title: 'GDP Q2 2026 (Second)', category: 'gdp', impact: 'medium', description: 'Second estimate GDP Q2 2026' },
  { id: 'gdp-q2-2026-fin', date: '2026-09-24', time: '08:30', title: 'GDP Q2 2026 (Final)', category: 'gdp', impact: 'medium', description: 'Final estimate GDP Q2 2026' },
  { id: 'gdp-q3-2026-adv', date: '2026-10-29', time: '08:30', title: 'GDP Q3 2026 (Advance)', category: 'gdp', impact: 'high', description: 'Advance estimate GDP Q3 2026' },
  { id: 'gdp-q3-2026-sec', date: '2026-11-25', time: '08:30', title: 'GDP Q3 2026 (Second)', category: 'gdp', impact: 'medium', description: 'Second estimate GDP Q3 2026' },
  { id: 'gdp-q3-2026-fin', date: '2026-12-22', time: '08:30', title: 'GDP Q3 2026 (Final)', category: 'gdp', impact: 'medium', description: 'Final estimate GDP Q3 2026' },

  // ========== Global Summits & Political Events 2025 ==========
  { id: 'wef-2025-start', date: '2025-01-20', time: '09:00', title: 'World Economic Forum Davos 2025', category: 'summit', impact: 'high', description: 'Annual WEF meeting begins - global leaders discuss economy, trade, AI' },
  { id: 'wef-2025-trump', date: '2025-01-21', time: '11:00', title: 'Trump Speech at WEF Davos', category: 'summit', impact: 'high', description: 'US President addresses World Economic Forum' },
  { id: 'wef-2025-end', date: '2025-01-24', time: '17:00', title: 'WEF Davos 2025 Closing', category: 'summit', impact: 'medium', description: 'World Economic Forum closing sessions' },
  { id: 'g7-2025', date: '2025-06-15', time: '09:00', title: 'G7 Summit 2025', category: 'summit', impact: 'high', description: 'G7 leaders meet in Canada - major policy discussions' },
  { id: 'jackson-hole-2025', date: '2025-08-21', time: '10:00', title: 'Jackson Hole Symposium', category: 'summit', impact: 'high', description: 'Fed Chair speech at annual Jackson Hole Economic Symposium' },
  { id: 'un-ga-2025', date: '2025-09-16', time: '09:00', title: 'UN General Assembly 2025', category: 'summit', impact: 'medium', description: 'United Nations General Assembly opens in New York' },
  { id: 'g20-2025', date: '2025-11-15', time: '09:00', title: 'G20 Summit 2025', category: 'summit', impact: 'high', description: 'G20 leaders meet in South Africa' },

  // ========== Global Summits & Political Events 2026 ==========
  { id: 'wef-2026', date: '2026-01-19', time: '09:00', title: 'World Economic Forum Davos 2026', category: 'summit', impact: 'high', description: 'Annual WEF meeting - global economic outlook' },
  { id: 'g7-2026', date: '2026-06-14', time: '09:00', title: 'G7 Summit 2026', category: 'summit', impact: 'high', description: 'G7 leaders annual summit' },
  { id: 'jackson-hole-2026', date: '2026-08-20', time: '10:00', title: 'Jackson Hole Symposium', category: 'summit', impact: 'high', description: 'Fed Chair speech at annual Jackson Hole Economic Symposium' },
  { id: 'un-ga-2026', date: '2026-09-15', time: '09:00', title: 'UN General Assembly 2026', category: 'summit', impact: 'medium', description: 'United Nations General Assembly opens' },
  { id: 'g20-2026', date: '2026-11-14', time: '09:00', title: 'G20 Summit 2026', category: 'summit', impact: 'high', description: 'G20 leaders annual summit' },
];

// Helper to get events for a date range
export function getEconomicEventsInRange(startDate: Date, endDate: Date): EconomicEvent[] {
  return ECONOMIC_CALENDAR_2025_2026.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startDate && eventDate <= endDate;
  });
}

// Helper to get events for a specific date
export function getEconomicEventsForDate(date: Date): EconomicEvent[] {
  const dateStr = date.toISOString().split('T')[0];
  return ECONOMIC_CALENDAR_2025_2026.filter(event => event.date === dateStr);
}

// Get category icon
export function getCategoryIcon(category: EconomicEvent['category']): string {
  switch (category) {
    case 'fomc': return '🏛️';
    case 'cpi': return '📊';
    case 'nfp': return '👷';
    case 'gdp': return '📈';
    case 'fed_speech': return '🎤';
    case 'summit': return '🌍';
    default: return '📅';
  }
}

// Get category label
export function getCategoryLabel(category: EconomicEvent['category']): string {
  switch (category) {
    case 'fomc': return 'FOMC';
    case 'cpi': return 'CPI';
    case 'nfp': return 'NFP';
    case 'gdp': return 'GDP';
    case 'fed_speech': return 'Fed Speech';
    case 'summit': return 'Global Summit';
    default: return 'Event';
  }
}
