'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/app/components/ui/InputWrapper';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/lib/i18n';
import { SuspectService } from '@/lib/suspect-service';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddSuspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuspectAdded: () => void;
}

export function AddSuspectDialog({
  open,
  onOpenChange,
  onSuspectAdded,
}: AddSuspectDialogProps) {
  const [steamInput, setSteamInput] = useState('');
  const [nickname, setNickname] = useState('');
  const [category, setCategory] = useState<
    'confirmed' | 'high_risk' | 'suspected'
  >('confirmed');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputHelp, setInputHelp] = useState('');
  const [showPrivateConfirm, setShowPrivateConfirm] = useState(false);
  const [privateAccountData, setPrivateAccountData] = useState<any>(null);
  const t = useTranslations();

  // 提取Steam ID的函数
  const extractSteamIdFromUrl = (input: string): string | null => {
    const cleanInput = input.trim();

    // 如果已经是17位数字的Steam ID，直接返回
    if (/^\d{17}$/.test(cleanInput)) {
      return cleanInput;
    }

    // 尝试从Steam profile URL中提取Steam ID
    const profileMatch = cleanInput.match(
      /steamcommunity\.com\/profiles\/(\d{17})/
    );
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
    setShowPrivateConfirm(false);
    setPrivateAccountData(null);
  };

  const handleSubmit = async (e: React.FormEvent, forceAddPrivate = false) => {
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
      const result = await SuspectService.addSuspect({
        steam_id: finalSteamId,
        nickname: nickname || undefined,
        category,
        force_add_private: forceAddPrivate,
      });

      // 检查是否为私密账户
      if (result.isPrivate && !forceAddPrivate) {
        setPrivateAccountData(result);
        setShowPrivateConfirm(true);
        setIsLoading(false);
        return;
      }
      
      resetForm();
      onOpenChange(false);
      onSuspectAdded();
      toast.success(t('suspects.messages.added_success'));
    } catch (error: any) {
      console.error('Failed to add suspect:', error);
      
      // 特殊处理重复用户错误
      if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        setError('该Steam用户已在监控列表中，请勿重复添加');
      } else if (error.message?.includes('Steam user not found')) {
        setError('未找到该Steam用户，请检查Steam ID是否正确');
      } else if (error.message?.includes('private')) {
        setError('该Steam账户为私密账户，无法获取详细信息');
      } else {
        setError(error.message || '添加嫌疑人失败，请重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleConfirmPrivate = async () => {
    // 创建一个虚拟事件对象
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent, true);
  };

  const handleCancelPrivate = () => {
    setShowPrivateConfirm(false);
    setPrivateAccountData(null);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {!showPrivateConfirm ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('suspects.add_title')}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={`${t('suspects.steam_id')} *`}
                type="text"
                id="steamInput"
                value={steamInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={`76561198358372020 ${t(
                  'common.or'
                )} https://steamcommunity.com/profiles/76561198358372020/`}
                helperText={inputHelp || t('suspects.steam_id_helper')}
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
                helperText={t('suspects.nickname_placeholder')}
                disabled={isLoading}
              />

              <div>
                <Label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t('suspects.category_label')}
                </Label>
                <Select
                  value={category}
                  onValueChange={(value: 'suspected' | 'high_risk' | 'confirmed') =>
                    setCategory(value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suspected">
                      {t('suspects.category.suspected')}
                    </SelectItem>
                    <SelectItem value="high_risk">
                      {t('suspects.category.high_risk')}
                    </SelectItem>
                    <SelectItem value="confirmed">
                      {t('suspects.category.confirmed')}
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t('common.loading') : t('suspects.add_button')}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('suspects.private_profile')}</DialogTitle>
              <DialogDescription>
                {t('suspects.private_account_warning')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {privateAccountData?.steamData && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {privateAccountData.steamData.avatarfull && (
                    <img
                      src={privateAccountData.steamData.avatarfull}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium">
                      {privateAccountData.steamData.personaname || 'Private Profile'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {privateAccountData.steamData.steamid}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                {privateAccountData?.message}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelPrivate}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={handleConfirmPrivate} disabled={isLoading}>
                {isLoading ? t('common.loading') : t('suspects.add_private_confirm')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
