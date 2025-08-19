import { SteamPlayerResponse, SteamPlayer, PERSONA_STATES, CS2_APP_ID } from './types';

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const STEAM_API_BASE = 'https://api.steampowered.com';

if (!STEAM_API_KEY) {
  console.warn('STEAM_API_KEY is not set in environment variables');
}

export class SteamAPI {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || STEAM_API_KEY || '';
  }

  async getPlayerSummaries(steamIds: string[]): Promise<SteamPlayer[]> {
    if (!this.apiKey) {
      throw new Error('Steam API key is required');
    }

    const steamIdList = steamIds.join(',');
    const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamIdList}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Steam API error: ${response.status}`);
      }

      const data: SteamPlayerResponse = await response.json();
      return data.response.players;
    } catch (error) {
      console.error('Failed to fetch player summaries:', error);
      throw error;
    }
  }

  async getPlayerSummary(steamId: string): Promise<SteamPlayer | null> {
    const players = await this.getPlayerSummaries([steamId]);
    return players.length > 0 ? players[0] : null;
  }

  getPlayerStatus(player: SteamPlayer): {
    status: string;
    isPlayingCs2: boolean;
    gameInfo?: string;
  } {
    const personaState = player.personastate;
    const isInGame = !!player.gameid;
    const isPlayingCs2 = player.gameid === CS2_APP_ID;

    let status = PERSONA_STATES[personaState as keyof typeof PERSONA_STATES] || 'offline';
    
    if (isInGame) {
      status = 'in-game';
    }

    return {
      status,
      isPlayingCs2,
      gameInfo: player.gameextrainfo
    };
  }

  async getPlayerCurrentGame(steamId: string): Promise<{
    isPlayingCs2: boolean;
    currentGame?: string;
    status: string;
  }> {
    try {
      const player = await this.getPlayerSummary(steamId);
      if (!player) {
        return {
          isPlayingCs2: false,
          status: 'offline'
        };
      }

      const statusInfo = this.getPlayerStatus(player);
      
      return {
        isPlayingCs2: statusInfo.isPlayingCs2,
        currentGame: statusInfo.gameInfo,
        status: statusInfo.status
      };
    } catch (error) {
      console.error(`Failed to get current game for ${steamId}:`, error);
      return {
        isPlayingCs2: false,
        status: 'offline'
      };
    }
  }

  static convertSteamId64(steamId: string): string {
    // This function can be extended to handle different Steam ID formats
    // For now, we assume the input is already a Steam64 ID
    return steamId;
  }

  static isValidSteamId64(steamId: string): boolean {
    // Steam 64-bit ID should be a 17-digit number starting with 7656119
    const steamIdRegex = /^7656119\d{10}$/;
    return steamIdRegex.test(steamId);
  }

  static getSteamProfileUrl(steamId: string): string {
    return `https://steamcommunity.com/profiles/${steamId}`;
  }
}

// Create a default instance
export const steamAPI = new SteamAPI();

// Utility functions
export async function updatePlayerInfo(steamId: string) {
  try {
    const player = await steamAPI.getPlayerSummary(steamId);
    if (!player) {
      return null;
    }

    const statusInfo = steamAPI.getPlayerStatus(player);

    return {
      nickname: player.personaname,
      avatar_url: player.avatarfull || player.avatarmedium || player.avatar,
      profile_url: SteamAPI.getSteamProfileUrl(steamId),
      status: statusInfo.status,
      is_playing_cs2: statusInfo.isPlayingCs2,
      last_checked: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Failed to update player info for ${steamId}:`, error);
    return null;
  }
}

export async function batchUpdatePlayersInfo(steamIds: string[]) {
  try {
    const players = await steamAPI.getPlayerSummaries(steamIds);
    
    return players.map(player => {
      const statusInfo = steamAPI.getPlayerStatus(player);
      
      return {
        steam_id: player.steamid,
        nickname: player.personaname,
        avatar_url: player.avatarfull || player.avatarmedium || player.avatar,
        profile_url: SteamAPI.getSteamProfileUrl(player.steamid),
        status: statusInfo.status,
        is_playing_cs2: statusInfo.isPlayingCs2,
        last_checked: new Date().toISOString()
      };
    });
  } catch (error) {
    console.error('Failed to batch update players info:', error);
    return [];
  }
}