export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Customer';
  status: 'Active' | 'Pending' | 'Deleted' | 'Locked';
  lastLogin?: string;
  isActive: boolean;
  emailVerified: boolean;
  
  // Ранги и очки для airsoft
  airsoftHumanRank: number;
  airsoftHumanRankName: string;
  airsoftHumanPoints: number;
  airsoftAlienRank: number;
  airsoftAlienRankName: string;
  airsoftAlienPoints: number;
  
  // Ранги и очки для paintball
  paintballHumanRank: number;
  paintballHumanRankName: string;
  paintballHumanPoints: number;
  paintballAlienRank: number;
  paintballAlienRankName: string;
  paintballAlienPoints: number;
  
  // Статистика миссий
  airsoftMissions: number;
  airsoftWins: number;
  airsoftWinRate: number;
  paintballMissions: number;
  paintballWins: number;
  paintballWinRate: number;
  
  // Базы и локация
  state: string;
  primaryBase: string;
  secondaryBases: string[];
  
  // Достижения
  achievements: string[];
  
  // Настройки отображения
  gameDisplayPreference: string;
  
  // Временные метки
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  airsoftHumanRank: number;
  airsoftHumanRankName: string;
  airsoftHumanPoints: number;
  airsoftAlienRank: number;
  airsoftAlienRankName: string;
  airsoftAlienPoints: number;
  paintballHumanRank: number;
  paintballHumanRankName: string;
  paintballHumanPoints: number;
  paintballAlienRank: number;
  paintballAlienRankName: string;
  paintballAlienPoints: number;
  airsoftMissions: number;
  paintballMissions: number;
  airsoftWins: number;
  paintballWins: number;
  airsoftWinRate: number;
  paintballWinRate: number;
  state: string;
  primaryBase: string;
  secondaryBases: string[];
  achievements: string[];
  // Clan information
  airsoftClanId?: string;
  airsoftClanName?: string;
  airsoftClanRole?: string;
  paintballClanId?: string;
  paintballClanName?: string;
  paintballClanRole?: string;
  gameDisplayPreference: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerGameStats {
  gameType: string;
  humanRank: number;
  humanRankName: string;
  humanPoints: number;
  alienRank: number;
  alienRankName: string;
  alienPoints: number;
  totalMissions: number;
  totalWins: number;
  winRate: number;
  totalPoints: number;
  totalRank: number;
}

export interface RankProgress {
  currentRank: number;
  currentRankName: string;
  currentPoints: number;
  nextRankPoints: number;
  pointsToNext: number;
  progressPercent: number;
  isMaxRank: boolean;
}

export interface PlayersResponse {
  players: Player[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}

export interface UserListResponse {
  users: User[];
  totalCount: number;
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
}

export interface UserUpdateRequest {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  password?: string;
} 