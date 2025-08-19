export interface Suspect {
  id: number;
  steam_id: string;
  nickname?: string;
  added_at: string;
  last_checked?: string;
  status?: 'online' | 'offline' | 'in-game' | 'away' | 'busy';
  is_playing_cs2: boolean;
  avatar_url?: string;
  profile_url?: string;
}

export interface Evidence {
  id: number;
  suspect_id: number;
  type: 'text' | 'link' | 'video' | 'image';
  content: string;
  description?: string;
  created_at: string;
  importance: 1 | 2 | 3 | 4 | 5;
}

export interface SteamPlayer {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  avatarhash: string;
  lastlogoff: number;
  personastate: number;
  personastateflags?: number;
  realname?: string;
  primaryclanid?: string;
  timecreated?: number;
  gameid?: string;
  gameserverip?: string;
  gameextrainfo?: string;
  cityid?: number;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;
}

export interface SteamPlayerResponse {
  response: {
    players: SteamPlayer[];
  };
}

export type PersonaState = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const PERSONA_STATES: Record<PersonaState, string> = {
  0: 'offline',
  1: 'online',
  2: 'busy',
  3: 'away',
  4: 'snooze',
  5: 'looking to trade',
  6: 'looking to play'
};

export const CS2_APP_ID = '730';