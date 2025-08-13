import apiClient from './apiClient';
import { Clan, ClanRank, ClanMember, CreateClanRequest, ClanSearchResult, ClanListResponse } from '../types/clan';
import { API_URL } from '../constants/api';

class ClanService {
  private baseUrl = '/api/clans';
  
  // Простое кеширование
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 минут

  constructor() {
    // Очищаем кеш при инициализации
    this.clearCache();
  }

  // Очистка кеша
  private clearCache() {
    this.cache.clear();
  }

  // Проверка кеша
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Сохранение в кеш
  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Получить все кланы с пагинацией
  async getAllClans(page: number = 1, pageSize: number = 20, type?: string): Promise<ClanListResponse> {
    const cacheKey = `all-clans-${page}-${pageSize}-${type || 'all'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      let url = `${this.baseUrl}?page=${page}&pageSize=${pageSize}`;
      if (type) {
        url += `&type=${type}`;
      }
      
      const response = await apiClient.get<ClanListResponse>(url);
      
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('ClanService: Ошибка при получении всех кланов', error);
      throw error;
    }
  }

  // Получить топ кланы
  async getTopClans(limit: number = 10, type?: string): Promise<Clan[]> {
    const cacheKey = `top-clans-${limit}-${type || 'all'}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      let url = `${this.baseUrl}/top?limit=${limit}`;
      if (type) {
        url += `&type=${type}`;
      }
      
      const response = await apiClient.get<Clan[]>(url);
      
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('ClanService: Ошибка при получении топ кланов', error);
      throw error;
    }
  }

  // Получить топ кланы по типу (удобный метод)
  async getTopClansByType(type: string, limit: number = 10): Promise<Clan[]> {
    return this.getTopClans(limit, type);
  }

  // Получить кланы по типу (удобный метод)
  async getClansByType(type: string, page: number = 1, pageSize: number = 20): Promise<ClanListResponse> {
    return this.getAllClans(page, pageSize, type);
  }

  // Получить клан по ID
  async getClanById(clanId: string): Promise<Clan> {
    const cacheKey = `clan-${clanId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const response = await apiClient.get<Clan>(`${this.baseUrl}/${clanId}`);
      
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('ClanService: Ошибка при получении клана', error);
      throw error;
    }
  }

  // Получить участников клана
  async getClanMembers(clanId: string): Promise<ClanMember[]> {
    const cacheKey = `clan-members-${clanId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const response = await apiClient.get<ClanMember[]>(`${this.baseUrl}/${clanId}/members`);
      console.log('ClanService: Участники клана получены', response);
      
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('ClanService: Ошибка при получении участников клана', error);
      throw error;
    }
  }

  // Получить ранги кланов
  async getClanRanks(): Promise<ClanRank[]> {
    const cacheKey = 'clan-ranks';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log('ClanService: Возвращаем кешированные ранги кланов');
      return cached;
    }

    console.log('ClanService: Получение рангов кланов');
    try {
      const response = await apiClient.get<ClanRank[]>(`${this.baseUrl}/ranks`);
      console.log('ClanService: Ранги кланов получены', response);
      
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('ClanService: Ошибка при получении рангов кланов', error);
      throw error;
    }
  }

  // Поиск кланов
  async searchClans(searchTerm: string, limit: number = 20): Promise<Clan[]> {
    console.log('ClanService: Поиск кланов', { searchTerm, limit });
    try {
      const response = await apiClient.get<Clan[]>(`${this.baseUrl}/search?term=${encodeURIComponent(searchTerm)}&limit=${limit}`);
      console.log('ClanService: Результаты поиска кланов', response);
      return response;
    } catch (error) {
      console.error('ClanService: Ошибка при поиске кланов', error);
      throw error;
    }
  }

  // Создать клан
  async createClan(formData: FormData): Promise<Clan> {
    console.log('🚀 ClanService: Начинаем создание клана');
    console.log('🔧 Base URL:', this.baseUrl);
    console.log('🔧 API_URL:', API_URL);
    
    // Логируем все данные формы
    console.log('📋 FormData contents:');
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`  ${key}:`, value);
    });
    try {
      const fullUrl = `${API_URL}${this.baseUrl}`;
      const token = localStorage.getItem('token');
      
      console.log('🌐 Full URL:', fullUrl);
      console.log('🔑 Token:', token ? 'exists' : 'missing');
      
      // Конвертируем FormData в обычный объект для JSON
      const jsonData: any = {};
      Array.from(formData.entries()).forEach(([key, value]) => {
        if (key !== 'logoFile') { // Пропускаем файл для тестирования
          jsonData[key] = value;
        }
      });
      
      console.log('📋 JSON data to send:', jsonData);
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        console.error('❌ Server error response:', response.status, response.statusText);
        
        // Специальная обработка для ошибки авторизации
        if (response.status === 401) {
          throw new Error('You are not authorized. Please log in and try again.');
        }
        
        // Пробуем парсить JSON, но если не получается - используем текст
        let errorMessage = 'Error creating clan';
        try {
          const errorData = await response.json();
          console.error('❌ Error data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error('❌ Could not parse error JSON, trying text...');
          try {
            const errorText = await response.text();
            console.error('❌ Error text:', errorText);
            errorMessage = `Server error ${response.status}: ${response.statusText}`;
          } catch (textError) {
            console.error('❌ Could not read error response');
          }
        }
        
        throw new Error(errorMessage);
      }

      const clan = await response.json();
      console.log('ClanService: Клан создан', clan);
      
      // Очищаем кеш после создания
      this.clearCache();
      
      return clan;
    } catch (error) {
      console.error('❌ ClanService: Ошибка при создании клана', error);
      
      if (error instanceof Error) {
        console.error('❌ Error type:', error.constructor.name);
        console.error('❌ Error message:', error.message);
      } else {
        console.error('❌ Unknown error type:', typeof error);
      }
      
      throw error;
    }
  }

  // Присоединиться к клану
  async joinClan(clanId: string): Promise<void> {
    console.log('ClanService: Присоединение к клану', clanId);
    try {
      await apiClient.post(`${this.baseUrl}/${clanId}/join`);
      console.log('ClanService: Успешно присоединились к клану');
      
      // Очищаем кеш после присоединения
      this.clearCache();
    } catch (error) {
      console.error('ClanService: Ошибка при присоединении к клану', error);
      throw error;
    }
  }

  // Покинуть клан
  async leaveClan(clanId: string): Promise<void> {
    console.log('ClanService: Покидание клана', clanId);
    try {
      await apiClient.post(`${this.baseUrl}/${clanId}/leave`);
      console.log('ClanService: Успешно покинули клан');
      
      // Очищаем кеш после покидания
      this.clearCache();
    } catch (error) {
      console.error('ClanService: Ошибка при покидании клана', error);
      throw error;
    }
  }

  // Поиск пользователей для приглашения
  async searchUsersForInvite(clanId: string, query: string, limit: number = 10): Promise<any[]> {
    console.log('ClanService: Поиск пользователей для приглашения', { clanId, query, limit });
    try {
      const response = await apiClient.get<any[]>(`${this.baseUrl}/${clanId}/search-users?query=${encodeURIComponent(query)}&limit=${limit}`);
      console.log('ClanService: Найденные пользователи', response);
      return response;
    } catch (error) {
      console.error('ClanService: Ошибка при поиске пользователей', error);
      throw error;
    }
  }

  // Пригласить пользователя в клан
  async inviteUserToClan(clanId: string, userId: string): Promise<void> {
    console.log('ClanService: Приглашение пользователя в клан', { clanId, userId });
    try {
      await apiClient.post(`${this.baseUrl}/${clanId}/invite`, { userId });
      console.log('ClanService: Пользователь приглашен в клан');
      
      // Очищаем кеш после приглашения
      this.clearCache();
    } catch (error) {
      console.error('ClanService: Ошибка при приглашении пользователя', error);
      throw error;
    }
  }

  // Удалить участника из клана
  async removeMemberFromClan(clanId: string, userId: string): Promise<void> {
    console.log('ClanService: Удаление участника из клана', { clanId, userId });
    try {
      await apiClient.post(`${this.baseUrl}/${clanId}/remove-member`, { userId });
      console.log('ClanService: Участник удален из клана');
      
      // Очищаем кеш после удаления
      this.clearCache();
    } catch (error) {
      console.error('ClanService: Ошибка при удалении участника', error);
      throw error;
    }
  }

  // Назначить старшего офицера
  async assignSeniorOfficer(clanId: string, userId: string): Promise<void> {
    console.log('ClanService: Назначение старшего офицера', { clanId, userId });
    try {
      await apiClient.post(`${this.baseUrl}/${clanId}/assign-senior-officer`, { userId });
      console.log('ClanService: Старший офицер назначен');
      
      // Очищаем кеш после назначения
      this.clearCache();
    } catch (error) {
      console.error('ClanService: Ошибка при назначении старшего офицера', error);
      throw error;
    }
  }

  // Снять старшего офицера
  async removeSeniorOfficer(clanId: string): Promise<void> {
    console.log('ClanService: Снятие старшего офицера', clanId);
    try {
      await apiClient.post(`${this.baseUrl}/${clanId}/remove-senior-officer`);
      console.log('ClanService: Старший офицер снят');
      
      // Очищаем кеш после снятия
      this.clearCache();
    } catch (error) {
      console.error('ClanService: Ошибка при снятии старшего офицера', error);
      throw error;
    }
  }

  // Проверить права управления участниками
  async canManageMembers(clanId: string): Promise<boolean> {
    console.log('ClanService: Проверка прав управления участниками', clanId);
    try {
      const response = await apiClient.get<{ canManage: boolean }>(`${this.baseUrl}/${clanId}/can-manage-members`);
      console.log('ClanService: Результат проверки прав', response);
      return response.canManage;
    } catch (error) {
      console.error('ClanService: Ошибка при проверке прав управления', error);
      throw error;
    }
  }

  // Обновить информацию о клане
  async updateClan(clanId: string, formData: FormData): Promise<Clan> {
    console.log('ClanService: Обновление информации о клане', { clanId });
    try {
      const response = await fetch(`${API_URL}${this.baseUrl}/${clanId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // НЕ устанавливаем Content-Type, браузер сам установит multipart/form-data
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении клана');
      }

      const clan = await response.json();
      console.log('ClanService: Информация о клане обновлена', clan);
      
      // Очищаем кеш после обновления
      this.clearCache();
      
      return clan;
    } catch (error) {
      console.error('ClanService: Ошибка при обновлении информации о клане', error);
      throw error;
    }
  }

  // Инициализировать ранги кланов (только для админов)
  async initializeClanRanks(): Promise<void> {
    console.log('ClanService: Инициализация рангов кланов');
    try {
      const result = await apiClient.post<{ message: string }>(`${this.baseUrl}/initialize-ranks`);
      console.log('ClanService: Ранги кланов инициализированы', result);
    } catch (error) {
      console.error('ClanService: Ошибка при инициализации рангов кланов', error);
      throw error;
    }
  }

  // Получить цвет ранга по уровню
  getRankColor(rank: number): string {
    const colors = [
      '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F4A460', // 0-4
      '#D2691E', '#FF8C00', '#FF7F50', '#FF6347', '#FF4500', // 5-9
      '#DC143C', '#B22222', '#8B0000', '#4B0082', '#483D8B', // 10-14
      '#6A5ACD', '#9370DB', '#8A2BE2', '#9932CC', '#FFD700'  // 15-19
    ];
    return colors[rank] || '#9E9E9E';
  }

  // Получить процент прогресса до следующего ранга
  getRankProgress(points: number, currentRank: number, ranks: ClanRank[]): number {
    const currentRankData = ranks.find(r => r.level === currentRank);
    const nextRankData = ranks.find(r => r.level === currentRank + 1);

    if (!currentRankData || !nextRankData) {
      return 100; // Максимальный ранг
    }

    const currentPoints = points - currentRankData.pointsRequired;
    const pointsNeeded = nextRankData.pointsRequired - currentRankData.pointsRequired;

    return Math.min(100, Math.max(0, (currentPoints / pointsNeeded) * 100));
  }

  // Получить очки до следующего ранга
  getPointsToNextRank(points: number, currentRank: number, ranks: ClanRank[]): number {
    const nextRankData = ranks.find(r => r.level === currentRank + 1);
    
    if (!nextRankData) {
      return 0; // Максимальный ранг
    }

    return Math.max(0, nextRankData.pointsRequired - points);
  }

  // Форматировать число с разделителями
  formatNumber(num: number): string {
    return num.toLocaleString('ru-RU');
  }

  // Получить статус клана (активность)
  getClanStatus(clan: Clan): { label: string; color: string } {
    const now = new Date();
    const lastUpdate = clan.updatedAt ? new Date(clan.updatedAt) : new Date(clan.createdAt || now);
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate <= 1) {
      return { label: 'Very Active', color: '#4CAF50' };
    } else if (daysSinceUpdate <= 7) {
      return { label: 'Active', color: '#8BC34A' };
    } else if (daysSinceUpdate <= 30) {
      return { label: 'Moderately Active', color: '#FF9800' };
    } else {
      return { label: 'Inactive', color: '#F44336' };
    }
  }

  // Получить рейтинг эффективности клана
  getClanEfficiencyRating(clan: Clan): { rating: number; label: string; color: string } {
    const winRate = clan.winRate || 0;
    const memberCount = clan.memberIds?.length || 0;
    const avgPointsPerMember = memberCount > 0 ? (clan.points || 0) / memberCount : 0;

    // Составной рейтинг на основе win rate, активности участников и очков
    let rating = 0;
    rating += winRate * 0.4; // 40% от win rate
    rating += Math.min(100, avgPointsPerMember / 1000 * 100) * 0.3; // 30% от очков на участника
    rating += Math.min(100, memberCount * 5) * 0.3; // 30% от количества участников

    let label = '';
    let color = '';

    if (rating >= 80) {
      label = 'Elite';
      color = '#FFD700';
    } else if (rating >= 60) {
      label = 'Excellent';
      color = '#4CAF50';
    } else if (rating >= 40) {
      label = 'Good';
      color = '#FF9800';
    } else if (rating >= 20) {
      label = 'Average';
      color = '#FFC107';
    } else {
      label = 'Rookie';
      color = '#9E9E9E';
    }

    return { rating: Math.round(rating), label, color };
  }
}

export default new ClanService(); 