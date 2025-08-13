import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Clan, ClanMember, ClanRank, ClanAchievement, ACHIEVEMENT_RARITIES, CLAN_ROLES } from '../types/clan';
import { ClanNews } from '../types/clanNews';
import clanService from '../services/clanService';
import clanNewsService from '../services/clanNewsService';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import NotificationContainer from '../components/common/NotificationContainer';
import InviteUserModal from '../components/common/InviteUserModal';
import ClanNewsModal from '../components/clan/ClanNewsModal';
import ClanNewsForm from '../components/clan/ClanNewsForm';
import ClanNewsTab from '../components/clan/ClanNewsTab';
import StateSelector from '../components/common/StateSelector';
import GameFieldSelector from '../components/common/GameFieldSelector';
import MultiGameFieldSelector from '../components/common/MultiGameFieldSelector';
import { ALL_STATES_OPTION } from '../constants/states';

const ClanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, removeNotification, showSuccess, showError } = useNotification();
  
  const [clan, setClan] = useState<Clan | null>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [clanRanks, setClanRanks] = useState<ClanRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'achievements' | 'news' | 'settings'>('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [canManageMembers, setCanManageMembers] = useState(false);
  const [assigningOfficer, setAssigningOfficer] = useState<string | null>(null);
  const [removingOfficer, setRemovingOfficer] = useState(false);

  // Состояние для системы новостей
  const [overviewNews, setOverviewNews] = useState<{ publicNews: ClanNews | null; internalNews: ClanNews | null }>({ publicNews: null, internalNews: null });
  const [selectedNews, setSelectedNews] = useState<ClanNews | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews] = useState<ClanNews | undefined>(undefined);
  const [canManageNews, setCanManageNews] = useState(false);

  // Состояние для формы редактирования клана
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    tag: '',
    state: '',
    primaryBase: '',
    secondaryBases: [] as string[],
    logoFile: null as File | null
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const loadClanData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [clanData, membersData, ranksData] = await Promise.all([
        clanService.getClanById(id!),
        clanService.getClanMembers(id!),
        clanService.getClanRanks()
      ]);
      
      console.log('ClanDetailPage: Clan data loaded', { clanData, membersData, ranksData });
      
      setClan(clanData);
      setMembers(membersData || []);
      setClanRanks(ranksData || []);
      
      // Инициализируем форму редактирования
      if (clanData) {
        setEditForm({
          name: clanData.name || '',
          description: clanData.description || '',
          tag: clanData.tag || '',
          state: clanData.state || '',
          primaryBase: clanData.primaryBase || '',
          secondaryBases: clanData.secondaryBases || [],
          logoFile: null
        });
      }
      
      // Проверяем права управления участниками и новостями
      if (user && clanData) {
        try {
          const [canManageMembers, canManageNews] = await Promise.all([
            clanService.canManageMembers(clanData.id),
            clanNewsService.canManageNews(clanData.id)
          ]);
          
          console.log('ClanDetailPage: Management permissions check', {
            userId: user.id,
            userName: user.name,
            clanId: clanData.id,
            clanName: clanData.name,
            leaderId: clanData.leaderId,
            leaderName: clanData.leaderName,
            seniorOfficerId: clanData.seniorOfficerId,
            seniorOfficerName: clanData.seniorOfficerName,
            canManageMembers,
            canManageNews,
            isLeader: clanData.leaderId === user.id,
            isSeniorOfficer: clanData.seniorOfficerId === user.id
          });
          
          setCanManageMembers(canManageMembers);
          setCanManageNews(canManageNews);
        } catch (err) {
          console.error('Error checking management permissions:', err);
          setCanManageMembers(false);
          setCanManageNews(false);
        }
      }
      
      // Загружаем новости для Overview
      if (clanData) {
        loadOverviewNews(clanData.id);
      }
    } catch (err: any) {
      console.error('Error loading clan data:', err);
      setError(err.message || 'Failed to load clan data');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      loadClanData();
    }
  }, [id, loadClanData]);

  // Функции для работы с новостями
  const loadOverviewNews = async (clanId: string) => {
    try {
      const newsData = await clanNewsService.getLatestNewsForOverview(clanId);
      setOverviewNews(newsData);
      console.log('ClanDetailPage: Overview news loaded', newsData);
    } catch (error) {
      console.error('Error loading overview news:', error);
      setOverviewNews({ publicNews: null, internalNews: null });
    }
  };

  const handleNewsClick = (news: ClanNews) => {
    setSelectedNews(news);
    setShowNewsModal(true);
  };

  const handleCloseNewsModal = () => {
    setShowNewsModal(false);
    setSelectedNews(null);
  };

  const handleCreateNews = () => {
    setEditingNews(undefined);
    setShowNewsForm(true);
  };

  const handleEditNews = (news: ClanNews) => {
    setEditingNews(news);
    setShowNewsForm(true);
  };

  const handleCloseNewsForm = () => {
    setShowNewsForm(false);
    setEditingNews(undefined);
  };

  const handleNewsSaved = (news: ClanNews) => {
    setShowNewsForm(false);
    setEditingNews(undefined);
    // Обновляем список новостей
    if (clan) {
      loadOverviewNews(clan.id);
    }
  };

  const handleDeleteNews = async (news: ClanNews) => {
    if (!clan) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete the news "${news.title}"?`);
    if (!confirmed) return;
    
    try {
      await clanNewsService.deleteClanNews(clan.id, news.id);
      loadOverviewNews(clan.id); // Перезагружаем новости
      showSuccess(
        'News Deleted',
        `News "${news.title}" has been deleted successfully.`,
        4000
      );
    } catch (error: any) {
      console.error('Error deleting news:', error);
      showError('Delete Failed', error.message || 'Failed to delete news');
    }
  };

  const handleJoinClan = async () => {
    if (!clan || !user) return;
    
    try {
      setActionLoading(true);
      await clanService.joinClan(clan.id);
      await loadClanData(); // Перезагружаем данные
      showSuccess(
        'Welcome to the Clan!',
        `You have successfully joined ${clan.name}. Welcome aboard!`,
        5000
      );
    } catch (err: any) {
      console.error('Error joining clan:', err);
      showError('Join Failed', err.message || 'Failed to join clan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveClan = async () => {
    if (!clan || !user) return;
    
    try {
      setActionLoading(true);
      await clanService.leaveClan(clan.id);
      await loadClanData(); // Перезагружаем данные
      showSuccess(
        'Left Clan',
        `You have successfully left ${clan.name}.`,
        4000
      );
    } catch (err: any) {
      console.error('Error leaving clan:', err);
      showError('Leave Failed', err.message || 'Failed to leave clan');
    } finally {
      setActionLoading(false);
    }
  };

  const isUserInClan = () => {
    return !!(clan && user && clan.memberIds?.includes(user.id));
  };

  const getUserClanRole = () => {
    if (!clan || !user) return null;
    
    const role = clan.leaderId === user.id ? 'Leader' : 
                 clan.seniorOfficerId === user.id ? 'Officer' : 
                 'Member';
    
    console.log('ClanDetailPage: getUserClanRole', {
      userId: user.id,
      leaderId: clan.leaderId,
      seniorOfficerId: clan.seniorOfficerId,
      calculatedRole: role,
      isLeader: clan.leaderId === user.id,
      isSeniorOfficer: clan.seniorOfficerId === user.id
    });
    
    return role;
  };

  const getMemberRole = (memberId: string) => {
    if (!clan) return 'Member';
    if (clan.leaderId === memberId) return 'Leader';
    if (clan.seniorOfficerId === memberId) return 'Officer';
    return 'Member';
  };

  const getRankProgress = () => {
    if (!clan || clanRanks.length === 0) return 0;
    return clanService.getRankProgress(clan.points, clan.rank, clanRanks);
  };

  const getPointsToNextRank = () => {
    if (!clan || clanRanks.length === 0) return 0;
    return clanService.getPointsToNextRank(clan.points, clan.rank, clanRanks);
  };

  const handleInviteUsers = () => {
    setShowInviteModal(true);
  };

  const handleInviteModalClose = () => {
    setShowInviteModal(false);
  };

  const handleUserInvited = () => {
    // Перезагружаем данные клана после приглашения пользователя
    loadClanData();
  };

  const handleRemoveMember = async (userId: string) => {
    if (!clan || !user) return;
    
    try {
      setRemovingMember(userId);
      await clanService.removeMemberFromClan(clan.id, userId);
      await loadClanData(); // Перезагружаем данные
      setMemberToRemove(null);
      
      const removedMember = members.find(m => m.id === userId);
      showSuccess(
        'Member Removed',
        `${removedMember?.name || 'Member'} has been removed from the clan.`,
        4000
      );
    } catch (err: any) {
      console.error('Error removing member:', err);
      showError('Remove Failed', err.message || 'Failed to remove member');
    } finally {
      setRemovingMember(null);
    }
  };

  const confirmRemoveMember = (userId: string) => {
    setMemberToRemove(userId);
  };

  const cancelRemoveMember = () => {
    setMemberToRemove(null);
  };

  const handleAssignSeniorOfficer = async (userId: string) => {
    if (!clan || !user) return;
    
    try {
      setAssigningOfficer(userId);
      await clanService.assignSeniorOfficer(clan.id, userId);
      await loadClanData(); // Перезагружаем данные
      
      const assignedMember = members.find(m => m.id === userId);
      showSuccess(
        'Senior Officer Assigned',
        `${assignedMember?.name || 'Member'} has been assigned as senior officer.`,
        4000
      );
    } catch (err: any) {
      console.error('Error assigning senior officer:', err);
      showError('Assignment Failed', err.message || 'Failed to assign senior officer');
    } finally {
      setAssigningOfficer(null);
    }
  };

  const handleRemoveSeniorOfficer = async () => {
    if (!clan || !user) return;
    
    try {
      setRemovingOfficer(true);
      await clanService.removeSeniorOfficer(clan.id);
      await loadClanData();
      showSuccess('Senior Officer Removed', 'Senior officer removed successfully');
    } catch (err: any) {
      showError('Remove Failed', err.message || 'Failed to remove senior officer');
    } finally {
      setRemovingOfficer(false);
    }
  };

  // Обработчики для формы редактирования клана
  const handleEditFormChange = (field: string, value: string | string[] | File | null) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStateChange = (state: string) => {
    setEditForm(prev => ({
      ...prev,
      state,
      // Очищаем поля при изменении штата
      primaryBase: '',
      secondaryBases: []
    }));
  };

  const handlePrimaryBaseChange = (primaryBase: string) => {
    setEditForm(prev => ({
      ...prev,
      primaryBase,
      // Удаляем из второстепенных баз, если была там
      secondaryBases: prev.secondaryBases.filter(base => base !== primaryBase)
    }));
  };

  const handleSecondaryBasesChange = (secondaryBases: string[]) => {
    setEditForm(prev => ({
      ...prev,
      secondaryBases
    }));
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (макс. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File Too Large', 'Logo file must be less than 5MB');
        return;
      }
      
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        showError('Invalid File Type', 'Please select an image file');
        return;
      }
      
      setEditForm(prev => ({
        ...prev,
        logoFile: file
      }));
    }
  };

  const handleMemberClick = (memberId: string) => {
    navigate(`/profile/${memberId}`);
  };

  const handleUpdateClan = async () => {
    if (!clan || !user) return;
    
    // Валидация
    if (!editForm.name.trim() || !editForm.tag.trim() || !editForm.description.trim()) {
      showError('Validation Error', 'All fields are required');
      return;
    }

    if (!editForm.state) {
      showError('Validation Error', 'State is required');
      return;
    }

    if (editForm.secondaryBases.length > 10) {
      showError('Validation Error', 'Maximum 10 secondary bases allowed');
      return;
    }

    // Проверяем, что основная база не дублируется во второстепенных
    if (editForm.primaryBase && editForm.secondaryBases.includes(editForm.primaryBase)) {
      showError('Validation Error', 'Primary base cannot be included in secondary bases');
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('description', editForm.description);
      formData.append('tag', editForm.tag);
      formData.append('clanType', clan.clanType);
      formData.append('state', editForm.state);
      formData.append('primaryBase', editForm.primaryBase);
      
      // Добавляем второстепенные базы
      editForm.secondaryBases.forEach((base, index) => {
        formData.append(`secondaryBases[${index}]`, base);
      });
      
      if (editForm.logoFile) {
        formData.append('logoFile', editForm.logoFile);
      }
      
      await clanService.updateClan(clan.id, formData);
      await loadClanData();
      showSuccess('Clan Updated', 'Clan information updated successfully');
    } catch (err: any) {
      showError('Update Failed', err.message || 'Failed to update clan information');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading clan data...</LoadingSpinner>
      </Container>
    );
  }

  if (error || !clan) {
    return (
      <Container>
        <ErrorMessage>{error || 'Clan not found'}</ErrorMessage>
        <BackButton onClick={() => navigate(`/clans?type=${clan?.clanType || 'Airsoft'}`)}>Return to clans</BackButton>
      </Container>
    );
  }

  const status = clanService.getClanStatus(clan);
  const efficiency = clanService.getClanEfficiencyRating(clan);
  const rankProgress = getRankProgress();
  const pointsToNext = getPointsToNextRank();

  const isAllStatesSelected = editForm.state === ALL_STATES_OPTION;
  const excludedFields = editForm.primaryBase ? [editForm.primaryBase] : [];

  return (
    <Container>
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
      
      <Header>
        <BackButton onClick={() => navigate(`/clans?type=${clan?.clanType || 'Airsoft'}`)}>← Return to clans</BackButton>
        
        <ClanInfo>
          {clan.logoUrl && (
            <ClanLogo src={clan.logoUrl} alt={`Logo ${clan.name}`} />
          )}
          <ClanTextInfo>
            <ClanName>{clan.name}</ClanName>
            <ClanTag>{clan.tag}</ClanTag>
          </ClanTextInfo>
        </ClanInfo>
        {user && (
          <ActionButtons>
            {isUserInClan() ? (
              <>
                {console.log('ClanDetailPage: Invite button check', {
                  canManageMembers,
                  isUserInClan: isUserInClan(),
                  userRole: getUserClanRole()
                })}
                {canManageMembers && (
                  <InviteButton onClick={handleInviteUsers}>
                    Invite Users
                  </InviteButton>
                )}
                {getUserClanRole() !== 'Leader' && (
                  <LeaveButton onClick={handleLeaveClan} disabled={actionLoading}>
                    {actionLoading ? 'Leaving...' : 'Leave Clan'}
                  </LeaveButton>
                )}
              </>
            ) : (
              <JoinButton onClick={handleJoinClan} disabled={actionLoading}>
                {actionLoading ? 'Joining...' : 'Join'}
              </JoinButton>
            )}
          </ActionButtons>
        )}
      </Header>

      <Tabs>
        <Tab 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          <TabText>
            <span className="full-text">Overview</span>
            <span className="short-text">Info</span>
          </TabText>
        </Tab>
        <Tab 
          active={activeTab === 'news'} 
          onClick={() => setActiveTab('news')}
        >
          <TabText>
            <span className="full-text">News</span>
            <span className="short-text">News</span>
          </TabText>
        </Tab>
        <Tab 
          active={activeTab === 'members'} 
          onClick={() => setActiveTab('members')}
        >
          <TabText>
            <span className="full-text">Members</span>
            <span className="short-text">Members</span>
          </TabText>
          <TabCount>({clan.memberIds?.length || 0})</TabCount>
        </Tab>
        <Tab 
          active={activeTab === 'achievements'} 
          onClick={() => setActiveTab('achievements')}
        >
          <TabText>
            <span className="full-text">Achievements</span>
            <span className="short-text">Awards</span>
          </TabText>
          <TabCount>({clan.achievements?.length || 0})</TabCount>
        </Tab>
        {/* Вкладка Settings только для лидера клана */}
        {user && clan && clan.leaderId === user.id && (
          <Tab 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
          >
            <TabText>
              <span className="full-text">Settings</span>
              <span className="short-text">Settings</span>
            </TabText>
          </Tab>
        )}
      </Tabs>

      <TabContent>
        {activeTab === 'overview' && (
          <OverviewTab>
            <ClanStats>
              <StatCard>
                <StatTitle>Clan Rank</StatTitle>
                <RankInfo>
                  <RankBadge color={clanService.getRankColor(clan.rank)}>
                    {clan.rankName}
                  </RankBadge>
                  <RankLevel>Level {clan.rank}</RankLevel>
                </RankInfo>
                {pointsToNext > 0 && (
                  <RankProgress>
                    <ProgressBar>
                      <ProgressFill width={rankProgress} />
                    </ProgressBar>
                    <ProgressText>
                      {clanService.formatNumber(pointsToNext)} points to next rank
                    </ProgressText>
                  </RankProgress>
                )}
              </StatCard>

              <StatCard>
                <StatTitle>Main Information</StatTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Members:</InfoLabel>
                    <InfoValue>{clan.memberIds?.length || 0}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Points:</InfoLabel>
                    <InfoValue>{clanService.formatNumber(clan.points || 0)}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Missions:</InfoLabel>
                    <InfoValue>{clan.totalMissions || 0}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Win Rate:</InfoLabel>
                    <InfoValue>{(clan.winRate || 0).toFixed(1)}%</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </StatCard>

              <StatCard>
                <StatTitle>Status and Rating</StatTitle>
                <BadgeGrid>
                  <StatusBadge color={status.color}>
                    {status.label}
                  </StatusBadge>
                  <EfficiencyBadge color={efficiency.color}>
                    {efficiency.label} ({efficiency.rating}%)
                  </EfficiencyBadge>
                </BadgeGrid>
              </StatCard>
            </ClanStats>

            <LocationInfo>
              <LocationTitle>Location Information</LocationTitle>
              <LocationGrid>
                <LocationItem>
                  <LocationLabel>State:</LocationLabel>
                  <LocationValue>{clan.state || 'Not specified'}</LocationValue>
                </LocationItem>
                {clan.primaryBase && (
                  <LocationItem>
                    <LocationLabel>Primary Base:</LocationLabel>
                    <LocationValue>{clan.primaryBase}</LocationValue>
                  </LocationItem>
                )}
                {clan.secondaryBases && clan.secondaryBases.length > 0 && (
                  <LocationSecondaryBases>
                    <LocationLabel>Secondary Bases:</LocationLabel>
                    <SecondaryBasesList>
                      {clan.secondaryBases.map((base, index) => (
                        <SecondaryBase key={index}>{base}</SecondaryBase>
                      ))}
                    </SecondaryBasesList>
                  </LocationSecondaryBases>
                )}
              </LocationGrid>
            </LocationInfo>

            <ClanDescription>
              <DescriptionTitle>Clan Description</DescriptionTitle>
              <DescriptionText>{clan.description}</DescriptionText>
            </ClanDescription>

            <ClanLeaderInfo>
              <LeaderTitle>Clan Leadership</LeaderTitle>
              <LeaderName>{clan.leaderName}</LeaderName>
              <LeaderRole>Leader</LeaderRole>
              
              {clan.seniorOfficerId && clan.seniorOfficerName ? (
                <>
                  <SeniorOfficerName>{clan.seniorOfficerName}</SeniorOfficerName>
                  <SeniorOfficerRole>Senior Officer</SeniorOfficerRole>
                  {getUserClanRole() === 'Leader' && (
                    <RemoveSeniorOfficerButton 
                      onClick={handleRemoveSeniorOfficer}
                      disabled={removingOfficer}
                    >
                      {removingOfficer ? 'Removing...' : 'Remove Senior Officer'}
                    </RemoveSeniorOfficerButton>
                  )}
                </>
              ) : (
                <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '10px' }}>
                  No senior officer assigned
                  {getUserClanRole() === 'Leader' && (
                    <div style={{ marginTop: '10px' }}>
                      <small style={{ color: '#666' }}>
                        Go to Members tab to assign a senior officer
                      </small>
                    </div>
                  )}
                </div>
              )}
              
              <LeaderSince>
                Created: {new Date(clan.createdAt).toLocaleDateString('en-US')}
              </LeaderSince>
            </ClanLeaderInfo>

            {/* Секция новостей */}
            <NewsSection>
              <NewsSectionHeader>
                <NewsSectionTitle>Latest News</NewsSectionTitle>
                {canManageNews && (
                  <CreateNewsButton onClick={handleCreateNews}>
                    Create News
                  </CreateNewsButton>
                )}
              </NewsSectionHeader>
              
              <NewsGrid>
                {overviewNews.publicNews && (
                  <NewsCard 
                    onClick={() => handleNewsClick(overviewNews.publicNews!)}
                    type="Public"
                  >
                    <NewsCardHeader>
                      <NewsCardTitle>{overviewNews.publicNews.title}</NewsCardTitle>
                      <NewsCardBadge type="Public">Public</NewsCardBadge>
                    </NewsCardHeader>
                    <NewsCardContent>
                      {clanNewsService.truncateText(overviewNews.publicNews.content, 120)}
                    </NewsCardContent>
                    <NewsCardFooter>
                      <NewsCardAuthor>By: {overviewNews.publicNews.authorName}</NewsCardAuthor>
                      <NewsCardDate>{clanNewsService.formatDate(overviewNews.publicNews.createdAt)}</NewsCardDate>
                    </NewsCardFooter>
                    {canManageNews && (
                      <NewsCardActions>
                        <EditNewsButton onClick={(e) => {
                          e.stopPropagation();
                          handleEditNews(overviewNews.publicNews!);
                        }}>
                          Edit
                        </EditNewsButton>
                        <DeleteNewsButton onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNews(overviewNews.publicNews!);
                        }}>
                          Delete
                        </DeleteNewsButton>
                      </NewsCardActions>
                    )}
                  </NewsCard>
                )}
                
                {overviewNews.internalNews && isUserInClan() && (
                  <NewsCard 
                    onClick={() => handleNewsClick(overviewNews.internalNews!)}
                    type="Internal"
                  >
                    <NewsCardHeader>
                      <NewsCardTitle>{overviewNews.internalNews.title}</NewsCardTitle>
                      <NewsCardBadge type="Internal">Internal</NewsCardBadge>
                    </NewsCardHeader>
                    <NewsCardContent>
                      {clanNewsService.truncateText(overviewNews.internalNews.content, 120)}
                    </NewsCardContent>
                    <NewsCardFooter>
                      <NewsCardAuthor>By: {overviewNews.internalNews.authorName}</NewsCardAuthor>
                      <NewsCardDate>{clanNewsService.formatDate(overviewNews.internalNews.createdAt)}</NewsCardDate>
                    </NewsCardFooter>
                    {canManageNews && (
                      <NewsCardActions>
                        <EditNewsButton onClick={(e) => {
                          e.stopPropagation();
                          handleEditNews(overviewNews.internalNews!);
                        }}>
                          Edit
                        </EditNewsButton>
                        <DeleteNewsButton onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNews(overviewNews.internalNews!);
                        }}>
                          Delete
                        </DeleteNewsButton>
                      </NewsCardActions>
                    )}
                  </NewsCard>
                )}
                
                {!overviewNews.publicNews && !overviewNews.internalNews && (
                  <NoNewsMessage>
                    No news available yet.
                    {canManageNews && (
                      <span>
                        <br />
                        <CreateNewsLink onClick={handleCreateNews}>
                          Create the first news post
                        </CreateNewsLink>
                      </span>
                    )}
                  </NoNewsMessage>
                )}
              </NewsGrid>
            </NewsSection>
          </OverviewTab>
        )}

        {activeTab === 'members' && (
          <MembersTab>
                         <MembersGrid>
               {members && members.map((member) => (
                 <MemberCard key={member.id} onClick={() => handleMemberClick(member.id)}>
                   <MemberHeader>
                     <MemberName>{member.name}</MemberName>
                     <MemberRole color={CLAN_ROLES[getMemberRole(member.id)]?.color || '#4CAF50'}>
                       {CLAN_ROLES[getMemberRole(member.id)]?.label || getMemberRole(member.id)}
                     </MemberRole>
                   </MemberHeader>
                  
                  <MemberStats>
                    <StatRow>
                      <StatLabel>Missions:</StatLabel>
                      <StatValue>{member.totalMissions || 0}</StatValue>
                    </StatRow>
                    <StatRow>
                      <StatLabel>Wins:</StatLabel>
                      <StatValue>{(member.winRate || 0).toFixed(1)}%</StatValue>
                    </StatRow>
                    <StatRow>
                      <StatLabel>Achievements:</StatLabel>
                      <StatValue>{member.achievements?.length || 0}</StatValue>
                    </StatRow>
                  </MemberStats>

                  <FactionRanks>
                    <FactionRank>
                      <FactionLabel>People:</FactionLabel>
                      <FactionRankName>{member.humanFactionRankName || 'Not specified'}</FactionRankName>
                    </FactionRank>
                    <FactionRank>
                      <FactionLabel>Aliens:</FactionLabel>
                      <FactionRankName>{member.alienFactionRankName || 'Not specified'}</FactionRankName>
                    </FactionRank>
                  </FactionRanks>

                                     <MemberSince>
                     Joined clan on: {new Date(member.createdAt).toLocaleDateString('en-US')}
                   </MemberSince>

                   <ProfileHint>
                     Click to view profile
                   </ProfileHint>

                                     {/* Управление участниками (только для лидера и старшего офицера) */}
                   {canManageMembers && member.id !== user?.id && (
                     <MemberActions onClick={(e) => e.stopPropagation()}>
                       {/* Назначение старшего офицера (только для лидера) */}
                       {getUserClanRole() === 'Leader' && 
                        member.id !== clan.leaderId && 
                        member.id !== clan.seniorOfficerId && (
                          <AssignOfficerButton 
                            onClick={() => handleAssignSeniorOfficer(member.id)}
                            disabled={assigningOfficer === member.id}
                          >
                            {assigningOfficer === member.id ? 'Assigning...' : 'Make Senior Officer'}
                          </AssignOfficerButton>
                        )}
                        
                        {/* Снятие старшего офицера (только для лидера) */}
                        {getUserClanRole() === 'Leader' && 
                         member.id === clan.seniorOfficerId && (
                          <RemoveOfficerButton 
                            onClick={handleRemoveSeniorOfficer}
                            disabled={removingOfficer}
                          >
                            {removingOfficer ? 'Removing...' : 'Remove Officer'}
                          </RemoveOfficerButton>
                        )}
                        
                        {/* Удаление участника */}
                        {memberToRemove === member.id ? (
                          <ConfirmActions>
                            <ConfirmText>Remove {member.name}?</ConfirmText>
                            <ConfirmButton 
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={removingMember === member.id}
                            >
                              {removingMember === member.id ? 'Removing...' : 'Yes'}
                            </ConfirmButton>
                            <CancelButton onClick={cancelRemoveMember}>No</CancelButton>
                          </ConfirmActions>
                        ) : (
                          <RemoveButton onClick={() => confirmRemoveMember(member.id)}>
                            Remove Member
                          </RemoveButton>
                        )}
                     </MemberActions>
                   )}
                </MemberCard>
              ))}
            </MembersGrid>
            {members.length === 0 && (
              <EmptyMembers>
                <EmptyTitle>No members found</EmptyTitle>
                <EmptyDescription>
                  No members in the clan yet or data not loaded.
                </EmptyDescription>
              </EmptyMembers>
            )}
          </MembersTab>
        )}

        {activeTab === 'achievements' && (
          <AchievementsTab>
            {clan.achievements && clan.achievements.length > 0 ? (
              <AchievementsGrid>
                {clan.achievements.map((achievement: ClanAchievement) => (
                  <AchievementCard key={achievement.id}>
                    <AchievementHeader>
                      <AchievementName>{achievement.name}</AchievementName>
                      <AchievementRarity color={ACHIEVEMENT_RARITIES[achievement.rarity as keyof typeof ACHIEVEMENT_RARITIES]?.color || '#9E9E9E'}>
                        {ACHIEVEMENT_RARITIES[achievement.rarity as keyof typeof ACHIEVEMENT_RARITIES]?.label || achievement.rarity}
                      </AchievementRarity>
                    </AchievementHeader>
                    <AchievementDescription>{achievement.description}</AchievementDescription>
                    <AchievementDate>
                      Earned: {new Date(achievement.earnedAt).toLocaleDateString('en-US')}
                    </AchievementDate>
                  </AchievementCard>
                ))}
              </AchievementsGrid>
            ) : (
              <EmptyAchievements>
                <EmptyAchievementsIcon>🏆</EmptyAchievementsIcon>
                <EmptyAchievementsTitle>No achievements yet</EmptyAchievementsTitle>
                <EmptyAchievementsDescription>
                  This clan hasn't earned any achievements yet. Complete missions and challenges to unlock achievements!
                </EmptyAchievementsDescription>
              </EmptyAchievements>
            )}
          </AchievementsTab>
        )}

        {/* Вкладка News */}
        {activeTab === 'news' && (
          <ClanNewsTab
            clanId={clan.id}
            canManageNews={canManageNews}
            isUserInClan={isUserInClan()}
          />
        )}

        {/* Вкладка Settings только для лидера клана */}
        {activeTab === 'settings' && user && clan && clan.leaderId === user.id && (
          <SettingsTab>
            <SettingsTitle>Clan Settings</SettingsTitle>
            <SettingsDescription>
              Update your clan information. Changes will be visible to all members.
            </SettingsDescription>
            
            <SettingsForm>
              <FormGroup>
                <FormLabel>Clan Name</FormLabel>
                <FormInput
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  placeholder="Enter clan name"
                  maxLength={50}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Clan Tag</FormLabel>
                <FormInput
                  type="text"
                  value={editForm.tag}
                  onChange={(e) => handleEditFormChange('tag', e.target.value)}
                  placeholder="Enter clan tag (e.g., NOVA)"
                  maxLength={10}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>State *</FormLabel>
                <StateSelector
                  value={editForm.state}
                  onChange={handleStateChange}
                  placeholder="Select your clan's state"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Primary Base</FormLabel>
                <GameFieldSelector
                  value={editForm.primaryBase}
                  onChange={handlePrimaryBaseChange}
                  clanType={clan.clanType}
                  state={editForm.state}
                  placeholder="Select primary game field"
                  disabled={isAllStatesSelected}
                  excludeFields={editForm.secondaryBases}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Secondary Bases</FormLabel>
                <MultiGameFieldSelector
                  value={editForm.secondaryBases}
                  onChange={handleSecondaryBasesChange}
                  clanType={clan.clanType}
                  placeholder="Search and select secondary game fields"
                  disabled={isAllStatesSelected}
                  maxSelections={10}
                  excludeFields={excludedFields}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextarea
                  value={editForm.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  placeholder="Enter clan description"
                  maxLength={500}
                  rows={4}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Clan Logo</FormLabel>
                <LogoSection>
                  {clan.logoUrl && (
                    <CurrentLogo>
                      <LogoPreview src={clan.logoUrl} alt="Current logo" />
                      <LogoLabel>Current Logo</LogoLabel>
                    </CurrentLogo>
                  )}
                  <FileInputWrapper>
                    <FileInput
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      id="logo-upload"
                    />
                    <FileInputLabel htmlFor="logo-upload">
                      {editForm.logoFile ? editForm.logoFile.name : 'Choose new logo'}
                    </FileInputLabel>
                    <FileInputHint>
                      Max 5MB. Supported formats: JPEG, PNG, GIF, WebP
                    </FileInputHint>
                  </FileInputWrapper>
                </LogoSection>
              </FormGroup>

              <FormActions>
                <SaveButton onClick={handleUpdateClan} disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </SaveButton>
                <CancelButton 
                  onClick={() => {
                    setEditForm({
                      name: clan.name || '',
                      description: clan.description || '',
                      tag: clan.tag || '',
                      state: clan.state || '',
                      primaryBase: clan.primaryBase || '',
                      secondaryBases: clan.secondaryBases || [],
                      logoFile: null
                    });
                  }}
                  disabled={isUpdating}
                >
                  Reset
                </CancelButton>
              </FormActions>
            </SettingsForm>
          </SettingsTab>
        )}
      </TabContent>
      
      {/* Модальное окно для приглашения пользователей */}
      {clan && (
        <InviteUserModal
          isOpen={showInviteModal}
          onClose={handleInviteModalClose}
          clanId={clan.id}
          clanName={clan.name}
          onUserInvited={handleUserInvited}
        />
      )}

      {/* Модальное окно для просмотра новости */}
      {selectedNews && (
        <ClanNewsModal
          news={selectedNews}
          isOpen={showNewsModal}
          onClose={handleCloseNewsModal}
        />
      )}

      {/* Модальное окно для создания/редактирования новости */}
      {clan && (
        <ClanNewsForm
          clanId={clan.id}
          news={editingNews}
          isOpen={showNewsForm}
          onClose={handleCloseNewsForm}
          onSave={handleNewsSaved}
        />
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 20px 20px 20px;
  color: #e0e0e0;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 80px 15px 20px 15px;
  }

  @media (max-width: 480px) {
    padding: 70px 10px 20px 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    margin-bottom: 25px;
  }

  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 1.1rem;
    border-radius: 10px;
    order: 3;
  }
`;

const ClanInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  justify-content: center;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    order: 1;
  }
