'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PollingRefreshControlProps {
  onRefresh: () => Promise<void>;
  interval?: number;
}

export function PollingRefreshControl({ onRefresh, interval = 30000 }: PollingRefreshControlProps) {
  const t = useTranslations();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
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
  }, [autoRefresh, interval, onRefresh]);

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
    <div className="flex items-center space-x-4 bg-muted/50 p-4 rounded-lg border border-border">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="autoRefresh"
          checked={autoRefresh}
          onCheckedChange={(checked) => setAutoRefresh(checked === true)}
        />
        <Label htmlFor="autoRefresh" className="text-sm text-foreground">
          {t('suspects.auto_refresh')}
        </Label>
      </div>

      {autoRefresh && (
        <div className="text-sm text-muted-foreground">
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