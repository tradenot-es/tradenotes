import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface AttentionCTAProps {
  children: React.ReactNode;
  className?: string;
  intervalMs?: number;
}

export function AttentionCTA({ 
  children, 
  className,
  intervalMs = 13000 
}: AttentionCTAProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Attention loop - triggers servo pulse periodically
  useEffect(() => {
    if (prefersReducedMotion) return;

    const triggerPulse = () => {
      setIsPulsing(true);
      // Reset after animation completes (1100ms to be safe)
      setTimeout(() => setIsPulsing(false), 1100);
    };

    // Initial delay before first pulse (3-5 seconds after page load)
    const initialDelay = setTimeout(triggerPulse, 4000);
    
    // Regular interval for subsequent pulses
    const interval = setInterval(triggerPulse, intervalMs);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [intervalMs, prefersReducedMotion]);

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Ripple Ring - only during pulse, respects reduced motion */}
      {isPulsing && !prefersReducedMotion && (
        <span 
          className="absolute inset-0 rounded-md border-2 border-primary/50 animate-servo-ripple pointer-events-none"
          aria-hidden="true"
        />
      )}
      
      {/* Button wrapper with servo pulse animation */}
      <span 
        className={cn(
          "inline-block transition-all duration-300",
          isPulsing && !prefersReducedMotion && "animate-servo-pulse",
          // Reduced motion: subtle shadow change only
          isPulsing && prefersReducedMotion && "shadow-[0_0_30px_hsl(158_100%_50%_/_0.3)]"
        )}
      >
        {children}
      </span>
    </div>
  );
}
