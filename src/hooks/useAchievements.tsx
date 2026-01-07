import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  achieved: boolean;
  achievedAt?: string;
  metadata?: Record<string, unknown>;
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
] as const;

export type AchievementType = typeof ACHIEVEMENT_DEFINITIONS[number]['type'];

interface Trade {
  id: string;
  pnl_net: number;
  exit_time: string;
  stop_loss_price?: number | null;
  r?: number | null;
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

  const loadAchievements = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const achievementMap = new Map(data?.map(a => [a.achievement_type, a]) || []);

      const allAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(def => {
        const achieved = achievementMap.get(def.type);
        return {
          id: achieved?.id || def.type,
          type: def.type,
          name: getAchievementName(def.type),
          description: getAchievementDescription(def.type),
          icon: def.icon,
          achieved: !!achieved,
          achievedAt: achieved?.achieved_at,
          metadata: achieved?.metadata as Record<string, unknown> | undefined,
        };
      });

      setAchievements(allAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getAchievementName, getAchievementDescription]);

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
  }, [user, t, getAchievementName, getAchievementDescription, loadAchievements]);

  const checkAchievements = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch all needed data in parallel
      const [tradesRes, journalRes, existingRes] = await Promise.all([
        supabase
          .from('trades')
          .select('id, pnl_net, exit_time, stop_loss_price, r')
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
