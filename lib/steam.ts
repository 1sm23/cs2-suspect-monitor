import { SteamProfile, SteamBans } from './types';

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const STEAM_API_BASE = 'https://api.steampowered.com';

if (!STEAM_API_KEY) {
  console.warn('STEAM_API_KEY not set. Steam API functionality will be disabled.');
}

export function extractSteamId(input: string): string | null {
  // Handle various Steam URL formats
  const patterns = [
    /steamcommunity\.com\/profiles\/(\d{17})/,
    /steamcommunity\.com\/id\/([^\/]+)/,
    /^(\d{17})$/
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      if (pattern.source.includes('id')) {
        // For custom URLs, we'd need to resolve them via Steam API
        // For now, return null to indicate we need custom URL resolution
        return null;
      }
      return match[1];
    }
  }
  
  return null;
}

export async function getSteamProfile(steamId: string): Promise<SteamProfile | null> {
  if (!STEAM_API_KEY) {
    throw new Error('Steam API key not configured');
  }
  
  try {
    const response = await fetch(
      `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
    );
    
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }
    
    const data = await response.json();
    const players = data.response?.players;
    
    if (!players || players.length === 0) {
      return null;
    }
    
    return players[0] as SteamProfile;
  } catch (error) {
    console.error('Error fetching Steam profile:', error);
    throw error;
  }
}

export async function getSteamBans(steamId: string): Promise<SteamBans | null> {
  if (!STEAM_API_KEY) {
    throw new Error('Steam API key not configured');
  }
  
  try {
    const response = await fetch(
      `${STEAM_API_BASE}/ISteamUser/GetPlayerBans/v1/?key=${STEAM_API_KEY}&steamids=${steamId}`
    );
    
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }
    
    const data = await response.json();
    const players = data.players;
    
    if (!players || players.length === 0) {
      return null;
    }
    
    return players[0] as SteamBans;
  } catch (error) {
    console.error('Error fetching Steam bans:', error);
    throw error;
  }
}

export async function resolveVanityUrl(vanityUrl: string): Promise<string | null> {
  if (!STEAM_API_KEY) {
    throw new Error('Steam API key not configured');
  }
  
  try {
    const response = await fetch(
      `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${vanityUrl}`
    );
    
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.response?.success === 1) {
      return data.response.steamid;
    }
    
    return null;
  } catch (error) {
    console.error('Error resolving vanity URL:', error);
    throw error;
  }
}

export async function getSteamIdFromUrl(url: string): Promise<string | null> {
  const directId = extractSteamId(url);
  if (directId) {
    return directId;
  }
  
  // Try to extract vanity URL
  const vanityMatch = url.match(/steamcommunity\.com\/id\/([^\/]+)/);
  if (vanityMatch) {
    return await resolveVanityUrl(vanityMatch[1]);
  }
  
  return null;
}

export function isValidSteamId(steamId: string): boolean {
  return /^\d{17}$/.test(steamId);
}