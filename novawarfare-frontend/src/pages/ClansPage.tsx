import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Clan, ClanRank, ClanListResponse, CLAN_TYPES, CLAN_TYPE_LABELS } from '../types/clan';
import clanService from '../services/clanService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { ClanUtils } from '../utils/clanUtils';
import NotificationContainer from '../components/common/NotificationContainer';

const ClansPage: React.FC = () => {
  const [topClans, setTopClans] = useState<Clan[]>([]);
  const [allClans, setAllClans] = useState<Clan[]>([]);
  const [clanRanks, setClanRanks] = useState<ClanRank[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingAllClans, setLoadingAllClans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreClans, setHasMoreClans] = useState(false);
  
  // Состояние для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;
  
  // Кеш для рангов кланов
  const [ranksCache, setRanksCache] = useState<ClanRank[] | null>(null);
  // Кеш для топ кланов
  const [topClansCache, setTopClansCache] = useState<Clan[] | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification, notifications, removeNotification } = useNotification();
  const [searchParams] = useSearchParams();
  
  // Получаем тип клана из URL параметров
  const selectedClanType = searchParams.get('type');
  
  // Ref для таймера поиска
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Перенаправление на страйкбол кланы по умолчанию
  useEffect(() => {
    if (!selectedClanType || !Object.values(CLAN_TYPES).includes(selectedClanType as any)) {
      navigate(`/clans?type=${CLAN_TYPES.AIRSOFT}`, { replace: true });
      return;
    }
  }, [selectedClanType, navigate]);

  // Определяем заголовок страницы на основе выбранного типа
  const getPageTitle = () => {
    if (selectedClanType && CLAN_TYPE_LABELS[selectedClanType as keyof typeof CLAN_TYPE_LABELS]) {
      return `NovaWarfare ${CLAN_TYPE_LABELS[selectedClanType as keyof typeof CLAN_TYPE_LABELS]} Clans`;
    }
    return 'NovaWarfare Clans';
  };

  const getPageSubtitle = () => {
    if (selectedClanType && CLAN_TYPE_LABELS[selectedClanType as keyof typeof CLAN_TYPE_LABELS]) {
      return `Join NovaWarfare ${CLAN_TYPE_LABELS[selectedClanType as keyof typeof CLAN_TYPE_LABELS].toLowerCase()} units or create your own clan`;
    }
    return 'Join NovaWarfare elite units or create your own clan';
  };

  // Мемоизируем функции для избежания лишних ререндеров
  const getRankColor = useCallback((rank: number) => {
    return clanService.getRankColor(rank);
  }, []);

  const formatNumber = useCallback((num: number) => {
    return clanService.formatNumber(num);
  }, []);

  const getClanStatus = useCallback((clan: Clan) => {
    return clanService.getClanStatus(clan);
  }, []);

  const getClanEfficiencyRating = useCallback((clan: Clan) => {
    return clanService.getClanEfficiencyRating(clan);
  }, []);

  // Загрузка рангов с кешированием
  const loadClanRanks = useCallback(async () => {
    try {
      const ranks = await clanService.getClanRanks();
      setClanRanks(ranks);
    } catch (err: any) {
      // Ranks loading failed - not critical
      setClanRanks([]);
    }
  }, []);

  // Загрузка топ кланов
  const loadTopClans = useCallback(async () => {
    try {
      const clans = await clanService.getTopClans(10, selectedClanType || undefined);
      setTopClans(clans);
    } catch (err: any) {
      setError(err.message || 'Failed to load top clans');
    }
  }, [selectedClanType]);

  const loadAllClans = useCallback(async () => {
    if (loadingAllClans) return;
    
    setLoadingAllClans(true);
    try {
      let response;
      
      if (selectedClanType && selectedClanType !== 'all') {
        response = await clanService.getClansByType(selectedClanType, currentPage, pageSize);
      } else {
        response = await clanService.getAllClans(currentPage, pageSize);
      }
      
      setAllClans(response.clans || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load clans');
    } finally {
      setLoadingAllClans(false);
    }
  }, [selectedClanType, currentPage, pageSize, loadingAllClans]);

  // Основная загрузка данных (только критически важные данные)
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([loadTopClans(), loadClanRanks()]);
      setHasMoreClans(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load clan data');
    } finally {
      setLoading(false);
    }
  }, [selectedClanType, loadTopClans, loadClanRanks]);

  // Эффект для отложенной загрузки всех кланов
  useEffect(() => {
    
    if (hasMoreClans && allClans.length === 0) {
      loadAllClans();
    }
  }, [hasMoreClans, loadAllClans, allClans.length]);

  // Эффекты
  useEffect(() => {
    // Сбрасываем состояние при изменении типа клана
    setHasMoreClans(false);
    setAllClans([]);
    setCurrentPage(1);
    loadData();
  }, [selectedClanType, loadData]); // Добавляем selectedClanType в зависимости

  // Отдельный эффект для пагинации (избегаем дублирования)
  useEffect(() => {
    if (currentPage > 1) {
      loadAllClans();
    }
  }, [currentPage, loadAllClans]);

  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await clanService.searchClans(term, 20);
      setSearchResults(results || []);
    } catch (err: any) {
      setError('Failed to search clans');
    } finally {
      setSearching(false);
    }
  }, []);

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

  const handleClanClick = useCallback((clanId: string) => {
    navigate(`/clans/${clanId}`);
  }, [navigate]);

  const handleCreateClan = useCallback(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Определяем тип клана
    const validClanType = (selectedClanType && Object.values(CLAN_TYPES).includes(selectedClanType as any)) 
      ? selectedClanType 
      : CLAN_TYPES.AIRSOFT;

    // Передаем тип клана в URL параметрах
    navigate(`/clans/create?type=${validClanType}`);
  }, [user, navigate, selectedClanType]);

  const handleMyClan = useCallback(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Определяем тип клана
    const validClanType = (selectedClanType && Object.values(CLAN_TYPES).includes(selectedClanType as any)) 
      ? selectedClanType 
      : CLAN_TYPES.AIRSOFT;

    // Получаем ID клана пользователя
    const clanId = ClanUtils.getUserClanId(user, validClanType);
    
    if (clanId) {
      navigate(`/clans/${clanId}`);
    } else {
      showNotification('error', 'Clan Not Found', 'Unable to find your clan.');
    }
  }, [user, navigate, selectedClanType, showNotification]);

  // Определяем, показывать ли кнопку "Create Clan" или "My Clan"
  const shouldShowCreateClan = useMemo(() => {
    // Если пользователь не залогинен - показываем "Create Clan" (перенаправит на логин)
    if (!user) return true;
    
    const validClanType = (selectedClanType && Object.values(CLAN_TYPES).includes(selectedClanType as any)) 
      ? selectedClanType 
      : CLAN_TYPES.AIRSOFT;
    
    // Если пользователь залогинен - проверяем, может ли он создать клан
    const canCreate = ClanUtils.canUserCreateClan(user, validClanType);
    
    return canCreate;
  }, [user, selectedClanType]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  }, [totalPages, currentPage]);

  // Мемоизированные вычисления
  const totalActiveUsers = useMemo(() => {
    return allClans.reduce((sum, clan) => sum + (clan.memberIds?.length || 0), 0);
  }, [allClans]);

  const totalPoints = useMemo(() => {
    return allClans.reduce((sum, clan) => sum + (clan.points || 0), 0);
  }, [allClans]);

  const renderPagination = useCallback(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Кнопка "Предыдущая"
    if (currentPage > 1) {
      pages.push(
        <PaginationButton key="prev" onClick={() => handlePageChange(currentPage - 1)}>
          ←
        </PaginationButton>
      );
    }

    // Первая страница
    if (startPage > 1) {
      pages.push(
        <PaginationButton key={1} onClick={() => handlePageChange(1)}>
          1
        </PaginationButton>
      );
      if (startPage > 2) {
        pages.push(<PaginationDots key="dots1">...</PaginationDots>);
      }
    }

    // Видимые страницы
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationButton
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </PaginationButton>
      );
    }

    // Последняя страница
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<PaginationDots key="dots2">...</PaginationDots>);
      }
      pages.push(
        <PaginationButton key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </PaginationButton>
      );
    }

    // Кнопка "Следующая"
    if (currentPage < totalPages) {
      pages.push(
        <PaginationButton key="next" onClick={() => handlePageChange(currentPage + 1)}>
          →
        </PaginationButton>
      );
    }

    return pages;
  }, [currentPage, totalPages, handlePageChange]);

  // Мемоизированные компоненты для оптимизации рендеринга
  const ClanCardMemo = React.memo(({ clan, onClick }: { clan: Clan; onClick: (id: string) => void }) => (
    <ClanCard onClick={() => onClick(clan.id)}>
      <ClanHeader>
        <ClanName>{clan.name}</ClanName>
        <ClanTag>{clan.tag}</ClanTag>
      </ClanHeader>
      <ClanDescription>{clan.description}</ClanDescription>
      <ClanStats>
        <ClanStat>
          <ClanStatLabel>Members:</ClanStatLabel>
          <ClanStatValue>{clan.memberIds?.length || 0}</ClanStatValue>
        </ClanStat>
        <ClanStat>
          <ClanStatLabel>Points:</ClanStatLabel>
          <ClanStatValue>{formatNumber(clan.points || 0)}</ClanStatValue>
        </ClanStat>
      </ClanStats>
      <ClanFooter>
        <ClanCardRankBadge color={getRankColor(clan.rank || 0)}>
          {clan.rankName || 'Survivor Squad'}
        </ClanCardRankBadge>
      </ClanFooter>
    </ClanCard>
  ));

  const TopClanItemMemo = React.memo(({ clan, index, onClick }: { clan: Clan; index: number; onClick: (id: string) => void }) => (
    <TopClanItem onClick={() => onClick(clan.id)}>
      <TopClanRank>#{index + 1}</TopClanRank>
      <TopClanInfo>
        <TopClanName>{clan.name}</TopClanName>
        <TopClanTag>{clan.tag}</TopClanTag>
      </TopClanInfo>
      <TopClanFooter>
        <TopClanStats>
          <TopClanStat>
            <TopClanStatLabel>Members:</TopClanStatLabel>
            <TopClanStatValue>{clan.memberIds?.length || 0}</TopClanStatValue>
          </TopClanStat>
          <TopClanStat>
            <TopClanStatLabel>Points:</TopClanStatLabel>
            <TopClanStatValue>{formatNumber(clan.points || 0)}</TopClanStatValue>
          </TopClanStat>
        </TopClanStats>
        <TopClanRankBadge color={getRankColor(clan.rank || 0)}>
          {clan.rankName || 'Survivor Squad'}
        </TopClanRankBadge>
      </TopClanFooter>
    </TopClanItem>
  ));

  const ClanListItemMemo = React.memo(({ clan, index, currentPage, pageSize, onClick }: { 
    clan: Clan; 
    index: number; 
    currentPage: number; 
    pageSize: number; 
    onClick: (id: string) => void 
  }) => {
    const status = getClanStatus(clan);
    const efficiency = getClanEfficiencyRating(clan);
    const globalRank = (currentPage - 1) * pageSize + index + 1;
    
    return (
      <ClanListItem onClick={() => onClick(clan.id)}>
        <ClanRankPosition>#{globalRank}</ClanRankPosition>
        
        <ClanMainInfo>
          <ClanListHeader>
            <ClanListName>{clan.name || 'Unknown Clan'}</ClanListName>
            <ClanListTag>{clan.tag || 'N/A'}</ClanListTag>
          </ClanListHeader>
          <ClanListDescription>{clan.description || 'No description available'}</ClanListDescription>
        </ClanMainInfo>
        
        <ClanStatsGrid>
          <ClanStatItem>
            <ClanStatItemLabel>Members:</ClanStatItemLabel>
            <ClanStatItemValue>{clan.memberIds?.length || 0}</ClanStatItemValue>
          </ClanStatItem>
          <ClanStatItem>
            <ClanStatItemLabel>Points:</ClanStatItemLabel>
            <ClanStatItemValue>{formatNumber(clan.points || 0)}</ClanStatItemValue>
          </ClanStatItem>
          <ClanStatItem>
            <ClanStatItemLabel>Missions:</ClanStatItemLabel>
            <ClanStatItemValue>{clan.totalMissions || 0}</ClanStatItemValue>
          </ClanStatItem>
          <ClanStatItem>
            <ClanStatItemLabel>Wins:</ClanStatItemLabel>
            <ClanStatItemValue>{(clan.winRate || 0).toFixed(1)}%</ClanStatItemValue>
          </ClanStatItem>
        </ClanStatsGrid>
        
        <ClanBadgesSection>
          <ClanRankBadge color={getRankColor(clan.rank || 0)}>
            {clan.rankName || 'Survivor Squad'}
          </ClanRankBadge>
          <StatusBadge color={status?.color || '#666'}>
            {status?.label || 'Unknown'}
          </StatusBadge>
          <EfficiencyBadge color={efficiency?.color || '#666'}>
            {efficiency?.label || 'Unknown'}
          </EfficiencyBadge>
        </ClanBadgesSection>
        
        <ClanLeaderInfo>
          <ClanLeaderLabel>Leader:</ClanLeaderLabel>
          <ClanLeaderName>{clan.leaderName || 'Unknown'}</ClanLeaderName>
        </ClanLeaderInfo>
      </ClanListItem>
    );
  });

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading clans...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
        <RetryButton onClick={loadData}>Try again</RetryButton>
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
          placeholder="Search clans by name or tag..."
          value={searchTerm}
          onChange={handleSearchInputChange}
        />
        {shouldShowCreateClan ? (
          <CreateClanButton onClick={handleCreateClan}>
            Create Clan
          </CreateClanButton>
        ) : (
          <CreateClanButton onClick={handleMyClan}>
            My Clan
          </CreateClanButton>
        )}
      </SearchSection>

      {searching && (
        <SearchingIndicator>Searching clans...</SearchingIndicator>
      )}

      {searchResults.length > 0 && (
        <SearchResultsSection>
          <SearchResultsTitle>Search Results</SearchResultsTitle>
          <SearchResultsList>
            {searchResults.map((clan) => (
              <SearchResultsCard key={clan.id} onClick={() => handleClanClick(clan.id)}>
                <SearchResultsInfo>
                  <SearchResultsName>{clan.name}</SearchResultsName>
                  <SearchResultsTag>{clan.tag}</SearchResultsTag>
                </SearchResultsInfo>
                <SearchResultsFooter>
                  <SearchResultsStats>
                    <SearchResultsStat>
                      <SearchResultsStatLabel>Members:</SearchResultsStatLabel>
                      <SearchResultsStatValue>{clan.memberIds?.length || 0}</SearchResultsStatValue>
                    </SearchResultsStat>
                    <SearchResultsStat>
                      <SearchResultsStatLabel>Points:</SearchResultsStatLabel>
                      <SearchResultsStatValue>{formatNumber(clan.points || 0)}</SearchResultsStatValue>
                    </SearchResultsStat>
                  </SearchResultsStats>
                  <SearchResultsRankBadge color={getRankColor(clan.rank || 0)}>
                    {clan.rankName || 'Survivor Squad'}
                  </SearchResultsRankBadge>
                </SearchResultsFooter>
              </SearchResultsCard>
            ))}
          </SearchResultsList>
        </SearchResultsSection>
      )}

      <TopClansSection>
        <SectionTitle>Top 10 Clans</SectionTitle>
        <TopClansList>
          {topClans.map((clan, index) => (
            <TopClanItemMemo key={clan.id} clan={clan} index={index} onClick={handleClanClick} />
          ))}
        </TopClansList>
      </TopClansSection>

      <AllClansSection>
        <SectionTitle>All Clans</SectionTitle>
        
        {loadingAllClans ? (
          <LoadingSpinner>Loading clans...</LoadingSpinner>
        ) : (
          <>
            <ClansStats>
              <ClansStat>
                <ClansStatLabel>Total Clans:</ClansStatLabel>
                <ClansStatValue>{totalCount}</ClansStatValue>
              </ClansStat>
              <ClansStat>
                <ClansStatLabel>Active Players:</ClansStatLabel>
                <ClansStatValue>{totalActiveUsers}</ClansStatValue>
              </ClansStat>
              <ClansStat>
                <ClansStatLabel>Total Points:</ClansStatLabel>
                <ClansStatValue>{formatNumber(totalPoints)}</ClansStatValue>
              </ClansStat>
            </ClansStats>

            <ClansList>
              {allClans.map((clan, index) => (
                <ClanListItemMemo 
                  key={clan.id} 
                  clan={clan} 
                  index={index} 
                  currentPage={currentPage} 
                  pageSize={pageSize} 
                  onClick={handleClanClick} 
                />
              ))}
            </ClansList>

            {totalPages > 1 && (
              <PaginationContainer>
                <PaginationInfo>
                  Page {currentPage} of {totalPages}
                </PaginationInfo>
                <PaginationControls>
                  {renderPagination()}
                </PaginationControls>
              </PaginationContainer>
            )}
          </>
        )}
      </AllClansSection>

      {(!topClans || topClans.length === 0) && (!allClans || allClans.length === 0) && (
        <EmptyState>
          <EmptyStateTitle>No clans yet</EmptyStateTitle>
          <EmptyStateDescription>
            Be the first to create a clan in NovaWarfare!
          </EmptyStateDescription>
          {shouldShowCreateClan ? (
            <CreateClanButton onClick={handleCreateClan}>
              Create first clan
            </CreateClanButton>
          ) : (
            <CreateClanButton onClick={handleMyClan}>
              My Clan
            </CreateClanButton>
          )}
        </EmptyState>
      )}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </Container>
  );
};

