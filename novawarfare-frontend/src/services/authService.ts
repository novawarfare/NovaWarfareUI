import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../constants/api';

// Типы данных
interface AuthRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  phone: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified?: boolean;
    // Новые поля для двойного членства в кланах
    airsoftClanId?: string;
    airsoftClanName?: string;
    airsoftClanRole?: string;
    paintballClanId?: string;
    paintballClanName?: string;
    paintballClanRole?: string;
    // Поля для рангов игрока
    humanFactionRank?: number;
    humanFactionRankName?: string;
    humanFactionPoints?: number;
    alienFactionRank?: number;
    alienFactionRankName?: string;
    alienFactionPoints?: number;
    totalMissions?: number;
    totalWins?: number;
    winRate?: number;
    achievements?: string[];
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  emailVerified?: boolean;
}

interface RegistrationResponse {
  success: boolean;
  message: string;
  email: string;
}

// Регистрация нового пользователя
export const registerUser = async (name: string, email: string, password: string, phone: string): Promise<RegistrationResponse> => {
  const request: RegisterRequest = {
    name,
    email,
    password,
    role: 'Customer', // Регистрируем пользователя с ролью Customer, согласно UserRole на бэкенде
    phone
  };
  
  const response = await axios.post<RegistrationResponse>(`${API_URL}/api/auth/register`, request);
  return response.data;
};

// Авторизация пользователя
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const request: AuthRequest = {
    email,
    password
  };
  
  const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/login`, request);
  return response.data;
};

// Обновление токена
export const refreshToken = async (token: string, refreshToken: string): Promise<AuthResponse> => {
  const request = {
    token,
    refreshToken
  };

  const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/refresh-token`, request);
  return response.data;
};

// Сохранение данных в localStorage
export const saveAuthData = (data: AuthResponse): void => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);
  
  // Обновляем объект пользователя, добавляя emailVerified, если он есть в ответе
  const user = {
    ...data.user,
    emailVerified: data.emailVerified !== undefined ? data.emailVerified : data.user.emailVerified
  };
  
  localStorage.setItem('user', JSON.stringify(user));
};

// Получение данных из localStorage
export const getAuthData = (): { token: string | null; refreshToken: string | null; user: any } => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  return { token, refreshToken, user };
};

// Очистка данных авторизации
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Простая функция для выполнения выхода
export const performLogout = (): void => {
  // Очищаем данные авторизации
  clearAuthData();
  
  // Простое сообщение
  alert('Сессия завершена. Перенаправление на главную страницу.');
  
  // Форсированное завершение текущих запросов
  if (window.stop) {
    window.stop();
  }
  
  // Принудительная перезагрузка страницы с перенаправлением на главную страницу
  window.location.href = '/';
};

// Мягкий выход без alert и перезагрузки
export const softLogout = (): void => {
  // Очищаем данные авторизации
  clearAuthData();
  
  // Перенаправляем на главную без перезагрузки
  window.location.href = '/';
};

// Хранилище для текущего interceptor
let currentRequestInterceptor: number | null = null;
let currentResponseInterceptor: number | null = null;

// Настройка axios для использования токена в запросах
export const setupAxiosInterceptors = (token: string): void => {
  // Удаляем предыдущие interceptors если они есть
  if (currentRequestInterceptor !== null) {
    axios.interceptors.request.eject(currentRequestInterceptor);
  }
  if (currentResponseInterceptor !== null) {
    axios.interceptors.response.eject(currentResponseInterceptor);
  }
  
  // Добавляем новый request interceptor
  currentRequestInterceptor = axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Добавляем response interceptor для обработки ошибок авторизации
  currentResponseInterceptor = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Мягкий logout при ошибке авторизации
        softLogout();
      }
      return Promise.reject(error);
    }
  );
};

// Повторная отправка верификационного email
export const resendVerificationEmail = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.post(`${API_URL}/api/EmailVerification/resend`, { email });
    return response.status === 200;
  } catch (error) {
    console.error('Error resending verification email:', error);
    return false;
  }
};

// Проверка валидности текущего токена
export const validateToken = async (): Promise<boolean> => {
  const { token } = getAuthData();
  if (!token) {
    return false;
  }
  
  try {
    // Проверяем структуру JWT токена
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Проверяем срок действия токена используя JWT exp поле с UTC временем
    const payload = JSON.parse(atob(parts[1]));
    const currentTimeUTC = Math.floor(Date.now() / 1000); // UTC timestamp в секундах
    
    // DEBUG: Логируем времена для отладки
    console.log('🔍 Token validation:');
    console.log('Token exp:', payload.exp, '(' + new Date(payload.exp * 1000) + ')');
    console.log('Current UTC:', currentTimeUTC, '(' + new Date(currentTimeUTC * 1000) + ')');
    console.log('Time diff (seconds):', payload.exp - currentTimeUTC);
    console.log('Token valid:', payload.exp > currentTimeUTC);
    
    if (payload.exp && payload.exp < currentTimeUTC) {
      console.log('❌ Token expired!');
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}; 