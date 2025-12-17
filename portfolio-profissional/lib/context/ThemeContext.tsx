'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeMode } from '@/lib/types';
import { useTheme } from '@/lib/hooks/useTheme';

interface ThemeContextType {
  currentTheme: ThemeMode;
  isDark: boolean;
  isLoaded: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeState = useTheme();

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}