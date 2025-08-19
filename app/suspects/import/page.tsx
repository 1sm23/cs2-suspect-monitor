'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationBar } from '@/app/components/NavigationBar';
import { useLanguage } from '@/app/components/LanguageProvider';

export default function ImportSuspectsPage() {
  const [importData, setImportData] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      // Parse the import data
      const lines = importData.trim().split('\n');
      const suspects = lines.map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          steam_id: parts[0],
          nickname: parts.slice(1).join(' ') || undefined,
        };
      }).filter(s => s.steam_id);

      const response = await fetch('/api/suspects/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suspects }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to import suspects' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {t('suspects.import_title')}
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Data
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-64"
                placeholder="Enter one Steam ID per line, optionally followed by nickname:&#10;76561198000000001&#10;76561198000000002 Player Name&#10;76561198000000003 Another Player"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter one Steam ID per line. You can optionally add a nickname after each Steam ID separated by spaces.
              </p>
            </div>

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
                {isSubmitting ? t('common.loading') : 'Import Suspects'}
              </button>
            </div>
          </form>

          {result && (
            <div className="mt-6 p-4 border rounded-md">
              {result.error ? (
                <div className="text-red-600">
                  <h3 className="font-medium">Error:</h3>
                  <p>{result.error}</p>
                </div>
              ) : (
                <div className="text-green-600">
                  <h3 className="font-medium">Import Results:</h3>
                  <ul className="mt-2 space-y-1">
                    <li>Imported: {result.imported}</li>
                    <li>Skipped: {result.skipped}</li>
                    {result.errors.length > 0 && (
                      <li>
                        Errors: {result.errors.length}
                        <ul className="ml-4 mt-1 text-red-600 text-sm">
                          {result.errors.map((error: string, index: number) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </li>
                    )}
                  </ul>
                  <button
                    onClick={() => router.push('/suspects')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View Suspects
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}