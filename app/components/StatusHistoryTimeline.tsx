'use client';

import { SuspectStatusHistory } from '@/lib/types';
import { useTranslations } from '@/lib/i18n';

interface StatusHistoryTimelineProps {
  history: SuspectStatusHistory[];
}

export function StatusHistoryTimeline({ history }: StatusHistoryTimelineProps) {
  const t = useTranslations();

  if (history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No status history available
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, index) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {index !== history.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-900">
                      Status changed from{' '}
                      <span className="font-medium">
                        {item.old_status ? t((`status.${item.old_status}`) as any) : 'Unknown'}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {t((`status.${item.new_status}`) as any)}
                      </span>
                    </p>
                    {item.nickname && (
                      <p className="text-sm text-gray-500">
                        Nickname: {item.nickname}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={item.created_at}>
                      {new Date(item.created_at).toLocaleString()}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}