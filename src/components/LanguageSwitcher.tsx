import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const languages = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "nl", name: "Nederlands" },
  { code: "it", name: "Italiano" },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="space-y-2">
      <Label>{t("settings.language")}</Label>
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger>
          <SelectValue placeholder={t("settings.selectLanguage")} />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
