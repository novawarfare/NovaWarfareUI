// Базовый URL для API
const isDevelopment = process.env.NODE_ENV === 'development';
export const API_URL = isDevelopment 
  ? 'https://localhost:7261' 
  : process.env.REACT_APP_API_URL || 'https://novawarfare-backend.railway.app'; 