import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { db, TRADES_CHANGED_EVENT } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface GoalAlertsContextType {
  checkGoalProgress: () => void;
  todayPnL: number;
  todayTrades: number;
  goalAchieved: boolean;
  drawdownWarning: boolean;
  drawdownCritical: boolean;
}

const GoalAlertsContext = createContext<GoalAlertsContextType | null>(null);

export const useGoalAlerts = () => {
  const context = useContext(GoalAlertsContext);
  if (!context) {
    throw new Error("useGoalAlerts must be used within GoalAlertsProvider");
  }
  return context;
};

interface GoalAlertsProviderProps {
  children: ReactNode;
}

export const GoalAlertsProvider = ({ children }: GoalAlertsProviderProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [todayPnL, setTodayPnL] = useState(0);
  const [todayTrades, setTodayTrades] = useState(0);
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [drawdownWarning, setDrawdownWarning] = useState(false);
  const [drawdownCritical, setDrawdownCritical] = useState(false);
  const [settings, setSettings] = useState({
    dailyGoalAmount: 500,
    dailyGoalMaxTrades: 10,
    notificationsEnabled: true,
    notificationSound: false,
    drawdownWarningThreshold: 50,
  });
  
  // Track which alerts have been shown to avoid duplicates
  const alertsShown = useRef({
    goalAchieved: false,
    drawdownWarning: false,
    drawdownCritical: false,
    tradeLimitReached: false,
  });

  // Load user settings
  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      const { data } = await db
        .from("user_settings")
        .select("daily_goal_amount, daily_goal_max_trades, notifications_enabled, notification_sound, drawdown_warning_threshold")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setSettings({
          dailyGoalAmount: data.daily_goal_amount || 500,
          dailyGoalMaxTrades: data.daily_goal_max_trades || 10,
          notificationsEnabled: data.notifications_enabled ?? true,
          notificationSound: data.notification_sound ?? false,
          drawdownWarningThreshold: data.drawdown_warning_threshold || 50,
        });
      }
    };

    loadSettings();
  }, [user]);

  // Check goal progress
  const checkGoalProgress = async () => {
    if (!user) return;

    const today = format(new Date(), "yyyy-MM-dd");
    
    const { data: trades } = await db
      .from("trades")
      .select("pnl_net")
      .eq("user_id", user.id)
      .gte("exit_time", `${today}T00:00:00`)
      .lt("exit_time", `${today}T23:59:59`);

    if (!trades) return;

    const pnl = trades.reduce((sum, t) => sum + (t.pnl_net || 0), 0);
    const tradeCount = trades.length;

    setTodayPnL(pnl);
    setTodayTrades(tradeCount);

    // Check goal achievement
    const achieved = pnl >= settings.dailyGoalAmount;
    setGoalAchieved(achieved);

    // Check drawdown levels
    const drawdownPercent = pnl < 0 ? Math.abs(pnl / settings.dailyGoalAmount * 100) : 0;
    const isDrawdownWarning = drawdownPercent >= settings.drawdownWarningThreshold && drawdownPercent < 100;
    const isDrawdownCritical = drawdownPercent >= 100;

    setDrawdownWarning(isDrawdownWarning);
    setDrawdownCritical(isDrawdownCritical);

    // Only show alerts if notifications are enabled
    if (!settings.notificationsEnabled) return;

    // Goal Achieved Alert
    if (achieved && !alertsShown.current.goalAchieved) {
      alertsShown.current.goalAchieved = true;
      showNotification(
        t("goalAlerts.goalAchieved"),
        t("goalAlerts.goalAchievedDesc", { amount: pnl.toFixed(2) }),
        "success"
      );
    }

    // Drawdown Warning Alert
    if (isDrawdownWarning && !isDrawdownCritical && !alertsShown.current.drawdownWarning) {
      alertsShown.current.drawdownWarning = true;
      showNotification(
        t("goalAlerts.drawdownWarning"),
        t("goalAlerts.drawdownWarningDesc", { percent: drawdownPercent.toFixed(0) }),
        "warning"
      );
    }

    // Drawdown Critical Alert
    if (isDrawdownCritical && !alertsShown.current.drawdownCritical) {
      alertsShown.current.drawdownCritical = true;
      showNotification(
        t("goalAlerts.drawdownCritical"),
        t("goalAlerts.drawdownCriticalDesc"),
        "error"
      );
    }

    // Trade Limit Alert
    if (tradeCount >= settings.dailyGoalMaxTrades && !alertsShown.current.tradeLimitReached) {
      alertsShown.current.tradeLimitReached = true;
      showNotification(
        t("goalAlerts.tradeLimitReached"),
        t("goalAlerts.tradeLimitReachedDesc", { limit: settings.dailyGoalMaxTrades }),
        "info"
      );
    }
  };

  const showNotification = (title: string, description: string, type: "success" | "warning" | "error" | "info") => {
    // Play sound if enabled
    if (settings.notificationSound) {
      playNotificationSound(type);
    }

    // Show toast
    switch (type) {
      case "success":
        toast.success(title, { description });
        break;
      case "warning":
        toast.warning(title, { description });
        break;
      case "error":
        toast.error(title, { description });
        break;
      default:
        toast.info(title, { description });
    }

    // Show browser notification if permitted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: description });
    }
  };

  const playNotificationSound = (type: string) => {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different alert types
      const frequencies: Record<string, number> = {
        success: 880, // A5
        warning: 440, // A4
        error: 220, // A3
        info: 660, // E5
      };

      oscillator.frequency.value = frequencies[type] || 440;
      oscillator.type = "sine";
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      console.error("Could not play notification sound:", e);
    }
  };

  // Reset alerts at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      alertsShown.current = {
        goalAchieved: false,
        drawdownWarning: false,
        drawdownCritical: false,
        tradeLimitReached: false,
      };
      setGoalAchieved(false);
      setDrawdownWarning(false);
      setDrawdownCritical(false);
      setTodayPnL(0);
      setTodayTrades(0);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  // Initial check and subscribe to trade changes
  useEffect(() => {
    if (!user) return;

    checkGoalProgress();

    // Re-check when trades change in this tab, and poll for trades arriving via the NinjaTrader webhook
    const onChange = () => checkGoalProgress();
    window.addEventListener(TRADES_CHANGED_EVENT, onChange);
    const interval = window.setInterval(onChange, 60_000);

    return () => {
      window.removeEventListener(TRADES_CHANGED_EVENT, onChange);
      window.clearInterval(interval);
    };
  }, [user, settings]);

  return (
    <GoalAlertsContext.Provider
      value={{
        checkGoalProgress,
        todayPnL,
        todayTrades,
        goalAchieved,
        drawdownWarning,
        drawdownCritical,
      }}
    >
      {children}
    </GoalAlertsContext.Provider>
  );
};
