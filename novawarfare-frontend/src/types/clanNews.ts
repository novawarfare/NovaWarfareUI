// Типы для системы новостей кланов
export interface ClanNews {
  id: string;
  clanId: string;
  title: string;
  content: string;
  type: 'Public' | 'Internal';
  isPriority: boolean;
  imageUrl?: string;
  videoUrl?: string; // YouTube URL
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ClanNewsDocument {
  _id: string;
  clanId: string;
  title: string;
  content: string;
  type: 'Public' | 'Internal';
  isPriority: boolean;
  imageUrl?: string;
  videoUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CreateClanNewsRequest {
  title: string;
  content: string;
  type: 'Public' | 'Internal';
  isPriority: boolean;
  imageFile?: File;
  videoUrl?: string;
}

export interface UpdateClanNewsRequest {
  title?: string;
  content?: string;
  type?: 'Public' | 'Internal';
  isPriority?: boolean;
  imageFile?: File;
  videoUrl?: string;
}

export interface ClanNewsListResponse {
  news: ClanNews[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface ClanNewsFilter {
  type?: 'Public' | 'Internal' | 'All';
  isPriority?: boolean;
  page?: number;
  pageSize?: number;
}

// Константы для новостей
export const NEWS_TYPES = {
  PUBLIC: 'Public' as const,
  INTERNAL: 'Internal' as const
};

export const MAX_PRIORITY_NEWS = 3;
export const MAX_CONTENT_LENGTH = 5000;
export const MAX_TITLE_LENGTH = 200; 