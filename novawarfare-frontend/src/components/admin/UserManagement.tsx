import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/adminService';
import { User, UserCreateRequest, UserListResponse, UserUpdateRequest } from '../../types/user';
import { GAME_DISPLAY_PREFERENCE } from '../../constants/gameDisplayPreference';

// Стили
const Container = styled.div`
  margin-bottom: 20px;
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

const DataTable = styled.div`
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  margin-bottom: 20px;
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 60px 180px 200px 120px 100px 140px;
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
    
    &.active {
      color: #00cc00;
    }
    
    &.inactive {
      color: #cc3000;
    }
    
    &.pending {
      color: #cccc00;
    }
    
    &.admin {
      color: #ff9900;
      font-weight: bold;
    }
    
    &.customer {
      color: #66ccff;
    }
  }
  
  &:last-child div {
    border-bottom: none;
  }
`;

const ActionButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 8px 10px;
  cursor: pointer;
  margin-right: 5px;
  
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
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

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const SubmitButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  padding: 12px 25px;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
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
  font-size: 36px;
  color: #ffffff;
  margin-bottom: 10px;
`;

const MetricFooter = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
`;

const UserManagement: React.FC = () => {
  // State для загрузки и ошибок
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // State для пользователей
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [changePassword, setChangePassword] = useState<boolean>(false);
  
  // Возможные роли пользователей
  const userRoles = {
    ADMIN: "Admin" as const,
    CUSTOMER: "Customer" as const
  };
  
  // Возможные статусы пользователей
  const userStatuses = {
    ACTIVE: "Active" as const,
    PENDING: "Pending" as const,
    DELETED: "Deleted" as const,
    LOCKED: "Locked" as const
  };
  
  const defaultUser: User = {
    id: `USR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    name: '',
    email: '',
    role: userRoles.CUSTOMER,
    status: userStatuses.ACTIVE,
    lastLogin: 'N/A',
    isActive: true,
    emailVerified: false,
    
    // Ранги и очки для airsoft
    airsoftHumanRank: 1,
    airsoftHumanRankName: 'Новобранец',
    airsoftHumanPoints: 0,
    airsoftAlienRank: 1,
    airsoftAlienRankName: 'Послушник',
    airsoftAlienPoints: 0,
    
    // Ранги и очки для paintball
    paintballHumanRank: 1,
    paintballHumanRankName: 'Новобранец',
    paintballHumanPoints: 0,
    paintballAlienRank: 1,
    paintballAlienRankName: 'Послушник',
    paintballAlienPoints: 0,
    
    // Статистика миссий
    airsoftMissions: 0,
    airsoftWins: 0,
    airsoftWinRate: 0,
    paintballMissions: 0,
    paintballWins: 0,
    paintballWinRate: 0,
    
    // Базы и локация
    state: '',
    primaryBase: '',
    secondaryBases: [],
    
    // Достижения
    achievements: [],
    
    // Настройки отображения
    gameDisplayPreference: GAME_DISPLAY_PREFERENCE.ALL_GAMES,
    
    // Временные метки
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const [editUser, setEditUser] = useState<User>({...defaultUser});
  
  // Загрузка пользователей при монтировании
  useEffect(() => {
    fetchUsers();
    
    // Устанавливаем интервал для обновления списка каждые 5 минут
    const intervalId = setInterval(() => {
      fetchUsers();
    }, 300000); // 5 минут (300000 мс)
    
    // Очищаем интервал при размонтировании компонента
    return () => clearInterval(intervalId);
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getUsers(1, 100);
      setUsers(response.users);
    } catch (err) {
      setError('Ошибка при загрузке пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddUser = () => {
    setCurrentUser(null);
    setEditUser({...defaultUser});
    setIsModalOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    
    // Убедимся, что у пользователя правильные значения для role и status
    const userWithValidTypes: User = {
      ...user,
      role: (user.role === 'Admin' ? userRoles.ADMIN : userRoles.CUSTOMER),
      status: (
        user.status === 'Active' ? userStatuses.ACTIVE :
        user.status === 'Pending' ? userStatuses.PENDING :
        user.status === 'Deleted' ? userStatuses.DELETED :
        userStatuses.LOCKED
      )
    };
    
    setEditUser(userWithValidTypes);
    setNewPassword('');
    setChangePassword(false);
    setIsModalOpen(true);
  };
  
  const handleDeleteUser = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Оптимистично удаляем пользователя из UI перед отправкой запроса
      const userToDelete = users.find(user => user.id === id);
      if (userToDelete) {
        const displayName = typeof userToDelete.name === 'string' && userToDelete.name 
          ? userToDelete.name 
          : userToDelete.id;
          
        setSuccessMessage(`Удаление пользователя ${displayName}...`);
      }
      
      // Удаляем с сервера
      await deleteUser(id);
      
      // Обновляем список после удаления
      await fetchUsers();
      
      // Обновляем сообщение
      if (userToDelete) {
        const displayName = typeof userToDelete.name === 'string' && userToDelete.name 
          ? userToDelete.name 
          : userToDelete.id;
          
        setSuccessMessage(`Пользователь ${displayName} успешно удален`);
      } else {
        setSuccessMessage('Пользователь успешно удален');
      }
      
      // Очищаем сообщение через 3 секунды
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError('Ошибка при удалении пользователя');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveUser = async () => {
    try {
      console.log("handleSaveUser called", { currentUser, editUser });
      
      // Проверка валидности данных
      if (!editUser.name.trim()) {
        setError('Имя пользователя не может быть пустым');
        return;
      }
      
      if (!editUser.email.trim()) {
        setError('Email пользователя не может быть пустым');
        return;
      }
      
      // Простая валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editUser.email)) {
        setError('Пожалуйста, укажите корректный email');
        return;
      }
      
      // Проверка пароля при изменении
      if (currentUser && changePassword && newPassword.length < 8) {
        setError('Пароль должен содержать не менее 8 символов');
        return;
      }
      
      setLoading(true);
      setError('');
      
      if (currentUser) {
        // Обновление всех данных пользователя
        const userUpdateData: UserUpdateRequest = {
          id: currentUser.id,
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
          status: editUser.status
        };
        
        // Добавляем пароль, если его нужно изменить
        if (changePassword && newPassword) {
          userUpdateData.password = newPassword;
        }
        
        console.log("Вызываем updateUser с данными:", JSON.stringify(userUpdateData));
        
        try {
          const result = await updateUser(userUpdateData);
          console.log("Результат updateUser:", result);
          
          // Обновляем список пользователей
          await fetchUsers();
          setSuccessMessage('Данные пользователя успешно обновлены');
          
          // Закрываем модальное окно
          setIsModalOpen(false);
          setCurrentUser(null);
          setEditUser({...defaultUser, id: `USR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`});
          
          // Очищаем сообщение об успехе через 3 секунды
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        } catch (error: any) {
          console.error("Ошибка при вызове updateUser:", error);
          setError(`Ошибка при обновлении пользователя: ${error?.message || 'Неизвестная ошибка'}`);
        }
      } else {
        // Создание нового пользователя
        const userCreateData: UserCreateRequest = {
          name: editUser.name,
          email: editUser.email,
          password: 'DefaultPassword123!', // Временный пароль
          role: editUser.role,
          status: editUser.status
        };
        
        console.log("Вызываем createUser с данными:", JSON.stringify(userCreateData));
        
        try {
          await createUser(userCreateData);
          
          // Обновляем список пользователей после создания
          await fetchUsers();
          setSuccessMessage('Пользователь успешно создан');
          
          // Закрываем модальное окно
          setIsModalOpen(false);
          setCurrentUser(null);
          setEditUser({...defaultUser, id: `USR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`});
          
          // Очищаем сообщение об успехе через 3 секунды
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        } catch (error: any) {
          console.error("Ошибка при вызове createUser:", error);
          setError(`Ошибка при создании пользователя: ${error?.message || 'Неизвестная ошибка'}`);
        }
      }
    } catch (err: any) {
      console.error("Общая ошибка в handleSaveUser:", err);
      setError(`Ошибка при сохранении пользователя: ${err?.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const nameMatch = typeof user.name === 'string' && user.name.toLowerCase().includes(query);
    const emailMatch = typeof user.email === 'string' && user.email.toLowerCase().includes(query);
    const idMatch = typeof user.id === 'string' && user.id.toLowerCase().includes(query);
    return nameMatch || emailMatch || idMatch;
  });
  
  // Метрики пользователей
  const activeUsers = users.filter(user => 
    typeof user.status === 'string' && user.status === userStatuses.ACTIVE
  ).length;
  
  const pendingUsers = users.filter(user => 
    typeof user.status === 'string' && user.status === userStatuses.PENDING
  ).length;

  const deletedUsers = users.filter(user => 
    typeof user.status === 'string' && user.status === userStatuses.DELETED
  ).length;
  
  const lockedUsers = users.filter(user => 
    typeof user.status === 'string' && user.status === userStatuses.LOCKED
  ).length;
  
  const totalUsers = users.length;
  const activePercentage = totalUsers > 0 ? Math.round(activeUsers / totalUsers * 100) : 0;

  // Добавляем обработчик поиска
  const handleSearch = () => {
    fetchUsers();
  };

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'Courier New, monospace', color: '#ffffff', margin: 0 }}>
          USER MANAGEMENT
        </h2>
        <ActionButton onClick={handleAddUser}>+ NEW USER</ActionButton>
      </div>
      
      {successMessage && (
        <div style={{ 
          background: 'rgba(0, 204, 0, 0.2)', 
          border: '1px solid #00cc00',
          padding: '10px',
          marginBottom: '20px',
          color: '#00cc00',
          fontFamily: 'Courier New, monospace'
        }}>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div style={{ 
          background: 'rgba(204, 0, 0, 0.2)', 
          border: '1px solid #cc0000',
          padding: '10px',
          marginBottom: '20px',
          color: '#cc0000',
          fontFamily: 'Courier New, monospace'
        }}>
          {error}
        </div>
      )}
      
      <MetricsGrid>
        <MetricCard>
          <MetricLabel>ACTIVE USERS</MetricLabel>
          <MetricValue>{activeUsers}</MetricValue>
          <MetricFooter>{activePercentage}% OF TOTAL</MetricFooter>
        </MetricCard>
        <MetricCard>
          <MetricLabel>PENDING USERS</MetricLabel>
          <MetricValue>{pendingUsers}</MetricValue>
          <MetricFooter>ACTION REQUIRED</MetricFooter>
        </MetricCard>
        <MetricCard>
          <MetricLabel>LOCKED USERS</MetricLabel>
          <MetricValue>{lockedUsers}</MetricValue>
          <MetricFooter>SECURITY MEASURE</MetricFooter>
        </MetricCard>
      </MetricsGrid>
      
      <SearchBar>
        <SearchInput 
          type="text"
          placeholder="SEARCH USERS..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <SearchButton onClick={handleSearch}>
          {loading ? 'ПОИСК...' : 'ПОИСК'}
        </SearchButton>
      </SearchBar>
      
      <DataTable>
        <TableGrid>
          <TableHeaderRow>
            <div>#</div>
            <div>NAME</div>
            <div>EMAIL</div>
            <div>ROLE</div>
            <div>STATUS</div>
            <div>ACTIONS</div>
          </TableHeaderRow>
          
          {loading ? (
            <TableDataRow>
              <div style={{gridColumn: 'span 6', textAlign: 'center', padding: '30px 0'}}>
                <div style={{color: '#00cc00', animation: 'blink 1s infinite'}}>Загрузка пользователей...</div>
              </div>
            </TableDataRow>
          ) : error ? (
            <TableDataRow>
              <div style={{gridColumn: 'span 6'}}>{error}</div>
            </TableDataRow>
          ) : filteredUsers.length === 0 ? (
            <TableDataRow>
              <div style={{gridColumn: 'span 6'}}>No users found</div>
            </TableDataRow>
          ) : (
            filteredUsers.map((user, index) => (
              <TableDataRow key={user.id}>
                <div>{index + 1}</div>
                <div>{user.name || `User ${user.id.substring(0, 6)}`}</div>
                <div>{user.email}</div>
                <div className={user.role && typeof user.role === 'string' ? user.role.toLowerCase() : 'unknown'}>
                  {user.role || 'UNKNOWN'}
                </div>
                <div className={user.status && typeof user.status === 'string' ? user.status.toLowerCase() : 'unknown'}>
                  {user.status || 'UNKNOWN'}
                </div>
                <div>
                  <ActionButton onClick={() => handleEditUser(user)}>EDIT</ActionButton>
                  <DeleteButton onClick={() => handleDeleteUser(user.id)}>DELETE</DeleteButton>
                </div>
              </TableDataRow>
            ))
          )}
        </TableGrid>
      </DataTable>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={currentUser ? 'EDIT USER' : 'ADD NEW USER'}
      >
        <FormRow>
          <FormLabel>USER ID:</FormLabel>
          <FormInput 
            type="text" 
            value={editUser.id}
            disabled
          />
        </FormRow>
        
        <FormRow>
          <FormLabel>NAME:</FormLabel>
          <FormInput 
            type="text" 
            name="name"
            value={editUser.name}
            onChange={handleInputChange}
            placeholder="Enter user name"
          />
        </FormRow>
        
        <FormRow>
          <FormLabel>EMAIL:</FormLabel>
          <FormInput 
            type="email" 
            name="email"
            value={editUser.email}
            onChange={handleInputChange}
            placeholder="Enter user email"
          />
        </FormRow>
        
        <FormRow>
          <FormLabel>ROLE:</FormLabel>
          <FormSelect 
            name="role"
            value={editUser.role}
            onChange={handleInputChange}
          >
            <option value={userRoles.CUSTOMER}>CUSTOMER</option>
            <option value={userRoles.ADMIN}>ADMIN</option>
          </FormSelect>
        </FormRow>
        
        <FormRow>
          <FormLabel>STATUS:</FormLabel>
          <FormSelect 
            name="status"
            value={editUser.status}
            onChange={handleInputChange}
          >
            <option value={userStatuses.ACTIVE}>ACTIVE</option>
            <option value={userStatuses.PENDING}>PENDING</option>
            <option value={userStatuses.DELETED}>DELETED</option>
            <option value={userStatuses.LOCKED}>LOCKED</option>
          </FormSelect>
        </FormRow>
        
        {currentUser && (
          <div style={{ marginBottom: '15px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '10px' 
            }}>
              <input 
                type="checkbox" 
                id="changePassword" 
                checked={changePassword} 
                onChange={e => setChangePassword(e.target.checked)} 
                style={{ marginRight: '10px' }}
              />
              <label 
                htmlFor="changePassword"
                style={{ 
                  fontFamily: 'Courier New, monospace',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                CHANGE PASSWORD
              </label>
            </div>
            
            {changePassword && (
              <FormRow>
                <FormLabel>NEW PASSWORD:</FormLabel>
                <FormInput 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </FormRow>
            )}
          </div>
        )}
        
        {!currentUser && (
          <div style={{ 
            padding: '10px',
            margin: '15px 0',
            background: 'rgba(0, 204, 0, 0.1)',
            border: '1px solid #00cc00',
            borderRadius: '4px',
            fontFamily: 'Courier New, monospace',
            fontSize: '14px',
            color: '#00cc00'
          }}>
            Пароль по умолчанию будет установлен: "DefaultPassword123!"
          </div>
        )}
        
        <ButtonContainer>
          <ActionButton onClick={() => setIsModalOpen(false)}>CANCEL</ActionButton>
          <SubmitButton 
            onClick={(e) => {
              console.log("SubmitButton clicked");
              e.preventDefault();
              handleSaveUser();
            }}
          >
            {currentUser ? 'UPDATE USER' : 'CREATE USER'}
          </SubmitButton>
        </ButtonContainer>
      </Modal>
    </Container>
  );
};

export default UserManagement; 