`;

const ClanLogo = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  border: 1px solid rgba(0, 212, 255, 0.3);

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    border-radius: 15px;
  }
`;

const ClanTextInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  flex: 1;
  overflow: hidden;
  max-width: 100%;

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
  }
`;

const ClanName = styled.h1`
  font-size: 2.5rem;
  color: #00d4ff;
  margin: 0;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  width: 100%;
  line-height: 1.2;
  white-space: normal;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }

  @media (max-width: 360px) {
    font-size: 1.2rem;
  }
`;

const ClanTag = styled.span`
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: bold;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  display: inline-block;
  white-space: normal;
  text-align: center;

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 1.3rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
    padding: 8px 16px;
  }

  @media (max-width: 360px) {
    font-size: 1rem;
    padding: 6px 12px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;

  @media (max-width: 768px) {
    width: 100%;
    order: 2;
    margin-bottom: 10px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const InviteButton = styled.button`
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0099cc, #007aa3);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 1rem;
  }
`;

const JoinButton = styled.button`
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 1rem;
  }
`;

const LeaveButton = styled.button`
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 1rem;
  }
`;

const Tabs = styled.div`
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

const Tab = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(0, 212, 255, 0.1)' : 'transparent'};
  border: none;
  color: ${props => props.active ? '#00d4ff' : '#b0b0b0'};
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid ${props => props.active ? '#00d4ff' : 'transparent'};
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

const TabCount = styled.span`
  color: #888;
  font-size: 0.9rem;
  margin-left: 5px;

  @media (max-width: 768px) {
    margin-left: 0;
    font-size: 0.7rem;
    color: #666;
  }
`;

const TabContent = styled.div`
  min-height: 400px;
`;

const OverviewTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const ClanStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const StatCard = styled.div`
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

const StatTitle = styled.h3`
  color: #00d4ff;
  margin: 0 0 15px 0;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const RankInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`;

const RankBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;

  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 1.1rem;
    border-radius: 10px;
  }
`;

const RankLevel = styled.span`
  color: #b0b0b0;
  font-size: 1.1rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const RankProgress = styled.div`
  margin-top: 15px;
`;

const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.1);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ width: number }>`
  background: linear-gradient(90deg, #00d4ff, #0099cc);
  height: 100%;
  width: ${props => props.width}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 0.9rem;
  color: #b0b0b0;
  text-align: center;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const InfoLabel = styled.span`
  color: #888;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const InfoValue = styled.span`
  color: #e0e0e0;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const BadgeGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 768px) {
    gap: 12px;
    justify-content: center;
  }
