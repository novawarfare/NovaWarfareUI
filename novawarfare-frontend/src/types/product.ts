export interface Product {
  id: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  difficulty: string | number | any;
  difficultyLevel?: number;
  duration: number;
  playerCountMin: number;
  playerCountMax: number;
  type: string;
  gameType?: string;
  missionId?: string;
  matchRate?: string;
  date?: string;
  lastUpdated?: string;
  unitSize?: string;
  terrain?: string;
  successRate?: string;
  stockStatus?: string;
  clearanceLevel?: string;
  priority?: string; // 'High', 'Medium', 'Low'
  isFeatured?: boolean;
  views?: number;
  purchases?: number;
  rating?: number;
  briefing?: string;
  warning?: string;
  equipment?: string;
  relatedMissions?: RelatedMission[];
  images: string[];
  videos: string[];
  files: string[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  totalCount: number;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  price: number;
  gameType: 'AIRSOFT' | 'PAINTBALL';
  difficulty: number;
  missionId: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  minPlayers?: number;
  maxPlayers?: number;
  duration?: number;
  images?: string[];
  videos?: string[];
  files?: string[];
  tags?: string[];
}

export interface RelatedMission {
  id: string;
  name: string;
  gameType: string;
  difficulty: number;
  price: number;
}

export interface MissionFilter {
  gameTypes?: string[];
  difficultyLevels?: string[];
  minPrice?: number;
  maxPrice?: number;
  unitSizes?: string[];
  searchTerm?: string;
} 