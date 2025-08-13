import apiClient from './apiClient';
import { Player, PlayerGameStats, RankProgress, PlayersResponse } from '../types/user';

// Mock данные для тестирования
const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Alpha Leader',
    email: 'alpha@example.com',
    airsoftHumanRank: 15,
    airsoftHumanRankName: 'Captain',
    airsoftHumanPoints: 2500,
    airsoftAlienRank: 12,
    airsoftAlienRankName: 'Dark Warrior',
    airsoftAlienPoints: 1800,
    paintballHumanRank: 8,
    paintballHumanRankName: 'Lieutenant',
    paintballHumanPoints: 1200,
    paintballAlienRank: 6,
    paintballAlienRankName: 'Dark Child',
    paintballAlienPoints: 900,
    airsoftMissions: 45,
    paintballMissions: 32,
    airsoftWins: 38,
    paintballWins: 26,
    airsoftWinRate: 84.4,
    paintballWinRate: 81.3,
    state: 'California',
    primaryBase: 'Los Angeles Combat Zone',
    secondaryBases: ['San Francisco Outpost', 'Sacramento Base'],
    achievements: ['First Blood', 'Mission Master', 'Elite Sniper', 'Team Leader'],
    gameDisplayPreference: 'all',
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Ghost Recon',
    email: 'ghost@example.com',
    airsoftHumanRank: 20,
    airsoftHumanRankName: 'Major',
    airsoftHumanPoints: 3200,
    airsoftAlienRank: 18,
    airsoftAlienRankName: 'Dark Lord',
    airsoftAlienPoints: 2800,
    paintballHumanRank: 12,
    paintballHumanRankName: 'Captain',
    paintballHumanPoints: 1800,
    paintballAlienRank: 10,
    paintballAlienRankName: 'Dark Warrior',
    paintballAlienPoints: 1600,
    airsoftMissions: 62,
    paintballMissions: 45,
    airsoftWins: 58,
    paintballWins: 39,
    airsoftWinRate: 93.5,
    paintballWinRate: 86.7,
    state: 'Texas',
    primaryBase: 'Dallas Tactical Center',
    secondaryBases: ['Houston Field', 'Austin Base'],
    achievements: ['Legendary Sniper', 'Master Tactician', 'Veteran Leader', 'Elite Marksman'],
    gameDisplayPreference: 'all',
    createdAt: '2023-02-20T14:30:00Z',
    updatedAt: '2024-02-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Silent Strike',
    email: 'silent@example.com',
    airsoftHumanRank: 8,
    airsoftHumanRankName: 'Sergeant',
    airsoftHumanPoints: 1200,
    airsoftAlienRank: 5,
    airsoftAlienRankName: 'Novice',
    airsoftAlienPoints: 750,
    paintballHumanRank: 6,
    paintballHumanRankName: 'Corporal',
    paintballHumanPoints: 900,
    paintballAlienRank: 4,
    paintballAlienRankName: 'Novice',
    paintballAlienPoints: 600,
    airsoftMissions: 28,
    paintballMissions: 19,
    airsoftWins: 22,
    paintballWins: 15,
    airsoftWinRate: 78.6,
    paintballWinRate: 78.9,
    state: 'Florida',
    primaryBase: 'Miami Combat Zone',
    secondaryBases: ['Orlando Field'],
    achievements: ['Stealth Master', 'Team Player'],
    gameDisplayPreference: 'airsoft',
    createdAt: '2023-03-10T09:15:00Z',
    updatedAt: '2024-03-10T09:15:00Z'
  }
];

// Mock данные для статистики игроков
const mockGameStats: { [key: string]: PlayerGameStats } = {
  'airsoft-1': {
    gameType: 'airsoft',
    humanRank: 15,
    humanRankName: 'Captain',
    humanPoints: 1800,
    alienRank: 12,
    alienRankName: 'Sentinel',
    alienPoints: 1400,
    totalMissions: 45,
    totalWins: 32,
    winRate: 71.1,
    totalPoints: 3200,
    totalRank: 13
  },
  'paintball-1': {
    gameType: 'paintball',
    humanRank: 8,
    humanRankName: 'Lieutenant',
    humanPoints: 950,
    alienRank: 10,
    alienRankName: 'Stalker',
    alienPoints: 1100,
    totalMissions: 28,
    totalWins: 18,
    winRate: 64.3,
    totalPoints: 2050,
    totalRank: 9
  }
};

// Mock данные для прогресса рангов
const mockRankProgress: { [key: string]: RankProgress } = {
  'airsoft-human-1': {
    currentRank: 15,
    currentRankName: 'Captain',
    currentPoints: 2500,
    nextRankPoints: 2700,
    pointsToNext: 200,
    progressPercent: 92.6,
    isMaxRank: false
  },
  'airsoft-alien-1': {
    currentRank: 12,
    currentRankName: 'Dark Warrior',
    currentPoints: 1800,
    nextRankPoints: 2000,
    pointsToNext: 200,
    progressPercent: 90.0,
    isMaxRank: false
  }
};

class UserService {
  private baseUrl = '/api/user';

  // Получить топ игроков
  async getTopPlayers(gameType: string = 'airsoft', limit: number = 10): Promise<Player[]> {
    try {
      const response = await apiClient.get<Player[]>(`${this.baseUrl}/top`, {
        params: { gameType, limit }
      });
      return response;
    } catch (error) {
      // Fallback to mock data
      return mockPlayers.slice(0, limit);
    }
  }

