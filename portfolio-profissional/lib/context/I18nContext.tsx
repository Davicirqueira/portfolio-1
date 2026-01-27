'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Translations, translations } from '@/lib/i18n/translations';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt'); // Default to Portuguese
  const [mounted, setMounted] = useState(false);

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('admin-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'pt')) {
      setLanguageState(savedLanguage);
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.toLowerCase();
      if (browserLanguage.startsWith('pt')) {
        setLanguageState('pt');
      } else {
        setLanguageState('en');
      }
    }
    setMounted(true);
  }, []);

  // Save language preference to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('admin-language', language);
      
      // Update document language attribute
      document.documentElement.lang = language;
      
      // Update document direction (for future RTL support)
      document.documentElement.dir = 'ltr'; // Both PT and EN are LTR
    }
  }, [language, mounted]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
    isRTL: false, // Neither PT nor EN are RTL
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook for getting nested translation values
export function useTranslation() {
  const { t, language } = useI18n();
  
  const translate = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = t;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : fallback || key;
  };

  return { t: translate, language, translations: t };
}