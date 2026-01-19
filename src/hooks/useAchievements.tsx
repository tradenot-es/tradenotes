import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  achieved: boolean;
  achievedAt?: string;
  metadata?: Record<string, unknown>;
  progress?: AchievementProgress;
}

export const ACHIEVEMENT_DEFINITIONS = [
  { type: 'first_trade', icon: '🎯', requirement: 'Ersten Trade loggen' },
  { type: 'streak_3_wins', icon: '🔥', requirement: '3 Gewinntrades in Folge' },
  { type: 'streak_5_wins', icon: '🔥', requirement: '5 Gewinntrades in Folge' },
  { type: 'streak_10_wins', icon: '⚡', requirement: '10 Gewinntrades in Folge' },
  { type: 'consistency_7_days', icon: '📅', requirement: '7 Tage hintereinander traden' },
  { type: 'consistency_30_days', icon: '🏆', requirement: '30 Tage hintereinander traden' },
  { type: 'profitable_week', icon: '💰', requirement: 'Erste profitable Woche' },
  { type: 'journal_hero', icon: '✍️', requirement: '7 Journal-Einträge' },
  { type: 'risk_manager', icon: '🛡️', requirement: '10 Trades mit Stop-Loss' },
  { type: 'r_master', icon: '⭐', requirement: 'Ø R-Multiple > 1.5 (min. 20 Trades)' },
  { type: 'century_club', icon: '💯', requirement: '100 Trades erreichen' },
  { type: 'thousand_club', icon: '🎖️', requirement: '1000 Trades erreichen' },
  // New achievements
  { type: 'first_green_month', icon: '📈', requirement: 'Erster profitabler Monat' },
  { type: 'low_drawdown', icon: '🎯', requirement: 'Max Drawdown < 5%' },
  { type: 'diversified', icon: '🌐', requirement: '10 verschiedene Symbole getradet' },
  { type: 'early_bird', icon: '🌅', requirement: '20 Trades vor 10:00 Uhr' },
  { type: 'weekend_warrior', icon: '📝', requirement: '4 Wochen Journal am Wochenende' },
  { type: 'comeback_king', icon: '👑', requirement: 'Nach 3 Verlusttrades profitabel abgeschlossen' },
] as const;

export type AchievementType = typeof ACHIEVEMENT_DEFINITIONS[number]['type'];

interface Trade {
  id: string;
  pnl_net: number;
  entry_time: string;
  exit_time: string;
  stop_loss_price?: number | null;
  r?: number | null;
  symbol: string;
}

interface JournalEntry {
  id: string;
  date: string;
}

