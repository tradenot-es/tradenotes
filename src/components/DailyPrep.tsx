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
import { Calendar, CheckCircle2, Target, Brain, TrendingUp, Plus } from "lucide-react";
import { format } from "date-fns";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface DailyPrepData {
  id?: string;
  date: string;
  marketOutlook: string;
  keyLevels: string;
  tradingPlan: string;
  mindset: string;
  checklist: ChecklistItem[];
}

export function DailyPrep() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  const getDefaultChecklist = (): ChecklistItem[] => [
    { id: "1", label: t("dailyPrep.reviewedNews"), checked: false },
    { id: "2", label: t("dailyPrep.checkedEconomicCalendar"), checked: false },
    { id: "3", label: t("dailyPrep.identifiedKeyLevels"), checked: false },
    { id: "4", label: t("dailyPrep.reviewedYesterday"), checked: false },
    { id: "5", label: t("dailyPrep.setDailyGoals"), checked: false },
    { id: "6", label: t("dailyPrep.checkedRiskManagement"), checked: false },
  ];

  const [prepData, setPrepData] = useState<DailyPrepData>({
    date: today,
    marketOutlook: "",
    keyLevels: "",
    tradingPlan: "",
    mindset: "",
    checklist: getDefaultChecklist(),
  });

  const [newChecklistItem, setNewChecklistItem] = useState("");

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
      let checklistData: ChecklistItem[] = getDefaultChecklist();
      
      if (Array.isArray(data.checklist) && data.checklist.length > 0) {
        try {
          checklistData = JSON.parse(JSON.stringify(data.checklist)) as ChecklistItem[];
        } catch {
          checklistData = getDefaultChecklist();
        }
      }

      setPrepData({
        id: data.id,
        date: data.date,
        marketOutlook: data.market_outlook || "",
        keyLevels: data.key_levels || "",
        tradingPlan: data.trading_plan || "",
        mindset: data.mindset || "",
        checklist: checklistData,
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
        checklist: JSON.parse(JSON.stringify(prepData.checklist)),
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

  const updateChecklist = (itemId: string) => {
    setPrepData({
      ...prepData,
      checklist: prepData.checklist.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    });
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      label: newChecklistItem.trim(),
      checked: false,
    };
    
    setPrepData({
      ...prepData,
      checklist: [...prepData.checklist, newItem],
    });
    
    setNewChecklistItem("");
  };

  const removeChecklistItem = (itemId: string) => {
    setPrepData({
      ...prepData,
      checklist: prepData.checklist.filter((item) => item.id !== itemId),
    });
  };

  const completedItems = prepData.checklist.filter((item) => item.checked).length;
  const totalItems = prepData.checklist.length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

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
            {prepData.checklist.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 group">
                <Checkbox
                  id={item.id}
                  checked={item.checked}
                  onCheckedChange={() => updateChecklist(item.id)}
                />
                <Label htmlFor={item.id} className="cursor-pointer flex-1">
                  {item.label}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChecklistItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            ))}
            
            <div className="flex gap-2 pt-2 border-t">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
                placeholder={t("dailyPrep.addChecklistItem")}
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
              />
              <Button onClick={addChecklistItem} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
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