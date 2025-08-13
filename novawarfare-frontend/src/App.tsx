import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import GlobalStyles from './styles/GlobalStyles';

// Компоненты
import HudHeader from './components/hud/HudHeader';
import HudFooter from './components/hud/HudFooter';
import HudBackground from './components/hud/HudBackground';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import VerifiedRoute from './components/common/VerifiedRoute';

// Страницы
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordCodePage from './pages/ResetPasswordCodePage';
import ResetPasswordNewPage from './pages/ResetPasswordNewPage';
import MissionsPage from './pages/MissionsPage';
import MissionDetailPage from './pages/MissionDetailPage';
import MapsPage from './pages/MapsPage';
import MapDetailPage from './pages/MapDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import IntelPage from './pages/IntelPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import ClansPage from './pages/ClansPage';
import ClanDetailPage from './pages/ClanDetailPage';
import CreateClanPage from './pages/CreateClanPage';
import CommandosPage from './pages/CommandosPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './contexts/AuthContext';

const AuthRedirect: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin()) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  return null;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isFullScreenPage = location.pathname.startsWith('/verify-email');
  const isAuthPage = location.pathname.startsWith('/login') || location.pathname.startsWith('/register');

  // Показываем HudHeader и HudFooter везде, кроме админки и страниц верификации
  const showHud = !isAdminPage && !isFullScreenPage;

  return (
    <>
      <GlobalStyles />
      <AuthRedirect />
      {isFullScreenPage ? (
        <Routes>
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      ) : showHud ? (
        <HudBackground>
          <HudHeader />
          <main style={{ 
            padding: '20px', 
            flex: 1,
            paddingBottom: '60px'
          }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/missions" element={<MissionsPage />} />
              <Route path="/missions/:id" element={<MissionDetailPage />} />
              <Route path="/maps" element={
                <PrivateRoute>
                  <VerifiedRoute>
                    <MapsPage />
                  </VerifiedRoute>
                </PrivateRoute>
              } />
              <Route path="/maps/:id" element={
                <PrivateRoute>
                  <VerifiedRoute>
                    <MapDetailPage />
                  </VerifiedRoute>
                </PrivateRoute>
              } />
              <Route path="/clans" element={<ClansPage />} />
              <Route path="/clans/:id" element={<ClanDetailPage />} />
              <Route path="/clans/create" element={
                <PrivateRoute>
                  <VerifiedRoute>
                    <CreateClanPage />
                  </VerifiedRoute>
                </PrivateRoute>
              } />
              <Route path="/commandos" element={<CommandosPage />} />
              <Route path="/commandos/:id" element={<ProfilePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={
                <PrivateRoute>
                  <VerifiedRoute>
                    <CheckoutPage />
                  </VerifiedRoute>
                </PrivateRoute>
              } />
              <Route path="/intel" element={<IntelPage />} />
              <Route path="/intel/:id" element={<NewsDetailPage />} />
              <Route path="/profile" element={
                <PrivateRoute>
                  <VerifiedRoute>
                    <ProfilePage />
                  </VerifiedRoute>
                </PrivateRoute>
              } />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password-code" element={<ResetPasswordCodePage />} />
              <Route path="/reset-password-new" element={<ResetPasswordNewPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <HudFooter />
        </HudBackground>
      ) : (
        <Routes>
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } />
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
