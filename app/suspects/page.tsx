'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { authManager } from '@/lib/auth-manager';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// 嫌疑人卡片骨架屏组件
function SuspectCardSkeleton() {
  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
      {/* 头像和基本信息 */}
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* 状态徽章 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>

      {/* 最后状态和时间 */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* 按钮区域 */}
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export default function SuspectsPage() {
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filterOnline, setFilterOnline] = useState(false);
  const [filterInGame, setFilterInGame] = useState(false);
  const [filterGameLaunched, setFilterGameLaunched] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  // 客户端认证检查
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      router.push('/login');
      return;
    }
  }, [router]);

  const fetchSuspects = async (isFilter = false) => {
    try {
      if (isFilter) {
        setFiltering(true);
      }

      // 构建筛选参数
      const params = new URLSearchParams();
      if (filterOnline) params.append('online', 'true');
      if (filterGameLaunched) params.append('cs2_launched', 'true');
      if (filterInGame) params.append('in_game', 'true');

      const url = `/api/suspects${params.toString() ? '?' + params.toString() : ''}`;

      // 使用认证的fetch
      const response = await authManager.authenticatedFetch(url);

      if (response.ok) {
        const data = await response.json();
        setSuspects(data);
        
        // 只在非首次加载时显示成功提示
        if (!loading) {
          toast.success(t('suspects.messages.loaded_success'));
        }
      } else {
        setError(t('common.error'));
        toast.error(t('suspects.messages.load_failed'));
      }
    } catch (error) {
      console.error('Failed to fetch suspects:', error);
      setError(t('common.error'));
    } finally {
      setLoading(false);
      if (isFilter) {
        setFiltering(false);
      }
    }
  };

  useEffect(() => {
    fetchSuspects();
  }, []);

  // 当筛选条件改变时重新获取数据
  useEffect(() => {
    if (!loading) {
      // 只有在初始加载完成后才触发过滤
      fetchSuspects(true);
    }
  }, [filterOnline, filterGameLaunched, filterInGame]);

  const handleDelete = async (id: number) => {
    try {
      const response = await authManager.authenticatedFetch(
        `/api/suspects?id=${id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setSuspects(suspects.filter((s) => s.id !== id));
        toast.success(t('suspects.messages.deleted_success'));
      } else {
        setError(t('common.error'));
        toast.error(t('suspects.messages.delete_failed'));
      }
    } catch (error) {
      console.error('Failed to delete suspect:', error);
      setError(t('common.error'));
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      // 构建筛选参数，和 fetchSuspects 保持一致
      const params = new URLSearchParams();
      if (filterOnline) params.append('online', 'true');
      if (filterGameLaunched) params.append('cs2_launched', 'true');
      if (filterInGame) params.append('in_game', 'true');

      const url = `/api/suspects${params.toString() ? '?' + params.toString() : ''}`;
      const response = await authManager.authenticatedFetch(url);

      if (response.ok) {
        const data = await response.json();
        setSuspects(data);
        setError('');
        toast.success(t('suspects.messages.refreshed_success'));
      } else {
        setError(t('common.error'));
        toast.error(t('suspects.messages.refresh_failed'));
      }
    } catch (error) {
      console.error('Failed to fetch suspects:', error);
      setError(t('common.error'));
    } finally {
      setRefreshing(false);
    }
  }, [filterOnline, filterGameLaunched, filterInGame, t]);

  const handleSuspectAdded = () => {
    fetchSuspects(); // 使用 fetchSuspects 保持筛选条件一致
  };

  const handleSuspectUpdated = (updatedSuspect: Suspect) => {
    setSuspects(
      suspects.map((s) => (s.id === updatedSuspect.id ? updatedSuspect : s))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-14">
        <NavigationBar />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Skeleton className="h-9 w-48" />
          </div>

          <div className="mb-6">
            <Skeleton className="h-10 w-full max-w-md" />
          </div>

          {/* 筛选控制骨架屏 */}
          <div className="mb-6 bg-card rounded-lg shadow-sm p-4 border border-border">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>

          {/* 嫌疑人卡片骨架屏 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SuspectCardSkeleton key={index} />
            ))}
          </div>
        </div>

        {/* 固定的加号按钮骨架屏 */}
        <Skeleton className="fixed bottom-6 right-6 h-14 w-14 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-14">
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
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {t('suspects.filter_options')}
          </h3>
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

        {refreshing || filtering ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: Math.max(suspects.length, 3) }).map(
              (_, index) => (
                <SuspectCardSkeleton key={`loading-skeleton-${index}`} />
              )
            )}
          </div>
        ) : suspects.length === 0 ? (
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
