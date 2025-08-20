'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/lib/i18n';

interface VACBadgeProps {
  vacBanned: boolean;
  gameBanCount: number;
}

export function VACBadge({ vacBanned, gameBanCount }: VACBadgeProps) {
  const t = useTranslations();
  if (vacBanned) {
    return <Badge variant="destructive">🔒 {t('ban_status.vac')}</Badge>;
  }

  if (gameBanCount > 0) {
    return (
      <Badge
        variant="secondary"
        className="bg-orange-100 text-orange-800 hover:bg-orange-200"
      >
        ⚠️ {t('ban_status.game')} ({gameBanCount})
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className="bg-green-100 text-green-800 hover:bg-green-200"
    >
      ✅ {t('ban_status.none')}
    </Badge>
  );
}
