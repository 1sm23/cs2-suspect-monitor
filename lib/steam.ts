import {
  SteamAPIResponse,
  SteamPlayerSummary,
  SteamPlayerBans,
  SteamPlayerBansResponse,
} from './types';

export function isValidSteamID(steamId: string): boolean {
  // Steam ID should be 17 digits
  return /^\d{17}$/.test(steamId);
}

export function extractSteamIdFromUrl(input: string): string | null {
  // 清理输入
  const cleanInput = input.trim();

  // 如果已经是17位数字的Steam ID，直接返回
  if (isValidSteamID(cleanInput)) {
    return cleanInput;
  }

  // 尝试从各种Steam URL格式中提取Steam ID
  const patterns = [
    // https://steamcommunity.com/profiles/76561198358372020/
    /steamcommunity\.com\/profiles\/(\d{17})/,
    // https://steamcommunity.com/id/customurl/ - 这种需要另外处理
    /steamcommunity\.com\/id\/([^\/]+)/,
  ];

  for (const pattern of patterns) {
    const match = cleanInput.match(pattern);
    if (match) {
      const extracted = match[1];
      // 如果提取到的是17位数字，说明是Steam ID
      if (isValidSteamID(extracted)) {
        return extracted;
      }
      // 如果是自定义URL，返回null（需要进一步处理）
      return null;
    }
  }

  return null;
}

export async function getSteamPlayerSummaries(
  steamIds: string[],
  apiKey?: string
): Promise<SteamPlayerSummary[]> {
  let steamApiKey = apiKey;
  
  // 如果在客户端环境且未提供API密钥，尝试从localStorage获取
  if (!steamApiKey && typeof window !== 'undefined') {
    steamApiKey = localStorage.getItem('cs2_steam_api_key') || undefined;
  }
  
  // 如果在服务器环境，使用环境变量
  if (!steamApiKey && typeof window === 'undefined') {
    steamApiKey = process.env.STEAM_API_KEY;
  }

  if (!steamApiKey) {
    console.warn('Steam API key is not configured, skipping Steam API call');
    return [];
  }

  if (steamIds.length === 0) {
    return [];
  }

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamIds.join(',')}`;

  // 尝试多次请求，每次超时时间逐渐增加
  const timeouts = [3000, 5000, 8000]; // 3秒, 5秒, 8秒

  for (let attempt = 0; attempt < timeouts.length; attempt++) {
    try {
      console.log(
        `Steam API attempt ${attempt + 1}/${timeouts.length} (timeout: ${timeouts[attempt]}ms)`
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeouts[attempt]);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          // 'User-Agent': 'CS2-Suspect-Monitor/1.0',
        },
        // 添加这些选项可能有助于连接
        keepalive: false,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Steam API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: SteamAPIResponse = await response.json();
      console.log(`✅ Steam API request successful on attempt ${attempt + 1}`);
      return data.response.players || [];
    } catch (error) {
      console.warn(
        `Steam API attempt ${attempt + 1} failed:`,
        error instanceof Error ? error.message : 'Unknown error'
      );

      // 如果是最后一次尝试，抛出错误
      if (attempt === timeouts.length - 1) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.error('All Steam API requests timed out');
            throw new Error(
              'Steam API request timed out after multiple attempts'
            );
          }
          console.error('Final Steam API error:', error.message);
        }
        throw error;
      }

      // 在重试之间等待一小段时间
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return [];
}

export async function getSteamPlayerBans(
  steamIds: string[],
  apiKey?: string
): Promise<SteamPlayerBans[]> {
  let steamApiKey = apiKey;
  
  // 如果在客户端环境且未提供API密钥，尝试从localStorage获取
  if (!steamApiKey && typeof window !== 'undefined') {
    steamApiKey = localStorage.getItem('cs2_steam_api_key') || undefined;
  }
  
  // 如果在服务器环境，使用环境变量
  if (!steamApiKey && typeof window === 'undefined') {
    steamApiKey = process.env.STEAM_API_KEY;
  }

  if (!steamApiKey) {
    console.warn(
      'Steam API key is not configured, skipping Steam Player Bans API call'
    );
    return [];
  }

  if (steamIds.length === 0) {
    return [];
  }

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${steamApiKey}&steamids=${steamIds.join(',')}`;

  // 尝试多次请求，每次超时时间逐渐增加
  const timeouts = [3000, 5000, 8000]; // 3秒, 5秒, 8秒

  for (let attempt = 0; attempt < timeouts.length; attempt++) {
    try {
      console.log(
        `Steam Player Bans API attempt ${attempt + 1}/${timeouts.length} (timeout: ${timeouts[attempt]}ms)`
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeouts[attempt]);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          // 'User-Agent': 'CS2-Suspect-Monitor/1.0',
        },
        keepalive: false,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Steam Player Bans API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: SteamPlayerBansResponse = await response.json();
      console.log(
        `✅ Steam Player Bans API request successful on attempt ${attempt + 1}`
      );
      return data.players || [];
    } catch (error) {
      console.warn(
        `Steam Player Bans API attempt ${attempt + 1} failed:`,
        error instanceof Error ? error.message : 'Unknown error'
      );

      // 如果是最后一次尝试，抛出错误
      if (attempt === timeouts.length - 1) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.error('All Steam Player Bans API requests timed out');
            throw new Error(
              'Steam Player Bans API request timed out after multiple attempts'
            );
          }
          console.error('Final Steam Player Bans API error:', error.message);
        }
        throw error;
      }

      // 在重试之间等待一小段时间
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return [];
}

