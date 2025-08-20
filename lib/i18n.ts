import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import enMessages from '../messages/en.json';
import zhMessages from '../messages/zh.json';

export type Locale = 'en' | 'zh';
export type Theme = 'light' | 'dark' | 'system';

const messages = {
  en: enMessages,
  zh: zhMessages,
} as const;

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      locale: 'en' as Locale,
      setLocale: (locale: Locale) => set({ locale }),
      theme: 'system' as Theme,
      setTheme: (theme: Theme) => set({ theme }),
    }),
    {
      name: 'cs2-monitor-settings',
    }
  )
);

type MessageKeys = keyof typeof enMessages;
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<typeof enMessages>;

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

export function useTranslations() {
  const { locale } = useI18nStore();

  return (key: TranslationKey): string => {
    return getNestedValue(messages[locale], key);
  };
}

export function getMessages(locale: Locale) {
  return messages[locale];
}

export const locales: Locale[] = ['en', 'zh'];
export const defaultLocale: Locale = 'en';

// Theme utility functions
export function useTheme() {
  const { theme, setTheme } = useI18nStore();

  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  return { theme, setTheme };
}
