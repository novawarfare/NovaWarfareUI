import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  registerUser, 
  loginUser, 
  saveAuthData, 
  getAuthData, 
  clearAuthData, 
  setupAxiosInterceptors,
  resendVerificationEmail,
  validateToken
} from '../services/authService';
import UserService from '../services/userService';
import { User } from '../types/user';
import { GAME_DISPLAY_PREFERENCE } from '../constants/gameDisplayPreference';

// Интерфейс аутентификации пользователя (расширение базового User)
export interface AuthUser extends User {
  isAdmin: boolean;
  // Новые поля для двойного членства в кланах
  airsoftClanId?: string;
  airsoftClanName?: string;
  airsoftClanRole?: string;
  paintballClanId?: string;
  paintballClanName?: string;
  paintballClanRole?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isEmailVerified: () => boolean;
  resendVerification: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Инициализация авторизации из localStorage при загрузке
  const initializeAuth = useCallback(async () => {
    try {
      const { token, user } = getAuthData();
      
      if (token && user) {
        const isValidToken = await validateToken();
        
        if (isValidToken) {
          setUser(user);
          setupAxiosInterceptors(token);
        } else {
          clearAuthData();
        }
      }
    } catch (error) {
      clearAuthData();
    }
  }, []);

  // Инициализация при старте приложения
  useEffect(() => {
    initializeAuth().finally(() => {
      setInitializing(false);
    });
  }, [initializeAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(email, password);
      
      // Сохраняем данные авторизации
      saveAuthData(response);
      setupAxiosInterceptors(response.token);
      
      // Устанавливаем пользователя
      const authUser: AuthUser = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as 'Admin' | 'Customer',
        status: 'Active',
        lastLogin: new Date().toISOString(),
        isActive: true,
        emailVerified: response.user.emailVerified || false,
        isAdmin: response.user.role === 'Admin',
        gameDisplayPreference: 'all',
        // Clan information
        airsoftClanId: response.user.airsoftClanId,
        airsoftClanName: response.user.airsoftClanName,
        airsoftClanRole: response.user.airsoftClanRole,
        paintballClanId: response.user.paintballClanId,
        paintballClanName: response.user.paintballClanName,
        paintballClanRole: response.user.paintballClanRole,
        // Игровые ранги
        airsoftHumanRank: 1,
        airsoftHumanRankName: 'Recruit',
        airsoftHumanPoints: 0,
        airsoftAlienRank: 1,
        airsoftAlienRankName: 'Novice',
        airsoftAlienPoints: 0,
        paintballHumanRank: 1,
        paintballHumanRankName: 'Recruit',
        paintballHumanPoints: 0,
        paintballAlienRank: 1,
        paintballAlienRankName: 'Novice',
        paintballAlienPoints: 0,
        // Статистика миссий
        airsoftMissions: 0,
        airsoftWins: 0,
        airsoftWinRate: 0,
        paintballMissions: 0,
        paintballWins: 0,
        paintballWinRate: 0,
        // Базы и локация
        state: '',
        primaryBase: '',
        secondaryBases: [],
        // Достижения
        achievements: [],
        // Временные метки
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setUser(authUser);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Authentication error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await registerUser(name, email, password, phone);
      
      // Больше не сохраняем данные и не устанавливаем пользователя после регистрации,
      // так как пользователь должен сначала подтвердить email
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearAuthData();
  }, []);
  
  // Метод для проверки прав администратора
  const isAdmin = useCallback(() => {
    return user?.isAdmin === true || user?.role === 'Admin';
  }, [user]);
  
  // Метод для проверки верификации email
  const isEmailVerified = useCallback(() => {
    return user?.emailVerified === true;
  }, [user]);
  
  // Метод для повторной отправки верификационного email
  const resendVerification = useCallback(async (): Promise<boolean> => {
    if (!user?.email) {
      return false;
    }
    
    return await resendVerificationEmail(user.email);
  }, [user]);

  // Метод для обновления данных пользователя
  const refreshUserData = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      const updatedUserData = await UserService.getPlayerProfile(user.id);
      
