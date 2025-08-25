// 客户端嫌疑人服务
import { 
  initDatabase, 
  getAllSuspects, 
  addSuspect, 
  updateSuspect, 
  deleteSuspect, 
  updateSuspectsBatch,
  getSuspectById 
} from '@/lib/db-indexeddb';
import type { Suspect } from '@/lib/types';
import { authManager } from '@/lib/auth-manager';

export class SuspectService {
  
  // 初始化数据库
  static async initialize() {
    try {
      await initDatabase();
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  }

  // 获取所有嫌疑人
  static async getAllSuspects(filters: {
    online?: boolean;
    cs2_launched?: boolean;
    in_game?: boolean;
  } = {}) {
    try {
      return await getAllSuspects(filters);
    } catch (error) {
      console.error('Error getting suspects:', error);
      return [];
    }
  }

  // 添加嫌疑人（包含Steam数据获取）
  static async addSuspect(data: {
    steam_id: string;
    nickname?: string;
    category?: 'confirmed' | 'high_risk' | 'suspected';
    force_add_private?: boolean;
  }) {
    try {
      const apiKey = authManager.getSteamApiKey();
      if (!apiKey) {
        throw new Error('Steam API key not found');
      }

      // 首先获取Steam数据
      const response = await fetch('/api/steam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steam_id: data.steam_id,
          api_key: apiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Steam data');
      }

      const { steamData, banData } = await response.json();

      // 检查是否为私密账户
      const isPrivate = steamData.communityvisibilitystate === 1;
      
      if (isPrivate && !data.force_add_private) {
        return {
          isPrivate: true,
          steamData,
          message: 'This is a private Steam profile. Do you want to add it anyway?'
        };
      }

      // 创建嫌疑人数据
      const suspectData: Partial<Suspect> = {
        steam_id: steamData.steamid,
        nickname: data.nickname || null,
        category: data.category || 'confirmed',
        profile_url: steamData.profileurl || null,
        avatar_url: steamData.avatarfull || null,
        status: this.getStatusFromPersonaState(steamData.personastate || 0),
        vac_banned: banData.VACBanned || false,
        game_ban_count: banData.NumberOfGameBans || 0,
        current_gameid: steamData.gameid ? parseInt(steamData.gameid) : null,
        game_server_ip: steamData.gameserverip || null,
        last_logoff: steamData.lastlogoff || null,
        personaname: steamData.personaname || null,
        ban_details: this.formatBanDetails(banData),
        communityvisibilitystate: steamData.communityvisibilitystate || 3,
      };

      // 保存到IndexedDB
      const suspect = await addSuspect(suspectData);
      return { suspect };

    } catch (error) {
      console.error('Error adding suspect:', error);
      throw error;
    }
  }

  // 删除嫌疑人
  static async deleteSuspect(id: number) {
    try {
      return await deleteSuspect(id);
    } catch (error) {
      console.error('Error deleting suspect:', error);
      return false;
    }
  }

  // 更新嫌疑人
  static async updateSuspect(id: number, updates: Partial<Suspect>) {
    try {
      return await updateSuspect(id, updates);
    } catch (error) {
      console.error('Error updating suspect:', error);
      return null;
    }
  }

  // 批量更新Steam数据
  static async refreshSteamData(suspects: Suspect[]) {
    try {
      const apiKey = authManager.getSteamApiKey();
      if (!apiKey) {
        throw new Error('Steam API key not found');
      }

      const steamIds = suspects.map(s => s.steam_id);
      
      const response = await fetch('/api/steam', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steam_ids: steamIds,
          api_key: apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh Steam data');
      }

      const { results } = await response.json();

      // 更新本地数据
      const updates = results.map((result: any) => {
        const steamData = result.steamData;
        const banData = result.banData;

        if (!steamData) return null;

        return {
          steam_id: result.steam_id,
          status: this.getStatusFromPersonaState(steamData.personastate || 0),
          current_gameid: steamData.gameid ? parseInt(steamData.gameid) : null,
          game_server_ip: steamData.gameserverip || null,
          personaname: steamData.personaname || null,
          avatar_url: steamData.avatarfull || null,
          vac_banned: banData?.VACBanned || false,
          game_ban_count: banData?.NumberOfGameBans || 0,
          last_logoff: steamData.lastlogoff || null,
          communityvisibilitystate: steamData.communityvisibilitystate || 3,
        };
      }).filter(Boolean);

      await updateSuspectsBatch(updates);
      return true;

    } catch (error) {
      console.error('Error refreshing Steam data:', error);
      return false;
    }
  }

  // 获取单个嫌疑人
  static async getSuspectById(id: number) {
    try {
      return await getSuspectById(id);
    } catch (error) {
      console.error('Error getting suspect by ID:', error);
      return null;
    }
  }

  // 工具方法：根据persona状态获取状态字符串
  private static getStatusFromPersonaState(personastate: number): string {
    switch (personastate) {
      case 0: return 'offline';
      case 1: return 'online';
      case 2: return 'busy';
      case 3: return 'away';
      case 4: return 'snooze';
      case 5: return 'looking to trade';
      case 6: return 'looking to play';
      default: return 'unknown';
    }
  }

  // 工具方法：格式化封禁详情
  private static formatBanDetails(banData: any): string | null {
    if (!banData) return null;

    const details = [];
    if (banData.VACBanned) {
      details.push(`VAC封禁: ${banData.NumberOfVACBans}次`);
    }
    if (banData.NumberOfGameBans > 0) {
      details.push(`游戏封禁: ${banData.NumberOfGameBans}次`);
    }
    if (banData.CommunityBanned) {
      details.push('社区封禁');
    }
    if (banData.EconomyBan !== 'none') {
      details.push(`经济封禁: ${banData.EconomyBan}`);
    }
    if (banData.DaysSinceLastBan > 0) {
      details.push(`距离上次封禁: ${banData.DaysSinceLastBan}天`);
    }

    return details.length > 0 ? details.join(', ') : null;
  }
}