'use client';

import { useTranslations } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

interface PrivacyBadgeProps {
  communityvisibilitystate: number;
}

export function PrivacyBadge({ communityvisibilitystate }: PrivacyBadgeProps) {
  const t = useTranslations();

  // communityvisibilitystate: 1 = 私密, 3 = 公开
  const isPrivate = communityvisibilitystate === 1;

  if (!isPrivate) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className="bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
      title={t('suspects.private_profile')}
    >
      <Lock className="h-3 w-3 mr-1" />
      {t('suspects.private')}
    </Badge>
  );
}
