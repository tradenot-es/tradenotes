import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Calendar, CheckCircle2, Target, Brain, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface DailyPrepData {
  id?: string;
  date: string;
  marketOutlook: string;
  keyLevels: string;
  tradingPlan: string;
  mindset: string;
  checklist: {
    reviewedNews: boolean;
    checkedEconomicCalendar: boolean;
    identifiedKeyLevels: boolean;
    reviewedYesterday: boolean;
    setDailyGoals: boolean;
    checkedRiskManagement: boolean;
  };
}

export function DailyPrep() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  const [prepData, setPrepData] = useState<DailyPrepData>({
    date: today,
    marketOutlook: "",
    keyLevels: "",
    tradingPlan: "",
    mindset: "",
    checklist: {
      reviewedNews: false,
      checkedEconomicCalendar: false,
      identifiedKeyLevels: false,
      reviewedYesterday: false,
      setDailyGoals: false,
      checkedRiskManagement: false,
    },
  });

  useEffect(() => {
    if (user) {
      loadTodaysPrep();
    }
  }, [user]);

  const loadTodaysPrep = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_prep")
      .select("*")
      .eq("date", today)
      .maybeSingle();

    if (!error && data) {
      setPrepData({
        id: data.id,
        date: data.date,
        marketOutlook: data.market_outlook || "",
        keyLevels: data.key_levels || "",
        tradingPlan: data.trading_plan || "",
        mindset: data.mindset || "",
        checklist: data.checklist || prepData.checklist,
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const dataToSave = {
        user_id: user.id,
        date: today,
        market_outlook: prepData.marketOutlook,
        key_levels: prepData.keyLevels,
        trading_plan: prepData.tradingPlan,
        mindset: prepData.mindset,
        checklist: prepData.checklist,
      };

      let error;
      if (prepData.id) {
        const result = await supabase
          .from("daily_prep")
          .update(dataToSave)
          .eq("id", prepData.id);
        error = result.error;
      } else {
        const result = await supabase.from("daily_prep").insert(dataToSave);
        error = result.error;
      }

      if (error) throw error;

      toast.success(t("dailyPrep.saved"));
      loadTodaysPrep();
    } catch (error: any) {
      toast.error(error.message || t("dailyPrep.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const updateChecklist = (key: keyof typeof prepData.checklist) => {
    setPrepData({
      ...prepData,
      checklist: {
        ...prepData.checklist,
        [key]: !prepData.checklist[key],
      },
    });
  };

  const completedItems = Object.values(prepData.checklist).filter(Boolean).length;
  const totalItems = Object.keys(prepData.checklist).length;
  const completionPercentage = (completedItems / totalItems) * 100;

  if (loading) {
    return <div className="text-center py-4">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("dailyPrep.title")} - {format(new Date(), "PPP")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t("dailyPrep.checklistProgress")}</span>
              <span className="text-sm text-muted-foreground">
                {completedItems}/{totalItems}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="reviewedNews"
                checked={prepData.checklist.reviewedNews}
                onCheckedChange={() => updateChecklist("reviewedNews")}
              />
              <Label htmlFor="reviewedNews" className="cursor-pointer">
                {t("dailyPrep.reviewedNews")}
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="checkedEconomicCalendar"
                checked={prepData.checklist.checkedEconomicCalendar}
                onCheckedChange={() => updateChecklist("checkedEconomicCalendar")}
              />
              <Label htmlFor="checkedEconomicCalendar" className="cursor-pointer">
                {t("dailyPrep.checkedEconomicCalendar")}
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="identifiedKeyLevels"
                checked={prepData.checklist.identifiedKeyLevels}
                onCheckedChange={() => updateChecklist("identifiedKeyLevels")}
              />
              <Label htmlFor="identifiedKeyLevels" className="cursor-pointer">
                {t("dailyPrep.identifiedKeyLevels")}
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="reviewedYesterday"
                checked={prepData.checklist.reviewedYesterday}
                onCheckedChange={() => updateChecklist("reviewedYesterday")}
              />
              <Label htmlFor="reviewedYesterday" className="cursor-pointer">
                {t("dailyPrep.reviewedYesterday")}
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="setDailyGoals"
                checked={prepData.checklist.setDailyGoals}
                onCheckedChange={() => updateChecklist("setDailyGoals")}
              />
              <Label htmlFor="setDailyGoals" className="cursor-pointer">
                {t("dailyPrep.setDailyGoals")}
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="checkedRiskManagement"
                checked={prepData.checklist.checkedRiskManagement}
                onCheckedChange={() => updateChecklist("checkedRiskManagement")}
              />
              <Label htmlFor="checkedRiskManagement" className="cursor-pointer">
                {t("dailyPrep.checkedRiskManagement")}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("dailyPrep.marketOutlook")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t("dailyPrep.marketOutlookPlaceholder")}
            value={prepData.marketOutlook}
            onChange={(e) => setPrepData({ ...prepData, marketOutlook: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("dailyPrep.keyLevels")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t("dailyPrep.keyLevelsPlaceholder")}
            value={prepData.keyLevels}
            onChange={(e) => setPrepData({ ...prepData, keyLevels: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {t("dailyPrep.tradingPlan")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t("dailyPrep.tradingPlanPlaceholder")}
            value={prepData.tradingPlan}
            onChange={(e) => setPrepData({ ...prepData, tradingPlan: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {t("dailyPrep.mindset")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={t("dailyPrep.mindsetPlaceholder")}
            value={prepData.mindset}
            onChange={(e) => setPrepData({ ...prepData, mindset: e.target.value })}
            rows={3}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? t("common.loading") : t("dailyPrep.savePrep")}
      </Button>
    </div>
  );
}