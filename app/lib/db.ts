import Database from 'better-sqlite3';
import path from 'path';
import { Suspect, Evidence } from './types';

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initDatabase() {
  // Create suspects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS suspects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      steam_id TEXT UNIQUE NOT NULL,
      nickname TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_checked DATETIME,
      status TEXT,
      is_playing_cs2 BOOLEAN DEFAULT FALSE,
      avatar_url TEXT,
      profile_url TEXT
    )
  `);

  // Create evidence table
  db.exec(`
    CREATE TABLE IF NOT EXISTS evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suspect_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      importance INTEGER DEFAULT 1,
      FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON DELETE CASCADE
    )
  `);

  console.log('Database tables initialized successfully');
}

// Suspect operations
export const suspects = {
  getAll(): Suspect[] {
    const stmt = db.prepare(`
      SELECT * FROM suspects 
      ORDER BY added_at DESC
    `);
    return stmt.all() as Suspect[];
  },

  getById(id: number): Suspect | undefined {
    const stmt = db.prepare('SELECT * FROM suspects WHERE id = ?');
    return stmt.get(id) as Suspect | undefined;
  },

  getBySteamId(steamId: string): Suspect | undefined {
    const stmt = db.prepare('SELECT * FROM suspects WHERE steam_id = ?');
    return stmt.get(steamId) as Suspect | undefined;
  },

  create(suspect: Omit<Suspect, 'id' | 'added_at'>): Suspect {
    const stmt = db.prepare(`
      INSERT INTO suspects (steam_id, nickname, last_checked, status, is_playing_cs2, avatar_url, profile_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      suspect.steam_id,
      suspect.nickname || null,
      suspect.last_checked || null,
      suspect.status || null,
      suspect.is_playing_cs2 ? 1 : 0,
      suspect.avatar_url || null,
      suspect.profile_url || null
    );

    return this.getById(result.lastInsertRowid as number)!;
  },

  update(id: number, updates: Partial<Omit<Suspect, 'id' | 'added_at'>>): Suspect | undefined {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    if (fields.length === 0) return this.getById(id);

    const stmt = db.prepare(`UPDATE suspects SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
    
    return this.getById(id);
  },

  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM suspects WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  updateStatus(steamId: string, status: string, isPlayingCs2: boolean, lastChecked: string): void {
    const stmt = db.prepare(`
      UPDATE suspects 
      SET status = ?, is_playing_cs2 = ?, last_checked = ? 
      WHERE steam_id = ?
    `);
    stmt.run(status, isPlayingCs2 ? 1 : 0, lastChecked, steamId);
  }
};

// Evidence operations
export const evidence = {
  getBySuspectId(suspectId: number): Evidence[] {
    const stmt = db.prepare(`
      SELECT * FROM evidence 
      WHERE suspect_id = ? 
      ORDER BY created_at DESC
    `);
    return stmt.all(suspectId) as Evidence[];
  },

  getById(id: number): Evidence | undefined {
    const stmt = db.prepare('SELECT * FROM evidence WHERE id = ?');
    return stmt.get(id) as Evidence | undefined;
  },

  create(evidenceData: Omit<Evidence, 'id' | 'created_at'>): Evidence {
    const stmt = db.prepare(`
      INSERT INTO evidence (suspect_id, type, content, description, importance)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      evidenceData.suspect_id,
      evidenceData.type,
      evidenceData.content,
      evidenceData.description || null,
      evidenceData.importance || 1
    );

    return this.getById(result.lastInsertRowid as number)!;
  },

  update(id: number, updates: Partial<Omit<Evidence, 'id' | 'created_at'>>): Evidence | undefined {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    if (fields.length === 0) return this.getById(id);

    const stmt = db.prepare(`UPDATE evidence SET ${fields} WHERE id = ?`);
    stmt.run(...values, id);
    
    return this.getById(id);
  },

  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM evidence WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  getCount(suspectId: number): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM evidence WHERE suspect_id = ?');
    const result = stmt.get(suspectId) as { count: number };
    return result.count;
  }
};

// Initialize the database when this module is imported
initDatabase();

export default db;