  // Получить всех игроков с пагинацией
  async getPlayers(
    gameType: string = 'airsoft',
    page: number = 1,
    pageSize: number = 20,
    search: string = ''
  ): Promise<PlayersResponse> {
    try {
      const response = await apiClient.get<PlayersResponse>(`${this.baseUrl}`, {
        params: { gameType, page, pageSize, search }
      });
      return response;
    } catch (error) {
      // Fallback to mock data
      return {
        players: mockPlayers,
        totalCount: mockPlayers.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: pageSize,
        hasMore: false
      };
    }
  }

  // Получить профиль игрока
  async getPlayerProfile(userId: string): Promise<Player> {
    try {
      const response = await apiClient.get<Player>(`${this.baseUrl}/${userId}`);
      return response;
    } catch (error) {
      // Fallback to mock data
      const mockPlayer = mockPlayers.find(p => p.id === userId);
      if (mockPlayer) {
        return mockPlayer;
      }
      throw new Error('Player not found');
    }
  }

  // Получить статистику игрока для определенного типа игры
  async getPlayerStats(userId: string, gameType: string): Promise<PlayerGameStats> {
    try {
      const response = await apiClient.get<PlayerGameStats>(`${this.baseUrl}/${userId}/stats/${gameType}`);
      return response;
    } catch (error) {
      // Fallback to mock data
      const mockStats = mockGameStats[`${gameType}-${userId}`];
      if (mockStats) {
        return mockStats;
      }
      // Create default stats
      return {
        gameType,
        humanRank: 1,
        humanRankName: 'Recruit',
        humanPoints: 0,
        alienRank: 1,
        alienRankName: 'Novice',
        alienPoints: 0,
        totalMissions: 0,
        totalWins: 0,
        winRate: 0,
        totalPoints: 0,
        totalRank: 1
      };
    }
  }

  // Получить прогресс игрока к следующему рангу
  async getRankProgress(
    userId: string,
    gameType: string = 'airsoft',
    faction: string = 'human'
  ): Promise<RankProgress> {
    try {
      const response = await apiClient.get<RankProgress>(`${this.baseUrl}/${userId}/rank-progress`, {
        params: { gameType, faction }
      });
      return response;
    } catch (error) {
      // Fallback to mock data
      const mockProgress = mockRankProgress[`${gameType}-${faction}-${userId}`];
      if (mockProgress) {
        return mockProgress;
      }
      // Create default progress
      return {
        currentRank: 1,
        currentRankName: faction === 'human' ? 'Recruit' : 'Novice',
        currentPoints: 0,
        nextRankPoints: 100,
        pointsToNext: 100,
        progressPercent: 0,
        isMaxRank: false
      };
    }
  }

  // Поиск игроков
  async searchPlayers(searchTerm: string, limit: number = 20, gameType: string = ''): Promise<Player[]> {
    try {
      const response = await apiClient.get<Player[]>(`${this.baseUrl}/search`, {
        params: { searchTerm, limit, gameType }
      });
      return response;
    } catch (error) {
      // Fallback to mock data
      return mockPlayers.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, limit);
    }
  }

  // Получить игроков клана
  async getClanPlayers(clanId: string, gameType: string = 'airsoft'): Promise<Player[]> {
    try {
      const response = await apiClient.get<Player[]>(`${this.baseUrl}/clan/${clanId}`, {
        params: { gameType }
      });
      return response;
    } catch (error) {
      // Fallback to mock data
      return mockPlayers.filter(p => p.id === clanId);
    }
  }

  // Обновить профиль пользователя
  async updatePlayerProfile(
    userId: string,
    profileData: {
      name?: string;
      email?: string;
      state?: string;
      primaryBase?: string;
      secondaryBases?: string[];
      gameDisplayPreference?: string;
    }
  ): Promise<Player> {
    try {
      const response = await apiClient.put<Player>(`${this.baseUrl}/${userId}`, profileData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Обновить статистику игрока
  async updatePlayerStats(
    userId: string,
    gameType: string,
    faction: string,
    points: number,
    isWin: boolean = false
  ): Promise<boolean> {
    try {
      await apiClient.post(`${this.baseUrl}/${userId}/update-stats`, {
        gameType,
        faction,
        points,
        isWin
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Утилитарные методы
  formatPlayerName(player: Player): string {
    return player.name.toUpperCase();
  }

  getPlayerMainRank(player: Player, gameType: string): string {
    if (gameType === 'airsoft') {
      const humanRank = player.airsoftHumanRank;
      const alienRank = player.airsoftAlienRank;
      return humanRank >= alienRank ? player.airsoftHumanRankName : player.airsoftAlienRankName;
    } else {
      const humanRank = player.paintballHumanRank;
      const alienRank = player.paintballAlienRank;
      return humanRank >= alienRank ? player.paintballHumanRankName : player.paintballAlienRankName;
    }
  }

  getPlayerTotalMissions(player: Player, gameType: string): number {
    return gameType === 'airsoft' ? player.airsoftMissions : player.paintballMissions;
  }

  getPlayerWinRate(player: Player, gameType: string): number {
    return gameType === 'airsoft' ? player.airsoftWinRate : player.paintballWinRate;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

export default new UserService(); 