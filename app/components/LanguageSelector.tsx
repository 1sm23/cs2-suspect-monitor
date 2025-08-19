'use client';

import { useI18nStore, type Locale } from '@/lib/i18n';

export function LanguageSelector() {
  const { locale, setLocale } = useI18nStore();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="px-3 py-1 border rounded-md bg-white"
    >
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
  );
}
