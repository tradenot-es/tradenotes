import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Wrench, 
  BarChart3, 
  Bot, 
  FileText, 
  Globe,
  LucideIcon, Plug, ShieldCheck } from "lucide-react";
import { featureFlags } from "@/config/featureFlags";

interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
}

interface CategoryNavProps {
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

export function CategoryNav({ activeCategory, onCategoryClick }: CategoryNavProps) {
  const { t } = useTranslation();

  const categories: Category[] = [
    { id: "discipline", name: t("features.categories.discipline"), icon: ShieldCheck },
    { id: "import", name: t("features.categories.import"), icon: Plug },
    { id: "trading-tools", name: t("features.categories.tradingTools"), icon: Wrench },
    { id: "analytics", name: t("features.categories.analytics"), icon: BarChart3 },
    ...(featureFlags.AI_FEATURES ? [{ id: "ai", name: t("features.categories.ai"), icon: Bot }] : []),
    { id: "reports", name: t("features.categories.reports"), icon: FileText },
    { id: "market-intel", name: t("features.categories.marketIntel"), icon: Globe },
  ];

  const handleClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = 140; // Account for sticky nav
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-16 z-40 bg-background/95 backdrop-blur-lg border-b py-3">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollArea className="w-full">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "ghost"}
                size="sm"
                onClick={() => handleClick(cat.id)}
                className="shrink-0 gap-2"
              >
                <cat.icon className="h-4 w-4" />
                {cat.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </nav>
  );
}
