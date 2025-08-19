import Link from 'next/link';
import Image from 'next/image';
import { SuspectProfile } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface SuspectCardProps {
  suspect: SuspectProfile;
}

export default function SuspectCard({ suspect }: SuspectCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center space-x-4">
        <Image
          src={suspect.avatarUrl || '/avatar_placeholder.png'}
          alt={suspect.displayName}
          width={64}
          height={64}
          className="rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
              {suspect.displayName}
            </h3>
            <StatusBadge status={suspect.status} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            Steam ID: {suspect.steamId}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Updated: {new Date(suspect.updatedAt).toLocaleDateString()}
          </p>
          {suspect.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {suspect.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Evidence: {suspect.evidence.length} | Bans: {suspect.banHistory.length}
        </div>
        <Link
          href={`/suspects/${suspect.id}`}
          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}