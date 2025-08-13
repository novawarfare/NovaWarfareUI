import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { Player, PlayerGameStats, RankProgress } from '../types/user';
import GameFieldSelector from '../components/common/GameFieldSelector';
import MultiGameFieldSelector from '../components/common/MultiGameFieldSelector';
import { ALL_STATES_OPTION, getStatesWithAllOption } from '../constants/states';
import { GAME_DISPLAY_PREFERENCE_OPTIONS, GAME_DISPLAY_PREFERENCE, GameDisplayPreference } from '../constants/gameDisplayPreference';
import { useNotification } from '../hooks/useNotification';
import NotificationContainer from '../components/common/NotificationContainer';

type TabType = 'overview' | 'edit';

interface EditFormData {
  name: string;
  email: string;
  state: string;
  primaryBase: string;
  secondaryBases: string[];
  gameDisplayPreference: GameDisplayPreference;
}

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: rgba(0, 25, 0, 0.5);
  padding: 20px;
  padding-top: 100px;
  
  @media (max-width: 768px) {
    padding-top: 90px;
    padding: 10px;
    padding-top: 90px;
  }
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  position: relative;
`;

const Title = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 5px;
  font-weight: normal;
`;

const Subtitle = styled.p`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00d4ff;
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  margin-bottom: 30px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    margin-bottom: 25px;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  @media (max-width: 480px) {
    margin-bottom: 20px;
    gap: 2px;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'rgba(0, 212, 255, 0.1)' : 'transparent'};
  border: none;
  color: ${props => props.$active ? '#00d4ff' : '#b0b0b0'};
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid ${props => props.$active ? '#00d4ff' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  flex-shrink: 0;
  white-space: nowrap;

  &:hover {
    color: #00d4ff;
    background: rgba(0, 212, 255, 0.05);
  }

  @media (max-width: 768px) {
    padding: 15px 12px;
    font-size: 0.85rem;
    flex: 1;
    text-align: center;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  @media (max-width: 480px) {
    padding: 12px 8px;
    font-size: 0.8rem;
    min-width: 80px;
    gap: 1px;
  }
`;

const TabText = styled.span`
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  .short-text {
    display: none;
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    line-height: 1.2;
  }

  @media (max-width: 480px) {
    .full-text {
      display: none;
    }
    
    .short-text {
      display: inline;
    }
  }
`;

const TabContent = styled.div`
  width: 100%;
  min-height: 400px;
`;

const EditSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 20px;
  padding: 20px;
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
    padding: 25px;
    border-radius: 15px;
  }

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label<{ disabled?: boolean }>`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: ${props => props.disabled ? '#666' : '#00d4ff'};
  text-transform: uppercase;
  font-weight: bold;
`;

const Input = styled.input`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  color: #ffffff;
  border-radius: 4px;
  
  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 5px rgba(0, 212, 255, 0.3);
  }
  
  &::placeholder {
    color: #666;
  }
`;

const Select = styled.select`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  color: #ffffff;
  border-radius: 4px;
  
  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 5px rgba(0, 212, 255, 0.3);
  }
  
  option {
    background: rgba(0, 0, 0, 0.9);
    color: #ffffff;
  }
`;

const HelpText = styled.p`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #888;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const SaveButton = styled.button`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px 24px;
  background: #00d4ff;
  color: #000000;
  border: 2px solid #00d4ff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: bold;
  border-radius: 4px;
  
  &:hover {
    background: #00a8cc;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }
`;

const CancelButton = styled.button`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px 24px;
  background: rgba(204, 0, 0, 0.1);
  color: #cc0000;
  border: 2px solid #cc0000;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: bold;
  border-radius: 4px;
  
  &:hover {
    background: rgba(204, 0, 0, 0.2);
    box-shadow: 0 0 10px rgba(204, 0, 0, 0.3);
  }
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 20px;
  padding: 20px;
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
    padding: 25px;
    border-radius: 15px;
  }

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const SectionHeader = styled.div`
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const SectionTitle = styled.h2`
  color: #00d4ff;
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    text-align: center;
  }
`;

const SectionContent = styled.div`
  /* Контент уже в блоке Section */
`;

const OverviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const InfoColumn = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #ffffff;
  line-height: 1.6;
`;

