'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  AccessibilityPreferences, 
  defaultAccessibilityPreferences,
  getMotionPreference,
  getHighContrastPreference
} from '@/lib/utils/accessibility';

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreferences: (updates: Partial<AccessibilityPreferences>) => void;
  resetPreferences: () => void;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontSize: string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultAccessibilityPreferences);
  const [mounted, setMounted] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('accessibility-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...defaultAccessibilityPreferences, ...parsed });
      } catch (error) {
        console.warn('Failed to parse accessibility preferences:', error);
      }
    } else {
      // Set system preferences as defaults
      const systemPreferences = {
        ...defaultAccessibilityPreferences,
        reducedMotion: getMotionPreference() === 'reduce',
        highContrast: getHighContrastPreference(),
      };
      setPreferences(systemPreferences);
    }
    setMounted(true);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    }
  }, [preferences, mounted]);

  // Apply CSS classes based on preferences
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // High contrast mode
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    root.classList.add(`font-${preferences.fontSize}`);

    // Screen reader mode
    if (preferences.screenReader) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }

  }, [preferences, mounted]);

  // Listen for system preference changes
  useEffect(() => {
    if (!mounted) return;

    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionMediaQuery.addEventListener('change', handleMotionChange);
    contrastMediaQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
    };
  }, [mounted]);

  const updatePreferences = (updates: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetPreferences = () => {
    setPreferences(defaultAccessibilityPreferences);
    localStorage.removeItem('accessibility-preferences');
  };

  const value: AccessibilityContextType = {
    preferences,
    updatePreferences,
    resetPreferences,
    isHighContrast: preferences.highContrast,
    isReducedMotion: preferences.reducedMotion,
    fontSize: preferences.fontSize,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Hook for keyboard navigation
export function useKeyboardNavigation() {
  const { preferences } = useAccessibility();
  
  return {
    isEnabled: preferences.keyboardNavigation,
    tabIndex: preferences.keyboardNavigation ? 0 : -1,
  };
}

// Hook for screen reader announcements
export function useScreenReader() {
  const { preferences } = useAccessibility();
  
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!preferences.screenReader) return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce, isEnabled: preferences.screenReader };
}