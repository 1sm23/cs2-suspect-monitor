'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/app/components/ui/InputWrapper';
import { useTranslations } from '@/lib/i18n';
import { authManager } from '@/lib/auth-manager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddSuspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuspectAdded: () => void;
}

export function AddSuspectDialog({ open, onOpenChange, onSuspectAdded }: AddSuspectDialogProps) {
  const [steamInput, setSteamInput] = useState('');
  const [nickname, setNickname] = useState('');
  const [category, setCategory] = useState<'confirmed' | 'high_risk' | 'suspected'>('confirmed');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputHelp, setInputHelp] = useState('');
  const t = useTranslations();

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

  const resetForm = () => {
    setSteamInput('');
    setNickname('');
    setCategory('confirmed');
    setError('');
    setInputHelp('');
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
        resetForm();
        onOpenChange(false);
        onSuspectAdded();
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

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('suspects.add_title')}</DialogTitle>
          <DialogDescription>
            {t('suspects.steam_id')} 或 Steam profile URL
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('suspects.category_label')}
            </label>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="category" 
                  value="confirmed" 
                  checked={category === 'confirmed'} 
                  onChange={() => setCategory('confirmed')} 
                  disabled={isLoading} 
                />
                <span className="text-sm">{t('suspects.category.confirmed')}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="category" 
                  value="high_risk" 
                  checked={category === 'high_risk'} 
                  onChange={() => setCategory('high_risk')} 
                  disabled={isLoading} 
                />
                <span className="text-sm">{t('suspects.category.high_risk')}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="category" 
                  value="suspected" 
                  checked={category === 'suspected'} 
                  onChange={() => setCategory('suspected')} 
                  disabled={isLoading} 
                />
                <span className="text-sm">{t('suspects.category.suspected')}</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('suspects.add_button')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
