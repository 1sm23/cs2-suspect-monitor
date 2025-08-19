'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspect } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { useLanguage } from './LanguageProvider';

interface SuspectCardProps {
  suspect: Suspect;
  onDelete: (id: number) => void;
}

export function SuspectCard({ suspect, onDelete }: SuspectCardProps) {
  const { t } = useLanguage();

  const handleDelete = () => {
    if (confirm(t('common.confirm'))) {
      onDelete(suspect.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Image
            src={suspect.avatar_url || '/avatar_placeholder.png'}
            alt={suspect.nickname || suspect.steam_id}
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {suspect.nickname || t('suspects.nickname')}
            </h3>
            <p className="text-sm text-gray-600">{suspect.steam_id}</p>
            <div className="flex items-center space-x-2 mt-2">
              <StatusBadge status={suspect.status} />
              {suspect.last_checked && (
                <span className="text-xs text-gray-500">
                  {new Date(suspect.last_checked).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link
            href={`/suspects/${suspect.id}`}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            {t('suspects.view_details')}
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            {t('suspects.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}