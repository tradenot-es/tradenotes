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
import { z } from "zod";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [defaultFees, setDefaultFees] = useState("2.00");
  const [defaultSlippage, setDefaultSlippage] = useState("0.5");
  const [setups, setSetups] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newSetup, setNewSetup] = useState("");
  const [newTag, setNewTag] = useState("");
  const [settingsId, setSettingsId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setups: z.array(
      z.string().trim().min(1).max(50, { message: t("validation.setupItemTooLong") })
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
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .maybeSingle();

    if (!error && data) {
      setSettingsId(data.id);
      setCurrency(data.base_currency);
      setTimezone(data.timezone);
      setDefaultFees(data.default_fees?.toString() || "2.00");
      setDefaultSlippage(data.default_slippage?.toString() || "0.5");
      setSetups(data.setups || []);
      setTags(data.tags || []);
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
      setups: setups,
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
          setups: setups,
          tags: tags,
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
    setErrors({ ...errors, setups: undefined });
    
    if (!newSetup.trim()) return;
    
    if (newSetup.trim().length > 50) {
      setErrors({ ...errors, setups: t("validation.setupItemTooLong") });
      return;
    }
    
    if (setups.length >= 20) {
      setErrors({ ...errors, setups: t("validation.setupMaxReached") });
      return;
    }
    
    if (!setups.includes(newSetup.trim())) {
      setSetups([...setups, newSetup.trim()]);
      setNewSetup("");
    }
  };

  const removeSetup = (setup: string) => {
    setSetups(setups.filter((s) => s !== setup));
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
        <div>
          <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
          <p className="text-muted-foreground">{t("settings.subtitle")}</p>
        </div>

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

          {/* Trading Setups */}
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
              <CardDescription>{t("settings.setupsDesc")}</CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder={t("settings.setups")}
                  value={newSetup}
                  onChange={(e) => {
                    setNewSetup(e.target.value);
                    setErrors({ ...errors, setups: undefined });
                  }}
                  onKeyPress={(e) => e.key === "Enter" && addSetup()}
                />
                <Button onClick={addSetup}>{t("trades.save")}</Button>
              </div>
              {errors.setups && (
                <p className="text-sm text-destructive">{errors.setups}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {setups.map((setup) => (
                <Badge key={setup} variant="secondary" className="pr-1">
                  {setup}
                  <button
                    onClick={() => removeSetup(setup)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
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
