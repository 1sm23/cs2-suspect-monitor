'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface PollingRefreshControlProps {
  onRefresh: () => Promise<void>;
  interval?: number;
}

export function PollingRefreshControl({ onRefresh, interval = 30000 }: PollingRefreshControlProps) {
  const t = useTranslations();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let countdownId: NodeJS.Timeout;

    if (autoRefresh) {
      intervalId = setInterval(() => {
        handleRefresh();
      }, interval);

      countdownId = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (countdownId) clearInterval(countdownId);
    };
  }, [autoRefresh, interval]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCountdown(30);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoRefresh"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="autoRefresh" className="text-sm text-gray-700">
          {t('suspects.auto_refresh')}
        </label>
      </div>

      {autoRefresh && (
        <div className="text-sm text-gray-600">
          Next refresh in {countdown}s
        </div>
      )}

      <Button
        onClick={handleRefresh}
        disabled={isRefreshing}
        size="sm"
      >
        {isRefreshing ? t('suspects.refreshing') : t('suspects.manual_refresh')}
      </Button>
    </div>
  );
}