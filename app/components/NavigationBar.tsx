'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from './LanguageProvider';

export function NavigationBar() {
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/suspects" className="text-xl font-bold">
              CS2 Monitor
            </Link>
            <div className="flex space-x-4">
              <Link 
                href="/suspects" 
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('navigation.suspects')}
              </Link>
              <Link 
                href="/suspects/add" 
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('navigation.add_suspect')}
              </Link>
              <Link 
                href="/suspects/import" 
                className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('navigation.import')}
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-blue-700 text-white px-2 py-1 rounded text-sm"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
            
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