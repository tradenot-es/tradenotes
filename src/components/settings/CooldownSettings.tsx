import { useTranslation } from "react-i18next";
import { Coffee } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CooldownRule } from "@/lib/behavior";

interface CooldownSettingsProps {
  rule: CooldownRule;
  onChange: (rule: CooldownRule) => void;
}

/** Self-imposed break after a losing streak; the dashboard shows the countdown. */
export function CooldownSettings({ rule, onChange }: CooldownSettingsProps) {
  const { t } = useTranslation();
  const toInt = (v: string, min: number, max: number) => Math.min(max, Math.max(min, parseInt(v) || min));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-primary" aria-hidden />
              {t("settings.cooldown.title")}
            </CardTitle>
            <CardDescription className="mt-1.5">{t("settings.cooldown.description")}</CardDescription>
          </div>
          <Switch
            checked={rule.enabled}
            onCheckedChange={(enabled) => onChange({ ...rule, enabled })}
            aria-label={t("settings.cooldown.enable")}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cooldown-losses">{t("settings.cooldown.afterLosses")}</Label>
            <Input
              id="cooldown-losses"
              type="number"
              min="1"
              max="20"
              value={rule.after_losses}
              disabled={!rule.enabled}
              onChange={(e) => onChange({ ...rule, after_losses: toInt(e.target.value, 1, 20) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cooldown-minutes">{t("settings.cooldown.minutes")}</Label>
            <Input
              id="cooldown-minutes"
              type="number"
              min="1"
              max="480"
              step="5"
              value={rule.minutes}
              disabled={!rule.enabled}
              onChange={(e) => onChange({ ...rule, minutes: toInt(e.target.value, 1, 480) })}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t("settings.cooldown.hint")}</p>
      </CardContent>
    </Card>
  );
}
