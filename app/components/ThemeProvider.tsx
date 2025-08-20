'use client';

import { useTheme } from '@/lib/i18n';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useTheme(); // This hook manages the theme application
  return <>{children}</>;
}