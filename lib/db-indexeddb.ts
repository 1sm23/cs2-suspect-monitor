import type { Suspect } from './types';

// 延迟导入localForage以避免SSR问题
async function getLocalForage() {
  if (typeof window === 'undefined') {
    return null;
  }
  const localforage = await import('localforage');
  return localforage.default;
}

let suspectsStore: any = null;
let settingsStore: any = null;

// 初始化存储实例
async function initializeStores() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!suspectsStore || !settingsStore) {
    const localforage = await getLocalForage();
    if (!localforage) return null;
    
    // 配置 localforage 使用 IndexedDB
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: 'cs2-suspect-monitor',
      version: 1.0,
      storeName: 'suspects',
      description: 'CS2 Suspect Monitor data storage'
    });

    // 创建不同的存储实例
    suspectsStore = localforage.createInstance({
      name: 'cs2-suspect-monitor',
      storeName: 'suspects'
    });

    settingsStore = localforage.createInstance({
      name: 'cs2-suspect-monitor',
      storeName: 'settings'
    });
  }

  return { suspectsStore, settingsStore };
}

// 生成唯一ID
function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// 初始化数据库
export async function initDatabase() {
  if (typeof window === 'undefined') {
    console.warn('IndexedDB can only be initialized on the client side');
    return false;
  }

  try {
    const stores = await initializeStores();
    if (!stores) return false;

    const version = await stores.settingsStore.getItem('db_version') as string | null;
    if (!version) {
      await stores.settingsStore.setItem('db_version', '1.0');
      console.log('IndexedDB initialized successfully');
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    return false;
  }
}

// 获取所有嫌疑人
export async function getAllSuspects(
  filters: {
    online?: boolean;
    cs2_launched?: boolean;
    in_game?: boolean;
  } = {}
): Promise<Suspect[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stores = await initializeStores();
    if (!stores) return [];

    const suspects: Suspect[] = [];
    
    await stores.suspectsStore.iterate((suspect: Suspect) => {
      if (suspect && suspect.steam_id) {
        suspects.push(suspect);
      }
    });

    let filteredSuspects = suspects;

    if (filters.online) {
      filteredSuspects = filteredSuspects.filter(s => 
        s.status && !['offline', 'unknown', 'private'].includes(s.status)
      );
    }

    if (filters.cs2_launched) {
      filteredSuspects = filteredSuspects.filter(s => 
        s.current_gameid === 730
      );
    }

    if (filters.in_game) {
      filteredSuspects = filteredSuspects.filter(s => 
        s.current_gameid !== null && s.current_gameid !== undefined
      );
    }

    return filteredSuspects.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error getting suspects:', error);
    return [];
  }
}

// 添加嫌疑人
export async function addSuspect(suspectData: Partial<Suspect>): Promise<Suspect> {
  const stores = await initializeStores();
  if (!stores) throw new Error('Storage not available');

  const now = new Date().toISOString();
  const id = generateId();
  
  const suspect: Suspect = {
    id,
    steam_id: suspectData.steam_id || '',
    nickname: suspectData.nickname || null,
    category: suspectData.category || 'confirmed',
    profile_url: suspectData.profile_url || null,
    avatar_url: suspectData.avatar_url || null,
    status: suspectData.status || 'unknown',
    vac_banned: suspectData.vac_banned || false,
    game_ban_count: suspectData.game_ban_count || 0,
    current_gameid: suspectData.current_gameid || null,
    game_server_ip: suspectData.game_server_ip || null,
    last_logoff: suspectData.last_logoff || null,
    last_checked: now,
    created_at: now,
    updated_at: now,
    personaname: suspectData.personaname || null,
    ban_details: suspectData.ban_details || null,
    communityvisibilitystate: suspectData.communityvisibilitystate || 3,
  };

  await stores.suspectsStore.setItem(suspect.steam_id, suspect);
  return suspect;
}

// 更新嫌疑人
export async function updateSuspect(id: number, updates: Partial<Suspect>): Promise<Suspect | null> {
  const stores = await initializeStores();
  if (!stores) return null;

  let foundSuspect: Suspect | null = null;
  let foundKey: string | null = null;

  await stores.suspectsStore.iterate((suspect: Suspect, key: string) => {
    if (suspect && suspect.id === id) {
      foundSuspect = suspect;
      foundKey = key;
      return;
    }
  });

  if (!foundSuspect || !foundKey) {
    return null;
  }

  const updatedSuspect: Suspect = {
    ...(foundSuspect as Suspect),
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await stores.suspectsStore.setItem(foundKey, updatedSuspect);
  return updatedSuspect;
}

// 删除嫌疑人
export async function deleteSuspect(id: number): Promise<boolean> {
  const stores = await initializeStores();
  if (!stores) return false;

  let foundKey: string | null = null;

  await stores.suspectsStore.iterate((suspect: Suspect, key: string) => {
    if (suspect && suspect.id === id) {
      foundKey = key;
      return;
    }
  });

  if (!foundKey) {
    return false;
  }

  await stores.suspectsStore.removeItem(foundKey);
  return true;
}

// 根据ID获取嫌疑人
export async function getSuspectById(id: number): Promise<Suspect | null> {
  const stores = await initializeStores();
  if (!stores) return null;

  let foundSuspect: Suspect | null = null;

  await stores.suspectsStore.iterate((suspect: Suspect) => {
    if (suspect && suspect.id === id) {
      foundSuspect = suspect;
      return;
    }
  });

  return foundSuspect;
}

// 批量更新嫌疑人状态
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
): Promise<void> {
  const stores = await initializeStores();
  if (!stores) return;

  for (const update of updates) {
    const suspect = await stores.suspectsStore.getItem(update.steam_id) as Suspect | null;
    if (suspect) {
      const updatedSuspect: Suspect = {
        ...suspect,
        ...update,
        last_logoff: update.last_logoff ? Number(update.last_logoff) : suspect.last_logoff,
        updated_at: new Date().toISOString(),
      };
      await stores.suspectsStore.setItem(update.steam_id, updatedSuspect);
    }
  }
}

// 获取Steam API密钥
export async function getSteamApiKey(): Promise<string | null> {
  const stores = await initializeStores();
  if (!stores) return null;

  try {
    return await stores.settingsStore.getItem('steam_api_key') as string | null;
  } catch (error) {
    console.error('Error getting Steam API key:', error);
    return null;
  }
}

// 设置Steam API密钥
export async function setSteamApiKey(apiKey: string): Promise<void> {
  const stores = await initializeStores();
  if (!stores) throw new Error('Storage not available');

  try {
    await stores.settingsStore.setItem('steam_api_key', apiKey);
  } catch (error) {
    console.error('Error setting Steam API key:', error);
    throw error;
  }
}

// 清除所有数据（用于测试或重置）
export async function clearAllData(): Promise<void> {
  const stores = await initializeStores();
  if (!stores) return;

  try {
    await stores.suspectsStore.clear();
    await stores.settingsStore.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}