`;

const StatusBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

const EfficiencyBadge = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

const ClanDescription = styled.div`
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

const DescriptionTitle = styled.h3`
  color: #00d4ff;
  margin: 0 0 15px 0;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const DescriptionText = styled.p`
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    line-height: 1.7;
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    text-align: left;
  }
`;

const ClanLeaderInfo = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
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

const LeaderTitle = styled.h3`
  color: #00d4ff;
  margin: 0 0 10px 0;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-bottom: 15px;
  }
`;

const LeaderName = styled.div`
  color: #e0e0e0;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 10px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const LeaderRole = styled.div`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 15px;
  }
`;

const SeniorOfficerName = styled.div`
  color: #00d4ff;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 5px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 10px;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const SeniorOfficerRole = styled.div`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 15px;
  }
`;

const RemoveSeniorOfficerButton = styled.button`
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 15px;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 1.1rem;
    border-radius: 10px;
    margin-top: 20px;
  }
`;

const RemoveOfficerButton = styled.button`
  background: linear-gradient(135deg, #FF9800, #F57C00);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #F57C00, #E65100);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 1.1rem;
    border-radius: 10px;
  }
`;

const AssignOfficerButton = styled.button`
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0099cc, #007aa3);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 1.1rem;
    border-radius: 10px;
  }