      // Преобразуем данные в формат AuthUser
      const updatedUser: AuthUser = {
        id: updatedUserData.id,
        name: updatedUserData.name,
        email: updatedUserData.email,
        role: ((updatedUserData as any).role || user.role) as 'Admin' | 'Customer',
        status: (updatedUserData as any).status || user.status,
        lastLogin: (updatedUserData as any).lastLogin || user.lastLogin,
        isActive: (updatedUserData as any).isActive !== undefined ? (updatedUserData as any).isActive : user.isActive,
        emailVerified: (updatedUserData as any).emailVerified !== undefined ? (updatedUserData as any).emailVerified : user.emailVerified,
        isAdmin: (updatedUserData as any).isAdmin || user.isAdmin,
        // Обновляем информацию о кланах
        airsoftClanId: (updatedUserData as any).airsoftClanId,
        airsoftClanName: (updatedUserData as any).airsoftClanName,
        airsoftClanRole: (updatedUserData as any).airsoftClanRole,
        paintballClanId: (updatedUserData as any).paintballClanId,
        paintballClanName: (updatedUserData as any).paintballClanName,
        paintballClanRole: (updatedUserData as any).paintballClanRole,
        // Поля из базового User
        airsoftHumanRank: (updatedUserData as any).airsoftHumanRank || user.airsoftHumanRank || 1,
        airsoftHumanRankName: (updatedUserData as any).airsoftHumanRankName || user.airsoftHumanRankName || 'Recruit',
        airsoftHumanPoints: (updatedUserData as any).airsoftHumanPoints || user.airsoftHumanPoints || 0,
        airsoftAlienRank: (updatedUserData as any).airsoftAlienRank || user.airsoftAlienRank || 1,
        airsoftAlienRankName: (updatedUserData as any).airsoftAlienRankName || user.airsoftAlienRankName || 'Novice',
        airsoftAlienPoints: (updatedUserData as any).airsoftAlienPoints || user.airsoftAlienPoints || 0,
        paintballHumanRank: (updatedUserData as any).paintballHumanRank || user.paintballHumanRank || 1,
        paintballHumanRankName: (updatedUserData as any).paintballHumanRankName || user.paintballHumanRankName || 'Recruit',
        paintballHumanPoints: (updatedUserData as any).paintballHumanPoints || user.paintballHumanPoints || 0,
        paintballAlienRank: (updatedUserData as any).paintballAlienRank || user.paintballAlienRank || 1,
        paintballAlienRankName: (updatedUserData as any).paintballAlienRankName || user.paintballAlienRankName || 'Novice',
        paintballAlienPoints: (updatedUserData as any).paintballAlienPoints || user.paintballAlienPoints || 0,
        airsoftMissions: (updatedUserData as any).airsoftMissions || user.airsoftMissions || 0,
        airsoftWins: (updatedUserData as any).airsoftWins || user.airsoftWins || 0,
        airsoftWinRate: (updatedUserData as any).airsoftWinRate || user.airsoftWinRate || 0,
        paintballMissions: (updatedUserData as any).paintballMissions || user.paintballMissions || 0,
        paintballWins: (updatedUserData as any).paintballWins || user.paintballWins || 0,
        paintballWinRate: (updatedUserData as any).paintballWinRate || user.paintballWinRate || 0,
        state: (updatedUserData as any).state || user.state || '',
        primaryBase: (updatedUserData as any).primaryBase || user.primaryBase || '',
        secondaryBases: (updatedUserData as any).secondaryBases || user.secondaryBases || [],
        achievements: (updatedUserData as any).achievements || user.achievements || [],
        gameDisplayPreference: (updatedUserData as any).gameDisplayPreference || user.gameDisplayPreference,
        createdAt: (updatedUserData as any).createdAt || user.createdAt,
        updatedAt: (updatedUserData as any).updatedAt || user.updatedAt
      };

      // Обновляем пользователя в контексте
      setUser(updatedUser);
      
      // Обновляем данные в localStorage
      const currentAuthData = getAuthData();
      if (currentAuthData.token && currentAuthData.refreshToken) {
        saveAuthData({
          token: currentAuthData.token,
          refreshToken: currentAuthData.refreshToken,
          user: updatedUser
        });
      }
    } catch (error) {
      // Silent failure for refresh
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      initializing,
      login, 
      register, 
      logout, 
      isAdmin,
      isEmailVerified,
      resendVerification,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 