// Основные styled-components
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

const CreateClanButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #0099cc, #007aa3);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 15px 30px;
    font-size: 1.1rem;
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

const TopClansSection = styled.div`
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

const TopClansList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const TopClanRank = styled.div`
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
    opacity: 1; /* На мобильных всегда показываем */
  }
`;

const TopClanItem = styled.div`
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
    
    /* Показываем ранг при наведении */
    ${TopClanRank} {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 25px;
    height: auto;
  }
`;

const TopClanInfo = styled.div`
  margin-bottom: 15px;
  min-height: 70px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
    min-height: auto;
  }
`;

const TopClanName = styled.h3`
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

const TopClanTag = styled.span`
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

const TopClanFooter = styled.div`
  margin-top: auto;
`;

const TopClanStats = styled.div`
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

const TopClanStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  @media (max-width: 768px) {
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const TopClanStatLabel = styled.span`
  color: #888;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const TopClanStatValue = styled.span`
  color: #e0e0e0;
  font-weight: bold;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const TopClanRankBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  word-wrap: break-word;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

const AllClansSection = styled.div`
  margin-bottom: 40px;
`;

const ClansStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const ClansStat = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
`;

const ClansStatLabel = styled.div`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 5px;
`;

const ClansStatValue = styled.div`
  color: #00d4ff;
  font-size: 1.5rem;
  font-weight: bold;
`;

const ClansList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const ClanListItem = styled.div`
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

const ClanRankPosition = styled.div`
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

const ClanMainInfo = styled.div`
  min-width: 0;
`;

const ClanListHeader = styled.div`
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

const ClanListName = styled.h3`
  font-size: 1.2rem;
  color: #00d4ff;
  margin: 0;
  word-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const ClanListTag = styled.span`
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

const ClanListDescription = styled.p`
  color: #b0b0b0;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 768px) {
    -webkit-line-clamp: none;
    font-size: 1rem;
  }
`;

const ClanStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  min-width: 200px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
    min-width: auto;
  }
