'use client';

import { useLanguage } from './LanguageProvider';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useLanguage();

  const statusColors = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-gray-100 text-gray-800',
    private: 'bg-yellow-100 text-yellow-800',
    banned: 'bg-red-100 text-red-800',
    unknown: 'bg-blue-100 text-blue-800',
  };

  const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.unknown;

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colorClass
    )}>
      {t(`status.${status}` as any)}
    </span>
  );
}