`;

const LeaderSince = styled.div`
  color: #888;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const MembersTab = styled.div``;

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

 const MemberCard = styled.div`
   background: rgba(255, 255, 255, 0.05);
   border: 1px solid rgba(0, 212, 255, 0.2);
   border-radius: 12px;
   padding: 20px;
   min-width: 0;
   overflow-wrap: break-word;
   word-wrap: break-word;
   cursor: pointer;
   transition: all 0.3s ease;
   position: relative;

   &:hover {
     background: rgba(255, 255, 255, 0.1);
     border-color: #00d4ff;
     transform: translateY(-2px);
     box-shadow: 0 8px 25px rgba(0, 212, 255, 0.15);
   }

   &:active {
     transform: translateY(0);
   }

   @media (max-width: 768px) {
     padding: 25px;
     border-radius: 15px;
   }

   @media (max-width: 480px) {
     padding: 20px;
   }
 `;

const MemberHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 20px;
  }
`;

const MemberName = styled.h4`
  color: #00d4ff;
  margin: 0;
  font-size: 1.1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const MemberRole = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
    border-radius: 6px;
  }
`;

const MemberStats = styled.div`
  margin-bottom: 15px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  color: #888;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatValue = styled.span`
  color: #e0e0e0;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const FactionRanks = styled.div`
  margin-bottom: 15px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const FactionRank = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 0;
  }
