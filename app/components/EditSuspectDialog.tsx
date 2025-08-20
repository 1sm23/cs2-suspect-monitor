'use client';

import { useState } from 'react';
import { Suspect } from '@/lib/types';
import { useTranslations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authManager } from '@/lib/auth-manager';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditSuspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suspect: Suspect;
  onSuspectUpdated: (updatedSuspect: Suspect) => void;
}

export function EditSuspectDialog({
  open,
  onOpenChange,
  suspect,
  onSuspectUpdated
}: EditSuspectDialogProps) {
  const t = useTranslations();
  const [nickname, setNickname] = useState(suspect.nickname || '');
  const [category, setCategory] = useState<'suspected' | 'high_risk' | 'confirmed'>(suspect.category);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authManager.authenticatedFetch(`/api/suspects?id=${suspect.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname || null,
          category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update suspect');
      }

      const updatedSuspect = await response.json();
      onSuspectUpdated(updatedSuspect);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update suspect:', error);
      alert('Failed to update suspect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('suspects.edit_title' as any)}</DialogTitle>
          <DialogDescription>
            {t('suspects.edit_description' as any)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="steam_id" className="text-right">
                Steam ID
              </Label>
              <Input
                id="steam_id"
                value={suspect.steam_id}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="personaname" className="text-right whitespace-nowrap">
                {t('suspects.personaname' as any)}
              </Label>
              <Input
                id="personaname"
                value={suspect.personaname || ''}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname" className="text-right">
                {t('suspects.nickname')}
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="col-span-3"
                placeholder={t('suspects.nickname_placeholder')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                {t('suspects.category_label')}
              </Label>
              <Select value={category} onValueChange={(value: 'suspected' | 'high_risk' | 'confirmed') => setCategory(value)}>
                <SelectTrigger className="col-span-3">
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
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
