'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import { Input } from '@/app/components/ui/InputWrapper';
import { Button } from '@/components/ui/button';
import { authManager } from '@/lib/auth-manager';
import { ExternalLink } from 'lucide-react';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 验证API密钥格式（Steam API密钥通常是32位十六进制字符）
      if (!apiKey.trim()) {
        setError('请输入Steam Web API密钥');
        return;
      }

      if (!/^[A-Fa-f0-9]{32}$/.test(apiKey.trim())) {
        setError('Steam Web API密钥格式不正确（应为32位十六进制字符）');
        return;
      }

      // 测试API密钥是否有效（调用一个简单的Steam API）
      const testUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey.trim()}&steamids=76561197960435530`;
      
      try {
        const response = await fetch(testUrl);
        if (!response.ok) {
          throw new Error('API key test failed');
        }
        const data = await response.json();
        if (!data.response) {
          throw new Error('Invalid API response');
        }
      } catch (testError) {
        setError('Steam Web API密钥无效或网络错误，请检查密钥是否正确');
        return;
      }

      // 保存API密钥
      authManager.setSteamApiKey(apiKey.trim());

      // 延迟一下确保密钥已保存，然后跳转
      setTimeout(() => {
        window.location.href = '/suspects';
      }, 100);
    } catch (error) {
      console.error('API key validation error:', error);
      setError('验证Steam Web API密钥时出错');
    } finally {
      setIsLoading(false);
    }
  };

  const openSteamApiPage = () => {
    window.open('https://steamcommunity.com/dev/apikey', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {t('suspects.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            请输入您的Steam Web API密钥
          </p>
        </div>

        {/* 获取API密钥的指导 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            如何获取Steam Web API密钥：
          </h3>
          <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 mb-3">
            <li>1. 访问Steam开发者页面</li>
            <li>2. 使用您的Steam账号登录</li>
            <li>3. 填写域名（可以填写localhost）</li>
            <li>4. 获取您的API密钥</li>
          </ol>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openSteamApiPage}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            获取Steam Web API密钥
          </Button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="apiKey" className="sr-only">
                Steam Web API密钥
              </label>
              <Input
                id="apiKey"
                name="apiKey"
                type="text"
                required
                placeholder="请输入32位Steam Web API密钥"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading}
                className="rounded-md font-mono text-sm"
                maxLength={32}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-destructive">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isLoading ? '验证中...' : '保存并继续'}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>您的API密钥将安全地存储在浏览器本地存储中</p>
          <p>我们不会将您的API密钥发送到任何服务器</p>
        </div>
      </div>
    </div>
  );
}
