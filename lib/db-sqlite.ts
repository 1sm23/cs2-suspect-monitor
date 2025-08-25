import Database from 'better-sqlite3';
import path from 'path';

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'data', 'database.db');

// 创建数据库连接
const db = new Database(dbPath);

// 设置 WAL 模式以提高并发性能
db.pragma('journal_mode = WAL');

// 设置编码为 UTF-8 以支持中文
db.pragma('encoding = "UTF-8"');

// 设置文本编码
db.exec('PRAGMA text_encoding = "UTF-8";');

// 初始化数据库表
export function initDatabase() {
  console.log('Initializing SQLite database at:', dbPath);

  // 创建 suspects 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS suspects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steam_id TEXT UNIQUE NOT NULL,
      nickname TEXT,
      personaname TEXT,
      category TEXT NOT NULL DEFAULT 'confirmed',
      profile_url TEXT,
      avatar_url TEXT,
      status TEXT NOT NULL DEFAULT 'unknown',
      vac_banned BOOLEAN DEFAULT 0,
      game_ban_count INTEGER DEFAULT 0,
      current_gameid INTEGER DEFAULT NULL,
      game_server_ip TEXT DEFAULT NULL,
      ban_details TEXT DEFAULT NULL,
      last_logoff INTEGER DEFAULT NULL,
      last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_private BOOLEAN DEFAULT 0
    )
  `);

  // 添加 is_private 字段（如果表已存在但没有该字段）
  try {
    db.exec('ALTER TABLE suspects ADD COLUMN is_private BOOLEAN DEFAULT 0');
  } catch (error) {
    // 如果字段已存在，忽略错误
    console.log('is_private column already exists or could not be added');
  }

  // 创建索引以提高查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_suspects_steam_id ON suspects(steam_id);
    CREATE INDEX IF NOT EXISTS idx_suspects_status ON suspects(status);
    CREATE INDEX IF NOT EXISTS idx_suspects_current_gameid ON suspects(current_gameid);
  `);

  console.log('SQLite database tables initialized successfully');
}

// 获取所有嫌疑人
export function getAllSuspects(
  filters: {
    online?: boolean;
    cs2_launched?: boolean;
    in_game?: boolean;
  } = {}
) {
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
      conditions.push(
        "current_gameid = 730 AND game_server_ip IS NOT NULL AND game_server_ip != ''"
      );
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all();
  } catch (error) {
    console.error('Get suspects error:', error);
    throw error;
  }
}

// 添加嫌疑人
export function addSuspect(suspect: {
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
    const stmt = db.prepare(`
      INSERT INTO suspects (
        steam_id, nickname, personaname, category, profile_url, avatar_url,
        status, vac_banned, game_ban_count, current_gameid, game_server_ip,
        ban_details, last_logoff, last_checked
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
      )
    `);

    const result = stmt.run(
      suspect.steam_id,
      suspect.nickname || null,
      suspect.personaname || null,
      suspect.category,
      suspect.profile_url || null,
      suspect.avatar_url || null,
      suspect.status || 'unknown',
      suspect.vac_banned ? 1 : 0,
      suspect.game_ban_count || 0,
      suspect.current_gameid || null,
      suspect.game_server_ip || null,
      suspect.ban_details || null,
      suspect.last_logoff || null
    );

    // 返回新插入的记录
    const newSuspect = db
      .prepare('SELECT * FROM suspects WHERE id = ?')
      .get(result.lastInsertRowid);
    return newSuspect;
  } catch (error) {
    console.error('Add suspect error:', error);
    throw error;
  }
}

// 更新嫌疑人
export function updateSuspect(id: number, updates: any) {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    const setClause = fields.map((field) => `${field} = ?`).join(', ');

    const stmt = db.prepare(`
      UPDATE suspects 
      SET ${setClause}, last_checked = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    stmt.run(...values, id);

    // 返回更新后的记录
    const updatedSuspect = db
      .prepare('SELECT * FROM suspects WHERE id = ?')
      .get(id);
    return updatedSuspect;
  } catch (error) {
    console.error('Update suspect error:', error);
    throw error;
  }
}

// 删除嫌疑人
export function deleteSuspect(id: number) {
  try {
    const stmt = db.prepare('DELETE FROM suspects WHERE id = ?');
    stmt.run(id);
  } catch (error) {
    console.error('Delete suspect error:', error);
    throw error;
  }
}

// 根据ID获取嫌疑人
export function getSuspectById(id: number) {
  try {
    const stmt = db.prepare('SELECT * FROM suspects WHERE id = ?');
    return stmt.get(id) || null;
  } catch (error) {
    console.error('Get suspect by ID error:', error);
    throw error;
  }
}

// 批量更新嫌疑人状态
export function updateSuspectsBatch(
  updates: Array<{
    steam_id: string;
    status?: string;
    current_gameid?: number;
    game_server_ip?: string;
    personaname?: string;
    vac_banned?: boolean;
    game_ban_count?: number;
    last_logoff?: string;
  }>
) {
  try {
    const stmt = db.prepare(`
      UPDATE suspects 
      SET 
        status = ?,
        current_gameid = ?,
        game_server_ip = ?,
        personaname = ?,
        vac_banned = ?,
        game_ban_count = ?,
        last_logoff = ?,
        last_checked = CURRENT_TIMESTAMP
      WHERE steam_id = ?
    `);

    const transaction = db.transaction((updates) => {
      for (const update of updates) {
        stmt.run(
          update.status || 'unknown',
          update.current_gameid || null,
          update.game_server_ip || null,
          update.personaname || null,
          update.vac_banned ? 1 : 0,
          update.game_ban_count || 0,
          update.last_logoff || null,
          update.steam_id
        );
      }
    });

    transaction(updates);
  } catch (error) {
    console.error('Batch update error:', error);
    throw error;
  }
}

// 在导入时初始化数据库
initDatabase();
