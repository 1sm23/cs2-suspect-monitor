import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllSuspects, 
  addSuspect, 
  initDatabase,
  updateSuspectsBatch,
  deleteSuspect,
  updateSuspect
} from '@/lib/db';
import { getSteamPlayerSummaries, getSteamPlayerBans } from '@/lib/steam';
import { steamCache } from '@/lib/steam-cache';
import type { Suspect } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // 确保数据库已初始化
    await initDatabase();

    const url = new URL(request.url);
    const filterOnline = url.searchParams.get('online') === 'true';
    const filterCS2Launched = url.searchParams.get('cs2_launched') === 'true';
    const filterInGame = url.searchParams.get('in_game') === 'true';

    console.log('🔍 Fetching suspects with filters:', { 
      online: filterOnline, 
      cs2_launched: filterCS2Launched, 
      in_game: filterInGame 
    });

    // 获取嫌疑人列表
    const suspects = await getAllSuspects({
      online: filterOnline,
      cs2_launched: filterCS2Launched,
      in_game: filterInGame
    });

    // 如果没有筛选条件，更新 Steam 数据
    if (suspects.length > 0 && !filterOnline && !filterCS2Launched && !filterInGame) {
      const steamIdArray = suspects.map((s: Suspect) => s.steam_id);
      const steamIds = steamIdArray.join(',');
      const cacheKey = `steam_data_${steamIds}`;
      
      let steamData = steamCache.get(cacheKey);
      let steamBanData = steamCache.get(`steam_bans_${steamIds}`);
      
      if (!steamData || !steamBanData) {
        console.log('🔄 Cache miss - calling Steam API for', suspects.length, 'suspects');
        
        steamData = await getSteamPlayerSummaries(steamIdArray);
        steamBanData = await getSteamPlayerBans(steamIdArray);
        
        steamCache.set(cacheKey, steamData, 300);
        steamCache.set(`steam_bans_${steamIds}`, steamBanData, 300);
      } else {
        console.log('✅ Cache hit - using cached Steam data');
      }

      // 批量更新数据库
      if (steamData && steamData.length > 0 && steamBanData && steamBanData.length > 0) {
        const updates = suspects.map((suspect: Suspect) => {
          const steamPlayer = steamData.find((p: any) => p.steamid === suspect.steam_id);
          const steamBan = steamBanData.find((p: any) => p.SteamId === suspect.steam_id);

          return {
            steam_id: suspect.steam_id,
            status: steamPlayer?.personastate !== undefined ? getStatusFromPersonaState(steamPlayer.personastate) : 'unknown',
            current_gameid: steamPlayer?.gameid ? parseInt(steamPlayer.gameid) : undefined,
            game_server_ip: steamPlayer?.gameserverip || undefined,
            personaname: steamPlayer?.personaname || undefined,
            avatar_url: steamPlayer?.avatarfull || steamPlayer?.avatarmedium || steamPlayer?.avatar || undefined,
            vac_banned: steamBan?.VACBanned || false,
            game_ban_count: steamBan?.NumberOfGameBans || 0,
            last_logoff: steamPlayer?.lastlogoff ? new Date(steamPlayer.lastlogoff * 1000).toISOString() : undefined
          };
        });

        await updateSuspectsBatch(updates);
      }

      // 重新获取更新后的数据
      const updatedSuspects = await getAllSuspects({
        online: filterOnline,
        cs2_launched: filterCS2Launched,
        in_game: filterInGame
      });

      return Response.json(updatedSuspects);
    }

    return Response.json(suspects);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Failed to fetch suspects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 确保数据库已初始化
    await initDatabase();

    const body = await request.json();
    const { steam_id, nickname, category } = body;

    // 验证必需的字段
    if (!steam_id) {
      return Response.json(
        { error: 'Steam ID is required' },
        { status: 400 }
      );
    }

    // Steam ID 提取逻辑保持不变...
    let extractedSteamId = steam_id;
    
    if (steam_id && steam_id.includes('steamcommunity.com')) {
      const matches = steam_id.match(/(?:profiles|id)\/([^\/]+)/);
      if (matches) {
        extractedSteamId = matches[1];
      }
    }

    // 获取 Steam 数据
    const steamData = await getSteamPlayerSummaries([extractedSteamId]);
    const steamBanData = await getSteamPlayerBans([extractedSteamId]);

    const steamPlayer = steamData?.[0];
    const steamBan = steamBanData?.[0];

    if (!steamPlayer) {
      return Response.json({ error: 'Steam user not found' }, { status: 404 });
    }

    // 添加到数据库
    const newSuspect = await addSuspect({
      steam_id: extractedSteamId,
      nickname: nickname || undefined,
      personaname: steamPlayer?.personaname || undefined,
      category,
      profile_url: steamPlayer?.profileurl || undefined,
      avatar_url: steamPlayer?.avatarfull || undefined,
      status: steamPlayer ? getStatusFromPersonaState(steamPlayer.personastate) : 'unknown',
      vac_banned: steamBan?.VACBanned || false,
      game_ban_count: steamBan?.NumberOfGameBans || 0,
      current_gameid: steamPlayer?.gameid ? parseInt(steamPlayer.gameid) : undefined,
      game_server_ip: steamPlayer?.gameserverip || undefined,
      last_logoff: steamPlayer?.lastlogoff ? new Date(steamPlayer.lastlogoff * 1000).toISOString() : undefined
    });

    return Response.json(newSuspect);
  } catch (error) {
    console.error('Failed to create suspect:', error);
    return Response.json({ error: 'Failed to create suspect' }, { status: 500 });
  }
}

function getStatusFromPersonaState(personastate: number): string {
  const statusMap: { [key: number]: string } = {
    0: 'offline',
    1: 'online',
    2: 'busy',
    3: 'away',
    4: 'snooze',
    5: 'looking to trade',
    6: 'looking to play'
  };
  return statusMap[personastate] || 'unknown';
}

export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return Response.json({ error: 'Missing suspect ID' }, { status: 400 });
    }
    
    await deleteSuspect(parseInt(id));
    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to delete suspect:', error);
    return Response.json({ error: 'Failed to delete suspect' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initDatabase();
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return Response.json({ error: 'Missing suspect ID' }, { status: 400 });
    }
    
    const body = await request.json();
    const updatedSuspect = await updateSuspect(parseInt(id), body);
    
    if (!updatedSuspect) {
      return Response.json({ error: 'Suspect not found' }, { status: 404 });
    }
    
    return Response.json(updatedSuspect);
  } catch (error) {
    console.error('Failed to update suspect:', error);
    return Response.json({ error: 'Failed to update suspect' }, { status: 500 });
  }
}
