export interface Suspect {
  id: number;
  steam_id: string;
  nickname: string | null;
  personaname: string | null;
  category: 'confirmed' | 'high_risk' | 'suspected';
  profile_url: string | null;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'private' | 'banned' | 'unknown';
  vac_banned: boolean;
  game_ban_count: number;
  ban_details: string | null; // 存储从个人资料页面爬取的封禁详情
  current_gameid: number | null;
  game_server_ip: string | null;
  last_logoff: number | null;
  last_checked: string | null;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: number;
  suspect_id: number;
  type: 'text' | 'link' | 'video' | 'image' | 'file';
  title: string;
  content: string;
  file_path: string | null;
  created_at: string;
}

export interface SuspectStatusHistory {
  id: number;
  suspect_id: number;
  old_status: string | null;
  new_status: string;
  nickname: string | null;
  created_at: string;
}

export interface SteamPlayerSummary {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number;
  realname?: string;
  primaryclanid?: string;
  timecreated?: number;
  personastateflags?: number;
  gameid?: string;
  gameserverip?: string;
  gameextrainfo?: string;
  lastlogoff?: number;
}

export interface SteamAPIResponse {
  response: {
    players: SteamPlayerSummary[];
  };
}

export interface SteamPlayerBans {
  SteamId: string;
  CommunityBanned: boolean;
  VACBanned: boolean;
  NumberOfVACBans: number;
  DaysSinceLastBan: number;
  NumberOfGameBans: number;
  EconomyBan: string; // "none", "probation", "banned"
}

export interface SteamPlayerBansResponse {
  players: SteamPlayerBans[];
}

export interface Language {
  code: string;
  name: string;
}

export interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
}