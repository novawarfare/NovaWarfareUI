import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import HudBackground from '../components/hud/HudBackground';
import UserManagement from '../components/admin/UserManagement';
import NewsManagement from '../components/admin/NewsManagement';
import OrderManagement from '../components/admin/OrderManagement';
import MissionManagement from '../components/admin/MissionManagement';
import { useAuth } from '../contexts/AuthContext';
import { performLogout } from '../services/authService';
import axios from 'axios';
import { API_URL } from '../constants/api';

// Анимации
const blinkAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

// Стили контейнеров
const Container = styled.div`
  padding: 5px 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
  transform: scale(0.90);
`;

const PageTitle = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 36px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  &::before, &::after {
    content: "//";
    color: #cc3000;
    margin: 0 15px;
  }
`;

const StatusBar = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #cc3000;
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

const LogoutButton = styled.button`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #ffffff;
  text-transform: uppercase;
  padding: 6px 12px;
  background: rgba(51, 0, 0, 0.5);
  border: 1px solid #cc3000;
  cursor: pointer;
  margin-left: 20px;
  
  &:hover {
    background: rgba(102, 0, 0, 0.5);
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  margin-bottom: 30px;
`;

// Панель управления (левая часть)
const ControlPanel = styled.div`
  border: 2px solid #cc3000;
  background: rgba(25, 0, 0, 0.5);
  padding-bottom: 20px;
`;

const ControlPanelHeader = styled.div`
  background: rgba(50, 0, 0, 0.5);
  padding: 15px;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 20px;
`;

const NavItem = styled(Link)<{ active?: boolean }>`
  display: block;
  margin: 0 20px 10px;
  padding: 15px;
  text-decoration: none;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  text-transform: uppercase;
  color: #ffffff;
  border: 1px solid ${props => props.active ? '#cc3000' : 'rgba(204, 48, 0, 0.5)'};
  background: ${props => props.active ? 'rgba(50, 0, 0, 0.5)' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(50, 0, 0, 0.5);
    border-color: #cc3000;
  }
`;

const AdminInfo = styled.div`
  margin: 20px;
  padding: 20px;
  background: rgba(25, 0, 0, 0.3);
  border: 1px solid rgba(204, 48, 0, 0.5);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #cc3000;
  line-height: 1.8;
`;

const SystemStatus = styled.div`
  margin: 20px;
  padding: 20px;
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
  
  h3 {
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 20px;
    font-size: 18px;
  }
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px dashed rgba(0, 204, 0, 0.3);
  
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`;

// Разделы в основной части (правая часть)
const MetricsPanel = styled.div`
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  padding: 20px;
  margin-bottom: 20px;
`;

const MetricsHeader = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 24px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const MetricCard = styled.div`
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  padding: 20px;
  text-align: center;
`;

const MetricLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #00cc00;
  margin-bottom: 10px;
`;

const MetricValue = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 48px;
  color: #ffffff;
  margin-bottom: 10px;
`;

const MetricFooter = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
`;

// Таблицы данных
const DataTable = styled.div`
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  margin-bottom: 20px;
`;

const TableHeader = styled.div`
  background: rgba(0, 40, 0, 0.5);
  padding: 15px 20px;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #ffffff;
  text-transform: uppercase;
`;

const TableControls = styled.div`
  text-align: right;
  padding: 10px 20px;
`;

const ViewAllButton = styled(Link)`
  display: inline-block;
  padding: 10px 15px;
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  text-decoration: none;
  text-transform: uppercase;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 180px 150px 150px 150px;
  
  &.activity-table {
    grid-template-columns: 120px 180px 1fr;
  }
`;

const TableHeaderRow = styled.div`
  display: contents;
  
  div {
    background: rgba(0, 40, 0, 0.8);
    padding: 10px 15px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #00cc00;
    border-bottom: 1px solid rgba(0, 204, 0, 0.3);
    border-right: 1px solid rgba(0, 204, 0, 0.1);
    
    &:last-child {
      border-right: none;
    }
  }
`;

const TableDataRow = styled.div`
  display: contents;
  
  div {
    padding: 15px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #ffffff;
    border-bottom: 1px dashed rgba(0, 204, 0, 0.1);
    border-right: 1px solid rgba(0, 204, 0, 0.1);
    
    &:last-child {
      border-right: none;
    }
    
    &.completed {
      color: #00cc00;
    }
    
    &.processing {
      color: #cccc00;
    }
    
    &.cancelled {
      color: #cc3000;
    }
  }
  
  &:last-child div {
    border-bottom: none;
  }
`;

// Панель статистики
const StatsPanel = styled.div`
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  padding: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  
  span:first-child {
    color: #00cc00;
  }
  
  span:last-child {
    color: #ffffff;
  }
`;

const FooterBar = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #cc3000;
  text-align: center;
  margin-top: 60px;
  margin-bottom: 20px;
`;

// Новые стили для управления миссиями
const TabContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid #00cc00;
`;

const TabButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? 'rgba(0, 51, 0, 0.8)' : 'transparent'};
  border: 1px solid #00cc00;
  border-bottom: ${props => props.active ? 'none' : '1px solid #00cc00'};
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 10px 20px;
  cursor: pointer;
  margin-right: 5px;
  margin-bottom: -1px;
  
  &:hover {
    background: rgba(0, 51, 0, 0.5);
  }
