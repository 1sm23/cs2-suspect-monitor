import localforage from 'localforage';
import type { Suspect } from './types';

// 配置 localforage 使用 IndexedDB
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'cs2-suspect-monitor',
  version: 1.0,
  storeName: 'suspects', // 主要存储区域
  description: 'CS2 Suspect Monitor data storage'
});

// 创建不同的存储实例
const suspectsStore = localforage.createInstance({
  name: 'cs2-suspect-monitor',
  storeName: 'suspects'
});

const settingsStore = localforage.createInstance({
  name: 'cs2-suspect-monitor',
  storeName: 'settings'
});

// 初始化数据库
export async function initDatabase() {
  // 确保只在客户端执行
  if (typeof window === 'undefined') {
    console.warn('IndexedDB can only be initialized on the client side');
    return false;
  }

  try {
    // 检查是否是第一次运行，如果是则进行初始化
    const version = await settingsStore.getItem<string>('db_version');
    if (!version) {
      await settingsStore.setItem('db_version', '1.0');
      console.log('IndexedDB initialized successfully');
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    throw error;
  }
}

// 生成唯一ID
function generateId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// 获取所有嫌疑人
export async function getAllSuspects(
  filters: {
    online?: boolean;
    cs2_launched?: boolean;
    in_game?: boolean;
  } = {}
): Promise<Suspect[]> {
  // 确保只在客户端执行
  if (typeof window === 'undefined') {
    console.warn('IndexedDB can only be accessed on the client side');
    return [];
  }

  try {
    const suspects: Suspect[] = [];
    
    // 获取所有嫌疑人
    await suspectsStore.iterate((suspect: Suspect) => {
      if (suspect && suspect.steam_id) {
        suspects.push(suspect);
      }
    });

    // 应用过滤器
    let filteredSuspects = suspects;

    if (filters.online) {
      filteredSuspects = filteredSuspects.filter(s => 
        s.status && !['offline', 'unknown', 'private'].includes(s.status)
      );
    }

    if (filters.cs2_launched) {
      filteredSuspects = filteredSuspects.filter(s => 
        s.current_gameid === 730 // CS2 的游戏ID
      );
    }

    if (filters.in_game) {
      filteredSuspects = filteredSuspects.filter(s => 
        s.current_gameid !== null && s.current_gameid !== undefined
      );
    }

    // 按创建时间排序
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
  try {
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

    await suspectsStore.setItem(suspect.steam_id, suspect);
    return suspect;
  } catch (error) {
    console.error('Error adding suspect:', error);
    throw error;
  }
}

// 更新嫌疑人
export async function updateSuspect(id: number, updates: Partial<Suspect>): Promise<Suspect | null> {
  try {
    // 通过ID查找嫌疑人
    let foundSuspect: Suspect | null = null;
    let foundKey: string | null = null;

    await suspectsStore.iterate((suspect: Suspect, key: string) => {
      if (suspect && suspect.id === id) {
        foundSuspect = suspect;
        foundKey = key;
        return; // 停止迭代
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

    await suspectsStore.setItem(foundKey, updatedSuspect);
    return updatedSuspect;
  } catch (error) {
    console.error('Error updating suspect:', error);
    throw error;
  }
}

// 删除嫌疑人
export async function deleteSuspect(id: number): Promise<boolean> {
  try {
    let foundKey: string | null = null;

    await suspectsStore.iterate((suspect: Suspect, key: string) => {
      if (suspect && suspect.id === id) {
        foundKey = key;
        return; // 停止迭代
      }
    });

    if (!foundKey) {
      return false;
    }

    await suspectsStore.removeItem(foundKey);
    return true;
  } catch (error) {
    console.error('Error deleting suspect:', error);
    return false;
  }
}

// 根据ID获取嫌疑人
export async function getSuspectById(id: number): Promise<Suspect | null> {
  try {
    let foundSuspect: Suspect | null = null;

    await suspectsStore.iterate((suspect: Suspect) => {
      if (suspect && suspect.id === id) {
        foundSuspect = suspect;
        return; // 停止迭代
      }
    });

    return foundSuspect;
  } catch (error) {
    console.error('Error getting suspect by ID:', error);
    return null;
  }
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
  try {
    for (const update of updates) {
      const suspect = await suspectsStore.getItem<Suspect>(update.steam_id);
      if (suspect) {
        const updatedSuspect: Suspect = {
          ...suspect,
          ...update,
          last_logoff: update.last_logoff ? Number(update.last_logoff) : suspect.last_logoff,
          updated_at: new Date().toISOString(),
        };
        await suspectsStore.setItem(update.steam_id, updatedSuspect);
      }
    }
  } catch (error) {
    console.error('Error batch updating suspects:', error);
    throw error;
  }
}

// 获取Steam API密钥
export async function getSteamApiKey(): Promise<string | null> {
  try {
    return await settingsStore.getItem<string>('steam_api_key');
  } catch (error) {
    console.error('Error getting Steam API key:', error);
    return null;
  }
}

// 设置Steam API密钥
export async function setSteamApiKey(apiKey: string): Promise<void> {
  try {
    await settingsStore.setItem('steam_api_key', apiKey);
  } catch (error) {
    console.error('Error setting Steam API key:', error);
    throw error;
  }
}

// 清除所有数据（用于测试或重置）
export async function clearAllData(): Promise<void> {
  try {
    await suspectsStore.clear();
    await settingsStore.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}