import { useEffect, useState } from "react";

interface RadialProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  subtitle?: string;
  showPercentage?: boolean;
  color?: "success" | "primary" | "warning" | "destructive";
}

export function RadialProgress({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  subtitle,
  showPercentage = true,
  color = "primary",
}: RadialProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  const colorMap = {
    success: "hsl(var(--success))",
    primary: "hsl(var(--primary))",
    warning: "hsl(45, 93%, 47%)", // amber/yellow
    destructive: "hsl(var(--destructive))",
  };

  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      )}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45, 93%, 47%)" />
              <stop offset="100%" stopColor="hsl(38, 92%, 50%)" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.2}
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color === "warning" ? `url(#${gradientId})` : colorMap[color]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
            className={`drop-shadow-[0_0_8px_${color === "success" ? "rgba(34,197,94,0.5)" : color === "warning" ? "rgba(234,179,8,0.5)" : color === "destructive" ? "rgba(239,68,68,0.5)" : "rgba(142,195,82,0.5)"}]`}
          />
        </svg>
        
        {/* Center content - only percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {Math.round(animatedValue)}%
            </span>
          )}
        </div>
      </div>
      
      {subtitle && (
        <span className="text-sm text-muted-foreground text-center">
          {subtitle}
        </span>
      )}
    </div>
  );
}
