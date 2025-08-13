import { Map } from '../types/map';
import { getAuthData } from './authService';
import axios from 'axios';
import { API_URL } from '../constants/api';

// API endpoint для карт
const MAPS_API_URL = `${API_URL}/api/maps`;

// Аутентифицированный запрос к API
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Получаем токен с помощью функции из authService
  const { token } = getAuthData();
  
  console.log('Запрос к API карт с токеном:', token ? 'токен есть' : 'токена нет');
  
  // Определяем заголовки с правильной типизацией
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  
  // Добавляем заголовок авторизации, если есть токен
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    console.log(`Выполняем запрос к: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    console.log('Статус ответа:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('Ошибка авторизации (401). Проверьте токен и права доступа.');
        // Можно добавить логику обновления токена или перенаправления на страницу входа
      }
      throw new Error(`Ошибка при запросе: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    throw error;
  }
}

// Получить все карты (для публичного доступа)
export const getMaps = async (page = 1, pageSize = 20): Promise<{maps: Map[], totalCount: number}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  return fetchWithAuth(`${MAPS_API_URL}?${params.toString()}`);
};

// Получить карту по ID
export const getMapById = async (id: string): Promise<Map> => {
  return fetchWithAuth(`${MAPS_API_URL}/${id}`);
};

// Получить карты для конкретного пользователя
export const getUserMaps = async (userId: string, page = 1, pageSize = 20): Promise<{maps: Map[], totalCount: number}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  return fetchWithAuth(`${MAPS_API_URL}/users/${userId}?${params.toString()}`);
}; 