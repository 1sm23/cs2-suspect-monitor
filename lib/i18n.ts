import { create } from 'zustand';
import enMessages from '../messages/en.json';
import zhMessages from '../messages/zh.json';

export type Locale = 'en' | 'zh';

const messages = {
  en: enMessages,
  zh: zhMessages,
} as const;

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nStore>((set) => ({
  locale: 'en' as Locale,
  setLocale: (locale: Locale) => set({ locale }),
}));

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
