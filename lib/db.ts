import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL || './database.db';
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Create suspects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suspects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steam_id TEXT UNIQUE NOT NULL,
      nickname TEXT,
      profile_url TEXT,
      avatar_url TEXT,
      status TEXT DEFAULT 'unknown',
      last_checked DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create evidence table
  db.exec(`
    CREATE TABLE IF NOT EXISTS evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suspect_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('text', 'link', 'video', 'image', 'file')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON DELETE CASCADE
    )
  `);

  // Create suspect status history table
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

  // Add any missing columns (idempotent)
  try {
    db.exec('ALTER TABLE suspects ADD COLUMN profile_url TEXT');
  } catch (e) {
    // Column already exists
  }
  
  try {
    db.exec('ALTER TABLE suspects ADD COLUMN avatar_url TEXT');
  } catch (e) {
    // Column already exists
  }
}

// Initialize on import
initializeDatabase();

export default db;