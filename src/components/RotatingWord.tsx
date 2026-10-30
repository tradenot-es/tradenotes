import { useState, useEffect } from "react";
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

  // All words share one grid cell; the hidden ones keep the cell as wide as the widest word as
  // rendered (not the one with the most letters: "systematic" is wider than "disciplined"), so the
  // text after it never overlaps or jumps
  return (
    <span className="inline-grid">
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden={i !== currentIndex}
          className={cn(
            "[grid-area:1/1] transition-all duration-300 ease-out",
            // hidden words stay transparent too: with only `invisible`, the outgoing word's opacity
            // would transition back to 1 while visibility still counts as visible, so it showed up
            // next to the incoming word
            i !== currentIndex
              ? "invisible opacity-0 translate-y-2"
              : isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2",
            className
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
