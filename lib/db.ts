// 统一的数据库接口 - 使用 IndexedDB (客户端存储)

// 动态导入 IndexedDB 模块
async function getDb() {
  const indexedDbModule = await import('./db-indexeddb');
  return { db: indexedDbModule, type: 'IndexedDB (客户端存储)' };
}

let dbCache: any = null;
let dbType = '';

async function ensureDb() {
  if (!dbCache) {
    const result = await getDb();
    dbCache = result.db;
    dbType = result.type;
    console.log(`🗄️ Using ${dbType} database`);
  }
  return dbCache;
}

// 导出所有数据库函数
export async function initDatabase() {
  const db = await ensureDb();
  return db.initDatabase();
}

export async function getAllSuspects(
  filters: {
    online?: boolean;
    cs2_launched?: boolean;
    in_game?: boolean;
  } = {}
) {
  const db = await ensureDb();
  return db.getAllSuspects(filters);
}

export async function addSuspect(suspect: any) {
  const db = await ensureDb();
  return db.addSuspect(suspect);
}

export async function updateSuspect(id: number, updates: any) {
  const db = await ensureDb();
  return db.updateSuspect(id, updates);
}

export async function deleteSuspect(id: number) {
  const db = await ensureDb();
  return db.deleteSuspect(id);
}

export async function getSuspectById(id: number) {
  const db = await ensureDb();
  return db.getSuspectById(id);
}

export async function updateSuspectsBatch(
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
  const db = await ensureDb();
  return db.updateSuspectsBatch(updates);
}

// 类型定义
export interface Suspect {
  id: number;
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
  last_checked?: string;
  created_at?: string;
}

export interface SuspectFilters {
  online?: boolean;
  cs2_launched?: boolean;
  in_game?: boolean;
}
