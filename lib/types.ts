export interface Suspect {
  id: number;
  steam_id: string;
  nickname: string | null;
  profile_url: string | null;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'private' | 'banned' | 'unknown';
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
}

export interface SteamAPIResponse {
  response: {
    players: SteamPlayerSummary[];
  };
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