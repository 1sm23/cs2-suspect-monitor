import Database from 'better-sqlite3';
import { SuspectProfile, BanRecord, Evidence } from './types';

const db = new Database(process.env.DATABASE_URL || './database.sqlite');

// Initialize database tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS suspects (
      id TEXT PRIMARY KEY,
      steam_id TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      profile_url TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'monitoring',
      notes TEXT,
      tags TEXT DEFAULT '[]',
      last_checked TEXT
    );

    CREATE TABLE IF NOT EXISTS ban_records (
      id TEXT PRIMARY KEY,
      suspect_id TEXT NOT NULL,
      ban_type TEXT NOT NULL,
      ban_date TEXT NOT NULL,
      detected TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      suspect_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      file_path TEXT,
      external_url TEXT,
      uploaded_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_suspects_steam_id ON suspects (steam_id);
    CREATE INDEX IF NOT EXISTS idx_suspects_status ON suspects (status);
    CREATE INDEX IF NOT EXISTS idx_ban_records_suspect_id ON ban_records (suspect_id);
    CREATE INDEX IF NOT EXISTS idx_evidence_suspect_id ON evidence (suspect_id);
  `);
}

// Suspect operations
export function getAllSuspects(): SuspectProfile[] {
  const stmt = db.prepare(`
    SELECT * FROM suspects ORDER BY updated_at DESC
  `);
  const suspects = stmt.all() as any[];
  
  return suspects.map(suspect => ({
    ...suspect,
    tags: JSON.parse(suspect.tags || '[]'),
    banHistory: getBanRecords(suspect.id),
    evidence: getEvidence(suspect.id)
  }));
}

export function getSuspectById(id: string): SuspectProfile | null {
  const stmt = db.prepare('SELECT * FROM suspects WHERE id = ?');
  const suspect = stmt.get(id) as any;
  
  if (!suspect) return null;
  
  return {
    ...suspect,
    tags: JSON.parse(suspect.tags || '[]'),
    banHistory: getBanRecords(suspect.id),
    evidence: getEvidence(suspect.id)
  };
}

export function getSuspectBySteamId(steamId: string): SuspectProfile | null {
  const stmt = db.prepare('SELECT * FROM suspects WHERE steam_id = ?');
  const suspect = stmt.get(steamId) as any;
  
  if (!suspect) return null;
  
  return {
    ...suspect,
    tags: JSON.parse(suspect.tags || '[]'),
    banHistory: getBanRecords(suspect.id),
    evidence: getEvidence(suspect.id)
  };
}

export function createSuspect(suspect: Omit<SuspectProfile, 'banHistory' | 'evidence'>): void {
  const stmt = db.prepare(`
    INSERT INTO suspects (
      id, steam_id, display_name, profile_url, avatar_url,
      created_at, updated_at, status, notes, tags, last_checked
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    suspect.id,
    suspect.steamId,
    suspect.displayName,
    suspect.profileUrl,
    suspect.avatarUrl,
    suspect.createdAt,
    suspect.updatedAt,
    suspect.status,
    suspect.notes,
    JSON.stringify(suspect.tags),
    suspect.lastChecked
  );
}

export function updateSuspect(id: string, updates: Partial<SuspectProfile>): void {
  const fields = [];
  const values = [];
  
  if (updates.displayName) {
    fields.push('display_name = ?');
    values.push(updates.displayName);
  }
  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    values.push(updates.notes);
  }
  if (updates.tags) {
    fields.push('tags = ?');
    values.push(JSON.stringify(updates.tags));
  }
  if (updates.lastChecked) {
    fields.push('last_checked = ?');
    values.push(updates.lastChecked);
  }
  
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);
  
  const stmt = db.prepare(`UPDATE suspects SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function deleteSuspect(id: string): void {
  const stmt = db.prepare('DELETE FROM suspects WHERE id = ?');
  stmt.run(id);
}

// Ban record operations
export function getBanRecords(suspectId: string): BanRecord[] {
  const stmt = db.prepare('SELECT * FROM ban_records WHERE suspect_id = ? ORDER BY created_at DESC');
  return stmt.all(suspectId) as BanRecord[];
}

export function createBanRecord(banRecord: BanRecord): void {
  const stmt = db.prepare(`
    INSERT INTO ban_records (id, suspect_id, ban_type, ban_date, detected, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    banRecord.id,
    banRecord.suspectId,
    banRecord.banType,
    banRecord.banDate,
    banRecord.detected,
    banRecord.createdAt
  );
}

// Evidence operations
export function getEvidence(suspectId: string): Evidence[] {
  const stmt = db.prepare('SELECT * FROM evidence WHERE suspect_id = ? ORDER BY created_at DESC');
  const evidence = stmt.all(suspectId) as any[];
  
  return evidence.map(e => ({
    ...e,
    tags: JSON.parse(e.tags || '[]')
  }));
}

export function createEvidence(evidence: Evidence): void {
  const stmt = db.prepare(`
    INSERT INTO evidence (
      id, suspect_id, type, title, description, file_path,
      external_url, uploaded_by, created_at, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    evidence.id,
    evidence.suspectId,
    evidence.type,
    evidence.title,
    evidence.description,
    evidence.filePath,
    evidence.externalUrl,
    evidence.uploadedBy,
    evidence.createdAt,
    JSON.stringify(evidence.tags)
  );
}

export function deleteEvidence(id: string): void {
  const stmt = db.prepare('DELETE FROM evidence WHERE id = ?');
  stmt.run(id);
}

// Initialize database on import
try {
  initDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error);
}

export default db;