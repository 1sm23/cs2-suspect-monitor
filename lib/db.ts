import Database from 'better-sqlite3';
import path from 'path';
import { Suspect, Evidence, SuspectStatusHistory } from './types';

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
export function initializeDatabase() {
  console.log('Initializing SQLite database at:', dbPath);
  
  // 创建 suspects 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS suspects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steam_id TEXT UNIQUE NOT NULL,
      nickname TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'confirmed',
      profile_url TEXT,
      avatar_url TEXT,
      status TEXT NOT NULL DEFAULT 'clean',
      vac_banned BOOLEAN DEFAULT 0,
      game_ban_count INTEGER DEFAULT 0,
      current_gameid INTEGER DEFAULT NULL,
      game_server_ip TEXT DEFAULT NULL,
      last_logoff INTEGER DEFAULT NULL,
      last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 为现有表添加新列（如果不存在）
  try {
    db.exec(`ALTER TABLE suspects ADD COLUMN vac_banned BOOLEAN DEFAULT 0`);
    console.log('Added vac_banned column to suspects table');
  } catch (error) {
    // 列可能已经存在
  }
  try {
    db.exec(`ALTER TABLE suspects ADD COLUMN category TEXT NOT NULL DEFAULT 'confirmed'`);
    console.log('Added category column to suspects table');
  } catch (error) {
    // column may already exist
  }
  
  try {
    db.exec(`ALTER TABLE suspects ADD COLUMN game_ban_count INTEGER DEFAULT 0`);
    console.log('Added game_ban_count column to suspects table');
  } catch (error) {
    // 列可能已经存在
  }

  try {
    db.exec(`ALTER TABLE suspects ADD COLUMN current_gameid INTEGER DEFAULT NULL`);
    console.log('Added current_gameid column to suspects table');
  } catch (error) {
    // 列可能已经存在
  }
  
  try {
    db.exec(`ALTER TABLE suspects ADD COLUMN game_server_ip TEXT DEFAULT NULL`);
    console.log('Added game_server_ip column to suspects table');
  } catch (error) {
    // 列可能已经存在
  }

  try {
    db.exec(`ALTER TABLE suspects ADD COLUMN last_logoff INTEGER DEFAULT NULL`);
    console.log('Added last_logoff column to suspects table');
  } catch (error) {
    // 列可能已经存在
  }

  try {
    db.exec(`ALTER TABLE suspects ADD COLUMN personaname TEXT DEFAULT NULL`);
    console.log('Added personaname column to suspects table');
  } catch (error) {
    // 列可能已经存在
  }

  try {
    db.exec(`ALTER TABLE suspects ADD COLUMN ban_details TEXT DEFAULT NULL`);
    console.log('Added ban_details column to suspects table');
  } catch (error) {
    // 列可能已经存在
  }

  // 数据迁移：将现有的 nickname 移动到 personaname，并允许 nickname 为空
  try {
    // 检查是否需要进行数据迁移
    const needsMigration = db.prepare(`
      SELECT COUNT(*) as count FROM suspects 
      WHERE personaname IS NULL AND nickname IS NOT NULL AND nickname != ''
    `).get() as { count: number };
    
    if (needsMigration.count > 0) {
      console.log(`🔄 Migrating ${needsMigration.count} suspects: moving nickname to personaname...`);
      
      // 创建新表结构（nickname 允许为 NULL）
      db.exec(`
        CREATE TABLE IF NOT EXISTS suspects_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          steam_id TEXT UNIQUE NOT NULL,
          nickname TEXT DEFAULT NULL,
          category TEXT NOT NULL DEFAULT 'confirmed',
          profile_url TEXT,
          avatar_url TEXT,
          status TEXT NOT NULL DEFAULT 'clean',
          vac_banned BOOLEAN DEFAULT 0,
          game_ban_count INTEGER DEFAULT 0,
          current_gameid INTEGER DEFAULT NULL,
          game_server_ip TEXT DEFAULT NULL,
          last_logoff INTEGER DEFAULT NULL,
          last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          personaname TEXT DEFAULT NULL
        )
      `);
      
      // 迁移数据：将 nickname 复制到 personaname，nickname 设为 NULL
      db.exec(`
        INSERT INTO suspects_new 
        SELECT 
          id, steam_id, NULL as nickname, category, profile_url, avatar_url, 
          status, vac_banned, game_ban_count, current_gameid, game_server_ip, 
          last_logoff, last_checked, created_at, updated_at, nickname as personaname
        FROM suspects
      `);
      
      // 删除旧表，重命名新表
      db.exec(`DROP TABLE suspects`);
      db.exec(`ALTER TABLE suspects_new RENAME TO suspects`);
      
      // 重新创建索引
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_suspects_steam_id ON suspects(steam_id);
        CREATE INDEX IF NOT EXISTS idx_suspects_status ON suspects(status);
      `);
      
      console.log('✅ Migration completed: moved nickname to personaname, cleared nickname fields');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }

  // 创建 evidence 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suspect_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON DELETE CASCADE
    )
  `);

  // 创建 suspect_status_history 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS suspect_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suspect_id INTEGER NOT NULL,
      old_status TEXT,
      new_status TEXT NOT NULL,
      nickname TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON DELETE CASCADE
    )
  `);

  // 创建索引以提高查询性能
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_suspects_steam_id ON suspects(steam_id);
    CREATE INDEX IF NOT EXISTS idx_suspects_status ON suspects(status);
    CREATE INDEX IF NOT EXISTS idx_evidence_suspect_id ON evidence(suspect_id);
    CREATE INDEX IF NOT EXISTS idx_status_history_suspect_id ON suspect_status_history(suspect_id);
  `);

  console.log('Database tables initialized successfully');
}

// 在导入时初始化数据库
initializeDatabase();

export default db;