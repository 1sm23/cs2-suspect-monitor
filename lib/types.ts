export interface SuspectProfile {
  id: string;
  steamId: string;
  displayName: string;
  profileUrl: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
  status: 'monitoring' | 'banned' | 'cleared';
  notes?: string;
  tags: string[];
  lastChecked?: string;
  banHistory: BanRecord[];
  evidence: Evidence[];
}

export interface BanRecord {
  id: string;
  suspectId: string;
  banType: 'vac' | 'game' | 'community';
  banDate: string;
  detected: string;
  createdAt: string;
}

export interface Evidence {
  id: string;
  suspectId: string;
  type: 'demo' | 'screenshot' | 'video' | 'text' | 'external_link';
  title: string;
  description?: string;
  filePath?: string;
  externalUrl?: string;
  uploadedBy: string;
  createdAt: string;
  tags: string[];
}

export interface SteamProfile {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  lastlogoff?: number;
  personastate: number;
  realname?: string;
  primaryclanid?: string;
  timecreated?: number;
  personastateflags?: number;
  loccountrycode?: string;
  locstatecode?: string;
  loccityid?: number;
}

export interface SteamBans {
  SteamId: string;
  CommunityBanned: boolean;
  VACBanned: boolean;
  NumberOfVACBans: number;
  DaysSinceLastBan: number;
  NumberOfGameBans: number;
  EconomyBan: string;
}

export interface UploadedFile {
  originalName: string;
  fileName: string;
  path: string;
  size: number;
  mimeType: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Locale {
  [key: string]: string | Locale;
}

export interface DatabaseConfig {
  path: string;
}

export interface AppConfig {
  steamApiKey: string;
  databaseUrl: string;
  adminPassword: string;
  supportedLangs: string[];
  defaultLang: string;
  maxUploadSize: number;
}