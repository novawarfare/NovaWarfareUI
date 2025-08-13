import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  
  // Если аутентификация все еще проверяется, показываем индикатор загрузки
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0a1a08',
        color: '#66ff66',
        fontFamily: 'Courier New, monospace'
      }}>
        ACCESS VERIFICATION IN PROGRESS...
      </div>
    );
  }
  
  // Если нет аутентифицированного пользователя, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Если требуется роль админа, проверяем её через метод isAdmin
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  // Если пользователь авторизован и имеет необходимые права, отображаем защищенный контент
  return <Outlet />;
};

export default ProtectedRoute; 