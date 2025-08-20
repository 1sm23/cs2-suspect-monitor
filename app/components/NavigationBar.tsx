'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations, useI18nStore } from '@/lib/i18n';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NavigationBar() {
  const t = useTranslations();
  const { locale, setLocale } = useI18nStore();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLanguageChange = (newLocale: 'en' | 'zh') => {
    setLocale(newLocale);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const ThemeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-blue-700 text-white border-blue-600 hover:bg-blue-800 hover:text-white">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          {t('theme.light')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          {t('theme.dark')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="h-4 w-4 mr-2" />
          {t('theme.system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/suspects" className="text-xl font-bold">
              CS2 Monitor
            </Link>
            {/* <div className="flex space-x-4">
              <Link 
                href="/suspects" 
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('navigation.suspects')}
              </Link>
              <Link 
                href="/suspects/import" 
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('navigation.import')}
              </Link>
            </div> */}
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[120px] bg-blue-700 text-white border-blue-600 hover:bg-blue-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
            
            <button
              onClick={handleLogout}
              className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('navigation.logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}