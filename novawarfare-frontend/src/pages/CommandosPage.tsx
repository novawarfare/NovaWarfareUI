import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import { Player } from '../types/user';

const CommandosPage: React.FC = () => {
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingAllPlayers, setLoadingAllPlayers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMorePlayers, setHasMorePlayers] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Получаем тип игры из URL параметров
  const selectedGameType = searchParams.get('type') || 'airsoft';
  
  // Ref для таймера поиска
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  // Ref для предотвращения дублирования API вызовов
  const loadingRef = React.useRef<boolean>(false);
  const currentGameTypeRef = React.useRef<string>('');

  // Определяем заголовок страницы на основе выбранного типа
  const getPageTitle = () => {
    if (selectedGameType === 'paintball') {
      return 'NovaWarfare Paintball Commandos';
    }
    return 'NovaWarfare Airsoft Commandos';
  };

  const getPageSubtitle = () => {
    if (selectedGameType === 'paintball') {
      return 'Elite tactical paintball operators leading the battlefield';
    }
    return 'Elite tactical airsoft operators leading the battlefield';
  };

  // Получить статистику игрока в зависимости от типа игры
  const getPlayerStats = useCallback((player: Player) => {
    if (selectedGameType === 'paintball') {
      return {
        humanRank: player.paintballHumanRank,
        humanRankName: player.paintballHumanRankName,
        alienRank: player.paintballAlienRank,
        alienRankName: player.paintballAlienRankName,
        missions: player.paintballMissions,
        wins: player.paintballWins,
        winRate: player.paintballWinRate,
        totalPoints: player.paintballHumanPoints + player.paintballAlienPoints,
        totalRank: Math.max(player.paintballHumanRank, player.paintballAlienRank)
      };
    }
    return {
      humanRank: player.airsoftHumanRank,
      humanRankName: player.airsoftHumanRankName,
      alienRank: player.airsoftAlienRank,
      alienRankName: player.airsoftAlienRankName,
      missions: player.airsoftMissions,
      wins: player.airsoftWins,
      winRate: player.airsoftWinRate,
      totalPoints: player.airsoftHumanPoints + player.airsoftAlienPoints,
      totalRank: Math.max(player.airsoftHumanRank, player.airsoftAlienRank)
    };
  }, [selectedGameType]);

  // Загрузка топ игроков
  const loadTopPlayers = useCallback(async () => {
    try {
      const players = await userService.getTopPlayers(selectedGameType, 10);
      setTopPlayers(players || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load top players');
      setTopPlayers([]);
    }
  }, [selectedGameType]);

  // Загрузка всех игроков
  const loadAllPlayers = useCallback(async () => {
    if (loadingAllPlayers) return;
    
    setLoadingAllPlayers(true);
    try {
      const response = await userService.getPlayers(selectedGameType, 1, 50);
      setAllPlayers(response.players || []);
      setHasMorePlayers(response.hasMore || false);
    } catch (err: any) {
      setError(err.message || 'Failed to load players');
      setAllPlayers([]);
      setHasMorePlayers(false);
    } finally {
      setLoadingAllPlayers(false);
    }
  }, [selectedGameType]);

  // Основной useEffect для загрузки данных при смене типа игры
  useEffect(() => {
    // Предотвращаем дублирование вызовов
    if (loadingRef.current || currentGameTypeRef.current === selectedGameType) {
      return;
    }
    
    const loadData = async () => {
      loadingRef.current = true;
      currentGameTypeRef.current = selectedGameType;
      setLoading(true);
      setError(null);
      setHasMorePlayers(false);
      setAllPlayers([]);
      setIsDataLoaded(false);
      
      try {
        // Загружаем данные параллельно
        const [topPlayersResponse, allPlayersResponse] = await Promise.all([
          userService.getTopPlayers(selectedGameType, 10),
          userService.getPlayers(selectedGameType, 1, 50)
        ]);
        
        setTopPlayers(topPlayersResponse || []);
        setAllPlayers(allPlayersResponse.players || []);
        setHasMorePlayers(allPlayersResponse.hasMore || false);
        setIsDataLoaded(true);
      } catch (err: any) {
        setError('Failed to load player data');
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };
    
    loadData();
  }, [selectedGameType]);

  // Функция для повторного вызова данных
  const retryLoadData = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setHasMorePlayers(false);
    setAllPlayers([]);
    setIsDataLoaded(false);
    
    try {
      const [topPlayersResponse, allPlayersResponse] = await Promise.all([
        userService.getTopPlayers(selectedGameType, 10),
        userService.getPlayers(selectedGameType, 1, 50)
      ]);
      
      setTopPlayers(topPlayersResponse || []);
      setAllPlayers(allPlayersResponse.players || []);
      setHasMorePlayers(allPlayersResponse.hasMore || false);
      setIsDataLoaded(true);
    } catch (err: any) {
      setError('Failed to load player data');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [selectedGameType]);

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await userService.searchPlayers(term, 20, selectedGameType);
      setSearchResults(results || []);
    } catch (err) {
      setError('Failed to search players');
    } finally {
      setSearching(false);
    }
  }, [selectedGameType]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Очищаем предыдущий таймер
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Дебаунс поиска
    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(value);
      }, 300);
    } else {
      setSearchResults([]);
    }
  }, [handleSearch]);

  const handlePlayerClick = useCallback((playerId: string) => {
    navigate(`/profile/${playerId}`);
  }, [navigate]);

  const handleCreateAccount = useCallback(() => {
    navigate('/register');
  }, [navigate]);

  const handleMyProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  // Очистка таймера и ref при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      loadingRef.current = false;
      currentGameTypeRef.current = '';
    };
  }, []);

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading commandos data...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          {error}
          <RetryButton onClick={retryLoadData}>Retry</RetryButton>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{getPageTitle()}</Title>
        <Subtitle>{getPageSubtitle()}</Subtitle>
      </Header>

      <SearchSection>
        <SearchInput
          type="text"
          placeholder="Search commandos by name or tag..."
          value={searchTerm}
          onChange={handleSearchInputChange}
        />
        {user ? (
          <ActionButton onClick={handleMyProfile}>
            My Profile
          </ActionButton>
        ) : (
          <ActionButton onClick={handleCreateAccount}>
            Create Account
          </ActionButton>
        )}
      </SearchSection>

      {searching && <SearchingIndicator>Searching...</SearchingIndicator>}

      {/* Результаты поиска */}
      {searchResults.length > 0 && (
        <SearchResultsSection>
          <SearchResultsTitle>Search Results</SearchResultsTitle>
          <SearchResultsList>
            {searchResults.map((player) => {
              const stats = getPlayerStats(player);
              return (
                <SearchResultsCard
                  key={player.id}
                  onClick={() => handlePlayerClick(player.id)}
                >
                  <SearchResultsInfo>
                    <SearchResultsName>{player.name}</SearchResultsName>
                    <SearchResultsTag>{player.primaryBase}</SearchResultsTag>
                  </SearchResultsInfo>
                  <SearchResultsFooter>
                    <SearchResultsStats>
                      <SearchResultsStat>
                        <SearchResultsStatLabel>Missions:</SearchResultsStatLabel>
                        <SearchResultsStatValue>{stats.missions}</SearchResultsStatValue>
                      </SearchResultsStat>
                      <SearchResultsStat>
                        <SearchResultsStatLabel>Win Rate:</SearchResultsStatLabel>
                        <SearchResultsStatValue>{stats.winRate.toFixed(1)}%</SearchResultsStatValue>
                      </SearchResultsStat>
                    </SearchResultsStats>
                    <SearchResultsRankBadge>
                      Rank {stats.totalRank}
                    </SearchResultsRankBadge>
                  </SearchResultsFooter>
                </SearchResultsCard>
              );
            })}
          </SearchResultsList>
        </SearchResultsSection>
      )}

      {/* Топ 10 коммандос */}
      <TopPlayersSection>
        <SectionTitle>Top 10 Commandos</SectionTitle>
        <TopPlayersList>
          {topPlayers.map((player, index) => {
            const stats = getPlayerStats(player);
            return (
              <TopPlayerItem
                key={player.id}
                onClick={() => handlePlayerClick(player.id)}
              >
                <TopPlayerRank>#{index + 1}</TopPlayerRank>
                <TopPlayerInfo>
                  <TopPlayerName>{player.name}</TopPlayerName>
                  <TopPlayerBase>{player.primaryBase}</TopPlayerBase>
                </TopPlayerInfo>
                <TopPlayerStats>
                  <TopPlayerStat>
                    <TopPlayerStatLabel>Missions:</TopPlayerStatLabel>
                    <TopPlayerStatValue>{stats.missions}</TopPlayerStatValue>
                  </TopPlayerStat>
                  <TopPlayerStat>
                    <TopPlayerStatLabel>Win Rate:</TopPlayerStatLabel>
                    <TopPlayerStatValue>{stats.winRate.toFixed(1)}%</TopPlayerStatValue>
                  </TopPlayerStat>
                  <TopPlayerStat>
                    <TopPlayerStatLabel>Points:</TopPlayerStatLabel>
                    <TopPlayerStatValue>{stats.totalPoints}</TopPlayerStatValue>
                  </TopPlayerStat>
                </TopPlayerStats>
                <TopPlayerFooter>
                  <TopPlayerRankBadge>
                    Rank {stats.totalRank}
                  </TopPlayerRankBadge>
                </TopPlayerFooter>
              </TopPlayerItem>
            );
          })}
        </TopPlayersList>
      </TopPlayersSection>

      {/* Все коммандос */}
      <AllPlayersSection>
        <SectionTitle>All Commandos</SectionTitle>
        <PlayersList>
          {allPlayers.map((player, index) => {
            const stats = getPlayerStats(player);
            return (
              <PlayerListItem
                key={player.id}
                onClick={() => handlePlayerClick(player.id)}
              >
                <PlayerRankPosition>#{index + 1}</PlayerRankPosition>
                <PlayerMainInfo>
                  <PlayerListHeader>
                    <PlayerListName>{player.name}</PlayerListName>
                    <PlayerListBase>{player.primaryBase}</PlayerListBase>
                  </PlayerListHeader>
                  <PlayerListLocation>
                    {player.state}
                    {player.secondaryBases.length > 0 && (
                      <span> • {player.secondaryBases.length} secondary bases</span>
                    )}
                  </PlayerListLocation>
                </PlayerMainInfo>
                <PlayerStatsGrid>
                  <PlayerStatItem>
                    <PlayerStatItemLabel>Missions</PlayerStatItemLabel>
                    <PlayerStatItemValue>{stats.missions}</PlayerStatItemValue>
                  </PlayerStatItem>
                  <PlayerStatItem>
                    <PlayerStatItemLabel>Win Rate</PlayerStatItemLabel>
                    <PlayerStatItemValue>{stats.winRate.toFixed(1)}%</PlayerStatItemValue>
                  </PlayerStatItem>
                  <PlayerStatItem>
                    <PlayerStatItemLabel>Points</PlayerStatItemLabel>
                    <PlayerStatItemValue>{stats.totalPoints}</PlayerStatItemValue>
                  </PlayerStatItem>
                </PlayerStatsGrid>
                <PlayerBadgesSection>
                  <PlayerRankBadge>
                    Rank {stats.totalRank}
                  </PlayerRankBadge>
                </PlayerBadgesSection>
                <PlayerRanksInfo>
                  <PlayerRankInfo>
                    <PlayerRankLabel>Human:</PlayerRankLabel>
                    <PlayerRankName>{stats.humanRankName}</PlayerRankName>
                  </PlayerRankInfo>
                  <PlayerRankInfo>
                    <PlayerRankLabel>Alien:</PlayerRankLabel>
                    <PlayerRankName>{stats.alienRankName}</PlayerRankName>
                  </PlayerRankInfo>
                </PlayerRanksInfo>
              </PlayerListItem>
            );
          })}
        </PlayersList>
      </AllPlayersSection>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px 20px 20px;
  color: #e0e0e0;

  @media (max-width: 768px) {
    padding: 80px 15px 20px 15px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #00d4ff;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 15px;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #b0b0b0;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.4;
    padding: 0 10px;
  }