export function useAchievements() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const getAchievementName = useCallback((type: string) => {
    return t(`achievements.${type}`, type);
  }, [t]);

  const getAchievementDescription = useCallback((type: string) => {
    return t(`achievements.${type}_desc`, ACHIEVEMENT_DEFINITIONS.find(a => a.type === type)?.requirement || '');
  }, [t]);

  // Calculate progress for each achievement type
  const calculateProgress = useCallback((
    type: string,
    trades: Trade[],
    journalEntries: JournalEntry[]
  ): AchievementProgress | undefined => {
    switch (type) {
      case 'first_trade':
        return { current: Math.min(trades.length, 1), target: 1 };
      
      case 'century_club':
        return { current: Math.min(trades.length, 100), target: 100 };
      
      case 'thousand_club':
        return { current: Math.min(trades.length, 1000), target: 1000 };
      
      case 'streak_3_wins':
      case 'streak_5_wins':
      case 'streak_10_wins': {
        const target = type === 'streak_3_wins' ? 3 : type === 'streak_5_wins' ? 5 : 10;
        let currentStreak = 0;
        let maxStreak = 0;
        for (const trade of trades) {
          if (trade.pnl_net > 0) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        }
        return { current: Math.min(maxStreak, target), target };
      }
      
      case 'consistency_7_days':
      case 'consistency_30_days': {
        const target = type === 'consistency_7_days' ? 7 : 30;
        const tradeDays = new Set(trades.map(t => t.exit_time.split('T')[0]));
        const sortedDays = Array.from(tradeDays).sort();
        let consecutiveDays = 1;
        let maxConsecutive = sortedDays.length > 0 ? 1 : 0;
        for (let i = 1; i < sortedDays.length; i++) {
          const prevDate = new Date(sortedDays[i - 1]);
          const currDate = new Date(sortedDays[i]);
          const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays === 1) {
            consecutiveDays++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
          } else {
            consecutiveDays = 1;
          }
        }
        return { current: Math.min(maxConsecutive, target), target };
      }
      
      case 'journal_hero':
        return { current: Math.min(journalEntries.length, 7), target: 7 };
      
      case 'risk_manager': {
        const tradesWithSL = trades.filter(t => t.stop_loss_price != null).length;
        return { current: Math.min(tradesWithSL, 10), target: 10 };
      }
      
      case 'r_master': {
        const tradesWithR = trades.filter(t => t.r != null && t.r > 0);
        return { current: Math.min(tradesWithR.length, 20), target: 20 };
      }
      
      case 'diversified': {
        const uniqueSymbols = new Set(trades.map(t => t.symbol));
        return { current: Math.min(uniqueSymbols.size, 10), target: 10 };
      }
      
      case 'early_bird': {
        const earlyTrades = trades.filter(t => {
          const entryTime = t.entry_time || t.exit_time;
          const hour = new Date(entryTime).getHours();
          return hour < 10;
        });
        return { current: Math.min(earlyTrades.length, 20), target: 20 };
      }
      
      case 'weekend_warrior': {
        const weekendEntries = journalEntries.filter(entry => {
          const day = new Date(entry.date).getDay();
          return day === 0 || day === 6;
        });
        return { current: Math.min(weekendEntries.length, 4), target: 4 };
      }
      
      // These achievements have binary conditions, no progress tracking
      case 'profitable_week':
      case 'first_green_month':
      case 'low_drawdown':
      case 'comeback_king':
        return undefined;
      
      default:
        return undefined;
    }
  }, []);

  const loadAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch achievements, trades and journal entries for progress calculation
      const [achievementsRes, tradesRes, journalRes] = await Promise.all([
        supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('trades')
          .select('id, pnl_net, entry_time, exit_time, stop_loss_price, r, symbol')
          .eq('user_id', user.id)
          .order('exit_time', { ascending: true }),
        supabase
          .from('journal_entries')
          .select('id, date')
          .eq('user_id', user.id),
      ]);

      if (achievementsRes.error) throw achievementsRes.error;

      const trades = (tradesRes.data || []) as Trade[];
      const journalEntries = (journalRes.data || []) as JournalEntry[];
      const achievementMap = new Map(achievementsRes.data?.map(a => [a.achievement_type, a]) || []);

      const allAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(def => {
        const achieved = achievementMap.get(def.type);
        const progress = !achieved ? calculateProgress(def.type, trades, journalEntries) : undefined;
        
        return {
          id: achieved?.id || def.type,
          type: def.type,
          name: getAchievementName(def.type),
          description: getAchievementDescription(def.type),
          icon: def.icon,
          achieved: !!achieved,
          achievedAt: achieved?.achieved_at,
          metadata: achieved?.metadata as Record<string, unknown> | undefined,
          progress,
        };
      });

      setAchievements(allAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getAchievementName, getAchievementDescription]);

  const triggerConfetti = useCallback(() => {
    // Achievement celebration confetti
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  const unlockAchievement = useCallback(async (type: AchievementType, metadata?: Record<string, unknown>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert([{
          user_id: user.id,
          achievement_type: type,
          metadata: (metadata || {}) as unknown as Record<string, never>,
        }]);

      if (error) {
        if (error.code === '23505') {
          // Already exists, ignore
          return false;
        }
        throw error;
      }

      const def = ACHIEVEMENT_DEFINITIONS.find(a => a.type === type);
      const newAch: Achievement = {
        id: type,
        type,
        name: getAchievementName(type),
        description: getAchievementDescription(type),
        icon: def?.icon || '🏅',
        achieved: true,
        achievedAt: new Date().toISOString(),
        metadata,
      };

      setNewAchievement(newAch);
      
      // Trigger confetti celebration!
      triggerConfetti();
      
      toast.success(
        `${def?.icon} ${t('achievements.newAchievement', 'Neues Achievement!')}`,
        { description: getAchievementName(type) }
      );

      await loadAchievements();
      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  }, [user, t, getAchievementName, getAchievementDescription, loadAchievements, triggerConfetti]);

  const checkAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch all needed data in parallel
      const [tradesRes, journalRes, existingRes] = await Promise.all([
        supabase
          .from('trades')
          .select('id, pnl_net, entry_time, exit_time, stop_loss_price, r, symbol')
          .eq('user_id', user.id)
          .order('exit_time', { ascending: true }),
        supabase
          .from('journal_entries')
          .select('id, date')
          .eq('user_id', user.id),
        supabase
          .from('user_achievements')
          .select('achievement_type')
          .eq('user_id', user.id),
      ]);

      const trades = (tradesRes.data || []) as Trade[];
      const journalEntries = (journalRes.data || []) as JournalEntry[];
      const existingTypes = new Set((existingRes.data || []).map(a => a.achievement_type));

      const newAchievements: AchievementType[] = [];

      // First Trade
      if (trades.length >= 1 && !existingTypes.has('first_trade')) {
        newAchievements.push('first_trade');
      }

      // Century Club (100 trades)
      if (trades.length >= 100 && !existingTypes.has('century_club')) {
        newAchievements.push('century_club');
      }

      // Thousand Club (1000 trades)
      if (trades.length >= 1000 && !existingTypes.has('thousand_club')) {
        newAchievements.push('thousand_club');
      }

      // Calculate streaks
      let currentStreak = 0;
      let maxStreak = 0;
      for (const trade of trades) {
        if (trade.pnl_net > 0) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      if (maxStreak >= 3 && !existingTypes.has('streak_3_wins')) {
        newAchievements.push('streak_3_wins');
      }
      if (maxStreak >= 5 && !existingTypes.has('streak_5_wins')) {
        newAchievements.push('streak_5_wins');
      }
      if (maxStreak >= 10 && !existingTypes.has('streak_10_wins')) {
        newAchievements.push('streak_10_wins');
      }

      // Consistency: Days with trades
      const tradeDays = new Set(trades.map(t => t.exit_time.split('T')[0]));
      const sortedDays = Array.from(tradeDays).sort();
      
      let consecutiveDays = 1;
      let maxConsecutive = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prevDate = new Date(sortedDays[i - 1]);
        const currDate = new Date(sortedDays[i]);
        const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          consecutiveDays++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
        } else {
          consecutiveDays = 1;
        }
      }

      if (maxConsecutive >= 7 && !existingTypes.has('consistency_7_days')) {
        newAchievements.push('consistency_7_days');
      }
      if (maxConsecutive >= 30 && !existingTypes.has('consistency_30_days')) {
        newAchievements.push('consistency_30_days');
      }

      // Profitable Week
      const weeklyPnL = new Map<string, number>();
      for (const trade of trades) {
        const date = new Date(trade.exit_time);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        weeklyPnL.set(weekKey, (weeklyPnL.get(weekKey) || 0) + Number(trade.pnl_net));
      }
      const hasProfitableWeek = Array.from(weeklyPnL.values()).some(pnl => pnl > 0);
      if (hasProfitableWeek && !existingTypes.has('profitable_week')) {
        newAchievements.push('profitable_week');
      }

      // Journal Hero
      if (journalEntries.length >= 7 && !existingTypes.has('journal_hero')) {
        newAchievements.push('journal_hero');
      }

      // Risk Manager (10 trades with stop-loss)
      const tradesWithStopLoss = trades.filter(t => t.stop_loss_price != null).length;
      if (tradesWithStopLoss >= 10 && !existingTypes.has('risk_manager')) {
        newAchievements.push('risk_manager');
      }

      // R-Master (avg R > 1.5 with min 20 trades)
      const tradesWithR = trades.filter(t => t.r != null && t.r > 0);
      if (tradesWithR.length >= 20) {
        const avgR = tradesWithR.reduce((sum, t) => sum + Number(t.r), 0) / tradesWithR.length;
        if (avgR > 1.5 && !existingTypes.has('r_master')) {
          newAchievements.push('r_master');
        }
      }

      // ===== NEW ACHIEVEMENTS =====

      // First Green Month (first profitable month)
      const monthlyPnL = new Map<string, number>();
      for (const trade of trades) {
        const monthKey = trade.exit_time.substring(0, 7); // YYYY-MM
        monthlyPnL.set(monthKey, (monthlyPnL.get(monthKey) || 0) + Number(trade.pnl_net));
      }
      const hasProfitableMonth = Array.from(monthlyPnL.values()).some(pnl => pnl > 0);
      if (hasProfitableMonth && !existingTypes.has('first_green_month')) {
        newAchievements.push('first_green_month');
      }

      // Low Drawdown (max drawdown < 5% - simplified: no single loss > 5% of cumulative gains)
      if (trades.length >= 20 && !existingTypes.has('low_drawdown')) {
        let runningEquity = 0;
        let peak = 0;
        let maxDrawdownPercent = 0;
        for (const trade of trades) {
          runningEquity += Number(trade.pnl_net);
          if (runningEquity > peak) peak = runningEquity;
          if (peak > 0) {
            const drawdown = (peak - runningEquity) / peak * 100;
            maxDrawdownPercent = Math.max(maxDrawdownPercent, drawdown);
          }
        }
        if (maxDrawdownPercent < 5 && peak > 0) {
          newAchievements.push('low_drawdown');
        }
      }

      // Diversified (10 different symbols traded)
      const uniqueSymbols = new Set(trades.map(t => t.symbol));
      if (uniqueSymbols.size >= 10 && !existingTypes.has('diversified')) {
        newAchievements.push('diversified');
      }

      // Early Bird (20 trades before 10:00)
      const earlyTrades = trades.filter(t => {
        const entryTime = t.entry_time || t.exit_time;
        const hour = new Date(entryTime).getHours();
        return hour < 10;
      });
      if (earlyTrades.length >= 20 && !existingTypes.has('early_bird')) {
        newAchievements.push('early_bird');
      }

      // Weekend Warrior (4 journal entries on weekends)
      const weekendEntries = journalEntries.filter(entry => {
        const day = new Date(entry.date).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      });
      if (weekendEntries.length >= 4 && !existingTypes.has('weekend_warrior')) {
        newAchievements.push('weekend_warrior');
      }

      // Comeback King (after 3 consecutive losses, ended day profitably)
      if (!existingTypes.has('comeback_king') && trades.length >= 5) {
        // Group trades by day
        const tradesByDay = new Map<string, Trade[]>();
        for (const trade of trades) {
          const day = trade.exit_time.split('T')[0];
          if (!tradesByDay.has(day)) tradesByDay.set(day, []);
          tradesByDay.get(day)!.push(trade);
        }
        
        for (const [, dayTrades] of tradesByDay) {
          let lossStreak = 0;
          let hasComeback = false;
          const totalDayPnL = dayTrades.reduce((sum, t) => sum + Number(t.pnl_net), 0);
          
          for (const trade of dayTrades) {
            if (trade.pnl_net < 0) {
              lossStreak++;
            } else {
              if (lossStreak >= 3 && totalDayPnL > 0) {
                hasComeback = true;
                break;
              }
              lossStreak = 0;
            }
          }
          
          if (hasComeback) {
            newAchievements.push('comeback_king');
            break;
          }
        }
      }

      // Unlock new achievements (one at a time with delay for nice UX)
      for (let i = 0; i < newAchievements.length; i++) {
        setTimeout(() => {
          unlockAchievement(newAchievements[i]);
        }, i * 1500);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [user, unlockAchievement]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const dismissNewAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);

  return {
    achievements,
    loading,
    newAchievement,
    dismissNewAchievement,
    checkAchievements,
    unlockAchievement,
    refresh: loadAchievements,
  };
}
