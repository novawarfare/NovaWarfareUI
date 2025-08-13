import { Order, OrderItem } from '../types/order';
import { getAuthData } from './authService';
import { API_URL } from '../constants/api';

// API endpoint для заказов
const ORDERS_API_URL = `${API_URL}/api/orders`;

// Аутентифицированный запрос к API
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Получаем токен с помощью функции из authService
  const { token } = getAuthData();
  
  console.log('Запрос к API заказов с токеном:', token ? 'токен есть' : 'токена нет');
  
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
      } else if (response.status === 403) {
        console.error('Доступ запрещен (403). Недостаточно прав для этого действия.');
      }
      throw new Error(`Ошибка при запросе: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    throw error;
  }
}

// Получить заказы пользователя
export const getUserOrders = async (page = 1, pageSize = 10): Promise<{orders: Order[], totalCount: number}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  return fetchWithAuth(`${ORDERS_API_URL}/user?${params.toString()}`);
};

// Получить заказ по ID
export const getOrderById = async (id: string): Promise<Order> => {
  return fetchWithAuth(`${ORDERS_API_URL}/${id}`);
};

// Создать новый заказ
export const createOrder = async (items: OrderItem[]) => {
  return fetchWithAuth(ORDERS_API_URL, {
    method: 'POST',
    body: JSON.stringify({ items })
  });
};

// Отменить заказ
export const cancelOrder = async (id: string) => {
  return fetchWithAuth(`${ORDERS_API_URL}/${id}/cancel`, {
    method: 'PUT'
  });
};

// Подтвердить оплату заказа
export const confirmPayment = async (id: string, paymentId: string) => {
  return fetchWithAuth(`${ORDERS_API_URL}/${id}/payment`, {
    method: 'PUT',
    body: JSON.stringify({ paymentId })
  });
}; 