`;

const SearchSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 25px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: #e0e0e0;
  font-size: 1rem;

  &::placeholder {
    color: #888;
  }

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 15px 20px;
    font-size: 1.1rem;
    border-radius: 10px;
  }
`;

const ActionButton = styled.button`
  padding: 12px 16px;
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: 1px solid #00d4ff;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: linear-gradient(135deg, #0099cc, #007aa3);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 15px 20px;
    font-size: 1rem;
    border-radius: 10px;
  }
`;

const SearchingIndicator = styled.div`
  text-align: center;
  color: #00d4ff;
  margin: 20px 0;
  font-style: italic;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  color: #00d4ff;
  font-size: 1.2rem;
  margin: 40px 0;
`;

const ErrorMessage = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid #f44336;
  color: #f44336;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  margin-top: 15px;

  &:hover {
    background: linear-gradient(135deg, #0099cc, #007aa3);
    transform: translateY(-2px);
  }
`;

const TopPlayersSection = styled.div`
  margin-bottom: 50px;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: #00d4ff;
  margin-bottom: 25px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.7rem;
    margin-bottom: 20px;
  }
`;

const TopPlayersList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const TopPlayerRank = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s ease;

  @media (max-width: 768px) {
    position: static;
    align-self: flex-end;
    margin-bottom: 10px;
    opacity: 1;
  }
`;

const TopPlayerItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 200px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #00d4ff;
    transform: translateX(5px);
    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
    
    ${TopPlayerRank} {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 25px;
    height: auto;
  }
`;

const TopPlayerInfo = styled.div`
  margin-bottom: 15px;
  min-height: 70px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
    min-height: auto;
  }
`;

const TopPlayerName = styled.h3`
  font-size: 1.4rem;
  color: #00d4ff;
  margin: 0 0 8px 0;
  line-height: 1.3;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 56px;

  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 10px;
    max-height: none;
    -webkit-line-clamp: none;
  }
`;

const TopPlayerBase = styled.span`
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  display: inline-block;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

const TopPlayerStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin: 15px 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    margin: 20px 0;
  }
`;

const TopPlayerStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  @media (max-width: 768px) {
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const TopPlayerStatLabel = styled.span`
  color: #888;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TopPlayerStatValue = styled.span`
  color: #e0e0e0;
  font-weight: bold;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const TopPlayerFooter = styled.div`
  margin-top: auto;
`;

const TopPlayerRankBadge = styled.span`
  background: #00d4ff;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  word-wrap: break-word;
  display: inline-block;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

const AllPlayersSection = styled.div`
  margin-bottom: 40px;
`;

const PlayersList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const PlayerListItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  gap: 20px;
  align-items: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #00d4ff;
    transform: translateX(5px);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 25px;
  }
`;

