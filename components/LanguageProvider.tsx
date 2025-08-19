'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '@/lib/types';

interface LanguageContextType {
  locale: Locale;
  currentLang: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLang, setCurrentLang] = useState('zh');
  const [locale, setLocale] = useState<Locale>({});

  useEffect(() => {
    loadLocale(currentLang);
  }, [currentLang]);

  async function loadLocale(lang: string) {
    try {
      const localeData = await import(`@/locales/${lang}.json`);
      setLocale(localeData.default);
    } catch (error) {
      console.error(`Failed to load locale ${lang}:`, error);
    }
  }

  const setLanguage = (lang: string) => {
    setCurrentLang(lang);
    localStorage.setItem('preferred-language', lang);
  };

  useEffect(() => {
    const saved = localStorage.getItem('preferred-language');
    if (saved && ['en', 'zh'].includes(saved)) {
      setCurrentLang(saved);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, currentLang, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function t(key: string, locale: Locale): string {
  const keys = key.split('.');
  let value: any = locale;
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}