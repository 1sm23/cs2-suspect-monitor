'use client';

import { useState, useEffect } from 'react';
import { NavigationBar } from '@/app/components/NavigationBar';
import { SuspectCard } from '@/app/components/SuspectCard';
import { PollingRefreshControl } from '@/app/components/PollingRefreshControl';
import { useLanguage } from '@/app/components/LanguageProvider';
import { Suspect } from '@/lib/types';

export default function SuspectsPage() {
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  const fetchSuspects = async () => {
    try {
      const response = await fetch('/api/suspects');
      if (response.ok) {
        const data = await response.json();
        setSuspects(data);
      }
    } catch (error) {
      console.error('Error fetching suspects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetch('/api/suspects/status/refresh', { method: 'POST' });
      await fetchSuspects();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/suspects/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSuspects(suspects.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting suspect:', error);
    }
  };

  useEffect(() => {
    fetchSuspects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('suspects.list_title')}
          </h1>
        </div>

        <div className="mb-6">
          <PollingRefreshControl onRefresh={handleRefresh} />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">{t('common.loading')}</div>
          </div>
        ) : suspects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">No suspects found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                suspect={suspect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}