const PlayerRankPosition = styled.div`
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  text-align: center;
  min-width: 50px;

  @media (max-width: 768px) {
    align-self: center;
    margin-bottom: 10px;
  }
`;

const PlayerMainInfo = styled.div`
  min-width: 0;
`;

const PlayerListHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const PlayerListName = styled.h3`
  font-size: 1.2rem;
  color: #00d4ff;
  margin: 0;
  word-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const PlayerListBase = styled.span`
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
`;

const PlayerListLocation = styled.p`
  color: #b0b0b0;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const PlayerStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  min-width: 300px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
    min-width: auto;
  }
`;

const PlayerStatItem = styled.div`
  text-align: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const PlayerStatItemLabel = styled.span`
  display: block;
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
`;

const PlayerStatItemValue = styled.span`
  display: block;
  color: #e0e0e0;
  font-weight: bold;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const PlayerBadgesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const PlayerRankBadge = styled.span`
  background: #00d4ff;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  word-wrap: break-word;
  min-width: 80px;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

const PlayerRanksInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;

  @media (max-width: 768px) {
    flex-direction: row;
    gap: 15px;
    min-width: auto;
    justify-content: space-around;
  }
`;

const PlayerRankInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
`;

const PlayerRankLabel = styled.div`
  color: #888;
  font-size: 0.8rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const PlayerRankName = styled.div`
  color: #e0e0e0;
  font-size: 0.9rem;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 1rem;
    white-space: normal;
  }
`;

// Стили для результатов поиска
const SearchResultsSection = styled.div`
  margin-bottom: 40px;
`;

const SearchResultsTitle = styled.h2`
  font-size: 1.5rem;
  color: #00d4ff;
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 15px;
  }
`;

const SearchResultsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const SearchResultsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #00d4ff;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SearchResultsInfo = styled.div`
  margin-bottom: 15px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const SearchResultsName = styled.h3`
  font-size: 1.1rem;
  color: #00d4ff;
  margin: 0 0 8px 0;
  word-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 10px;
  }
`;

const SearchResultsTag = styled.span`
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
`;

const SearchResultsFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const SearchResultsStats = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 768px) {
    justify-content: space-between;
    width: 100%;
  }
`;

const SearchResultsStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const SearchResultsStatLabel = styled.span`
  color: #888;
  font-size: 0.8rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const SearchResultsStatValue = styled.span`
  color: #e0e0e0;
  font-weight: bold;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SearchResultsRankBadge = styled.span`
  background: #00d4ff;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
`;

export default CommandosPage; 