`;

const TabContent = styled.div`
  padding: 20px;
  background: rgba(0, 25, 0, 0.3);
  border: 1px solid #00cc00;
  border-top: none;
`;

const ActionButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 8px 15px;
  cursor: pointer;
  margin-right: 10px;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const DeleteButton = styled(ActionButton)`
  border-color: #cc3000;
  color: #cc3000;
  
  &:hover {
    background: rgba(51, 0, 0, 0.5);
  }
`;

const MissionForm = styled.div`
  background: rgba(0, 25, 0, 0.3);
  border: 1px solid #00cc00;
  padding: 20px;
  margin-top: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  margin-bottom: 15px;
  align-items: center;
`;

const FormLabel = styled.label`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #ffffff;
`;

const FormInput = styled.input`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
`;

const FormSelect = styled.select`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
`;

const FormTextarea = styled.textarea`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
  min-height: 100px;
`;

const SubmitButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  padding: 12px 25px;
  cursor: pointer;
  margin-top: 20px;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
`;

const SearchButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 0 20px;
  cursor: pointer;
`;

// Интерфейсы данных
interface Order {
  id: string;
  user: string;
  amount: number;
  status: 'COMPLETED' | 'PROCESSING' | 'CANCELLED';
  date: string;
}

interface Activity {
  time: string;
  user: string;
  action: string;
}

const AdminPage: React.FC = () => {
  // Демо-данные
  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD-9542', user: 'JOHNSON, T.', amount: 3500, status: 'COMPLETED', date: '05/06/25' },
    { id: 'ORD-9541', user: 'MILLER, A.', amount: 5750, status: 'PROCESSING', date: '05/06/25' },
    { id: 'ORD-9540', user: 'WILSON, S.', amount: 2800, status: 'COMPLETED', date: '05/05/25' },
    { id: 'ORD-9539', user: 'BROWN, J.', amount: 4200, status: 'CANCELLED', date: '05/05/25' }
  ]);
  
  const [activities, setActivities] = useState<Activity[]>([
    { time: '17:42:15', user: 'JOHNSON, T.', action: 'COMPLETED MISSION ASM-001' },
    { time: '16:37:22', user: 'MILLER, A.', action: 'PLACED ORDER ORD-9541' },
    { time: '15:15:47', user: 'PARKER, H.', action: 'REGISTERED NEW ACCOUNT' },
    { time: '14:28:05', user: 'BROWN, J.', action: 'CANCELLED ORDER ORD-9539' }
  ]);
  
  const [stats, setStats] = useState({
    totalUsers: 1245,
    userGrowth: '+12% THIS MONTH',
    activeMissions: 78,
    deploymentRate: '92%',
    totalRevenue: 457890,
    revenueToday: 12450,
    revenueMonth: 87320,
    averageOrder: 3250,
    popularMission: 'GHOST PROTOCOL',
    growthRate: '+15.4%'
  });
  
  const [systemStatus, setSystemStatus] = useState({
    apiServer: 'ONLINE',
    database: 'OPTIMAL',
    memory: '64%',
    uptime: '18d 3h 27m'
  });
  
  // Состояние для админ-панели
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  
  // Генерация ID сессии
  const sessionId = `SES-${Math.floor(Math.random() * 1000000)}`;
  
  // Функция для получения текущей даты
  const getCurrentDate = () => {
    const date = new Date();
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Принудительная проверка токена каждые 5 секунд
  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        // Выполняем тестовый запрос к API, требующему авторизацию
        await axios.get(`${API_URL}/api/admin/users?page=1&pageSize=1`);
      } catch (error) {
        // Если получена ошибка 401, выполняем немедленный выход
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log('Токен администратора недействителен, выполняем принудительный выход');
          performLogout();
          
          // Дополнительная страховка - прямое перенаправление без использования React Router
          window.location.href = '/';
        }
      }
    };
    
    // Запускаем проверку при монтировании компонента
    checkTokenValidity();
    
    // Проверяем токен каждые 5 секунд
    const interval = setInterval(checkTokenValidity, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const renderDashboard = () => (
    <>
      <MetricsPanel>
        <MetricsHeader>SYSTEM METRICS</MetricsHeader>
        <MetricsGrid>
          <MetricCard>
            <MetricLabel>TOTAL USERS</MetricLabel>
            <MetricValue>{stats.totalUsers.toLocaleString()}</MetricValue>
            <MetricFooter>{stats.userGrowth}</MetricFooter>
          </MetricCard>
          <MetricCard>
            <MetricLabel>ACTIVE MISSIONS</MetricLabel>
            <MetricValue>{stats.activeMissions}</MetricValue>
            <MetricFooter>DEPLOYMENT RATE: {stats.deploymentRate}</MetricFooter>
          </MetricCard>
        </MetricsGrid>
      </MetricsPanel>
      
      <DataTable>
        <TableHeader>RECENT ORDERS</TableHeader>
        <TableGrid>
          <TableHeaderRow>
            <div>ORDER ID</div>
            <div>USER</div>
            <div>AMOUNT</div>
            <div>STATUS</div>
            <div>DATE</div>
          </TableHeaderRow>
          
          {orders.map(order => (
            <TableDataRow key={order.id}>
              <div>{order.id}</div>
              <div>{order.user}</div>
              <div>{order.amount.toLocaleString()} ₽</div>
              <div className={order.status.toLowerCase()}>{order.status}</div>
              <div>{order.date}</div>
            </TableDataRow>
          ))}
        </TableGrid>
        <TableControls>
          <ViewAllButton to="/admin/orders">VIEW ALL ORDERS</ViewAllButton>
        </TableControls>
      </DataTable>
      
      <DataTable>
        <TableHeader>RECENT USER ACTIVITY</TableHeader>
        <TableGrid className="activity-table">
          <TableHeaderRow>
            <div>TIME</div>
            <div>USER</div>
            <div>ACTION</div>
          </TableHeaderRow>
          
          {activities.map((activity, index) => (
            <TableDataRow key={index}>
              <div>{activity.time}</div>
              <div>{activity.user}</div>
              <div>{activity.action}</div>
            </TableDataRow>
          ))}
        </TableGrid>
        <TableControls>
          <ViewAllButton to="/admin/activity">VIEW ALL ACTIVITY</ViewAllButton>
        </TableControls>
      </DataTable>
      
      <StatsPanel>
        <MetricsHeader>REVENUE STATISTICS</MetricsHeader>
        <StatsGrid>
          <div>
            <StatItem>
              <span>TOTAL REVENUE:</span>
              <span>{stats.totalRevenue.toLocaleString()} ₽</span>
            </StatItem>
            <StatItem>
              <span>REVENUE TODAY:</span>
              <span>{stats.revenueToday.toLocaleString()} ₽</span>
            </StatItem>
            <StatItem>
              <span>REVENUE THIS MONTH:</span>
              <span>{stats.revenueMonth.toLocaleString()} ₽</span>
            </StatItem>
          </div>
          <div>
            <StatItem>
              <span>AVERAGE ORDER VALUE:</span>
              <span>{stats.averageOrder.toLocaleString()} ₽</span>
            </StatItem>
            <StatItem>
              <span>MOST POPULAR MISSION:</span>
              <span>{stats.popularMission}</span>
            </StatItem>
            <StatItem>
              <span>GROWTH RATE:</span>
              <span>{stats.growthRate}</span>
            </StatItem>
          </div>
        </StatsGrid>
      </StatsPanel>
    </>
  );
  
  const renderMissionManagement = () => (
    <>
      <MissionManagement />
    </>
  );

  return (
    <HudBackground>
      <Container>
        <PageTitle>COMMAND CENTRAL</PageTitle>
        <StatusBar>
          ADMIN ACCESS LEVEL: ALPHA • ENCRYPTION: ACTIVE • SESSION ID: {sessionId}
          <LogoutButton onClick={handleLogout}>LOGOUT</LogoutButton>
        </StatusBar>
        
        <MainContent>
          {/* Левая панель с навигацией */}
          <div>
            <ControlPanel>
              <ControlPanelHeader>CONTROL PANEL</ControlPanelHeader>
              <NavItem to="#" active={activeSection === 'dashboard'} onClick={() => setActiveSection('dashboard')}>DASHBOARD</NavItem>
              <NavItem to="#" active={activeSection === 'missions'} onClick={() => setActiveSection('missions')}>MISSIONS</NavItem>
              <NavItem to="#" active={activeSection === 'users'} onClick={() => setActiveSection('users')}>USERS</NavItem>
              <NavItem to="#" active={activeSection === 'news'} onClick={() => setActiveSection('news')}>NEWS</NavItem>
              <NavItem to="#" active={activeSection === 'comments'} onClick={() => setActiveSection('comments')}>COMMENTS</NavItem>
              <NavItem to="#" active={activeSection === 'orders'} onClick={() => setActiveSection('orders')}>ORDERS</NavItem>
            </ControlPanel>
            
            <AdminInfo>
              ADMIN: COMMANDER ALPHA<br />
              LAST LOGIN: {getCurrentDate()}<br />
              SECURITY: MAXIMUM
            </AdminInfo>
            
            <SystemStatus>
              <h3>SYSTEM STATUS</h3>
              <StatusItem>
                <span>API SERVER:</span>
                <span>{systemStatus.apiServer}</span>
              </StatusItem>
              <StatusItem>
                <span>DATABASE:</span>
                <span>{systemStatus.database}</span>
              </StatusItem>
              <StatusItem>
                <span>MEMORY:</span>
                <span>{systemStatus.memory}</span>
              </StatusItem>
              <StatusItem>
                <span>UPTIME:</span>
                <span>{systemStatus.uptime}</span>
              </StatusItem>
            </SystemStatus>
          </div>
          
          {/* Правая панель с метриками и данными */}
          <div>
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'missions' && renderMissionManagement()}
            {activeSection === 'users' && <UserManagement />}
            {activeSection === 'news' && <NewsManagement />}
            {activeSection === 'orders' && <OrderManagement />}
          </div>
        </MainContent>
        
        <FooterBar>
          © 2025 NOVAWARFARE • ADMIN CONSOLE v2.3.1 • ACCESS LEVEL: ALPHA CLEARANCE
        </FooterBar>
      </Container>
    </HudBackground>
  );
};

export default AdminPage; 