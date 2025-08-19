'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationBar } from '@/app/components/NavigationBar';
import { useLanguage } from '@/app/components/LanguageProvider';

export default function AddSuspectPage() {
  const [formData, setFormData] = useState({
    steam_id: '',
    nickname: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/suspects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/suspects');
      } else {
        setError(data.error || t('common.error'));
      }
    } catch (error) {
      setError(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t('suspects.add_title')}
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('suspects.steam_id')}
              </label>
              <input
                type="text"
                value={formData.steam_id}
                onChange={(e) => setFormData({ ...formData, steam_id: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="76561198000000000"
                required
                pattern="[0-9]{17}"
                title="Steam ID must be 17 digits"
              />
              <p className="text-sm text-gray-500 mt-1">
                17-digit Steam ID (e.g., 76561198000000000)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('suspects.nickname')} ({t('common.optional')})
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Player nickname"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('suspects.add_button')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}