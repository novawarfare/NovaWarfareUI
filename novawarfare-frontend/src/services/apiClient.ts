import axios, { 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig 
} from 'axios';
import { getAuthData, refreshToken, saveAuthData, clearAuthData, performLogout } from './authService';
import { API_URL } from '../constants/api';

// Базовая конфигурация
// const API_URL = 'https://localhost:7261';

// Класс для работы с API
class ApiClient {
  private static instance: ApiClient;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private constructor() {
    // Инициализация перехватчиков
    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Конфигурация axios с перехватчиками
  private setupInterceptors(): void {
    // Перехватчик запросов для добавления токена
    axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const { token } = getAuthData();
        console.log('Token from getAuthData:', token ? 'EXISTS' : 'NULL/UNDEFINED');
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Authorization header:', config.headers?.Authorization);
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    // Перехватчик ответов для обработки ошибок авторизации
    axios.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        // Проверяем, что ошибка 401 и запрос не на обновление токена
        if (error.response?.status === 401 && 
            originalRequest && 
            originalRequest.url !== `${API_URL}/api/auth/refresh-token`) {
          
          // Пытаемся обновить токен только если еще не выполняется обновление
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            
            try {
              const { token: oldToken, refreshToken: oldRefreshToken } = getAuthData();
              
              if (oldToken && oldRefreshToken) {
                // Обновляем токен
                try {

                  
                  const response = await refreshToken(oldToken, oldRefreshToken);
                  // Сохраняем новые токены
                  saveAuthData(response);
                  
                  // Повторно отправляем все отложенные запросы
                  this.onRefreshed(response.token);

                  // Перенастраиваем текущий запрос с новым токеном
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${response.token}`;
                  }
                  
                  // Повторяем оригинальный запрос с новым токеном
                  return axios(originalRequest);
                } catch (refreshError) {
                  performLogout();
                  return Promise.reject(error);
                }
              } else {
                // Если нет токенов для обновления, выполняем выход
                performLogout();
                return Promise.reject(error);
              }
            } catch (error) {
              // Если не удалось обновить токен, выполняем выход
              performLogout();
              return Promise.reject(error);
            } finally {
              this.isRefreshing = false;
              this.refreshSubscribers = [];
            }
          }
          
          // Если мы уже обновляем токен, добавляем запрос в очередь
          const retryOriginalRequest = new Promise(resolve => {
            this.addSubscriber((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(axios(originalRequest));
            });
          });
          
          return retryOriginalRequest;
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Добавление подписчика для повторной отправки запросов после обновления токена
  private addSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  // Вызов всех подписчиков с новым токеном
  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
  }

  // Методы для выполнения запросов
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.get<T>(`${API_URL}${url}`, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.post<T>(`${API_URL}${url}`, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.put<T>(`${API_URL}${url}`, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.delete<T>(`${API_URL}${url}`, config);
    return response.data;
  }
}

// Экспортируем инстанс
export const apiClient = ApiClient.getInstance();
export default apiClient; 