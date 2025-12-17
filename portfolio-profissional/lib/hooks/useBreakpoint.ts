'use client';

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/lib/constants';

type Breakpoint = keyof typeof BREAKPOINTS;

export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateSize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });

      // Determine current breakpoint
      if (width >= BREAKPOINTS['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= BREAKPOINTS.md) {
        setCurrentBreakpoint('md');
      } else {
        setCurrentBreakpoint('sm');
      }
    }

    // Set initial size
    updateSize();

    // Listen for resize events
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const isAbove = (breakpoint: Breakpoint): boolean => {
    return windowSize.width >= BREAKPOINTS[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint): boolean => {
    return windowSize.width < BREAKPOINTS[breakpoint];
  };

  const isBetween = (min: Breakpoint, max: Breakpoint): boolean => {
    return windowSize.width >= BREAKPOINTS[min] && windowSize.width < BREAKPOINTS[max];
  };

  return {
    currentBreakpoint,
    windowSize,
    isAbove,
    isBelow,
    isBetween,
    isMobile: isBelow('md'),
    isTablet: isBetween('md', 'lg'),
    isDesktop: isAbove('lg'),
  };
}