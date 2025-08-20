// 统一的数据库接口 - 根据环境自动选择使用 SQLite 或 Vercel Postgres

// 导入所有函数
import * as sqliteDb from './db-sqlite';
import * as vercelDb from './db-vercel';

// 检查是否在 Vercel 环境中
const isVercel = process.env.VERCEL === '1' || process.env.POSTGRES_URL;

// 根据环境选择数据库实现
const db = isVercel ? vercelDb : sqliteDb;

console.log(`🗄️ Using ${isVercel ? 'Vercel Postgres' : 'SQLite'} database`);

// 导出所有数据库函数
export const {
  initDatabase,
  getAllSuspects,
  addSuspect,
  updateSuspect,
  deleteSuspect,
  getSuspectById,
  updateSuspectsBatch
} = db;

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