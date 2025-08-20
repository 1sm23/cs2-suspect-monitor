'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Suspect } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { VACBadge } from './VACBadge';
import { CS2StatusBadge } from './CS2StatusBadge';
import { EditSuspectDialog } from './EditSuspectDialog';
import { useTranslations } from '@/lib/i18n';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SuspectCardProps {
  suspect: Suspect;
  onDelete: (id: number) => void;
  onUpdate?: (updatedSuspect: Suspect) => void;
}

export function SuspectCard({ suspect, onDelete, onUpdate }: SuspectCardProps) {
  const t = useTranslations();
  const [imageError, setImageError] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleDelete = () => {
    onDelete(suspect.id);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleSuspectUpdated = (updatedSuspect: Suspect) => {
    if (onUpdate) {
      onUpdate(updatedSuspect);
    }
  };

  const displayName = () => {
    const personaName = suspect.personaname || suspect.steam_id;
    const nickname = suspect.nickname;

    if (nickname) {
      return (
        <div className="flex items-baseline gap-2">
          <span>{personaName}</span>
          <span
            className="text-sm text-muted-foreground truncate"
            title={nickname}
          >
            ({nickname})
          </span>
        </div>
      );
    }

    return personaName;
  };

  const getProfileUrl = () => {
    // 如果有 profile_url 就使用，否则构建一个默认的 Steam profile URL
    return (
      suspect.profile_url ||
      `https://steamcommunity.com/profiles/${suspect.steam_id}`
    );
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border h-full flex flex-col">
      <div className="flex items-start space-x-4 flex-1">
        <Image
          src={
            imageError || !suspect.avatar_url
              ? '/avatar_placeholder.svg'
              : suspect.avatar_url
          }
          alt={suspect.personaname || suspect.steam_id}
          width={64}
          height={64}
          className="rounded-full flex-shrink-0 select-none"
          onError={handleImageError}
          unoptimized={imageError || !suspect.avatar_url}
        />
        <div className="flex-1 min-w-0 flex flex-col h-full">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground truncate">
              <Link
                href={getProfileUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-primary transition-colors cursor-pointer"
                title={getProfileUrl()}
              >
                {displayName()}
              </Link>
            </h3>
            {/* <p className="text-sm text-muted-foreground mb-2">{suspect.steam_id}</p> */}

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge status={suspect.status} />
              <VACBadge
                vacBanned={suspect.vac_banned || false}
                gameBanCount={suspect.game_ban_count || 0}
              />
              <CS2StatusBadge
                currentGameId={suspect.current_gameid}
                gameServerIp={suspect.game_server_ip}
              />
              <Badge
                variant={
                  suspect.category === 'confirmed' ? 'destructive' : 'secondary'
                }
                className={
                  suspect.category === 'confirmed'
                    ? ''
                    : suspect.category === 'high_risk'
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }
              >
                {t(`suspects.category.${suspect.category}` as any)}
              </Badge>
            </div>

            {/* <div className="mb-3">
              <div className="text-sm text-gray-600">{t('suspects.category_label')}:</div>
              <Badge 
                variant={suspect.category === 'confirmed' ? 'destructive' : 'secondary'}
                className={
                  suspect.category === 'confirmed' ? '' : 
                  suspect.category === 'high_risk' ? 'bg-orange-500 text-white hover:bg-orange-600' : 
                  'bg-yellow-500 text-white hover:bg-yellow-600'
                }
              >
                {t(`suspects.category.${suspect.category}` as any)}
              </Badge>
            </div> */}

            <div className="text-xs text-muted-foreground space-y-1 mb-3">
              {/* {suspect.last_checked && (
                <div>
                  {t('suspects.last_checked')}: {new Date(suspect.last_checked + 'Z').toLocaleString('zh-CN', {
                    timeZone: 'Asia/Shanghai',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )} */}
              {suspect.last_logoff && (
                <div>
                  {t('suspects.last_logoff')}:{' '}
                  {new Date(suspect.last_logoff * 1000).toLocaleString(
                    'zh-CN',
                    {
                      timeZone: 'Asia/Shanghai',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-auto pt-2">
            <Button
              onClick={() => setEditDialogOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              {t('common.edit')}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('suspects.delete')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('common.delete_confirm_title')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('common.delete_confirm_description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    {t('common.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <EditSuspectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        suspect={suspect}
        onSuspectUpdated={handleSuspectUpdated}
      />
    </div>
  );
}
