'use client';

import { useEffect, useState } from 'react';
import { SuspectProfile } from '@/lib/types';
import NavigationBar from '@/components/NavigationBar';
import SuspectCard from '@/components/SuspectCard';
import { useLanguage, t } from '@/components/LanguageProvider';

export default function SuspectsPage() {
  const [suspects, setSuspects] = useState<SuspectProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { locale } = useLanguage();

  useEffect(() => {
    fetchSuspects();
  }, []);

  const fetchSuspects = async () => {
    try {
      const response = await fetch('/api/suspects');
      if (!response.ok) {
        throw new Error('Failed to fetch suspects');
      }
      const data = await response.json();
      setSuspects(data.data || []);
    } catch (error) {
      setError(t('messages.error', locale));
      console.error('Error fetching suspects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <NavigationBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">{t('messages.loading', locale)}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavigationBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('navigation.suspects', locale)}
          </h1>
          <button
            onClick={fetchSuspects}
            className="btn-secondary"
          >
            {t('actions.refresh', locale)}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {suspects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg">
              {t('messages.no_suspects', locale)}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suspects.map((suspect) => (
              <SuspectCard key={suspect.id} suspect={suspect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}