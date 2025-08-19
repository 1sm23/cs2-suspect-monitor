import { SteamAPIResponse, SteamPlayerSummary } from './types';

export function isValidSteamID(steamId: string): boolean {
  // Steam ID should be 17 digits
  return /^\d{17}$/.test(steamId);
}

export async function getSteamPlayerSummaries(steamIds: string[]): Promise<SteamPlayerSummary[]> {
  const apiKey = process.env.STEAM_API_KEY;
  
  if (!apiKey) {
    throw new Error('STEAM_API_KEY is not configured');
  }

  if (steamIds.length === 0) {
    return [];
  }

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamIds.join(',')}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Steam API request failed: ${response.status}`);
    }
    
    const data: SteamAPIResponse = await response.json();
    return data.response.players || [];
  } catch (error) {
    console.error('Error fetching Steam player summaries:', error);
    throw error;
  }
}

export function mapPlayerStateToStatus(personastate: number, communityvisibilitystate: number): string {
  // If profile is private
  if (communityvisibilitystate !== 3) {
    return 'private';
  }
  
  // Map persona state to our status
  switch (personastate) {
    case 0: return 'offline';
    case 1: return 'online';
    case 2: return 'online'; // busy
    case 3: return 'online'; // away
    case 4: return 'online'; // snooze
    case 5: return 'online'; // looking to trade
    case 6: return 'online'; // looking to play
    default: return 'unknown';
  }
}

export function steamIdToProfileUrl(steamId: string): string {
  return `https://steamcommunity.com/profiles/${steamId}`;
}