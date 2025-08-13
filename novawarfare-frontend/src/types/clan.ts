// Типы для системы кланов
export interface Clan {
  id: string;
  name: string;
  tag: string;
  description: string;
  clanType: ClanType;
  logoUrl?: string;
  leaderId: string;
  leaderName: string;
  seniorOfficerId?: string;
  seniorOfficerName?: string;
  memberIds: string[];
  memberNames: string[];
  points: number;
  rank: number;
  rankName: string;
  achievements: ClanAchievement[];
  state: string; // Обязательное поле - штат клана
  primaryBase: string; // Основная база клана
  secondaryBases: string[]; // Второстепенные базы (максимум 10)
  totalMissions: number;
  totalWins: number;
  winRate: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ClanDocument {
  _id: string;
  name: string;
  tag: string;
  description: string;
  clanType: ClanType;
  logoUrl?: string;
  leaderId: string;
  leaderName: string;
  seniorOfficerId?: string;
  seniorOfficerName?: string;
  memberIds: string[];
  memberNames: string[];
  points: number;
  rank: number;
  rankName: string;
  achievements: ClanAchievement[];
  state: string; // Обязательное поле - штат клана
  primaryBase: string; // Основная база клана
  secondaryBases: string[]; // Второстепенные базы (максимум 10)
  totalMissions: number;
  totalWins: number;
  winRate: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ClanAchievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface ClanRank {
  id: string;
  level: number;
  name: string;
  pointsRequired: number;
  description: string;
  iconUrl: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface PlayerAchievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  earnedAt: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  category: string;
}

export interface ClanMember {
  id: string;
  name: string;
  email: string;
  clanRole: 'Leader' | 'Officer' | 'Member';
  humanFactionRank: number;
  humanFactionRankName: string;
  humanFactionPoints: number;
  alienFactionRank: number;
  alienFactionRankName: string;
  alienFactionPoints: number;
  totalMissions: number;
  totalWins: number;
  winRate: number;
  achievements: PlayerAchievement[];
  createdAt: string;
}

export interface CreateClanRequest {
  name: string;
  description: string;
  tag: string;
  clanType: string;
  state: string; // Обязательное поле - штат клана
  primaryBase: string; // Основная база клана
  secondaryBases: string[]; // Второстепенные базы (максимум 10)
  logoFile?: File;
}

export interface ClanSearchResult {
  clans: Clan[];
  total: number;
}

// Интерфейс для ответа с пагинацией
export interface ClanListResponse {
  clans: Clan[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

// Константы для рангов игроков
export const HUMAN_FACTION_RANKS = [
  'Recruit', 'Private', 'Private First Class', 'Lance Corporal', 'Corporal',
  'Sergeant', 'Staff Sergeant', 'Warrant Officer', 'Second Lieutenant', 'Lieutenant',
  'First Lieutenant', 'Captain', 'Major', 'Lieutenant Colonel', 'Colonel',
  'Brigadier General', 'Major General', 'Lieutenant General', 'General', 'Marshal',
  'Earth Hero', 'Defender of Humanity', 'Resistance Legend', 'Supreme Commander', 'Planet Savior'
];

export const ALIEN_FACTION_RANKS = [
  'Acolyte', 'Servant', 'Adept', 'Initiate', 'Devotee',
  'Senior Devotee', 'Overseer', 'Executor', 'Guide', 'Herald',
  'Guardian', 'Commander', 'Prefect', 'Exarch', 'Archon',
  'Procurator', 'Legate', 'Consul', 'Proconsul', 'Viceroy',
  'Overlord', 'High Priest', 'Chosen One', 'Master', 'Avatar of Will'
];

export const CLAN_RANKS = [
  'Survivor Squad', 'Resistance Group', 'Combat Cell', 'Tactical Unit',
  'Operative Platoon', 'Assault Company', 'Mechanized Battalion', 'Orbital Regiment',
  'Star Brigade', 'Space Division', 'Exo-Corps', 'Plasma Guard',
  'Quantum Legion', 'Neuro-Commandos', 'Chrono-Elite', 'World Breakers',
  'Galaxy Guardians', 'Warp Lords', 'Destiny Architects', 'Last Bastion'
];

export const ACHIEVEMENT_RARITIES = {
  Common: { color: '#9E9E9E', label: 'Common' },
  Rare: { color: '#2196F3', label: 'Rare' },
  Epic: { color: '#9C27B0', label: 'Epic' },
  Legendary: { color: '#FF9800', label: 'Legendary' }
};

export const CLAN_ROLES = {
  Leader: { label: 'Clan Leader', color: '#FF5722' },
  Officer: { label: 'Officer', color: '#FF9800' },
  Member: { label: 'Member', color: '#4CAF50' }
};

// Константы типов кланов
export const CLAN_TYPES = {
  AIRSOFT: 'airsoft',
  PAINTBALL: 'paintball'
} as const;

export const CLAN_TYPE_LABELS = {
  [CLAN_TYPES.AIRSOFT]: 'Airsoft',
  [CLAN_TYPES.PAINTBALL]: 'Paintball'
} as const;

export type ClanType = typeof CLAN_TYPES[keyof typeof CLAN_TYPES]; 