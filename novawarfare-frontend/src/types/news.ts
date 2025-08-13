export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'Draft' | 'Published' | 'Archived';
  imageUrl?: string;
  imageUrls?: string[];
  authorId: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  date?: string;
  views?: number;
  priority?: string; // 'High', 'Medium', 'Low'
}

export interface NewsListResponse {
  news: NewsItem[];
  totalCount: number;
}

export interface NewsRequest {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  status: 'Draft' | 'Published' | 'Archived';
} 