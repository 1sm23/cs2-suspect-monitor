import { neon } from '@neondatabase/serverless';
import type { Suspect } from './types';

// 获取数据库连接（延迟检查）
function getConnection() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (
    !DATABASE_URL ||
    !(
      DATABASE_URL.startsWith('postgresql://') ||
      DATABASE_URL.startsWith('postgres://')
    )
  ) {
    throw new Error(
      'PostgreSQL database requires a valid PostgreSQL connection string'
    );
  }
  return neon(DATABASE_URL);
}

// 初始化数据库表
export async function initDatabase() {
  try {
    const sql = getConnection();

    await sql`
      CREATE TABLE IF NOT EXISTS suspects (
        id SERIAL PRIMARY KEY,
        steam_id TEXT UNIQUE NOT NULL,
        nickname TEXT DEFAULT NULL,
        category TEXT NOT NULL DEFAULT 'confirmed',
        profile_url TEXT,
        avatar_url TEXT,
        status TEXT NOT NULL DEFAULT 'clean',
        vac_banned BOOLEAN DEFAULT false,
        game_ban_count INTEGER DEFAULT 0,
        current_gameid INTEGER DEFAULT NULL,
        game_server_ip TEXT DEFAULT NULL,
        last_logoff BIGINT DEFAULT NULL,
        last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        personaname TEXT DEFAULT NULL,
        ban_details TEXT DEFAULT NULL
      )
    `;

    // 创建索引
    await sql`CREATE INDEX IF NOT EXISTS idx_suspects_steam_id ON suspects(steam_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_suspects_status ON suspects(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_suspects_current_gameid ON suspects(current_gameid)`;

    console.log('PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize PostgreSQL database:', error);
    throw error;
  }
}

// 获取所有嫌疑人
export async function getAllSuspects(
  filters: {
    online?: boolean;
    cs2_launched?: boolean;
    in_game?: boolean;
  } = {}
) {
  try {
    const sql = getConnection();

    if (filters.online && filters.cs2_launched && filters.in_game) {
      return await sql`
        SELECT * FROM suspects 
        WHERE status NOT IN ('offline', 'private') 
        AND current_gameid = 730 
        AND game_server_ip IS NOT NULL 
        AND game_server_ip != ''
        ORDER BY created_at DESC
      `;
    } else if (filters.online && filters.cs2_launched) {
      return await sql`
        SELECT * FROM suspects 
        WHERE status NOT IN ('offline', 'private') 
        AND current_gameid = 730
        ORDER BY created_at DESC
      `;
    } else if (filters.online) {
      return await sql`
        SELECT * FROM suspects 
        WHERE status NOT IN ('offline', 'private')
        ORDER BY created_at DESC
      `;
    } else if (filters.cs2_launched) {
      return await sql`
        SELECT * FROM suspects 
        WHERE current_gameid = 730
        ORDER BY created_at DESC
      `;
    } else {
      return await sql`SELECT * FROM suspects ORDER BY created_at DESC`;
    }
  } catch (error) {
    console.error('Get suspects error:', error);
    throw error;
  }
}

// 添加嫌疑人
export async function addSuspect(suspectData: Partial<Suspect>) {
  try {
    const sql = getConnection();

    const result = await sql`
      INSERT INTO suspects (
        steam_id, nickname, category, profile_url, avatar_url,
        status, vac_banned, game_ban_count, current_gameid, game_server_ip,
        last_logoff, personaname, ban_details
      ) VALUES (
        ${suspectData.steam_id},
        ${suspectData.nickname || null},
        ${suspectData.category || 'confirmed'},
        ${suspectData.profile_url || null},
        ${suspectData.avatar_url || null},
        ${suspectData.status || 'clean'},
        ${suspectData.vac_banned || false},
        ${suspectData.game_ban_count || 0},
        ${suspectData.current_gameid || null},
        ${suspectData.game_server_ip || null},
        ${suspectData.last_logoff || null},
        ${suspectData.personaname || null},
        ${suspectData.ban_details || null}
      )
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Add suspect error:', error);
    throw error;
  }
}

// 更新嫌疑人
export async function updateSuspect(id: number, updates: Partial<Suspect>) {
  try {
    const sql = getConnection();

    // 简化方案：使用模板字符串但明确处理 null 值
    const result = await sql`
      UPDATE suspects 
      SET 
        nickname = ${updates.hasOwnProperty('nickname') ? updates.nickname : sql`nickname`},
        category = ${updates.category !== undefined ? updates.category : sql`category`},
        profile_url = ${updates.profile_url !== undefined ? updates.profile_url : sql`profile_url`},
        avatar_url = ${updates.avatar_url !== undefined ? updates.avatar_url : sql`avatar_url`},
        status = ${updates.status !== undefined ? updates.status : sql`status`},
        vac_banned = ${updates.vac_banned !== undefined ? updates.vac_banned : sql`vac_banned`},
        game_ban_count = ${updates.game_ban_count !== undefined ? updates.game_ban_count : sql`game_ban_count`},
        current_gameid = ${updates.current_gameid !== undefined ? updates.current_gameid : sql`current_gameid`},
        game_server_ip = ${updates.game_server_ip !== undefined ? updates.game_server_ip : sql`game_server_ip`},
        last_logoff = ${updates.last_logoff !== undefined ? updates.last_logoff : sql`last_logoff`},
        personaname = ${updates.personaname !== undefined ? updates.personaname : sql`personaname`},
        ban_details = ${updates.ban_details !== undefined ? updates.ban_details : sql`ban_details`},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error('Update suspect error:', error);
    throw error;
  }
}

// 删除嫌疑人
export async function deleteSuspect(id: number) {
  try {
    const sql = getConnection();
    await sql`DELETE FROM suspects WHERE id = ${id}`;
  } catch (error) {
    console.error('Delete suspect error:', error);
    throw error;
  }
}

// 根据ID获取嫌疑人
export async function getSuspectById(id: number) {
  try {
    const sql = getConnection();
    const result = await sql`SELECT * FROM suspects WHERE id = ${id}`;
    return result[0] || null;
  } catch (error) {
    console.error('Get suspect by ID error:', error);
    throw error;
  }
}

// 批量更新嫌疑人状态
export async function updateSuspectsBatch(
  updates: Array<{
    steam_id: string;
    nickname?: string;
    personaname?: string;
    status?: string;
    vac_banned?: boolean;
    game_ban_count?: number;
    current_gameid?: number;
    game_server_ip?: string;
    last_logoff?: number;
    avatar_url?: string;
  }>
) {
  try {
    const sql = getConnection();

    for (const update of updates) {
      await sql`
        UPDATE suspects 
        SET 
          personaname = ${update.personaname || null},
          status = ${update.status || 'clean'},
          vac_banned = ${update.vac_banned || false},
          game_ban_count = ${update.game_ban_count || 0},
          current_gameid = ${update.current_gameid || null},
          game_server_ip = ${update.game_server_ip || null},
          last_logoff = ${update.last_logoff || null},
          avatar_url = ${update.avatar_url || null},
          last_checked = CURRENT_TIMESTAMP
        WHERE steam_id = ${update.steam_id}
      `;
    }
  } catch (error) {
    console.error('Batch update error:', error);
    throw error;
  }
}
