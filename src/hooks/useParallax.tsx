import { useState, useEffect, useCallback } from 'react';

export function useParallax(speed: number = 0.3) {
  const [offset, setOffset] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleScroll = useCallback(() => {
    if (!isReducedMotion) {
      setOffset(window.scrollY * speed);
    }
  }, [speed, isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, isReducedMotion]);

  return isReducedMotion ? 0 : offset;
}
