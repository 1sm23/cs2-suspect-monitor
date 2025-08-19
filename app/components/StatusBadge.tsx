'use client';

import { useTranslations } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations();

  const statusColors = {
    online: 'bg-green-100 text-green-800 hover:bg-green-200',
    offline: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    private: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    banned: 'bg-red-100 text-red-800 hover:bg-red-200',
    unknown: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  };

  const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.unknown;
  return (
    <Badge variant="secondary" className={colorClass}>
      {t(`status.${status}` as any)}
    </Badge>
  );
}