const InfoLine = styled.div`
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
`;

const Label = styled.span`
  color: #00d4ff;
  text-transform: uppercase;
  font-weight: bold;
`;

const Value = styled.span`
  color: #ffffff;
  margin-left: 10px;
`;

const ClanLink = styled.span`
  color: #00d4ff;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: #00a8cc;
  }
`;

const ClanInfo = styled.div`
  margin-bottom: 5px;
`;

const ClanSection = styled.div`
  margin-bottom: 15px;
`;

const ClanRole = styled.span`
  color: #b0b0b0;
  font-weight: normal;
  font-size: 12px;
`;

const RanksTable = styled.div`
  border: 1px solid rgba(0, 212, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: ${props => Array(props.$columns).fill('1fr').join(' ')};
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const TableHeaderCell = styled.div`
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00d4ff;
  text-transform: uppercase;
  font-weight: bold;
  background: rgba(0, 212, 255, 0.1);
  border-right: 1px solid rgba(0, 212, 255, 0.2);
  
  &:last-child {
    border-right: none;
  }
  
  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 12px;
  }
`;

const TableRow = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: ${props => Array(props.$columns).fill('1fr').join(' ')};
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.div`
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #ffffff;
  border-right: 1px solid rgba(0, 212, 255, 0.1);
  
  &:last-child {
    border-right: none;
  }
  
  @media (max-width: 768px) {
    padding: 12px 8px;
    font-size: 12px;
  }
`;

const FactionTitle = styled.div`
  font-size: 16px;
  color: #00d4ff;
  font-weight: bold;
  margin-bottom: 15px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 18px;
    text-align: center;
  }
`;

const RankInfo = styled.div`
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
  
  @media (max-width: 768px) {
    height: 10px;
    margin: 12px 0;
  }
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #0099cc);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 12px;
  color: #b0b0b0;
  text-align: center;
  margin-top: 4px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const GameTypeSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 2px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 25px;
  }
`;

const GameTypeButton = styled.button<{ active: boolean }>`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px 24px;
  background: ${props => props.active ? '#00d4ff' : 'rgba(0, 212, 255, 0.1)'};
  color: ${props => props.active ? '#000000' : '#00d4ff'};
  border: 2px solid #00d4ff;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: bold;
  transition: all 0.3s ease;
  
  &:first-child {
    border-right: none;
  }
  
  &:last-child {
    border-left: none;
  }
  
  &:hover {
    background: ${props => props.active ? '#00d4ff' : 'rgba(0, 212, 255, 0.2)'};
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }
`;

const RanksDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const RankCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    padding: 25px;
    border-radius: 15px;
  }

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const RankTitle = styled.h3`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #00d4ff;
  margin-bottom: 15px;
  text-transform: uppercase;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const RankHistory = styled.div`
  margin-top: 20px;
`;

const HistoryTitle = styled.h4`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00d4ff;
  margin-bottom: 10px;
  text-transform: uppercase;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 15px;
    text-align: center;
  }
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const HistoryItem = styled.li`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #ffffff;
  margin-bottom: 5px;
  padding-left: 10px;
  position: relative;
  
  &:before {
    content: '•';
    color: #00d4ff;
    position: absolute;
    left: 0;
  }
`;

const MissionFilters = styled.div`
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #ffffff;
  text-align: center;
`;

const MissionStats = styled.div`
  margin-bottom: 20px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #ffffff;
  text-align: center;
`;

const MissionTable = styled.div`
  border: 1px solid rgba(0, 212, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  overflow-x: auto;
`;

const MissionTableHeader = styled.div`
  display: grid;
  grid-template-columns: 60px 120px 80px 80px 80px 120px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  min-width: 540px;
  
  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const MissionTableRow = styled.div`
  display: grid;
  grid-template-columns: 60px 120px 80px 80px 80px 120px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  min-width: 540px;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const MissionTableCell = styled.div`
  padding: 10px 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #ffffff;
  border-right: 1px solid rgba(0, 212, 255, 0.1);
  text-align: center;
  
  &:last-child {
    border-right: none;
  }
  
  @media (max-width: 768px) {
    padding: 8px 5px;
    font-size: 10px;
  }
`;

const MissionTableHeaderCell = styled(MissionTableCell)`
  color: #00d4ff;
  text-transform: uppercase;
  background: rgba(0, 212, 255, 0.1);
  font-weight: bold;
`;

const LoadMoreButton = styled.button`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 8px 16px;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid #00d4ff;
  color: #00d4ff;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(0, 212, 255, 0.2);
    color: #ffffff;
    box-shadow: 0 0 5px rgba(0, 212, 255, 0.3);
  }
