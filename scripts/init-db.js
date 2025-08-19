const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Initializing database...');

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

console.log('Database tables created successfully!');
console.log('Database location:', dbPath);

// Close the database connection
db.close();