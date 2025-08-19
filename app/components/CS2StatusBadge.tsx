'use client';

import { useTranslations } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

interface CS2StatusBadgeProps {
  currentGameId: number | null;
  gameServerIp?: string | null;
}

export function CS2StatusBadge({ currentGameId, gameServerIp }: CS2StatusBadgeProps) {
  const t = useTranslations();

  // CS2的游戏ID是730
  const isPlayingCS2 = currentGameId === 730;
  // 如果有游戏服务器IP，说明玩家真正在游戏中（而不只是启动了游戏）
  const isInGame = isPlayingCS2 && gameServerIp;

  if (!isPlayingCS2) {
    return null;
  }

  return (
    <Badge 
      variant="secondary" 
      className={
        isInGame 
          ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200" 
          : "bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200"
      }
    >
      <div className={`w-2 h-2 rounded-full mr-1 animate-pulse ${isInGame ? 'bg-green-400' : 'bg-orange-400'}`}></div>
      {isInGame ? (
        <span title={`${t('suspects.playing_cs2_on_server')}: ${gameServerIp}`}>
          {t('suspects.playing_cs2_in_game')} 🎮
        </span>
      ) : (
        <span title={t('suspects.playing_cs2_menu')}>
          {t('suspects.playing_cs2_menu')} ⏸️
        </span>
      )}
    </Badge>
  );
}
