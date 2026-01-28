import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface GoalRadialCellProps {
  percentage: number;
  value: number;
  achieved: boolean;
  label: string;
  operator: ">=" | "<=";
  target: number;
  size?: number;
  formatValue?: (value: number) => string;
  onClick?: () => void;
}

export function GoalRadialCell({
  percentage,
  value,
  achieved,
  label,
  operator,
  target,
  size = 40,
  formatValue = (v) => v.toFixed(1),
  onClick,
}: GoalRadialCellProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (achieved) return "hsl(var(--success))";
    if (percentage >= 75) return "hsl(142.1, 76.2%, 36.3%)"; // success/70
    if (percentage >= 50) return "hsl(45, 93%, 47%)"; // warning
    if (percentage >= 25) return "hsl(45, 93%, 47%, 0.7)"; // warning/70
    return "hsl(var(--destructive))";
  };

  const getBgColorClass = () => {
    if (achieved) return "bg-success/10";
    if (percentage >= 50) return "bg-warning/10";
    return "bg-destructive/10";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg p-1 cursor-pointer transition-all hover:scale-105",
            getBgColorClass()
          )}
        >
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="hsl(var(--border))"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.3}
              />
              {/* Progress circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={getColor()}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold tabular-nums">
                {Math.round(percentage)}%
              </span>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="z-[100]">
        <div className="text-sm space-y-1">
          <div className="font-medium">{label}</div>
          <div className="text-muted-foreground">
            {formatValue(value)} / {operator} {formatValue(target)}
          </div>
          <div className={achieved ? "text-success" : "text-destructive"}>
            {achieved ? "✓ Goal Achieved" : "✗ Goal Not Met"}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
