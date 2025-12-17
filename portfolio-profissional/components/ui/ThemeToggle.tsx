'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeContext } from '@/lib/context/ThemeContext';
import { ThemeMode } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'button' | 'dropdown';
}

export function ThemeToggle({ 
  className, 
  showLabel = false, 
  variant = 'button' 
}: ThemeToggleProps) {
  const { currentTheme, isDark, isLoaded, setTheme, toggleTheme } = useThemeContext();

  if (!isLoaded) {
    return (
      <div className={cn(
        "w-10 h-10 rounded-lg bg-muted animate-pulse",
        className
      )} />
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative group">
        <button
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            "bg-background border border-border hover:bg-accent",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className
          )}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
        
        <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <ThemeOption
            theme="light"
            currentTheme={currentTheme}
            onSelect={setTheme}
            icon={<Sun className="w-4 h-4" />}
            label="Claro"
          />
          <ThemeOption
            theme="dark"
            currentTheme={currentTheme}
            onSelect={setTheme}
            icon={<Moon className="w-4 h-4" />}
            label="Escuro"
          />
          <ThemeOption
            theme="system"
            currentTheme={currentTheme}
            onSelect={setTheme}
            icon={<Monitor className="w-4 h-4" />}
            label="Sistema"
          />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg",
        "bg-background border border-border hover:bg-accent",
        "transition-all duration-200 hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        showLabel && "w-auto px-4 gap-2",
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={cn(
            "absolute inset-0 w-5 h-5 transition-all duration-300",
            isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
          )} 
        />
        <Moon 
          className={cn(
            "absolute inset-0 w-5 h-5 transition-all duration-300",
            isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"
          )} 
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? 'Claro' : 'Escuro'}
        </span>
      )}
    </button>
  );
}

interface ThemeOptionProps {
  theme: ThemeMode;
  currentTheme: ThemeMode;
  onSelect: (theme: ThemeMode) => void;
  icon: React.ReactNode;
  label: string;
}

function ThemeOption({ theme, currentTheme, onSelect, icon, label }: ThemeOptionProps) {
  return (
    <button
      onClick={() => onSelect(theme)}
      className={cn(
        "flex items-center w-full px-4 py-2 text-sm text-left",
        "hover:bg-accent transition-colors duration-150",
        currentTheme === theme && "bg-accent text-accent-foreground"
      )}
    >
      <span className="mr-3">{icon}</span>
      {label}
      {currentTheme === theme && (
        <span className="ml-auto text-xs text-muted-foreground">✓</span>
      )}
    </button>
  );
}