import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, HelpCircle, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { z } from "zod";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SetupDefinition } from "@/types/setup";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [defaultFees, setDefaultFees] = useState("2.00");
  const [defaultSlippage, setDefaultSlippage] = useState("0.5");
  const [setupDefinitions, setSetupDefinitions] = useState<SetupDefinition[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newSetup, setNewSetup] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newTag, setNewTag] = useState("");
  const [settingsId, setSettingsId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dailyGoalAmount, setDailyGoalAmount] = useState("500.00");
  const [dailyGoalMaxTrades, setDailyGoalMaxTrades] = useState("10");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationSound, setNotificationSound] = useState(false);
  const [drawdownWarningThreshold, setDrawdownWarningThreshold] = useState(50);

  const timezones = [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Toronto", "America/Sao_Paulo", "Europe/London", "Europe/Paris",
    "Europe/Berlin", "Europe/Zurich", "Europe/Amsterdam", "Asia/Tokyo",
    "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Singapore", "Asia/Dubai",
    "Australia/Sydney", "Pacific/Auckland"
  ];

  const settingsSchema = z.object({
    base_currency: z.string().length(3, { message: t("validation.currencyInvalid") }).regex(/^[A-Z]+$/),
    timezone: z.string().min(1),
    default_fees: z.number()
      .nonnegative({ message: t("validation.feesInvalid") })
      .max(1000, { message: t("validation.feesInvalid") }),
    default_slippage: z.number()
      .nonnegative({ message: t("validation.slippageInvalid") })
      .max(100, { message: t("validation.slippageInvalid") }),
    setup_definitions: z.array(
      z.object({
        name: z.string().trim().min(1).max(50),
        checklist: z.array(z.string().trim().min(1).max(100)).max(10)
      })
    ).max(20, { message: t("validation.setupMaxReached") }),
    tags: z.array(
      z.string().trim().min(1).max(30, { message: t("validation.tagItemTooLong") })
    ).max(30, { message: t("validation.tagMaxReached") })
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    // Explicitly select only needed columns - exclude webhook_api_key for security
    const { data, error } = await supabase
      .from("user_settings")
      .select("id, base_currency, timezone, default_fees, default_slippage, setup_definitions, tags, daily_goal_amount, daily_goal_max_trades, notifications_enabled, notification_sound, drawdown_warning_threshold")
      .maybeSingle();

    if (!error && data) {
      setSettingsId(data.id);
      setCurrency(data.base_currency);
      setTimezone(data.timezone);
      setDefaultFees(data.default_fees?.toString() || "2.00");
      setDefaultSlippage(data.default_slippage?.toString() || "0.5");
      
      // Load setup definitions from JSONB field
      const setupDefs = (data.setup_definitions as unknown as SetupDefinition[]) || [];
      setSetupDefinitions(setupDefs);
      
      setTags(data.tags || []);
      setDailyGoalAmount(data.daily_goal_amount?.toString() || "500.00");
      setDailyGoalMaxTrades(data.daily_goal_max_trades?.toString() || "10");
      setNotificationsEnabled(data.notifications_enabled ?? true);
      setNotificationSound(data.notification_sound ?? false);
      setDrawdownWarningThreshold(data.drawdown_warning_threshold ?? 50);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setErrors({});

    // Validate input
    const validation = settingsSchema.safeParse({
      base_currency: currency,
      timezone: timezone,
      default_fees: parseFloat(defaultFees),
      default_slippage: parseFloat(defaultSlippage),
      setup_definitions: setupDefinitions,
      tags: tags
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast.error(t("settings.saveError"));
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          base_currency: currency,
          timezone: timezone,
          default_fees: parseFloat(defaultFees),
          default_slippage: parseFloat(defaultSlippage),
          setup_definitions: setupDefinitions as any,
          tags: tags,
          daily_goal_amount: parseFloat(dailyGoalAmount),
          daily_goal_max_trades: parseInt(dailyGoalMaxTrades),
          notifications_enabled: notificationsEnabled,
          notification_sound: notificationSound,
          drawdown_warning_threshold: drawdownWarningThreshold,
        })
        .eq("id", settingsId);

      if (error) throw error;
      toast.success(t("settings.settingsSaved"));
    } catch (error: any) {
      toast.error(error.message || t("settings.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const addSetup = () => {
    setErrors({ ...errors, setup_definitions: undefined });
    
    if (!newSetup.trim()) return;
    
    if (newSetup.trim().length > 50) {
      setErrors({ ...errors, setup_definitions: t("validation.setupItemTooLong") });
      return;
    }
    
    if (setupDefinitions.length >= 20) {
      setErrors({ ...errors, setup_definitions: t("validation.setupMaxReached") });
      return;
    }
    
    if (!setupDefinitions.find(s => s.name === newSetup.trim())) {
      setSetupDefinitions([...setupDefinitions, { name: newSetup.trim(), checklist: [] }]);
      setNewSetup("");
    }
  };

  const removeSetup = (setupName: string) => {
    setSetupDefinitions(setupDefinitions.filter((s) => s.name !== setupName));
  };

  const addChecklistItem = (setupName: string) => {
    if (!newChecklistItem.trim()) return;
    
    setSetupDefinitions(setupDefinitions.map(setup => {
      if (setup.name === setupName) {
        if (setup.checklist.length >= 10) {
          toast.error(t("validation.checklistMaxReached"));
          return setup;
        }
        return {
          ...setup,
          checklist: [...setup.checklist, newChecklistItem.trim()]
        };
      }
      return setup;
    }));
    setNewChecklistItem("");
  };

  const removeChecklistItem = (setupName: string, itemIndex: number) => {
    setSetupDefinitions(setupDefinitions.map(setup => {
      if (setup.name === setupName) {
        return {
          ...setup,
          checklist: setup.checklist.filter((_, idx) => idx !== itemIndex)
        };
      }
      return setup;
    }));
  };

  const addTag = () => {
    setErrors({ ...errors, tags: undefined });
    
    if (!newTag.trim()) return;
    
    if (newTag.trim().length > 30) {
      setErrors({ ...errors, tags: t("validation.tagItemTooLong") });
      return;
    }
    
    if (tags.length >= 30) {
      setErrors({ ...errors, tags: t("validation.tagMaxReached") });
      return;
    }
    
    if (!tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-6">
        <PageHeader
          title={t("settings.title")}
          subtitle={t("settings.subtitle")}
        />

        <div className="grid gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                {t("settings.general")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LanguageSwitcher />
              
              <div className="grid gap-2">
                <Label>{t("settings.theme")}</Label>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <span className="text-sm text-muted-foreground">
                    {t("settings.themeDescription")}
                  </span>
                </div>
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="currency">{t("settings.currency")}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{t("settings.currencyHelp")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  </SelectContent>
                </Select>
                {errors.base_currency && (
                  <p className="text-sm text-destructive">{errors.base_currency}</p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="timezone">{t("settings.timezone")}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{t("settings.timezoneHelp")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="fees">{t("settings.defaultFees")} ($)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{t("settings.feesHelp")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="fees"
                  type="number"
                  step="0.01"
                  min="0"
                  value={defaultFees}
                  onChange={(e) => {
                    setDefaultFees(e.target.value);
                    setErrors({ ...errors, default_fees: undefined });
                  }}
                />
                {errors.default_fees && (
                  <p className="text-sm text-destructive">{errors.default_fees}</p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="slippage">{t("settings.defaultSlippage")} (%)</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{t("settings.slippageHelp")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="slippage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={defaultSlippage}
                  onChange={(e) => {
                    setDefaultSlippage(e.target.value);
                    setErrors({ ...errors, default_slippage: undefined });
                  }}
                />
                {errors.default_slippage && (
                  <p className="text-sm text-destructive">{errors.default_slippage}</p>
                )}
              </div>
          </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications")}</CardTitle>
              <CardDescription>{t("settings.notificationsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.enableNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.enableNotificationsDesc")}</p>
                </div>
                <input 
                  type="checkbox" 
                  className="h-5 w-5 accent-primary"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("settings.notificationSound")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.notificationSoundDesc")}</p>
                </div>
                <input 
                  type="checkbox" 
                  className="h-5 w-5 accent-primary"
                  checked={notificationSound}
                  onChange={(e) => setNotificationSound(e.target.checked)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>{t("settings.drawdownThreshold")}</Label>
                  <Badge variant="outline">{drawdownWarningThreshold}%</Badge>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="10"
                  value={drawdownWarningThreshold}
                  onChange={(e) => setDrawdownWarningThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">{t("settings.drawdownThresholdDesc")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Daily Trade Goal */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{ t("settings.dailyGoal")}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      {t("settings.dailyGoalTooltip")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>
                {t("settings.dailyGoalDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="dailyGoalAmount">{t("settings.dailyGoalAmount")}</Label>
                <Input
                  id="dailyGoalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={dailyGoalAmount}
                  onChange={(e) => setDailyGoalAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dailyGoalMaxTrades">{t("settings.dailyGoalMaxTrades")}</Label>
                <Input
                  id="dailyGoalMaxTrades"
                  type="number"
                  min="1"
                  value={dailyGoalMaxTrades}
                  onChange={(e) => setDailyGoalMaxTrades(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Trading Setups with Checklists */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t("settings.setups")}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">{t("settings.setupsHelp")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>{t("settings.setupsChecklistDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={t("settings.newSetupName")}
                    value={newSetup}
                    onChange={(e) => {
                      setNewSetup(e.target.value);
                      setErrors({ ...errors, setup_definitions: undefined });
                    }}
                    onKeyPress={(e) => e.key === "Enter" && addSetup()}
                  />
                  <Button onClick={addSetup}><Plus className="h-4 w-4" /></Button>
                </div>
                {errors.setup_definitions && (
                  <p className="text-sm text-destructive">{errors.setup_definitions}</p>
                )}
              </div>

              {setupDefinitions.length > 0 && (
                <Accordion type="single" collapsible className="w-full">
                  {setupDefinitions.map((setup) => (
                    <AccordionItem key={setup.name} value={setup.name}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">{setup.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {setup.checklist.length} {t("settings.checklistItems")}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder={t("settings.newChecklistItem")}
                              value={newChecklistItem}
                              onChange={(e) => setNewChecklistItem(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  addChecklistItem(setup.name);
                                }
                              }}
                            />
                            <Button 
                              size="sm" 
                              onClick={() => addChecklistItem(setup.name)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {setup.checklist.length > 0 && (
                            <div className="space-y-2">
                              {setup.checklist.map((item, idx) => (
                                <div 
                                  key={idx}
                                  className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                                >
                                  <span className="text-sm">{item}</span>
                                  <button
                                    onClick={() => removeChecklistItem(setup.name, idx)}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSetup(setup.name)}
                            className="w-full mt-2"
                          >
                            {t("settings.deleteSetup")}
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Trading Tags */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{t("settings.tags")}</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="inline-flex">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">{t("settings.tagsHelp")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>{t("settings.tagsDesc")}</CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder={t("settings.tags")}
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(e.target.value);
                    setErrors({ ...errors, tags: undefined });
                  }}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag}>{t("trades.save")}</Button>
              </div>
              {errors.tags && (
                <p className="text-sm text-destructive">{errors.tags}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="pr-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? t("common.loading") : t("settings.save")}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Settings;
