// Theme System Types

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeSystem {
  currentTheme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
  };
  animations: {
    duration: string;
    easing: string;
  };
}