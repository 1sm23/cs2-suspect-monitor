'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, t } from './LanguageProvider';

export default function NavigationBar() {
  const pathname = usePathname();
  const { locale, currentLang, setLanguage } = useLanguage();

  const navigation = [
    { name: t('navigation.suspects', locale), href: '/suspects' },
    { name: t('navigation.add_suspect', locale), href: '/suspects/add' },
    { name: t('navigation.import', locale), href: '/suspects/import' },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/suspects" className="text-xl font-bold text-gray-900 dark:text-white">
                {t('title', locale)}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={currentLang}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
            <button
              onClick={handleLogout}
              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium"
            >
              {t('navigation.logout', locale)}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}