`;

const LoadingMessage = styled.div`
  font-family: 'Courier New', monospace;
  color: #00d4ff;
  text-align: center;
  margin: 20px 0;
  font-size: 18px;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin: 30px 0;
  }
`;

const ErrorMessage = styled.div`
  font-family: 'Courier New', monospace;
  color: #cc3000;
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  border: 1px dashed #cc3000;
  background: rgba(51, 0, 0, 0.2);
  border-radius: 8px;
  
  @media (max-width: 768px) {
    margin: 30px 0;
    padding: 20px;
    font-size: 16px;
  }
`;

const NoDataMessage = styled.div`
  font-family: 'Courier New', monospace;
  color: #b0b0b0;
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
  font-style: italic;
  
  @media (max-width: 768px) {
    padding: 50px 25px;
    font-size: 16px;
  }
`;

// Component
const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { userId, id } = useParams<{ userId: string; id: string }>();
  const navigate = useNavigate();
  
  // Инициализация состояний с учетом gameDisplayPreference
  const getInitialGameType = (playerData: Player | null): 'airsoft' | 'paintball' => {
    if (!playerData) return 'airsoft';
    
    switch (playerData.gameDisplayPreference) {
      case GAME_DISPLAY_PREFERENCE.AIRSOFT_ONLY:
        return 'airsoft';
      case GAME_DISPLAY_PREFERENCE.PAINTBALL_ONLY:
        return 'paintball';
      default:
        return 'airsoft';
    }
  };
  
  const [gameType, setGameType] = useState<'airsoft' | 'paintball'>('airsoft');
  const [missionHistoryGameType, setMissionHistoryGameType] = useState<'airsoft' | 'paintball'>('airsoft');
  const [loading, setLoading] = useState(true);
  const [ranksLoading, setRanksLoading] = useState(false);
  const [error, setError] = useState('');
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [statsData, setStatsData] = useState<PlayerGameStats | null>(null);
  const [rankProgress, setRankProgress] = useState<{
    human: RankProgress | null;
    alien: RankProgress | null;
  }>({ human: null, alien: null });
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { notifications, showSuccess, showError, removeNotification } = useNotification();

  const currentUserId = userId || id || user?.id;
  const isOwnProfile = user && ((!userId && !id) || userId === user.id || id === user.id);

  // Логика для определения видимости кнопок переключения
  const shouldShowGameTypeSelector = (playerData: Player | null): boolean => {
    if (!playerData) return true;
    return playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES;
  };

  const handleClanClick = (clanId: string) => {
    navigate(`/clans/${clanId}`);
  };

  // Состояние для формы редактирования
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    state: '',
    primaryBase: '',
    secondaryBases: [] as string[],
    gameDisplayPreference: GAME_DISPLAY_PREFERENCE.AIRSOFT_ONLY as GameDisplayPreference
  });

  // Инициализация формы редактирования
  useEffect(() => {
    if (playerData && activeTab === 'edit') {
      setEditFormData({
        name: playerData.name || '',
        email: playerData.email || '',
        state: playerData.state || '',
        primaryBase: playerData.primaryBase || '',
        secondaryBases: playerData.secondaryBases || [],
        gameDisplayPreference: (playerData.gameDisplayPreference as GameDisplayPreference) || GAME_DISPLAY_PREFERENCE.AIRSOFT_ONLY
      });
    }
  }, [playerData, activeTab]);

  const handleSaveProfile = async () => {
    // Проверяем права доступа
    if (!user || !isOwnProfile || !currentUserId) {
      showError('Unauthorized attempt to save profile', 'error');
      return;
    }

    try {
      const updatedPlayer = await userService.updatePlayerProfile(currentUserId, editFormData);
      setPlayerData(updatedPlayer);
      
      // Если изменилось gameDisplayPreference, обновляем состояния типов игр
      if (editFormData.gameDisplayPreference) {
        const initialGameType = getInitialGameType(updatedPlayer);
        setGameType(initialGameType);
        setMissionHistoryGameType(initialGameType);
      }
      
      showSuccess('Profile updated successfully!', 'success');
      setActiveTab('overview');
    } catch (error) {
      showError('Failed to update profile', 'error');
    }
  };

  const handleEditFormChange = (field: keyof EditFormData, value: string | string[]) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrimaryBaseChange = (value: string) => {
    setEditFormData(prev => ({ ...prev, primaryBase: value }));
  };

  const handleSecondaryBasesChange = (value: string[]) => {
    setEditFormData(prev => ({ ...prev, secondaryBases: value }));
  };

  const isAllStatesSelected = editFormData.state === ALL_STATES_OPTION || editFormData.state === '';
  const excludedFields = [editFormData.primaryBase, ...editFormData.secondaryBases].filter(Boolean);

  // Загрузка профиля пользователя (только при смене пользователя)
  useEffect(() => {
    const fetchPlayerProfile = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const playerProfile = await userService.getPlayerProfile(currentUserId);
        setPlayerData(playerProfile);
        
        // Обновляем состояния типов игр в зависимости от gameDisplayPreference
        const initialGameType = getInitialGameType(playerProfile);
        setGameType(initialGameType);
        setMissionHistoryGameType(initialGameType);
        
        setError('');
      } catch (err) {
        console.error('Error loading player profile:', err);
        setError('Failed to load player profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerProfile();
  }, [currentUserId]);

  // Загрузка данных рангов (при смене типа игры)
  useEffect(() => {
    const fetchRankData = async () => {
      if (!currentUserId) {
        return;
      }

      try {
        setRanksLoading(true);
        const [gameStats, humanProgress, alienProgress] = await Promise.all([
          userService.getPlayerStats(currentUserId, gameType),
          userService.getRankProgress(currentUserId, gameType, 'human'),
          userService.getRankProgress(currentUserId, gameType, 'alien')
        ]);

        setStatsData(gameStats);
        setRankProgress({ human: humanProgress, alien: alienProgress });
      } catch (err) {
        console.error('Error loading rank data:', err);
        // Не меняем общую ошибку, только логируем
      } finally {
        setRanksLoading(false);
      }
    };

    fetchRankData();
  }, [currentUserId, gameType]);

  if (loading) {
    return (
      <Container>
        <Content>
          <LoadingMessage>LOADING OPERATIVE PROFILE...</LoadingMessage>
        </Content>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Content>
          <ErrorMessage>{error}</ErrorMessage>
        </Content>
      </Container>
    );
  }

  if (!playerData) {
    return (
      <Container>
        <Content>
          <ErrorMessage>Operative not found</ErrorMessage>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <Header>
          <Title>
            {isOwnProfile ? '// YOUR PROFILE //' : `// ${playerData.name.toUpperCase()} //`}
          </Title>
          <Subtitle>
            Operative ID: {playerData.id} | Status: ACTIVE
          </Subtitle>
        </Header>

        {/* Tabs */}
        <TabContainer>
          <Tab 
            $active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            <TabText>
              <span className="full-text">Overview</span>
              <span className="short-text">Info</span>
            </TabText>
          </Tab>
          {isOwnProfile && (
            <Tab 
              $active={activeTab === 'edit'} 
              onClick={() => setActiveTab('edit')}
            >
              <TabText>
                <span className="full-text">Edit Profile</span>
                <span className="short-text">Edit</span>
              </TabText>
            </Tab>
          )}
        </TabContainer>

        <TabContent>
          {activeTab === 'overview' && (
            <>
              {/* OPERATIVE OVERVIEW */}
        <Section>
          <SectionHeader>
            <SectionTitle>Operative Overview</SectionTitle>
          </SectionHeader>
          <SectionContent>
                         <OverviewGrid>
               <InfoColumn>
                 <InfoLine>
                   <Label>CALLSIGN:</Label>
                   <Value>{playerData.name}</Value>
                 </InfoLine>
                 <InfoLine>
                   <Label>MEMBER SINCE:</Label>
                   <Value>{new Date(playerData.createdAt).toLocaleDateString()}</Value>
                 </InfoLine>
                 <InfoLine>
                   <Label>CLANS:</Label>
                 </InfoLine>
                 <ClanSection>
                   {(playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES || 
                     playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.AIRSOFT_ONLY) && (
                     <ClanInfo>
                       <Label>Airsoft:</Label>
                       {playerData.airsoftClanId && playerData.airsoftClanName ? (
                         <Value>
                           <ClanLink onClick={() => handleClanClick(playerData.airsoftClanId!)}>
                             [{playerData.airsoftClanName}]
                           </ClanLink>
                           {playerData.airsoftClanRole && (
                             <ClanRole> - {playerData.airsoftClanRole}</ClanRole>
                           )}
                         </Value>
                       ) : (
                         <Value> No clan assigned</Value>
                       )}
                     </ClanInfo>
                   )}
                   {(playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES || 
                     playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.PAINTBALL_ONLY) && (
                     <ClanInfo>
                       <Label>Paintball:</Label>
                       {playerData.paintballClanId && playerData.paintballClanName ? (
                         <Value>
                           <ClanLink onClick={() => handleClanClick(playerData.paintballClanId!)}>
                             [{playerData.paintballClanName}]
                           </ClanLink>
                           {playerData.paintballClanRole && (
                             <ClanRole> - {playerData.paintballClanRole}</ClanRole>
                           )}
                         </Value>
                       ) : (
                         <Value> No clan assigned</Value>
                       )}
                     </ClanInfo>
                   )}
                 </ClanSection>
               </InfoColumn>
               
               <RanksTable>
                 <TableHeader $columns={playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES ? 2 : 1}>
                   {(playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES || 
                     playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.AIRSOFT_ONLY) && (
                     <TableHeaderCell>Airsoft</TableHeaderCell>
                   )}
                   {(playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES || 
                     playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.PAINTBALL_ONLY) && (
                     <TableHeaderCell>Paintball</TableHeaderCell>
                   )}
                 </TableHeader>
                 
                 <TableRow $columns={playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES ? 2 : 1}>
                   {(playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES || 
                     playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.AIRSOFT_ONLY) && (
                     <TableCell>
                       <FactionTitle>Human Forces</FactionTitle>
                       <RankInfo>
                         <Label>Rank:</Label>
                         <Value>{playerData.airsoftHumanRank || 'Not ranked'}</Value>
                       </RankInfo>
                       <RankInfo>
                         <Label>Points:</Label>
                         <Value>{playerData.airsoftHumanPoints || 0}</Value>
                       </RankInfo>
                       {playerData.airsoftHumanPoints > 0 && (
                         <>
                           <ProgressBar>
                             <ProgressFill progress={50} />
                           </ProgressBar>
                           <ProgressText>Progress to next rank</ProgressText>
                         </>
                       )}
                     </TableCell>
                   )}
                   {(playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES || 
                     playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.PAINTBALL_ONLY) && (
                     <TableCell>
                       <FactionTitle>Human Forces</FactionTitle>
                       <RankInfo>
                         <Label>Rank:</Label>
                         <Value>{playerData.paintballHumanRank || 'Not ranked'}</Value>
                       </RankInfo>
                       <RankInfo>
                         <Label>Points:</Label>
                         <Value>{playerData.paintballHumanPoints || 0}</Value>
                       </RankInfo>
                       {playerData.paintballHumanPoints > 0 && (
                         <>
                           <ProgressBar>
                             <ProgressFill progress={50} />
                           </ProgressBar>
                           <ProgressText>Progress to next rank</ProgressText>
                         </>
                       )}
                     </TableCell>
                   )}
                 </TableRow>
                 
                 <TableRow $columns={playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES ? 2 : 1}>
                   {(playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES || 
                     playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.AIRSOFT_ONLY) && (
                     <TableCell>
                       <FactionTitle>Alien Alliance</FactionTitle>
                       <RankInfo>
                         <Label>Rank:</Label>
                         <Value>{playerData.airsoftAlienRank || 'Not ranked'}</Value>
                       </RankInfo>
                       <RankInfo>
                         <Label>Points:</Label>
                         <Value>{playerData.airsoftAlienPoints || 0}</Value>
                       </RankInfo>
                       {playerData.airsoftAlienPoints > 0 && (
                         <>
                           <ProgressBar>
                             <ProgressFill progress={50} />
                           </ProgressBar>
                           <ProgressText>Progress to next rank</ProgressText>
                         </>
                       )}
                     </TableCell>
                   )}
                   {(playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.ALL_GAMES || 
                     playerData.gameDisplayPreference === GAME_DISPLAY_PREFERENCE.PAINTBALL_ONLY) && (
                     <TableCell>
                       <FactionTitle>Alien Alliance</FactionTitle>
                       <RankInfo>
                         <Label>Rank:</Label>
                         <Value>{playerData.paintballAlienRank || 'Not ranked'}</Value>
                       </RankInfo>
                       <RankInfo>
                         <Label>Points:</Label>
                         <Value>{playerData.paintballAlienPoints || 0}</Value>
                       </RankInfo>
                       {playerData.paintballAlienPoints > 0 && (
                         <>
                           <ProgressBar>
                             <ProgressFill progress={50} />
                           </ProgressBar>
                           <ProgressText>Progress to next rank</ProgressText>
                         </>
                       )}
                     </TableCell>
                   )}
                 </TableRow>
               </RanksTable>
             </OverviewGrid>
             
             <InfoLine>
               <Label>MAIN BASE:</Label>
               <Value>{playerData.primaryBase || 'No base assigned'}</Value>
             </InfoLine>
             <InfoLine>
               <Label>SECONDARY BASES:</Label>
               <Value>{playerData.secondaryBases?.length ? playerData.secondaryBases.join(', ') : 'No secondary bases'}</Value>
             </InfoLine>
          </SectionContent>
        </Section>

        {/* RANKS & PROGRESS */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              Ranks & Progress
              {!shouldShowGameTypeSelector(playerData) && (
                <span style={{ fontSize: '14px', color: '#00d4ff', marginLeft: '10px' }}>
                  [{gameType.toUpperCase()}]
                </span>
              )}
            </SectionTitle>
          </SectionHeader>
          <SectionContent>
            {shouldShowGameTypeSelector(playerData) && (
              <GameTypeSelector>
                <GameTypeButton 
                  active={gameType === 'airsoft'}
                  onClick={() => shouldShowGameTypeSelector(playerData) && setGameType('airsoft')}
                >
                  [Airsoft]
                </GameTypeButton>
                <GameTypeButton 
                  active={gameType === 'paintball'}
                  onClick={() => shouldShowGameTypeSelector(playerData) && setGameType('paintball')}
                >
                  [Paintball]
                </GameTypeButton>
              </GameTypeSelector>
            )}
            
                         {ranksLoading ? (
              <div style={{ textAlign: 'center', color: '#00d4ff', fontSize: '14px', padding: '40px' }}>
                Loading {gameType} ranks data...
              </div>
            ) : (
              <RanksDetailGrid>
                <RankCard>
                  <RankTitle>Human Forces</RankTitle>
                  {rankProgress.human ? (
                    <>
                      <RankInfo>
                        <Label>Current Rank:</Label>
                        <Value>{rankProgress.human.currentRankName}</Value>
                      </RankInfo>
                      <RankInfo>
                        <Label>Points:</Label>
                        <Value>{rankProgress.human.currentPoints}</Value>
                      </RankInfo>
                      {!rankProgress.human.isMaxRank && (
                        <>
                          <ProgressBar>
                            <ProgressFill progress={rankProgress.human.progressPercent} />
                          </ProgressBar>
                          <ProgressText>{rankProgress.human.progressPercent}%</ProgressText>
                          <RankInfo>
                            <Label>Next Rank:</Label>
                            <Value>{rankProgress.human.pointsToNext} points needed</Value>
                          </RankInfo>
                        </>
                      )}
                    </>
                  ) : (
                    <NoDataMessage>No progress data available</NoDataMessage>
                  )}
                  
                  <RankHistory>
                    <HistoryTitle>Rank History:</HistoryTitle>
                    <NoDataMessage>No rank history available</NoDataMessage>
                  </RankHistory>
                </RankCard>
                
                <RankCard>
                  <RankTitle>Alien Alliance</RankTitle>
                  {rankProgress.alien ? (
                    <>
                      <RankInfo>
                        <Label>Current Rank:</Label>
                        <Value>{rankProgress.alien.currentRankName}</Value>
                      </RankInfo>
                      <RankInfo>
                        <Label>Points:</Label>
                        <Value>{rankProgress.alien.currentPoints}</Value>
                      </RankInfo>
                      {!rankProgress.alien.isMaxRank && (
                        <>
                          <ProgressBar>
                            <ProgressFill progress={rankProgress.alien.progressPercent} />
                          </ProgressBar>
                          <ProgressText>{rankProgress.alien.progressPercent}%</ProgressText>
                          <RankInfo>
                            <Label>Next Rank:</Label>
                            <Value>{rankProgress.alien.pointsToNext} points needed</Value>
                          </RankInfo>
                        </>
                      )}
                    </>
                  ) : (
                    <NoDataMessage>No progress data available</NoDataMessage>
                  )}
                  
                  <RankHistory>
                    <HistoryTitle>Rank History:</HistoryTitle>
                    <NoDataMessage>No rank history available</NoDataMessage>
                  </RankHistory>
                </RankCard>
              </RanksDetailGrid>
            )}
          </SectionContent>
        </Section>

        {/* MISSION HISTORY */}
        <Section>
          <SectionHeader>
            <SectionTitle>
              Mission History
              {!shouldShowGameTypeSelector(playerData) && (
                <span style={{ fontSize: '14px', color: '#00d4ff', marginLeft: '10px' }}>
                  [{missionHistoryGameType.toUpperCase()}]
                </span>
              )}
            </SectionTitle>
          </SectionHeader>
          <SectionContent>
            {shouldShowGameTypeSelector(playerData) && (
              <GameTypeSelector>
                <GameTypeButton 
                  active={missionHistoryGameType === 'airsoft'}
                  onClick={() => shouldShowGameTypeSelector(playerData) && setMissionHistoryGameType('airsoft')}
                >
                  [Airsoft]
                </GameTypeButton>
                <GameTypeButton 
                  active={missionHistoryGameType === 'paintball'}
                  onClick={() => shouldShowGameTypeSelector(playerData) && setMissionHistoryGameType('paintball')}
                >
                  [Paintball]
                </GameTypeButton>
              </GameTypeSelector>
            )}
            
            <MissionFilters>
              Filters: [All] [Victories] [Defeats] [Human] [Alien] [Last 30 days]
            </MissionFilters>
             
             <MissionStats>
               Total: {playerData ? 
                 (missionHistoryGameType === 'airsoft' ? 
                   (playerData.airsoftMissions || 0) : 
                   (playerData.paintballMissions || 0)) : 0} missions | 
               Victories: {playerData ? 
                 (missionHistoryGameType === 'airsoft' ? 
                   (playerData.airsoftWins || 0) : 
                   (playerData.paintballWins || 0)) : 0} | 
               Defeats: {playerData ? 
                 (missionHistoryGameType === 'airsoft' ? 
                   ((playerData.airsoftMissions || 0) - (playerData.airsoftWins || 0)) : 
                   ((playerData.paintballMissions || 0) - (playerData.paintballWins || 0))) : 0} | 
               Win Rate: {playerData ? 
                 (missionHistoryGameType === 'airsoft' ? 
                   `${(playerData.airsoftWinRate || 0).toFixed(1)}%` : 
                   `${(playerData.paintballWinRate || 0).toFixed(1)}%`) : '0%'}
             </MissionStats>
             
             {playerData && ((missionHistoryGameType === 'airsoft' ? 
               (playerData.airsoftMissions || 0) : 
               (playerData.paintballMissions || 0)) > 0) ? (
               <>
                 <MissionTable>
                   <MissionTableHeader>
                     <MissionTableHeaderCell>DATE</MissionTableHeaderCell>
                     <MissionTableHeaderCell>MISSION TYPE</MissionTableHeaderCell>
                     <MissionTableHeaderCell>GAME</MissionTableHeaderCell>
                     <MissionTableHeaderCell>FACTION</MissionTableHeaderCell>
                     <MissionTableHeaderCell>RESULT</MissionTableHeaderCell>
                     <MissionTableHeaderCell>POINTS EARNED</MissionTableHeaderCell>
                   </MissionTableHeader>
                   
                   <div style={{ padding: '20px', textAlign: 'center' }}>
                     <NoDataMessage>Mission history feature coming soon</NoDataMessage>
                   </div>
                 </MissionTable>
                 
                 <div style={{ textAlign: 'center' }}>
                   <LoadMoreButton>[Load More]</LoadMoreButton>
                 </div>
               </>
             ) : (
                                    <NoDataMessage>
                       No {missionHistoryGameType} missions played yet. Join a mission to start building your combat record!
                     </NoDataMessage>
             )}
                      </SectionContent>
         </Section>
              </>
            )}

            {activeTab === 'edit' && isOwnProfile && (
              <EditProfileContent
                editFormData={editFormData}
                handleEditFormChange={handleEditFormChange}
                handlePrimaryBaseChange={handlePrimaryBaseChange}
                handleSecondaryBasesChange={handleSecondaryBasesChange}
                handleSaveProfile={handleSaveProfile}
                isAllStatesSelected={isAllStatesSelected}
                excludedFields={excludedFields}
                setActiveTab={setActiveTab}
              />
            )}
          </TabContent>
        </Content>
        
        <NotificationContainer 
          notifications={notifications} 
          onRemove={removeNotification} 
        />
      </Container>
    );
  };

  // Edit Profile Content Component  
  const EditProfileContent: React.FC<{
    editFormData: EditFormData;
    handleEditFormChange: (field: keyof EditFormData, value: string | string[]) => void;
    handlePrimaryBaseChange: (value: string) => void;
    handleSecondaryBasesChange: (value: string[]) => void;
    handleSaveProfile: () => void;
    isAllStatesSelected: boolean;
    excludedFields: string[];
    setActiveTab: (tab: TabType) => void;
  }> = ({
    editFormData,
    handleEditFormChange,
    handlePrimaryBaseChange,
    handleSecondaryBasesChange,
    handleSaveProfile,
    isAllStatesSelected,
    excludedFields,
    setActiveTab,
  }) => {
    const statesOptions = getStatesWithAllOption();

    return (
      <EditSection>
        <SectionHeader>
          <SectionTitle>Edit Profile</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <EditForm>
            <FormGroup>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                value={editFormData.name}
                onChange={(e) => handleEditFormChange('name', e.target.value)}
                placeholder="Enter your name"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={editFormData.email}
                onChange={(e) => handleEditFormChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>State</FormLabel>
              <Select
                value={editFormData.state}
                onChange={(e) => handleEditFormChange('state', e.target.value)}
              >
                {statesOptions.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.abbreviation}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <FormLabel disabled={isAllStatesSelected}>Primary Base</FormLabel>
              <GameFieldSelector
                value={editFormData.primaryBase}
                onChange={handlePrimaryBaseChange}
                clanType="airsoft"
                state={editFormData.state}
                placeholder={isAllStatesSelected ? "Select specific state first" : "Select primary base"}
                disabled={isAllStatesSelected}
                excludeFields={editFormData.secondaryBases}
              />
              {isAllStatesSelected && (
                <HelpText>Please select a specific state to choose your primary base</HelpText>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel>Secondary Bases</FormLabel>
              <MultiGameFieldSelector
                value={editFormData.secondaryBases}
                onChange={handleSecondaryBasesChange}
                clanType="airsoft"
                state={editFormData.state}
                placeholder="Search and select secondary bases"
                disabled={isAllStatesSelected}
                maxSelections={5}
                excludeFields={excludedFields}
              />
              {isAllStatesSelected && (
                <HelpText>Please select a specific state to choose your secondary bases</HelpText>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel>Game Display Preference</FormLabel>
              <Select
                value={editFormData.gameDisplayPreference}
                onChange={(e) => handleEditFormChange('gameDisplayPreference', e.target.value)}
              >
                {GAME_DISPLAY_PREFERENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <HelpText>Choose which game types you want to display in your profile</HelpText>
            </FormGroup>

            <ButtonGroup>
              <SaveButton onClick={handleSaveProfile}>
                Save Changes
              </SaveButton>
              <CancelButton onClick={() => setActiveTab('overview')}>
                Cancel
              </CancelButton>
            </ButtonGroup>
          </EditForm>
        </SectionContent>
      </EditSection>
    );
  };

  export default ProfilePage; 