`;

const ClanStatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;

  @media (max-width: 768px) {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const ClanStatItemLabel = styled.span`
  color: #888;
  font-size: 0.8rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ClanStatItemValue = styled.span`
  color: #e0e0e0;
  font-weight: bold;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ClanBadgesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;

  @media (max-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    min-width: auto;
  }
`;

const ClanRankBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
`;

const StatusBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
`;

const EfficiencyBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
`;

const ClanLeaderInfo = styled.div`
  text-align: center;
  min-width: 100px;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const ClanLeaderLabel = styled.div`
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ClanLeaderName = styled.div`
  color: #e0e0e0;
  font-weight: bold;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding: 20px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const PaginationInfo = styled.div`
  color: #b0b0b0;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const PaginationButton = styled.button<{ disabled?: boolean; active?: boolean }>`
  background: ${props => 
    props.disabled 
      ? 'rgba(255, 255, 255, 0.1)' 
      : props.active 
        ? 'rgba(0, 212, 255, 0.4)' 
        : 'rgba(0, 212, 255, 0.2)'
  };
  border: 1px solid ${props => 
    props.disabled 
      ? 'rgba(255, 255, 255, 0.2)' 
      : props.active 
        ? '#00d4ff' 
        : 'rgba(0, 212, 255, 0.3)'
  };
  color: ${props => props.disabled ? '#666' : '#00d4ff'};
  padding: 8px 16px;
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: rgba(0, 212, 255, 0.3);
    border-color: #00d4ff;
  }

  @media (max-width: 768px) {
    padding: 10px 18px;
    font-size: 1rem;
  }
