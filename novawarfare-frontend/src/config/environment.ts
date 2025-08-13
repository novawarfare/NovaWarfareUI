// Конфигурация окружений
interface EnvironmentConfig {
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Определяем окружение
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Конфигурация для разных окружений
const config: EnvironmentConfig = {
  apiUrl: isDevelopment 
    ? 'https://localhost:7261'  // Локальная разработка
    : process.env.REACT_APP_API_URL || 'https://novawarfare-production.up.railway.app', // Продакшен
  isDevelopment,
  isProduction
};

export default config;
