import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSteamPlayerSummaries, getSteamPlayerBans, extractSteamIdFromUrl, mapPlayerStateToStatus, steamIdToProfileUrl } from '@/lib/steam';
import { Suspect } from '@/lib/types';
import { steamCache } from '@/lib/steam-cache';

// GET /api/suspects - 获取所有嫌疑人
export async function GET(request: NextRequest) {
  try {
    // 获取筛选参数
    const { searchParams } = new URL(request.url);
    const filterOnline = searchParams.get('online') === 'true';
    const filterCS2Launched = searchParams.get('cs2_launched') === 'true';
    const filterInGame = searchParams.get('in_game') === 'true';

    let query = 'SELECT * FROM suspects';
    const conditions: string[] = [];
    
    // 构建筛选条件
    if (filterOnline) {
      // 在线状态包含除了 offline、unknown、private 之外的所有状态
      // 包括：online, busy, away, snooze, looking to trade, looking to play
      conditions.push("status NOT IN ('offline', 'unknown', 'private')");
    }
    if (filterCS2Launched) {
      conditions.push("current_gameid = 730");
    }
    if (filterInGame) {
      conditions.push("current_gameid = 730 AND game_server_ip IS NOT NULL AND game_server_ip != ''");
    }
    
    // 添加筛选条件到查询
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    console.log(`🔍 Fetching suspects with query: ${query}`);
    console.log(`📊 Filters - Online: ${filterOnline}, CS2: ${filterCS2Launched}, InGame: ${filterInGame}`);
    
    const suspects = db.prepare(query).all() as Suspect[];
    console.log(`📋 Found ${suspects.length} suspects matching criteria`);

    // 批量更新Steam状态（只在没有筛选条件时更新，避免频繁API调用）
    if (suspects.length > 0 && !filterOnline && !filterCS2Launched && !filterInGame) {
      console.log(`🔄 Updating Steam status for ${suspects.length} suspects...`);
      
      try {
        // 提取所有Steam ID
        const steamIds = suspects.map(suspect => suspect.steam_id);
        const steamIdsKey = steamIds.sort().join(','); // 排序确保缓存键一致
        
        // 检查缓存
        const summariesCacheKey = `summaries_${steamIdsKey}`;
        const bansCacheKey = `bans_${steamIdsKey}`;
        
        let steamPlayers = steamCache.get(summariesCacheKey);
        let steamBans = steamCache.get(bansCacheKey);
        
        // 如果缓存中没有数据，才调用 Steam API
        if (!steamPlayers || !steamBans) {
          console.log('🔄 Cache miss - calling Steam API for', steamIds.length, 'suspects');
          
          // 并行获取Steam数据和封禁数据
          [steamPlayers, steamBans] = await Promise.all([
            getSteamPlayerSummaries(steamIds),
            getSteamPlayerBans(steamIds)
          ]);
          
          // 缓存结果（5分钟）
          steamCache.set(summariesCacheKey, steamPlayers, 300);
          steamCache.set(bansCacheKey, steamBans, 300);
          
          console.log('💾 Cached Steam API results for', steamIds.length, 'suspects');
        } else {
          console.log('✅ Cache hit - using cached Steam data for', steamIds.length, 'suspects');
        }
        
        if (steamPlayers.length > 0 || steamBans.length > 0) {
          console.log(`✅ Fetched Steam data for ${steamPlayers.length}/${steamIds.length} players`);
          console.log(`✅ Fetched ban data for ${steamBans.length}/${steamIds.length} players`);
          
          // 为每个嫌疑人更新状态
          const updateStatement = db.prepare(`
            UPDATE suspects 
            SET status = ?, current_gameid = ?, game_server_ip = ?, last_logoff = ?, personaname = ?, 
                vac_banned = ?, game_ban_count = ?, last_checked = datetime('now')
            WHERE steam_id = ?
          `);
          
          // 批量更新
          const updateTransaction = db.transaction(() => {
            for (const steamId of steamIds) {
              const steamPlayer = steamPlayers.find((p: any) => p.steamid === steamId);
              const steamBan = steamBans.find((b: any) => b.SteamId === steamId);
              
              const newStatus = steamPlayer ? mapPlayerStateToStatus(
                steamPlayer.personastate, 
                steamPlayer.communityvisibilitystate
              ) : 'unknown';
              
              updateStatement.run(
                newStatus,
                steamPlayer?.gameid ? parseInt(steamPlayer.gameid) : null,
                steamPlayer?.gameserverip || null,
                steamPlayer?.lastlogoff || null,
                steamPlayer?.personaname || null, // 保存 Steam API 返回的 personaname
                steamBan?.VACBanned ? 1 : 0, // 转换 boolean 为数字
                steamBan?.NumberOfGameBans || 0,
                steamId
              );
            }
          });
          
          updateTransaction();
          console.log(`🔄 Updated ${steamIds.length} suspect statuses and ban info`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to update Steam statuses:', error instanceof Error ? error.message : 'Unknown error');
        console.log('📝 Returning cached data...');
      }
    }

    // 如果有筛选条件，直接返回筛选结果，不需要重新获取
    if (filterOnline || filterCS2Launched || filterInGame) {
      console.log(`🎯 Returning filtered results: ${suspects.length} suspects`);
      return NextResponse.json(suspects);
    }

    // 重新获取更新后的数据（仅在没有筛选时）
    const updatedSuspects = db.prepare(`
      SELECT * FROM suspects 
      ORDER BY created_at DESC
    `).all() as Suspect[];

    return NextResponse.json(updatedSuspects);
  } catch (error) {
    console.error('Failed to fetch suspects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suspects' },
      { status: 500 }
    );
  }
}

// POST /api/suspects - 添加新嫌疑人
export async function POST(request: NextRequest) {
  try {
  const { steam_id, nickname, category } = await request.json();

    if (!steam_id) {
      return NextResponse.json(
        { error: 'Steam ID is required' },
        { status: 400 }
      );
    }

    // 提取Steam ID（支持URL格式）
    const extractedSteamId = extractSteamIdFromUrl(steam_id);
    
    if (!extractedSteamId) {
      return NextResponse.json(
        { error: 'Invalid Steam ID format or URL' },
        { status: 400 }
      );
    }

    // 检查是否已存在
    const existing = db.prepare(`
      SELECT id FROM suspects WHERE steam_id = ?
    `).get(extractedSteamId);

    if (existing) {
      return NextResponse.json(
        { error: 'Suspect already exists' },
        { status: 409 }
      );
    }

    // 获取 Steam 用户信息和封禁信息
    let steamData = null;
    let steamBanData = null;
    let steamDataAvailable = false;
    
    try {
      console.log(`🔍 Fetching Steam data and ban info for: ${extractedSteamId}`);
      
      // 并行获取玩家信息和封禁信息
      const [steamPlayers, steamBans] = await Promise.all([
        getSteamPlayerSummaries([extractedSteamId]),
        getSteamPlayerBans([extractedSteamId])
      ]);
      
      if (steamPlayers.length > 0) {
        steamData = steamPlayers[0];
        steamDataAvailable = true;
        console.log(`✅ Successfully fetched Steam data for: ${extractedSteamId} (${steamData.personaname})`);
      } else {
        console.warn(`⚠️ No Steam data returned for: ${extractedSteamId}`);
      }
      
      if (steamBans.length > 0) {
        steamBanData = steamBans[0];
        console.log(`✅ Successfully fetched ban data for: ${extractedSteamId} (VAC: ${steamBanData.VACBanned}, Game bans: ${steamBanData.NumberOfGameBans})`);
      } else {
        console.warn(`⚠️ No ban data returned for: ${extractedSteamId}`);
      }
    } catch (error) {
      console.warn(`❌ Failed to fetch Steam data for ${extractedSteamId}:`, error instanceof Error ? error.message : 'Unknown error');
      console.log('📝 Proceeding with manual data entry...');
    }

    const profileUrl = steamIdToProfileUrl(extractedSteamId);
    const defaultNickname = nickname || `Player_${extractedSteamId.slice(-6)}`;
    let finalNickname = steamData?.personaname || defaultNickname;
    
    // 确保昵称是有效的字符串
    if (typeof finalNickname !== 'string') {
      finalNickname = String(finalNickname || defaultNickname);
    }
    
    // 清理可能存在的特殊字符或控制字符
    finalNickname = finalNickname.trim().replace(/[\x00-\x1F\x7F]/g, '');
    
    // 如果清理后为空，使用默认昵称
    if (!finalNickname) {
      finalNickname = defaultNickname;
    }
    
  const status = steamData ? mapPlayerStateToStatus(
      steamData.personastate, 
      steamData.communityvisibilitystate
    ) : 'unknown';

  // validate category
  const allowedCategories = ['confirmed', 'high_risk', 'suspected'];
  const finalCategory = allowedCategories.includes(category) ? category : 'confirmed';

    console.log(`📋 Creating suspect: ${finalNickname} (${status}) - Steam data: ${steamDataAvailable ? 'Yes' : 'No'}`);
    console.log(`🔤 Nickname type: ${typeof finalNickname}, value: "${finalNickname}"`);
    console.log(`📏 Nickname length: ${finalNickname?.length || 0} characters`);
    
    // 调试所有参数
    console.log('🔍 SQL Parameters:');
    console.log('  steam_id:', typeof extractedSteamId, extractedSteamId);
    console.log('  nickname:', typeof (nickname || null), nickname || null);
    console.log('  personaname:', typeof (steamData?.personaname || null), steamData?.personaname || null);
    console.log('  profileUrl:', typeof profileUrl, profileUrl);
    console.log('  avatar_url:', typeof (steamData?.avatarfull || null), steamData?.avatarfull || null);
    console.log('  status:', typeof status, status);
    console.log('  vac_banned:', typeof (steamBanData?.VACBanned || false), steamBanData?.VACBanned || false);
    console.log('  game_ban_count:', typeof (steamBanData?.NumberOfGameBans || 0), steamBanData?.NumberOfGameBans || 0);
    console.log('  current_gameid:', typeof (steamData?.gameid ? parseInt(steamData.gameid) : null), steamData?.gameid ? parseInt(steamData.gameid) : null);
    console.log('  game_server_ip:', typeof (steamData?.gameserverip || null), steamData?.gameserverip || null);
    console.log('  last_logoff:', typeof (steamData?.lastlogoff || null), steamData?.lastlogoff || null);
    
    const result = db.prepare(`
      INSERT INTO suspects (
        steam_id, nickname, personaname, category, profile_url, avatar_url, status, vac_banned, game_ban_count, current_gameid, game_server_ip, last_logoff, last_checked
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      extractedSteamId,
      nickname || null, // 保存用户输入的自定义昵称
      steamData?.personaname || null, // 保存 Steam API 返回的 personaname
      finalCategory,
      profileUrl,
      steamData?.avatarfull || null,
      status,
      steamBanData?.VACBanned ? 1 : 0, // 转换 boolean 为数字
      steamBanData?.NumberOfGameBans || 0, // 使用真实的游戏封禁数量
      steamData?.gameid ? parseInt(steamData.gameid) : null, // 当前游戏ID
      steamData?.gameserverip || null, // 游戏服务器IP
      steamData?.lastlogoff || null // 最后登录时间
    );

    // 记录状态历史
    db.prepare(`
      INSERT INTO suspect_status_history (
        suspect_id, old_status, new_status, nickname
      ) VALUES (?, NULL, ?, ?)
    `).run(
      result.lastInsertRowid,
      status,
      finalNickname
    );

    const newSuspect = db.prepare(`
      SELECT * FROM suspects WHERE id = ?
    `).get(result.lastInsertRowid) as Suspect;

    return NextResponse.json(newSuspect, { status: 201 });
  } catch (error) {
    console.error('Failed to create suspect:', error);
    return NextResponse.json(
      { error: 'Failed to create suspect' },
      { status: 500 }
    );
  }
}
