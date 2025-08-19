'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/app/components/ui/InputWrapper';
import { useTranslations } from '@/lib/i18n';
import { Suspect } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditSuspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suspect: Suspect;
  onSuspectUpdated: (updatedSuspect: Suspect) => void;
}

export function EditSuspectDialog({ open, onOpenChange, suspect, onSuspectUpdated }: EditSuspectDialogProps) {
  const [nickname, setNickname] = useState(suspect.nickname || '');
  const [category, setCategory] = useState<'confirmed' | 'high_risk' | 'suspected'>(suspect.category);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/suspects/${suspect.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickname || null,
          category,
        }),
      });

      if (response.ok) {
        const updatedSuspect = await response.json();
        onSuspectUpdated(updatedSuspect);
        onOpenChange(false);
      } else {
        const data = await response.json();
        setError(data.error || t('common.error'));
      }
    } catch (error) {
      console.error('Failed to update suspect:', error);
      setError(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNickname(suspect.nickname || '');
    setCategory(suspect.category);
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('common.edit')} {suspect.personaname || suspect.steam_id}</DialogTitle>
          <DialogDescription>
            Edit suspect information
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steam ID
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600">
              {suspect.steam_id}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steam Persona Name
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-600">
              {suspect.personaname || 'Not available'}
            </div>
          </div>

          <Input
            label={`${t('suspects.nickname')} (Optional)`}
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Custom nickname"
            helperText="Leave empty to use Steam persona name only"
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
              {isLoading ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
