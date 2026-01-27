import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FeatureRowProps {
  feature: {
    icon: ReactNode;
    title: string;
    description: string;
    benefits: string[];
    extendedDescription?: string;
  };
  imagePosition: "left" | "right";
  screenshotUrl?: string;
}

export function FeatureRow({ feature, imagePosition, screenshotUrl }: FeatureRowProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "grid md:grid-cols-2 gap-8 items-center py-12 border-b border-border/50 last:border-0",
        imagePosition === "left" && "md:[&>*:first-child]:order-2"
      )}
    >
      {/* Content Side */}
      <div className="space-y-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {feature.icon}
        </div>
        <h3 className="text-2xl font-bold">{feature.title}</h3>
        <p className="text-muted-foreground text-lg">{feature.description}</p>

        {/* Benefit Bullets */}
        <ul className="space-y-2">
          {feature.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Optional: Detail Accordion */}
        {feature.extendedDescription && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto">
                {t("features.learnMore")}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 text-muted-foreground">
              {feature.extendedDescription}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>

      {/* Screenshot/Demo Placeholder */}
      <div className="aspect-video rounded-xl border border-primary/20 bg-muted/50 flex items-center justify-center overflow-hidden">
        {screenshotUrl ? (
          <img
            loading="lazy"
            src={screenshotUrl}
            alt={feature.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <span className="text-sm">Screenshot</span>
          </div>
        )}
      </div>
    </div>
  );
}
