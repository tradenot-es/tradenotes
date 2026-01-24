import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface RotatingWordProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

export function RotatingWord({ 
  words, 
  intervalMs = 3000, 
  className 
}: RotatingWordProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
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

  // Find the longest word for stable width
  const longestWord = useMemo(() => {
    return words.reduce((a, b) => a.length > b.length ? a : b, '');
  }, [words]);

  // Rotation interval
  useEffect(() => {
    if (prefersReducedMotion || words.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsVisible(true);
      }, 300);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [words.length, intervalMs, prefersReducedMotion]);

  // Static display for reduced motion or single word
  if (prefersReducedMotion || words.length <= 1) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <span className="relative inline-block align-bottom">
      {/* Invisible placeholder for stable width */}
      <span className={cn("invisible", className)} aria-hidden="true">
        {longestWord}
      </span>
      
      {/* Animated word - absolutely positioned */}
      <span
        className={cn(
          "absolute left-0 top-0 transition-all duration-300 ease-out",
          isVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-2",
          className
        )}
      >
        {words[currentIndex]}
      </span>
    </span>
  );
}