`;

const PaginationDots = styled.span`
  color: #666;
  padding: 0 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;

  @media (max-width: 768px) {
    padding: 40px 15px;
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  color: #888;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const EmptyStateDescription = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ClanCard = styled.div`
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
  height: 280px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #00d4ff;
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
  }

  @media (max-width: 768px) {
    padding: 25px;
    height: auto;
  }
`;

const ClanHeader = styled.div`
  margin-bottom: 15px;
  min-height: 70px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
    min-height: auto;
  }
`;

const ClanName = styled.h3`
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

const ClanTag = styled.span`
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

const ClanDescription = styled.p`
  color: #b0b0b0;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 15px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
    -webkit-line-clamp: none;
    margin: 20px 0;
  }
`;

const ClanStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 15px 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    margin: 20px 0;
  }
`;

const ClanStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  @media (max-width: 768px) {
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const ClanStatLabel = styled.span`
  color: #888;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ClanStatValue = styled.span`
  color: #e0e0e0;
  font-weight: bold;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ClanFooter = styled.div`
  margin-top: auto;
`;

const ClanCardRankBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  word-wrap: break-word;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

const SearchResultsSection = styled.div`
  margin-bottom: 40px;
`;

const SearchResultsTitle = styled.h2`
  font-size: 1.8rem;
  color: #00d4ff;
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 25px;
  }
`;

const SearchResultsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

// Создаем новый компонент для результатов поиска, идентичный TopClanItem
const SearchResultsCard = styled.div`
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
  height: 200px; /* Такая же высота как у TopClanItem */

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #00d4ff;
    transform: translateX(5px);
    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
  }

  @media (max-width: 768px) {
    padding: 25px;
    height: auto;
  }
`;

const SearchResultsInfo = styled.div`
  margin-bottom: 15px;
  min-height: 70px; /* Фиксированная минимальная высота */

  @media (max-width: 768px) {
    margin-bottom: 20px;
    min-height: auto;
  }
`;

const SearchResultsName = styled.h3`
  font-size: 1.4rem;
  color: #00d4ff;
  margin: 0 0 8px 0;
  line-height: 1.3;
  word-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Ограничиваем до 2 строк */
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 56px; /* Фиксированная высота для 2 строк */

  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: 10px;
    max-height: none;
    -webkit-line-clamp: none;
  }
`;

const SearchResultsTag = styled.span`
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

const SearchResultsFooter = styled.div`
  margin-top: auto; /* Прижимаем к низу карточки */
`;

const SearchResultsStats = styled.div`
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

const SearchResultsStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;

  @media (max-width: 768px) {
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const SearchResultsStatLabel = styled.span`
  color: #888;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SearchResultsStatValue = styled.span`
  color: #e0e0e0;
  font-weight: bold;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const SearchResultsRankBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: center;
  word-wrap: break-word;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

export default ClansPage;