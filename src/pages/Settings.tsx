import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [defaultFees, setDefaultFees] = useState("2.00");
  const [setups, setSetups] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newSetup, setNewSetup] = useState("");
  const [newTag, setNewTag] = useState("");
  const [settingsId, setSettingsId] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .single();

    if (!error && data) {
      setSettingsId(data.id);
      setCurrency(data.base_currency);
      setTimezone(data.timezone);
      setDefaultFees(data.default_fees.toString());
      setSetups(data.setups || []);
      setTags(data.tags || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          base_currency: currency,
          timezone: timezone,
          default_fees: parseFloat(defaultFees),
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
    if (newSetup.trim() && !setups.includes(newSetup.trim())) {
      setSetups([...setups, newSetup.trim()]);
      setNewSetup("");
    }
  };

  const removeSetup = (setup: string) => {
    setSetups(setups.filter((s) => s !== setup));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.general")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LanguageSwitcher />
            <div className="grid gap-2">
              <Label htmlFor="currency">{t("settings.currency")}</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">{t("settings.timezone")}</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fees">{t("settings.defaultFees")} ($)</Label>
              <Input
                id="fees"
                type="number"
                step="0.01"
                value={defaultFees}
                onChange={(e) => setDefaultFees(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.setups")}</CardTitle>
            <CardDescription>{t("settings.setupsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t("settings.setups")}
                value={newSetup}
                onChange={(e) => setNewSetup(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addSetup()}
              />
              <Button onClick={addSetup}>{t("trades.save")}</Button>
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

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.tags")}</CardTitle>
            <CardDescription>{t("settings.tagsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={t("settings.tags")}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag}>{t("trades.save")}</Button>
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
  );
};

export default Settings;