`;

const FactionLabel = styled.span`
  color: #888;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FactionRankName = styled.span`
  color: #e0e0e0;
  font-weight: bold;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

 const MemberSince = styled.div`
   color: #888;
   font-size: 0.8rem;
   text-align: center;
   padding-top: 10px;
   border-top: 1px solid rgba(255, 255, 255, 0.1);

   @media (max-width: 768px) {
     font-size: 0.9rem;
     padding-top: 15px;
   }
 `;

 const ProfileHint = styled.div`
   color: #00d4ff;
   font-size: 0.75rem;
   text-align: center;
   margin-top: 8px;
   opacity: 0;
   transition: opacity 0.3s ease;
   font-weight: 500;

   ${MemberCard}:hover & {
     opacity: 1;
   }

   @media (max-width: 768px) {
     opacity: 1;
     font-size: 0.8rem;
     margin-top: 10px;
   }
 `;

const MemberActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
  min-width: 0;

  @media (max-width: 768px) {
    margin-top: 20px;
    flex-direction: column;
    gap: 12px;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const ConfirmActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  width: 100%;
  max-width: 300px;
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 15px;
    max-width: 100%;
  }

  @media (max-width: 480px) {
    padding: 15px;
    gap: 8px;
  }
`;

const ConfirmText = styled.p`
  color: #e0e0e0;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 15px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ConfirmButton = styled.button`
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0099cc, #007aa3);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 1.1rem;
    border-radius: 10px;
  }
