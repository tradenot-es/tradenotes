import logo from "@/assets/tradenotes-logo-new-transparent.png";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="glossy-card relative py-4 px-6 rounded-2xl overflow-visible mb-6">
      <img
        src={logo}
        alt="TradeNotes"
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_25px_hsl(158,100%,45%,0.5)]"
      />
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex-shrink-0 min-w-0 max-w-[45%] relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1 truncate">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="shrink-0 flex items-center gap-2 z-10">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
