// lib/db-vercel.ts
import { sql } from '@vercel/postgres';

export async function initDatabase() {
  try {
    // 创建 suspects 表
    await sql`
      CREATE TABLE IF NOT EXISTS suspects (
        id SERIAL PRIMARY KEY,
        steam_id VARCHAR(20) UNIQUE NOT NULL,
        nickname VARCHAR(255),
        personaname VARCHAR(255),
        category VARCHAR(50) NOT NULL,
        profile_url TEXT,
        avatar_url TEXT,
        status VARCHAR(20) DEFAULT 'unknown',
        vac_banned BOOLEAN DEFAULT FALSE,
        game_ban_count INTEGER DEFAULT 0,
        current_gameid INTEGER,
        game_server_ip VARCHAR(45),
        ban_details TEXT,
        last_logoff TIMESTAMP,
        last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建索引
    await sql`CREATE INDEX IF NOT EXISTS idx_steam_id ON suspects(steam_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_status ON suspects(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_current_gameid ON suspects(current_gameid)`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// 获取所有嫌疑人
export async function getAllSuspects(filters: {
  online?: boolean;
  cs2_launched?: boolean;
  in_game?: boolean;
} = {}) {
  try {
    let query = 'SELECT * FROM suspects';
    const conditions = [];

    if (filters.online) {
      conditions.push("status NOT IN ('offline', 'unknown', 'private')");
    }
    if (filters.cs2_launched) {
      conditions.push('current_gameid = 730');
    }
    if (filters.in_game) {
      conditions.push("current_gameid = 730 AND game_server_ip IS NOT NULL AND game_server_ip != ''");
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await sql.query(query);
    return result.rows;
  } catch (error) {
    console.error('Get suspects error:', error);
    throw error;
  }
}

// 添加嫌疑人
export async function addSuspect(suspect: {
  steam_id: string;
  nickname?: string;
  personaname?: string;
  category: string;
  profile_url?: string;
  avatar_url?: string;
  status?: string;
  vac_banned?: boolean;
  game_ban_count?: number;
  current_gameid?: number;
  game_server_ip?: string;
  ban_details?: string;
  last_logoff?: string;
}) {
  try {
    const result = await sql`
      INSERT INTO suspects (
        steam_id, nickname, personaname, category, profile_url, avatar_url,
        status, vac_banned, game_ban_count, current_gameid, game_server_ip,
        ban_details, last_logoff, last_checked
      ) VALUES (
        ${suspect.steam_id},
        ${suspect.nickname || null},
        ${suspect.personaname || null},
        ${suspect.category},
        ${suspect.profile_url || null},
        ${suspect.avatar_url || null},
        ${suspect.status || 'unknown'},
        ${suspect.vac_banned ? 1 : 0},
        ${suspect.game_ban_count || 0},
        ${suspect.current_gameid || null},
        ${suspect.game_server_ip || null},
        ${suspect.ban_details || null},
        ${suspect.last_logoff || null},
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Add suspect error:', error);
    throw error;
  }
}

// 更新嫌疑人
export async function updateSuspect(id: number, updates: any) {
  try {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await sql.query(
      `UPDATE suspects SET ${setClause}, last_checked = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
  } catch (error) {
    console.error('Update suspect error:', error);
    throw error;
  }
}

// 删除嫌疑人
export async function deleteSuspect(id: number) {
  try {
    await sql`DELETE FROM suspects WHERE id = ${id}`;
  } catch (error) {
    console.error('Delete suspect error:', error);
    throw error;
  }
}

// 根据ID获取嫌疑人
export async function getSuspectById(id: number) {
  try {
    const result = await sql`SELECT * FROM suspects WHERE id = ${id}`;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Get suspect by ID error:', error);
    throw error;
  }
}

// 批量更新嫌疑人状态
export async function updateSuspectsBatch(updates: Array<{
  steam_id: string;
  status?: string;
  current_gameid?: number;
  game_server_ip?: string;
  personaname?: string;
  vac_banned?: boolean;
  game_ban_count?: number;
  last_logoff?: string;
}>) {
  try {
    for (const update of updates) {
      await sql`
        UPDATE suspects 
        SET 
          status = ${update.status || 'unknown'},
          current_gameid = ${update.current_gameid || null},
          game_server_ip = ${update.game_server_ip || null},
          personaname = ${update.personaname || null},
          vac_banned = ${update.vac_banned ? 1 : 0},
          game_ban_count = ${update.game_ban_count || 0},
          last_logoff = ${update.last_logoff || null},
          last_checked = CURRENT_TIMESTAMP
        WHERE steam_id = ${update.steam_id}
      `;
    }
  } catch (error) {
    console.error('Batch update error:', error);
    throw error;
  }
}