`;

const CancelButton = styled.button`
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 1rem;
  }
`;

const RemoveButton = styled.button`
  background: linear-gradient(135deg, #f44336, #d32f2f);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 1rem;
  }
`;

const AchievementsTab = styled.div``;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const AchievementCard = styled.div`
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

const AchievementHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 15px;
  }
`;

const AchievementName = styled.h4`
  color: #00d4ff;
  margin: 0;
  font-size: 1.1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const AchievementRarity = styled.span<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
    border-radius: 6px;
  }
`;

const AchievementDescription = styled.p`
  color: #b0b0b0;
  margin: 10px 0;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
    margin: 15px 0;
  }
`;

const AchievementDate = styled.div`
  color: #888;
  font-size: 0.8rem;
  text-align: right;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    text-align: center;
  }
`;

const EmptyAchievements = styled.div`
  text-align: center;
  padding: 50px 20px;

  @media (max-width: 768px) {
    padding: 40px 15px;
  }
`;

const EmptyAchievementsIcon = styled.div`
  font-size: 4rem;
  color: #888;
  margin-bottom: 20px;
`;

const EmptyAchievementsTitle = styled.h3`
  color: #888;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }
`;

const EmptyAchievementsDescription = styled.p`
  color: #666;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.7;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #00d4ff;
  margin: 50px 0;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ff4444;
  font-size: 1.1rem;
  margin: 20px 0;
