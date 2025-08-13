import { User } from '../types/user';
import { NewsItem, NewsRequest } from '../types/news';
import { Order } from '../types/order';
import { Product, Mission } from '../types/product';
import { UserCreateRequest, UserUpdateRequest } from '../types/user';
import { API_URL } from '../constants/api';

// Функция для получения токена авторизации
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Базовый URL для API admin
const ADMIN_API_URL = `${API_URL}/api/admin`;

// Общая функция для выполнения запросов
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Получаем токен из localStorage
  const token = localStorage.getItem('token');
  
  console.log(`Выполняем запрос: ${options.method || 'GET'} ${url}`);
  console.log('Тело запроса:', options.body);
  
  // Устанавливаем заголовки авторизации
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  try {
    // Логируем полный URL и заголовки
    console.log('Полный URL:', url);
    console.log('Заголовки:', headers);
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    console.log(`Ответ от сервера: ${response.status} ${response.statusText}`);
    
    // Попытка прочитать текст ответа для логирования
    const responseText = await response.text();
    console.log('Тело ответа:', responseText);
    
    if (!response.ok) {
      console.error('Текст ошибки:', responseText);
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
        console.error('Данные ошибки:', errorData);
      } catch (e) {
        console.error('Не удалось разобрать JSON ошибки');
      }
      
      throw new Error(errorData?.message || `Ошибка сервера: ${response.status}`);
    }
    
    // Преобразовать ответ обратно в JSON, если это возможно
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.warn('Не удалось разобрать ответ как JSON, возвращаем текст:', responseText);
      return responseText;
    }
    
    console.log('Данные ответа:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    throw error;
  }
}

// Статистика
export const getRevenueStatistics = async () => {
  return fetchWithAuth(`${ADMIN_API_URL}/statistics/revenue`);
};

// Управление пользователями
export const getUsers = async (page = 1, pageSize = 10, role?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  if (role) {
    params.append('role', role);
  }
  
  return fetchWithAuth(`${ADMIN_API_URL}/users?${params.toString()}`);
};

export const getUserById = async (id: string) => {
  return fetchWithAuth(`${ADMIN_API_URL}/users/${id}`);
};

export const updateUser = async (userData: UserUpdateRequest) => {
  console.log('updateUser вызван с данными:', userData);
  
  try {
    console.log('Подготовка данных для отправки:', { request: userData });
    console.log('JSON данных:', JSON.stringify({ request: userData }));
    
    const result = await fetchWithAuth(`${ADMIN_API_URL}/UpdateUser`, {
      method: 'POST',
      body: JSON.stringify({ request: userData })
    });
    
    console.log('Результат updateUser:', result);
    return result;
  } catch (error) {
    console.error('Ошибка в updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  return fetchWithAuth(`${ADMIN_API_URL}/users/${id}`, {
    method: 'DELETE'
  });
};

export const createUser = async (userData: UserCreateRequest) => {
  // Убедимся, что статус задан
  const userDataWithStatus = {
    ...userData,
    status: userData.status || 'PENDING'
  };
  
  return fetchWithAuth(`${ADMIN_API_URL}/createuser`, {
    method: 'POST',
    body: JSON.stringify(userDataWithStatus)
  });
};

