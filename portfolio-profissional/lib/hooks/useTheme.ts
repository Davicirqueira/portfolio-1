'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '@/lib/types';
import { 
  getStoredTheme, 
  setStoredTheme, 
  getSystemTheme, 
  getEffectiveTheme, 
  applyTheme 
} from '@/lib/utils/theme';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme() || 'system';
    const effectiveTheme = getEffectiveTheme(storedTheme);
    
    setCurrentTheme(storedTheme);
    setIsDark(effectiveTheme === 'dark');
    applyTheme(effectiveTheme);
    setIsLoaded(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!isLoaded) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (currentTheme === 'system') {
        const systemTheme = getSystemTheme();
        setIsDark(systemTheme === 'dark');
        applyTheme(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [currentTheme, isLoaded]);

  const setTheme = useCallback((theme: ThemeMode) => {
    const effectiveTheme = getEffectiveTheme(theme);
    
    setCurrentTheme(theme);
    setIsDark(effectiveTheme === 'dark');
    setStoredTheme(theme);
    applyTheme(effectiveTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    // Se o tema atual é 'system', alterna baseado no estado efetivo (isDark)
    // Se não, alterna entre 'light' e 'dark'
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  }, [isDark, setTheme]);

  return {
    currentTheme,
    isDark,
    isLoaded,
    setTheme,
    toggleTheme,
  };
}