`;

const EmptyMembers = styled.div`
  text-align: center;
  padding: 50px 20px;

  @media (max-width: 768px) {
    padding: 40px 15px;
  }
`;

const EmptyTitle = styled.h3`
  color: #888;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }
`;

const EmptyDescription = styled.p`
  color: #666;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.7;
  }
`;

const SettingsTab = styled.div`
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

const SettingsTitle = styled.h3`
  color: #00d4ff;
  margin: 0 0 15px 0;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const SettingsDescription = styled.p`
  color: #b0b0b0;
  margin: 0 0 20px 0;
  font-size: 0.9rem;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    line-height: 1.7;
    text-align: center;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    text-align: left;
  }
`;

const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormLabel = styled.label`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 5px;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 8px;
  }
`;

const FormInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  padding: 10px 15px;
  color: #e0e0e0;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }

  &::placeholder {
    color: #888;
  }

  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 1.1rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 10px 15px;
    font-size: 1rem;
  }
`;

const FormTextarea = styled.textarea`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 8px;
  padding: 10px 15px;
  color: #e0e0e0;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
  }

  &::placeholder {
    color: #888;
  }

  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 1.1rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 10px 15px;
    font-size: 1rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 15px;

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;

const CurrentLogo = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 15px;
  overflow: hidden;
  border: 1px solid rgba(0, 212, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a1a1a;

  @media (max-width: 768px) {
    width: 150px;
    height: 150px;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    width: 120px;
    height: 120px;
    border-radius: 15px;
  }
`;

const LogoPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const LogoLabel = styled.span`
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: bold;
  white-space: nowrap;
`;

const FileInputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
`;

const FileInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  color: #e0e0e0;
  padding: 15px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  width: 100%;
  min-height: 60px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
  font-size: 1rem;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
    color: #00d4ff;
  }

  &:active {
    background: rgba(0, 212, 255, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 18px 24px;
    font-size: 1.1rem;
    border-radius: 10px;
    min-height: 70px;
  }

  @media (max-width: 480px) {
    padding: 15px 20px;
    font-size: 1rem;
    min-height: 60px;
  }
`;

const FileInputHint = styled.p`
  color: #888;
  font-size: 0.85rem;
  margin-top: 8px;
  text-align: center;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-top: 10px;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }

  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    flex: 1;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 1rem;
  }
`;

const LocationInfo = styled.div`
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

const LocationTitle = styled.h3`
  color: #00d4ff;
  margin: 0 0 15px 0;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-bottom: 20px;
    text-align: center;
  }
`;

const LocationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const LocationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const LocationLabel = styled.span`
  color: #888;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const LocationValue = styled.span`
  color: #e0e0e0;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const LocationSecondaryBases = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  grid-column: 1 / -1; /* Занимает всю ширину грида */

  @media (max-width: 768px) {
    padding: 12px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const SecondaryBasesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SecondaryBase = styled.span`
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.9rem;
    border-radius: 6px;
  }
`;

// Styled-компоненты для системы новостей

// Компоненты для секции новостей в Overview
const NewsSection = styled.div`
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

const NewsSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 25px;
  }
`;

const NewsSectionTitle = styled.h3`
  color: #00d4ff;
  margin: 0;
  font-size: 1.2rem;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const CreateNewsButton = styled.button`
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 1rem;
    border-radius: 10px;
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const NewsCard = styled.div<{ type: 'Public' | 'Internal' }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${props => props.type === 'Public' ? 'rgba(0, 204, 0, 0.3)' : 'rgba(255, 165, 0, 0.3)'};
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: ${props => props.type === 'Public' ? '#00cc00' : '#ffa500'};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
  }
`;

const NewsCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const NewsCardTitle = styled.h4`
  color: #ffffff;
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const NewsCardBadge = styled.span<{ type: 'Public' | 'Internal' }>`
  background: ${props => props.type === 'Public' ? 'rgba(0, 204, 0, 0.2)' : 'rgba(255, 165, 0, 0.2)'};
  border: 1px solid ${props => props.type === 'Public' ? '#00cc00' : '#ffa500'};
  color: ${props => props.type === 'Public' ? '#00cc00' : '#ffa500'};
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: 4px 10px;
    font-size: 0.8rem;
    border-radius: 6px;
  }
`;

const NewsCardContent = styled.p`
  color: #b0b0b0;
  margin: 10px 0;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
    margin: 15px 0;
  }
`;

const NewsCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  font-size: 0.8rem;
  color: #888;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    font-size: 0.9rem;
  }
`;

const NewsCardAuthor = styled.span`
  color: #888;
`;

const NewsCardDate = styled.span`
  color: #666;
`;

const NewsCardActions = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${NewsCard}:hover & {
    opacity: 1;
  }

  @media (max-width: 768px) {
    position: static;
    opacity: 1;
    margin-top: 15px;
    justify-content: flex-end;
  }
`;

const EditNewsButton = styled.button`
  background: rgba(0, 212, 255, 0.8);
  border: 1px solid #00d4ff;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 1);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8rem;
    border-radius: 6px;
  }
`;

const DeleteNewsButton = styled.button`
  background: rgba(244, 67, 54, 0.8);
  border: 1px solid #f44336;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 1);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8rem;
    border-radius: 6px;
  }
`;

const NoNewsMessage = styled.div`
  text-align: center;
  color: #888;
  font-size: 1rem;
  padding: 40px 20px;
  grid-column: 1 / -1;

  @media (max-width: 768px) {
    padding: 30px 15px;
    font-size: 1.1rem;
  }
`;

const CreateNewsLink = styled.button`
  background: none;
  border: none;
  color: #00d4ff;
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  margin: 0;

  &:hover {
    color: #ffffff;
  }
`;

// Компоненты для News вкладки
const NewsTab = styled.div`
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

const NewsTabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    margin-bottom: 25px;
  }
`;

const NewsTabTitle = styled.h2`
  color: #00d4ff;
  margin: 0;
  font-size: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const NewsTabContent = styled.div`
  min-height: 300px;
`;

const NewsTabDescription = styled.p`
  color: #b0b0b0;
  margin: 0 0 30px 0;
  font-size: 1rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 35px;
  }
`;

const NewsComingSoon = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #888;

  @media (max-width: 768px) {
    padding: 50px 15px;
  }
`;

const NewsComingSoonIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const NewsComingSoonTitle = styled.h3`
  color: #00d4ff;
  margin: 0 0 15px 0;
  font-size: 1.3rem;

  @media (max-width: 768px) {
    font-size: 1.4rem;
    margin-bottom: 20px;
  }
`;

const NewsComingSoonDescription = styled.p`
  color: #b0b0b0;
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    line-height: 1.7;
  }
`;

export default ClanDetailPage; 