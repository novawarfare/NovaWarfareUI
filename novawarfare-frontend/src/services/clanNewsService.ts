import apiClient from './apiClient';
import { 
  ClanNews, 
  ClanNewsListResponse, 
  CreateClanNewsRequest, 
  UpdateClanNewsRequest, 
  ClanNewsFilter 
} from '../types/clanNews';

class ClanNewsService {
  private baseUrl = '/api/clans';
  
  // Простое кеширование
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 2 * 60 * 1000; // 2 минуты для новостей

  constructor() {
    this.clearCache();
  }

  private getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // Получить новости клана
  async getClanNews(clanId: string, filter?: ClanNewsFilter): Promise<ClanNewsListResponse> {
    const cacheKey = `clan-news-${clanId}-${JSON.stringify(filter || {})}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('ClanNewsService: Возвращаем кешированные новости');
      return cached;
    }

    console.log('ClanNewsService: Получение новостей клана', { clanId, filter });
    try {
      const params = new URLSearchParams();
      if (filter?.type && filter.type !== 'All') params.append('type', filter.type);
      if (filter?.isPriority !== undefined) params.append('isPriority', filter.isPriority.toString());
      if (filter?.page) params.append('page', filter.page.toString());
      if (filter?.pageSize) params.append('pageSize', filter.pageSize.toString());

      const response = await apiClient.get<ClanNewsListResponse>(
        `${this.baseUrl}/${clanId}/news?${params.toString()}`
      );
      
      console.log('ClanNewsService: Новости клана получены', response);
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('ClanNewsService: Ошибка при получении новостей клана', error);
      throw error;
    }
  }

  // Получить новость по ID
  async getClanNewsById(clanId: string, newsId: string): Promise<ClanNews> {
    const cacheKey = `clan-news-${clanId}-${newsId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('ClanNewsService: Возвращаем кешированную новость');
      return cached;
    }

    console.log('ClanNewsService: Получение новости по ID', { clanId, newsId });
    try {
      const response = await apiClient.get<ClanNews>(`${this.baseUrl}/${clanId}/news/${newsId}`);
      console.log('ClanNewsService: Новость получена', response);
      
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('ClanNewsService: Ошибка при получении новости', error);
      throw error;
    }
  }

  // Создать новость
  async createClanNews(clanId: string, newsData: CreateClanNewsRequest): Promise<ClanNews> {
    console.log('ClanNewsService: Создание новости', { clanId, newsData });
    try {
      const formData = new FormData();
      formData.append('title', newsData.title);
      formData.append('content', newsData.content);
      formData.append('type', newsData.type);
      formData.append('isPriority', newsData.isPriority.toString());
      
      if (newsData.imageFile) {
        formData.append('imageFile', newsData.imageFile);
      }
      
      if (newsData.videoUrl) {
        formData.append('videoUrl', newsData.videoUrl);
      }

      const response = await apiClient.post<ClanNews>(
        `${this.baseUrl}/${clanId}/news`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('ClanNewsService: Новость создана', response);
      this.clearCache(); // Очищаем кеш после создания
      return response;
    } catch (error) {
      console.error('ClanNewsService: Ошибка при создании новости', error);
      throw error;
    }
  }

  // Обновить новость
  async updateClanNews(clanId: string, newsId: string, newsData: UpdateClanNewsRequest): Promise<ClanNews> {
    console.log('ClanNewsService: Обновление новости', { clanId, newsId, newsData });
    try {
      const formData = new FormData();
      
      if (newsData.title) formData.append('title', newsData.title);
      if (newsData.content) formData.append('content', newsData.content);
      if (newsData.type) formData.append('type', newsData.type);
      if (newsData.isPriority !== undefined) formData.append('isPriority', newsData.isPriority.toString());
      
      if (newsData.imageFile) {
        formData.append('imageFile', newsData.imageFile);
      }
      
      if (newsData.videoUrl) {
        formData.append('videoUrl', newsData.videoUrl);
      }

      const response = await apiClient.put<ClanNews>(
        `${this.baseUrl}/${clanId}/news/${newsId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('ClanNewsService: Новость обновлена', response);
      this.clearCache(); // Очищаем кеш после обновления
      return response;
    } catch (error) {
      console.error('ClanNewsService: Ошибка при обновлении новости', error);
      throw error;
    }
  }

  // Удалить новость
  async deleteClanNews(clanId: string, newsId: string): Promise<void> {
    console.log('ClanNewsService: Удаление новости', { clanId, newsId });
    try {
      await apiClient.delete(`${this.baseUrl}/${clanId}/news/${newsId}`);
      console.log('ClanNewsService: Новость удалена');
      this.clearCache(); // Очищаем кеш после удаления
    } catch (error) {
      console.error('ClanNewsService: Ошибка при удалении новости', error);
      throw error;
    }
  }

  // Получить последние новости для Overview (2 новости: 1 публичная, 1 внутренняя)
  async getLatestNewsForOverview(clanId: string): Promise<{ publicNews: ClanNews | null; internalNews: ClanNews | null }> {
    console.log('ClanNewsService: Получение последних новостей для Overview', clanId);
    try {
      const response = await apiClient.get<{ publicNews: ClanNews | null; internalNews: ClanNews | null }>(
        `${this.baseUrl}/${clanId}/news/latest-overview`
      );
      
      console.log('ClanNewsService: Последние новости для Overview получены', response);
      return response;
    } catch (error) {
      console.error('ClanNewsService: Ошибка при получении последних новостей для Overview', error);
      throw error;
    }
  }

  // Проверить права на управление новостями
  async canManageNews(clanId: string): Promise<boolean> {
    console.log('ClanNewsService: Проверка прав на управление новостями', clanId);
    try {
      const response = await apiClient.get<{ canManage: boolean }>(`${this.baseUrl}/${clanId}/can-manage-news`);
      console.log('ClanNewsService: Результат проверки прав на управление новостями', response);
      return response.canManage;
    } catch (error) {
      console.error('ClanNewsService: Ошибка при проверке прав на управление новостями', error);
      throw error;
    }
  }

  // Получить количество приоритетных новостей
  async getPriorityNewsCount(clanId: string): Promise<number> {
    console.log('ClanNewsService: Получение количества приоритетных новостей', clanId);
    try {
      const response = await apiClient.get<{ count: number }>(`${this.baseUrl}/${clanId}/news/priority-count`);
      console.log('ClanNewsService: Количество приоритетных новостей получено', response);
      return response.count;
    } catch (error) {
      console.error('ClanNewsService: Ошибка при получении количества приоритетных новостей', error);
      throw error;
    }
  }

  // Валидация YouTube URL
  validateYouTubeUrl(url: string): boolean {
    if (!url.trim()) return true; // Пустая строка разрешена
    
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    return youtubeRegex.test(url);
  }

  // Извлечение ID видео из YouTube URL
  extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  // Форматирование даты
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Обрезка текста
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}

export default new ClanNewsService(); 