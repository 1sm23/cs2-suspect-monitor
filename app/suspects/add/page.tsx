'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationBar from '@/components/NavigationBar';
import { useLanguage, t } from '@/components/LanguageProvider';

export default function AddSuspectPage() {
  const [steamUrl, setSteamUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { locale } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/suspects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steamUrl: steamUrl.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/suspects');
      } else {
        setError(data.error || t('messages.error', locale));
      }
    } catch (error) {
      setError(t('messages.error', locale));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavigationBar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('navigation.add_suspect', locale)}
        </h1>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="steamUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('forms.steam_url', locale)}
              </label>
              <input
                type="text"
                id="steamUrl"
                required
                className="input"
                placeholder={t('forms.steam_url_placeholder', locale)}
                value={steamUrl}
                onChange={(e) => setSteamUrl(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('forms.notes', locale)}
              </label>
              <textarea
                id="notes"
                rows={4}
                className="input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? t('messages.loading', locale) : t('actions.add', locale)}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                {t('actions.cancel', locale)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}