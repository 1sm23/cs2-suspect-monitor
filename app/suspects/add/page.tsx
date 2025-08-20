'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NavigationBar } from '@/app/components/NavigationBar';
import { Input } from '@/app/components/ui/InputWrapper';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n';
import { authManager } from '@/lib/auth-manager';
import { Skeleton } from '@/components/ui/skeleton';

export default function AddSuspectPage() {
  const [steamInput, setSteamInput] = useState('');
  const [nickname, setNickname] = useState('');
  const [category, setCategory] = useState<'confirmed' | 'high_risk' | 'suspected'>('confirmed');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputHelp, setInputHelp] = useState('');
  const router = useRouter();
  const t = useTranslations();

  // 客户端认证检查
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setPageLoading(false);
  }, [router]);

  // 提取Steam ID的函数
  const extractSteamIdFromUrl = (input: string): string | null => {
    const cleanInput = input.trim();
    
    // 如果已经是17位数字的Steam ID，直接返回
    if (/^\d{17}$/.test(cleanInput)) {
      return cleanInput;
    }
    
    // 尝试从Steam profile URL中提取Steam ID
    const profileMatch = cleanInput.match(/steamcommunity\.com\/profiles\/(\d{17})/);
    if (profileMatch) {
      return profileMatch[1];
    }
    
    return null;
  };

  const handleInputChange = (value: string) => {
    setSteamInput(value);
    
    if (!value.trim()) {
      setInputHelp('');
      return;
    }
    
    const extractedId = extractSteamIdFromUrl(value);
    
    if (extractedId) {
      setInputHelp(`✓ 检测到 Steam ID: ${extractedId}`);
    } else if (value.includes('steamcommunity.com/id/')) {
      setInputHelp('⚠ 自定义URL暂不支持，请使用数字Steam ID或profiles URL');
    } else if (value.includes('steamcommunity.com')) {
      setInputHelp('⚠ 请检查URL格式是否正确');
    } else if (!/^\d{17}$/.test(value.trim())) {
      setInputHelp('⚠ 请输入17位数字的Steam ID或Steam profile URL');
    } else {
      setInputHelp('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 提取Steam ID
    const finalSteamId = extractSteamIdFromUrl(steamInput);
    
    if (!finalSteamId) {
      setError('请输入有效的Steam ID或Steam profile URL');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authManager.authenticatedFetch('/api/suspects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steam_id: finalSteamId,
          nickname: nickname || null,
          category,
        }),
      });

      if (response.ok) {
        router.push('/suspects');
      } else {
        const data = await response.json();
        setError(data.error || t('common.error'));
      }
    } catch (error) {
      console.error('Failed to add suspect:', error);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-14">
        <NavigationBar />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <Skeleton className="h-9 w-48" />
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-6">
                {/* Steam ID输入框骨架屏 */}
                <div>
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>

                {/* 昵称输入框骨架屏 */}
                <div>
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-1" />
                </div>

                {/* 分类选择骨架屏 */}
                <div>
                  <Skeleton className="h-5 w-16 mb-2" />
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 w-14" />
                    </div>
                  </div>
                </div>

                {/* 按钮骨架屏 */}
                <div className="flex space-x-3">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <NavigationBar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('suspects.add_title')}
            </h1>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label={`${t('suspects.steam_id')} *`}
                type="text"
                id="steamInput"
                value={steamInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="76561198358372020 或 https://steamcommunity.com/profiles/76561198358372020/"
                helperText={inputHelp || "输入17位Steam ID或Steam profile URL"}
                required
                disabled={isLoading}
              />

              <Input
                label={`${t('suspects.nickname')} (Optional)`}
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Custom nickname"
                helperText="Leave empty to use Steam profile name"
                disabled={isLoading}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('suspects.category_label')}</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="category" value="confirmed" checked={category === 'confirmed'} onChange={() => setCategory('confirmed')} disabled={isLoading} />
                    <span className="text-sm">{t('suspects.category.confirmed')}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="category" value="high_risk" checked={category === 'high_risk'} onChange={() => setCategory('high_risk')} disabled={isLoading} />
                    <span className="text-sm">{t('suspects.category.high_risk')}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="category" value="suspected" checked={category === 'suspected'} onChange={() => setCategory('suspected')} disabled={isLoading} />
                    <span className="text-sm">{t('suspects.category.suspected')}</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? t('common.loading') : t('suspects.add_button')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
