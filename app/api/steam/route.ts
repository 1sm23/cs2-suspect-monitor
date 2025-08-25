import { NextRequest, NextResponse } from 'next/server';
import { getSteamPlayerSummaries, getSteamPlayerBans } from '@/lib/steam';

// 客户端API接口 - 仅用于Steam API调用，数据存储在客户端IndexedDB中
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { steam_id, api_key } = body;

    // 验证必需的字段
    if (!steam_id) {
      return Response.json({ error: 'Steam ID is required' }, { status: 400 });
    }

    if (!api_key) {
      return Response.json({ error: 'Steam API key is required' }, { status: 400 });
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
    const steamData = await getSteamPlayerSummaries([extractedSteamId], api_key);
    const steamBanData = await getSteamPlayerBans([extractedSteamId], api_key);

    const steamPlayer = steamData?.[0];
    const steamBan = steamBanData?.[0];

    if (!steamPlayer) {
      return Response.json({ error: 'Steam user not found' }, { status: 404 });
    }

    // 返回Steam数据，让客户端处理存储
    return Response.json({
      steamData: {
        steamid: extractedSteamId,
        personaname: steamPlayer?.personaname || 'Unknown',
        avatarfull: steamPlayer?.avatarfull || undefined,
        communityvisibilitystate: steamPlayer?.communityvisibilitystate || 3,
        personastate: steamPlayer?.personastate || 0,
        profileurl: steamPlayer?.profileurl || undefined,
        gameid: steamPlayer?.gameid || undefined,
        gameserverip: steamPlayer?.gameserverip || undefined,
        lastlogoff: steamPlayer?.lastlogoff || undefined,
      },
      banData: {
        VACBanned: steamBan?.VACBanned || false,
        NumberOfGameBans: steamBan?.NumberOfGameBans || 0,
        CommunityBanned: steamBan?.CommunityBanned || false,
        DaysSinceLastBan: steamBan?.DaysSinceLastBan || 0,
        NumberOfVACBans: steamBan?.NumberOfVACBans || 0,
        EconomyBan: steamBan?.EconomyBan || 'none',
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Steam API error:', error);
    return Response.json(
      { error: 'Failed to fetch Steam data' },
      { status: 500 }
    );
  }
}

// 批量更新Steam数据
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { steam_ids, api_key } = body;

    if (!steam_ids || !Array.isArray(steam_ids) || steam_ids.length === 0) {
      return Response.json({ error: 'Steam IDs array is required' }, { status: 400 });
    }

    if (!api_key) {
      return Response.json({ error: 'Steam API key is required' }, { status: 400 });
    }

    // 获取所有Steam数据
    const steamData = await getSteamPlayerSummaries(steam_ids, api_key);
    const steamBanData = await getSteamPlayerBans(steam_ids, api_key);

    // 处理数据并返回
    const results = steam_ids.map((steamId: string) => {
      const steamPlayer = steamData.find((p: any) => p.steamid === steamId);
      const steamBan = steamBanData.find((p: any) => p.SteamId === steamId);

      return {
        steam_id: steamId,
        steamData: steamPlayer ? {
          steamid: steamId,
          personaname: steamPlayer.personaname || 'Unknown',
          avatarfull: steamPlayer.avatarfull || undefined,
          communityvisibilitystate: steamPlayer.communityvisibilitystate || 3,
          personastate: steamPlayer.personastate || 0,
          profileurl: steamPlayer.profileurl || undefined,
          gameid: steamPlayer.gameid || undefined,
          gameserverip: steamPlayer.gameserverip || undefined,
          lastlogoff: steamPlayer.lastlogoff || undefined,
        } : null,
        banData: steamBan ? {
          VACBanned: steamBan.VACBanned || false,
          NumberOfGameBans: steamBan.NumberOfGameBans || 0,
          CommunityBanned: steamBan.CommunityBanned || false,
          DaysSinceLastBan: steamBan.DaysSinceLastBan || 0,
          NumberOfVACBans: steamBan.NumberOfVACBans || 0,
          EconomyBan: steamBan.EconomyBan || 'none',
        } : null
      };
    });

    return Response.json({ results }, { status: 200 });

  } catch (error) {
    console.error('Batch Steam API error:', error);
    return Response.json(
      { error: 'Failed to fetch Steam data' },
      { status: 500 }
    );
  }
}