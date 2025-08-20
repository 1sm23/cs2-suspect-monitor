'use client';

import { useState, useEffect, useCallback } from 'react';
import { NavigationBar } from '@/app/components/NavigationBar';
import { SuspectCard } from '@/app/components/SuspectCard';
import { PollingRefreshControl } from '@/app/components/PollingRefreshControl';
import { AddSuspectDialog } from '@/app/components/AddSuspectDialog';
import { useTranslations } from '@/lib/i18n';
import { Suspect } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export default function SuspectsPage() {
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filterOnline, setFilterOnline] = useState(false);
  const [filterInGame, setFilterInGame] = useState(false);
  const [filterGameLaunched, setFilterGameLaunched] = useState(false);
  const t = useTranslations();

  const fetchSuspects = async () => {
    try {
      // 构建筛选参数
      const params = new URLSearchParams();
      if (filterOnline) params.append('online', 'true');
      if (filterGameLaunched) params.append('cs2_launched', 'true'); 
      if (filterInGame) params.append('in_game', 'true');

      const url = `/api/suspects${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setSuspects(data);
      } else {
        setError(t('common.error'));
      }
    } catch (error) {
      console.error('Failed to fetch suspects:', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuspects();
  }, []);

  // 当筛选条件改变时重新获取数据
  useEffect(() => {
    fetchSuspects();
  }, [filterOnline, filterGameLaunched, filterInGame]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/suspects?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSuspects(suspects.filter(s => s.id !== id));
      } else {
        setError(t('common.error'));
      }
    } catch (error) {
      console.error('Failed to delete suspect:', error);
      setError(t('common.error'));
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      // 构建筛选参数，和 fetchSuspects 保持一致
      const params = new URLSearchParams();
      if (filterOnline) params.append('online', 'true');
      if (filterGameLaunched) params.append('cs2_launched', 'true'); 
      if (filterInGame) params.append('in_game', 'true');

      const url = `/api/suspects${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setSuspects(data);
        setError('');
      } else {
        setError(t('common.error'));
      }
    } catch (error) {
      console.error('Failed to fetch suspects:', error);
      setError(t('common.error'));
    }
  }, [filterOnline, filterGameLaunched, filterInGame, t]);

  const handleSuspectAdded = () => {
    fetchSuspects(); // 使用 fetchSuspects 保持筛选条件一致
  };

  const handleSuspectUpdated = (updatedSuspect: Suspect) => {
    setSuspects(suspects.map(s => s.id === updatedSuspect.id ? updatedSuspect : s));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-lg text-foreground">{t('common.loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            {t('suspects.list_title')}
          </h1>
        </div>

        <div className="mb-6">
          <PollingRefreshControl onRefresh={handleRefresh} />
        </div>

        {/* 筛选控制 */}
        <div className="mb-6 bg-card rounded-lg shadow-sm p-4 border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">{t('suspects.filter_options')}</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="filter-online"
                checked={filterOnline}
                onCheckedChange={setFilterOnline}
              />
              <Label htmlFor="filter-online" className="text-sm">
                {t('suspects.filter_online')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="filter-launched"
                checked={filterGameLaunched}
                onCheckedChange={setFilterGameLaunched}
              />
              <Label htmlFor="filter-launched" className="text-sm">
                {t('suspects.filter_game_launched')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="filter-in-game"
                checked={filterInGame}
                onCheckedChange={setFilterInGame}
              />
              <Label htmlFor="filter-in-game" className="text-sm">
                {t('suspects.filter_in_game')}
              </Label>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-destructive/10 p-4 border border-destructive/20">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {suspects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              No suspects found. Add some suspects to start monitoring.
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                suspect={suspect}
                onDelete={handleDelete}
                onUpdate={handleSuspectUpdated}
              />
            ))}
          </div>
        )}
      </div>

      {/* 固定的加号按钮 */}
      <Button
        onClick={() => setAddDialogOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">{t('suspects.add_button')}</span>
      </Button>

      {/* 添加嫌疑人对话框 */}
      <AddSuspectDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuspectAdded={handleSuspectAdded}
      />
    </div>
  );
}
