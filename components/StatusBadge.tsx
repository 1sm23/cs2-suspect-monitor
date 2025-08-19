import clsx from 'clsx';
import { useLanguage, t } from './LanguageProvider';

interface StatusBadgeProps {
  status: 'monitoring' | 'banned' | 'cleared';
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const { locale } = useLanguage();

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'status-monitoring': status === 'monitoring',
          'status-banned': status === 'banned',
          'status-cleared': status === 'cleared',
        },
        className
      )}
    >
      {t(`status.${status}`, locale)}
    </span>
  );
}