export function mapPlayerStateToStatus(
  personastate: number,
  communityvisibilitystate: number
): string {
  // If profile is private
  if (communityvisibilitystate !== 3) {
    return 'private';
  }

  // Map persona state to our status
  switch (personastate) {
    case 0:
      return 'offline';
    case 1:
      return 'online';
    case 2:
      return 'busy'; // busy
    case 3:
      return 'away'; // away
    case 4:
      return 'snooze'; // snooze
    case 5:
      return 'looking to trade'; // looking to trade
    case 6:
      return 'looking to play'; // looking to play
    default:
      return 'unknown';
  }
}

export function steamIdToProfileUrl(steamId: string): string {
  return `https://steamcommunity.com/profiles/${steamId}`;
}

export interface BanStatus {
  hasBan: boolean;
  banDetails: string[];
}

export async function getSteamBanStatusFromProfile(
  steamId: string
): Promise<BanStatus> {
  const profileUrl = steamIdToProfileUrl(steamId);

  try {
    console.log(`🔍 Fetching ban status from profile: ${profileUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    const response = await fetch(profileUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(
        `❌ Failed to fetch profile page: ${response.status} ${response.statusText}`
      );
      return { hasBan: false, banDetails: [] };
    }

    const html = await response.text();

    // 检查是否存在封禁状态元素
    const hasBanStatus = html.includes('class="profile_ban_status"');

    if (!hasBanStatus) {
      console.log(`✅ No ban status found for ${steamId}`);
      return { hasBan: false, banDetails: [] };
    }

    // 提取封禁详情
    const banDetails: string[] = [];

    // 使用正则表达式提取 profile_ban 类中的内容
    const banMatches = html.match(
      /<div[^>]*class="profile_ban"[^>]*>[\s\S]*?<\/div>/g
    );

    if (banMatches) {
      for (const banMatch of banMatches) {
        // 移除HTML标签，只保留文本内容
        const cleanText = banMatch.replace(/<[^>]*>/g, '').trim();
        if (cleanText) {
          banDetails.push(cleanText);
        }
      }
    }

    console.log(`🚫 Ban status found for ${steamId}:`, banDetails);
    return { hasBan: true, banDetails };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`⏰ Profile fetch timeout for ${steamId}`);
      } else {
        console.warn(
          `❌ Error fetching profile for ${steamId}:`,
          error.message
        );
      }
    } else {
      console.warn(`❌ Unknown error fetching profile for ${steamId}`);
    }

    return { hasBan: false, banDetails: [] };
  }
}