// Управление новостями
export const getNews = async (page = 1, pageSize = 10, status?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  if (status) {
    params.append('status', status);
  }
  
  try {
    const response = await fetchWithAuth(`${ADMIN_API_URL}/news?${params.toString()}`);
    console.log('News data received:', response);
    return response;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const getNewsById = async (id: string) => {
  try {
    const response = await fetchWithAuth(`${ADMIN_API_URL}/news/${id}`);
    console.log('News details received:', response);
    return response;
  } catch (error) {
    console.error(`Error fetching news ID ${id}:`, error);
    throw error;
  }
};

// Вспомогательная функция для преобразования UPPERCASE строки статуса в PascalCase
function getStatusInPascalCase(status: string): string {
  switch (status.toUpperCase()) {
    case 'DRAFT': return 'Draft';
    case 'PUBLISHED': return 'Published';
    case 'ARCHIVED': return 'Archived';
    default: 
      console.warn(`Неизвестный статус: ${status}, возвращаем Draft`);
      return 'Draft';
  }
}

export const createNews = async (newsData: NewsRequest) => {
  try {
    console.log('Creating news with data:', newsData);
    
    // Format data according to backend expectations
    const formattedData = {
      title: newsData.title,
      content: newsData.content,
      category: newsData.category,
      status: getStatusInPascalCase(newsData.status),
      imageUrl: newsData.imageUrl || null
    };
    
    console.log('Formatted news data:', formattedData);
    
    const response = await fetchWithAuth(`${ADMIN_API_URL}/news`, {
      method: 'POST',
      body: JSON.stringify(formattedData)
    });
    
    console.log('News creation response:', response);
    return response;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

export const updateNews = async (id: string, newsData: NewsRequest) => {
  try {
    console.log(`Updating news ${id} with data:`, newsData);
    
    // Format data according to backend expectations
    const formattedData = {
      title: newsData.title,
      content: newsData.content,
      category: newsData.category,
      status: getStatusInPascalCase(newsData.status),
      imageUrl: newsData.imageUrl || null
    };
    
    console.log('Formatted news update data:', formattedData);
    
    const response = await fetchWithAuth(`${ADMIN_API_URL}/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formattedData)
    });
    
    console.log('News update response:', response);
    return response;
  } catch (error) {
    console.error(`Error updating news ${id}:`, error);
    throw error;
  }
};

export const deleteNews = async (id: string) => {
  try {
    console.log(`Deleting news ${id}`);
    const response = await fetchWithAuth(`${ADMIN_API_URL}/news/${id}`, {
      method: 'DELETE'
    });
    console.log('Delete response:', response);
    return response;
  } catch (error) {
    console.error(`Error deleting news ${id}:`, error);
    throw error;
  }
};

// Управление заказами
export const getOrders = async (page = 1, pageSize = 10, status?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  if (status) {
    params.append('status', status);
  }
  
  return fetchWithAuth(`${ADMIN_API_URL}/orders?${params.toString()}`);
};

export const getOrderById = async (id: string) => {
  return fetchWithAuth(`${ADMIN_API_URL}/orders/${id}`);
};

export const updateOrderStatus = async (id: string, status: string) => {
  return fetchWithAuth(`${ADMIN_API_URL}/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
};

export const deleteOrder = async (id: string) => {
  return fetchWithAuth(`${ADMIN_API_URL}/orders/${id}`, {
    method: 'DELETE'
  });
};

// Управление миссиями (через API продуктов)
export const getMissions = async (page = 1, pageSize = 10, status?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  if (status) {
    params.append('status', status);
  }
  
  return fetchWithAuth(`${ADMIN_API_URL}/products?${params.toString()}`);
};

export const getMissionById = async (id: string) => {
  return fetchWithAuth(`${ADMIN_API_URL}/products/${id}`);
};

export const createMission = async (missionData: Partial<Mission>) => {
  try {
    console.log('Исходные данные миссии:', missionData);
    
    // Формируем данные в точном соответствии с классом ProductRequest
    const productRequestData = {
      Title: missionData.name || 'Новая миссия',
      Description: missionData.description || 'Описание миссии',
      Price: typeof missionData.price === 'number' ? missionData.price : 0,
      Difficulty: getDifficultyAsString(typeof missionData.difficulty === 'number' ? missionData.difficulty : 2),
      Duration: typeof missionData.duration === 'number' ? missionData.duration : 120,
      PlayerCountMin: typeof missionData.minPlayers === 'number' ? missionData.minPlayers : 6,
      PlayerCountMax: typeof missionData.maxPlayers === 'number' ? missionData.maxPlayers : 12,
      Type: missionData.gameType === 'AIRSOFT' ? "Airsoft" : "Paintball",
      Images: Array.isArray(missionData.images) ? missionData.images : [],
      Videos: Array.isArray(missionData.videos) ? missionData.videos : [],
      Files: Array.isArray(missionData.files) ? missionData.files : [],
      Tags: Array.isArray(missionData.tags) ? missionData.tags : [`MISSION-${missionData.missionId || 'UNKNOWN'}`],
      IsActive: missionData.status === 'ACTIVE'
    };
    
    console.log('Отправка данных создания миссии:', JSON.stringify(productRequestData, null, 2));
    
    const response = await fetchWithAuth(`${ADMIN_API_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(productRequestData)
    });
    
    console.log('Ответ от сервера при создании миссии:', response);
    return response;
  } catch (error) {
    console.error('Ошибка при создании миссии:', error);
    throw error;
  }
};

export const updateMission = async (id: string, missionData: Partial<Mission>) => {
  try {
    console.log('Исходные данные обновления миссии:', missionData);
    
    // Формируем данные в точном соответствии с классом ProductRequest
    const productRequestData = {
      Title: missionData.name || 'Новая миссия',
      Description: missionData.description || 'Описание миссии',
      Price: typeof missionData.price === 'number' ? missionData.price : 0,
      Difficulty: getDifficultyAsString(typeof missionData.difficulty === 'number' ? missionData.difficulty : 2),
      Duration: typeof missionData.duration === 'number' ? missionData.duration : 120,
      PlayerCountMin: typeof missionData.minPlayers === 'number' ? missionData.minPlayers : 6,
      PlayerCountMax: typeof missionData.maxPlayers === 'number' ? missionData.maxPlayers : 12,
      Type: missionData.gameType === 'AIRSOFT' ? "Airsoft" : "Paintball",
      Images: Array.isArray(missionData.images) ? missionData.images : [],
      Videos: Array.isArray(missionData.videos) ? missionData.videos : [],
      Files: Array.isArray(missionData.files) ? missionData.files : [],
      Tags: Array.isArray(missionData.tags) ? missionData.tags : [`MISSION-${missionData.missionId || 'UNKNOWN'}`],
      IsActive: missionData.status === 'ACTIVE'
    };
    
    console.log('Отправка данных обновления миссии:', JSON.stringify(productRequestData, null, 2));
    
    const response = await fetchWithAuth(`${ADMIN_API_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productRequestData)
    });
    
    console.log('Ответ от сервера при обновлении миссии:', response);
    return response;
  } catch (error) {
    console.error('Ошибка при обновлении миссии:', error);
    throw error;
  }
};

export const deleteMission = async (id: string) => {
  return fetchWithAuth(`${ADMIN_API_URL}/products/${id}`, {
    method: 'DELETE'
  });
};

// Вспомогательные функции
function getDifficultyFromLevel(level: number): number {
  switch (level) {
    case 1: return 0; // Easy = 0
    case 2: return 1; // Medium = 1
    case 3: return 2; // Hard = 2
    case 4: return 3; // Expert = 3
    default: return 1; // Medium = 1
  }
}

function getDifficultyAsString(level: number): string {
  switch (level) {
    case 1: return "Easy";
    case 2: return "Medium";
    case 3: return "Hard";
    case 4: return "Expert";
    default: return "Medium";
  }
}

function getLevelFromDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'Easy': return 1;
    case 'Medium': return 2;
    case 'Hard': return 3;
    case 'Expert': return 4;
    default: return 2;
  }
}

// Преобразование продукта в миссию
export function productToMission(product: any): Mission {
  // Более надежное определение типа игры
  let gameType: 'AIRSOFT' | 'PAINTBALL';
  
  // Проверяем разные возможные значения типа игры
  if (typeof product.type === 'string') {
    if (product.type.toLowerCase() === 'paintball') {
      gameType = 'PAINTBALL';
    } else {
      gameType = 'AIRSOFT'; // По умолчанию Airsoft для всех других строковых значений
    }
  } else if (product.type === 1) {
    gameType = 'PAINTBALL';
  } else {
    gameType = 'AIRSOFT'; // По умолчанию Airsoft для всех других случаев
  }
  
  console.log('Преобразование типа игры:', product.type, '→', gameType);
  
  return {
    id: product.id,
    name: product.title,
    description: product.description,
    price: product.price,
    gameType: gameType,
    difficulty: getLevelFromDifficulty(product.difficulty),
    missionId: product.tags?.find((tag: string) => tag.startsWith('MISSION-'))?.replace('MISSION-', '') || 'UNKNOWN',
    status: product.isActive ? 'ACTIVE' : 'DRAFT'
  };
}

// Вспомогательная функция для преобразования строки категории в числовое значение
function getCategoryIndex(category: string): number {
  switch (category.toUpperCase()) {
    case 'GENERAL': return 0;
    case 'UPDATES': return 1;
    case 'EVENTS': return 2;
    case 'ANNOUNCEMENTS': return 3;
    case 'GUIDES': return 4;
    default: return 0; // По умолчанию General
  }
}

// Функция для получения опубликованных новостей (для обычных пользователей)
export const getPublishedNews = async (page = 1, pageSize = 10, category?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    status: 'Published'
  });
  
  if (category) {
    params.append('category', category);
  }
  
  try {
    // Эта функция использует API не требующее авторизации
    const response = await fetch(`${API_URL}/api/news?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching published news:', error);
    throw error;
  }
};

export const getPublishedNewsById = async (id: string) => {
  try {
    // Эта функция использует API не требующее авторизации
    const response = await fetch(`${API_URL}/api/news/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching published news ID ${id}:`, error);
    throw error;
  }
};

export const createNewsWithFiles = async (newsData: FormData) => {
  try {
    console.log('Creating news with files');
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${ADMIN_API_URL}/news`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: newsData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creating news: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating news with files:', error);
    throw error;
  }
};

export const updateNewsWithFiles = async (id: string, newsData: FormData) => {
  try {
    console.log(`Updating news ${id} with files`);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${ADMIN_API_URL}/news/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: newsData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error updating news: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating news ${id} with files:`, error);
    throw error;
  }
};

export const createMissionWithFiles = async (missionData: FormData) => {
  try {
    console.log('Creating mission with files');
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${ADMIN_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: missionData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error creating mission: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating mission with files:', error);
    throw error;
  }
};

export const updateMissionWithFiles = async (id: string, missionData: FormData) => {
  try {
    console.log(`Updating mission ${id} with files`);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${ADMIN_API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: missionData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error updating mission: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating mission ${id} with files:`, error);
    throw error;
  }
};