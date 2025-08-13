import { getAuthData } from './authService';
import { Product, ProductListResponse, MissionFilter } from '../types/product';
import { API_URL } from '../constants/api';

// API endpoint для продуктов
const PRODUCTS_API_URL = `${API_URL}/api/products`;
const COMMENTS_API_URL = `${API_URL}/api/comments`;

// Обычный запрос к API без авторизации
async function fetchData(url: string, options: RequestInit = {}) {
  try {
    console.log(`Making public request to: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    console.log('Status of response:', response.status);
    
    if (!response.ok) {
      throw new Error(`Error during request: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error during request execution:', error);
    throw error;
  }
}

// Аутентифицированный запрос к API для действий, требующих авторизации
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Получаем токен с помощью функции из authService
  const { token } = getAuthData();
  
  console.log('Request to API products with token:', token ? 'token exists' : 'no token');
  
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
    console.log(`Making protected request to: ${url}`);
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    console.log('Status of response:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('Authorization error (401). Check token and access rights.');
      } else if (response.status === 403) {
        console.error('Access denied (403). Insufficient rights for this action.');
      }
      throw new Error(`Error during request: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error during request execution:', error);
    throw error;
  }
}

// Интерфейс для фильтров продуктов (соответствует ProductFilterRequest на backend)
export interface ProductFilter {
  type?: string;
  difficulties?: string[];
  minDuration?: number;
  maxDuration?: number;
  minPrice?: number;
  maxPrice?: number;
  minPlayers?: number;
  maxPlayers?: number;
  tags?: string[];
  searchTerm?: string;
}

// Получить все продукты с фильтрацией (публичный запрос)
export const getProducts = async (
  page = 1, 
  pageSize = 20, 
  filter?: ProductFilter
): Promise<{products: Product[], totalCount: number, facets?: any}> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });

  // Добавляем параметры фильтрации если они переданы
  if (filter) {
    if (filter.type) {
      params.append('filter.Type', filter.type);
    }
    if (filter.difficulties && filter.difficulties.length > 0) {
      filter.difficulties.forEach(difficulty => params.append('filter.Difficulties', difficulty));
    }
    if (filter.minDuration !== undefined) {
      params.append('filter.MinDuration', filter.minDuration.toString());
    }
    if (filter.maxDuration !== undefined) {
      params.append('filter.MaxDuration', filter.maxDuration.toString());
    }
    if (filter.minPrice !== undefined) {
      params.append('filter.MinPrice', filter.minPrice.toString());
    }
    if (filter.maxPrice !== undefined) {
      params.append('filter.MaxPrice', filter.maxPrice.toString());
    }
    if (filter.minPlayers !== undefined) {
      params.append('filter.MinPlayers', filter.minPlayers.toString());
    }
    if (filter.maxPlayers !== undefined) {
      params.append('filter.MaxPlayers', filter.maxPlayers.toString());
    }
    if (filter.tags && filter.tags.length > 0) {
      filter.tags.forEach(tag => params.append('filter.Tags', tag));
    }
    if (filter.searchTerm) {
      params.append('filter.SearchTerm', filter.searchTerm);
    }
  }
  
  return fetchData(`${PRODUCTS_API_URL}?${params.toString()}`);
};

// Получить продукт по ID через обычный API
export const getProductById = async (id: string): Promise<Product> => {
  try {
    console.log(`Getting product with ID: ${id} via regular API`);
    const data = await fetchData(`${PRODUCTS_API_URL}/${id}`);
    
    console.log("Product data received:", data);
    
    // Если данные получены в другом формате, преобразуем их
    if (data) {
      // Убедимся, что все необходимые поля присутствуют
      return {
        id: data.id || '',
        title: data.title || '',
        name: data.title || '', // Используем title как name если отсутствует
        description: data.description || '',
        price: typeof data.price === 'number' ? data.price : 0,
        difficulty: data.difficulty || 'Medium',
        duration: data.duration || 120,
        type: data.type || 'Airsoft',
        gameType: data.type || 'Airsoft', // Используем type как gameType если отсутствует
        images: Array.isArray(data.images) ? data.images : [],
        videos: Array.isArray(data.videos) ? data.videos : [],
        files: Array.isArray(data.files) ? data.files : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        playerCountMin: data.playerCountMin || 4,
        playerCountMax: data.playerCountMax || 12
      };
    }
    
    throw new Error("Failed to get product data");
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw new Error("Error loading mission data");
  }
};

// Получить комментарии к продукту (публичный запрос)
export const getProductComments = async (productId: string, page = 1, pageSize = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString()
  });
  
  return fetchData(`${PRODUCTS_API_URL}/${productId}/comments?${params.toString()}`);
};

// Добавить комментарий к продукту (требует авторизации)
export const addComment = async (productId: string, text: string) => {
  return fetchWithAuth(`${PRODUCTS_API_URL}/${productId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
};

// Удалить комментарий
export const deleteComment = async (commentId: string): Promise<void> => {
  const { token } = getAuthData() || {};
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  return fetchWithAuth(`${COMMENTS_API_URL}/${commentId}`, {
    method: 'DELETE'
  });
};

// Получить приоритетные миссии для главной страницы
export const getFeaturedProducts = async (
  pageSize = 6
): Promise<{products: Product[], totalCount: number}> => {
  const params = new URLSearchParams({
    page: '1',
    pageSize: pageSize.toString(),
    'filter.IsFeatured': 'true' // Если backend поддерживает такой фильтр
  });
  
  try {
    console.log('Getting featured products for homepage');
    return await fetchData(`${PRODUCTS_API_URL}?${params.toString()}`);
  } catch (error) {
    console.log('Featured filter not supported, falling back to regular products');
    // Fallback к обычному запросу если backend не поддерживает featured
    return await getProducts(1, pageSize);
  }
};

// Получить популярные новости
export const getPopularNews = async (
  page = 1,
  pageSize = 3
): Promise<any> => {
  // Это функция должна быть в adminService, но добавлю для примера
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortBy: 'views', // Сортировка по просмотрам
    sortOrder: 'desc'
  });
  
  try {
    console.log('Getting popular news');
    return await fetchData(`${API_URL}/api/admin/news/published?${params.toString()}`);
  } catch (error) {
    console.error('Error fetching popular news:', error);
    throw error;
  }
}; 