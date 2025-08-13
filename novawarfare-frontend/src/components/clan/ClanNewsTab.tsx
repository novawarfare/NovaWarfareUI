import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ClanNews, ClanNewsFilter, ClanNewsListResponse } from '../../types/clanNews';
import clanNewsService from '../../services/clanNewsService';
import ClanNewsModal from './ClanNewsModal';
import ClanNewsForm from './ClanNewsForm';
import { useAuth } from '../../contexts/AuthContext';

interface ClanNewsTabProps {
  clanId: string;
  canManageNews: boolean;
  isUserInClan: boolean;
}

const ClanNewsTab: React.FC<ClanNewsTabProps> = ({ clanId, canManageNews, isUserInClan }) => {
  const { user } = useAuth();
  const [news, setNews] = useState<ClanNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<ClanNews | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews] = useState<ClanNews | undefined>(undefined);
  
  // Фильтры и пагинация
  const [filter, setFilter] = useState<ClanNewsFilter>({
    type: isUserInClan ? 'All' : 'Public',
    isPriority: undefined,
    page: 1,
    pageSize: 12
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Загрузка новостей
  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ClanNewsListResponse = await clanNewsService.getClanNews(clanId, filter);
      console.log('ClanNewsTab: News loaded', response);
      
      setNews(response.news || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      console.error('Error loading news:', err);
      setError(err.message || 'Failed to load news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [clanId, filter]);

  // Обработчики
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

  const handleNewsSaved = () => {
    setShowNewsForm(false);
    setEditingNews(undefined);
    loadNews(); // Перезагружаем новости
  };

  const handleDeleteNews = async (news: ClanNews) => {
    const confirmed = window.confirm(`Are you sure you want to delete the news "${news.title}"?`);
    if (!confirmed) return;
    
    try {
      await clanNewsService.deleteClanNews(clanId, news.id);
      loadNews(); // Перезагружаем новости
    } catch (error: any) {
      console.error('Error deleting news:', error);
      alert('Failed to delete news: ' + (error.message || 'Unknown error'));
    }
  };

  // Обработчики фильтров
  const handleFilterChange = (newFilter: Partial<ClanNewsFilter>) => {
    setFilter(prev => ({
      ...prev,
      ...newFilter,
      page: 1 // Сбрасываем на первую страницу при изменении фильтра
    }));
  };

  const handlePageChange = (page: number) => {
    setFilter(prev => ({ ...prev, page }));
  };

  return (
    <Container>
      <Header>
        <Title>Clan News</Title>
        {canManageNews && (
          <CreateButton onClick={handleCreateNews}>
            Create News
          </CreateButton>
        )}
      </Header>

      <Description>
        Stay updated with the latest clan announcements and news.
      </Description>

      {/* Фильтры */}
      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Type:</FilterLabel>
          <FilterSelect 
            value={filter.type || 'All'} 
            onChange={(e) => handleFilterChange({ type: e.target.value as any })}
          >
            {isUserInClan && <option value="All">All News</option>}
            <option value="Public">Public</option>
            {isUserInClan && <option value="Internal">Internal</option>}
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Priority:</FilterLabel>
          <FilterSelect 
            value={filter.isPriority === undefined ? 'All' : filter.isPriority.toString()} 
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange({ 
                isPriority: value === 'All' ? undefined : value === 'true' 
              });
            }}
          >
            <option value="All">All Priority</option>
            <option value="true">Priority Only</option>
            <option value="false">Regular Only</option>
          </FilterSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Per Page:</FilterLabel>
          <FilterSelect 
            value={filter.pageSize?.toString() || '12'} 
            onChange={(e) => handleFilterChange({ pageSize: parseInt(e.target.value) })}
          >
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="21">21</option>
            <option value="48">48</option>
          </FilterSelect>
        </FilterGroup>
      </FiltersContainer>

      {/* Результаты */}
      <ResultsInfo>
        {loading ? (
          <span>Loading...</span>
        ) : (
          <span>
            Showing {news.length} of {totalCount} news 
            {filter.type !== 'All' && ` (${filter.type})`}
            {filter.isPriority !== undefined && ` (${filter.isPriority ? 'Priority' : 'Regular'})`}
          </span>
        )}
      </ResultsInfo>

      {/* Контент */}
      {loading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading news...</LoadingText>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={loadNews}>Retry</RetryButton>
        </ErrorContainer>
      ) : news.length === 0 ? (
        <EmptyContainer>
          <EmptyIcon>📰</EmptyIcon>
          <EmptyTitle>No news found</EmptyTitle>
          <EmptyDescription>
            {filter.type !== 'All' || filter.isPriority !== undefined
              ? 'No news match your current filters.'
              : 'No news have been posted yet.'}
          </EmptyDescription>
          {canManageNews && (
            <CreateNewsLink onClick={handleCreateNews}>
              Create the first news post
            </CreateNewsLink>
          )}
        </EmptyContainer>
      ) : (
        <>
          <NewsGrid>
            {news.map((newsItem) => (
              <NewsCard 
                key={newsItem.id} 
                onClick={() => handleNewsClick(newsItem)}
                type={newsItem.type}
                isPriority={newsItem.isPriority}
              >
                <NewsCardHeader>
                  <NewsCardTitle>{newsItem.title}</NewsCardTitle>
                  <NewsCardBadges>
                    {newsItem.isPriority && (
                      <PriorityBadge>Priority</PriorityBadge>
                    )}
                    <TypeBadge type={newsItem.type}>{newsItem.type}</TypeBadge>
                  </NewsCardBadges>
                </NewsCardHeader>
                
                <NewsCardContent>
                  {newsItem.content}
                </NewsCardContent>
                
                <NewsCardFooter>
                  <NewsCardAuthor>By: {newsItem.authorName}</NewsCardAuthor>
                  <NewsCardDate>{clanNewsService.formatDate(newsItem.createdAt)}</NewsCardDate>
                </NewsCardFooter>
                
                {canManageNews && (
                  <NewsCardActions>
                    <EditButton onClick={(e) => {
                      e.stopPropagation();
                      handleEditNews(newsItem);
                    }}>
                      Edit
                    </EditButton>
                    <DeleteButton onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNews(newsItem);
                    }}>
                      Delete
                    </DeleteButton>
                  </NewsCardActions>
                )}
              </NewsCard>
            ))}
          </NewsGrid>

          {/* Пагинация */}
          {totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton 
                onClick={() => handlePageChange(filter.page! - 1)}
                disabled={filter.page === 1}
              >
                Previous
              </PaginationButton>
              
              <PaginationInfo>
                Page {filter.page} of {totalPages}
              </PaginationInfo>
              
              <PaginationButton 
                onClick={() => handlePageChange(filter.page! + 1)}
                disabled={filter.page === totalPages}
              >
                Next
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}

      {/* Модальные окна */}
      {selectedNews && (
        <ClanNewsModal
          news={selectedNews}
          isOpen={showNewsModal}
          onClose={handleCloseNewsModal}
        />
      )}

      <ClanNewsForm
        clanId={clanId}
        news={editingNews}
        isOpen={showNewsForm}
        onClose={handleCloseNewsForm}
        onSave={handleNewsSaved}
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
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

const Header = styled.div`
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

const Title = styled.h2`
  color: #00d4ff;
  margin: 0;
  font-size: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const CreateButton = styled.button`
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

const Description = styled.p`
  color: #b0b0b0;
  margin: 0 0 25px 0;
  font-size: 1rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 30px;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 15px;
    margin-bottom: 25px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FilterLabel = styled.label`
  color: #888;
  font-size: 0.9rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FilterSelect = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  color: #e0e0e0;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 5px rgba(0, 212, 255, 0.3);
  }

  option {
    background: #1a1a1a;
    color: #e0e0e0;
  }

  @media (max-width: 768px) {
    padding: 10px 15px;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

const ResultsInfo = styled.div`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 20px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 25px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 212, 255, 0.3);
  border-top: 3px solid #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: #00d4ff;
  font-size: 1.1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
`;

const ErrorText = styled.div`
  color: #ff4444;
  font-size: 1.1rem;
  text-align: center;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #0099cc, #007aa3);
    transform: translateY(-2px);
  }
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  color: #00d4ff;
  margin: 0 0 15px 0;
  font-size: 1.3rem;
`;

const EmptyDescription = styled.p`
  color: #b0b0b0;
  margin: 0 0 20px 0;
  font-size: 1rem;
  line-height: 1.6;
`;

const CreateNewsLink = styled.button`
  background: none;
  border: none;
  color: #00d4ff;
  text-decoration: underline;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;

  &:hover {
    color: #ffffff;
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 25px;
  }
`;

const NewsCard = styled.div<{ type: 'Public' | 'Internal'; isPriority: boolean }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${props => {
    if (props.isPriority) return 'rgba(255, 215, 0, 0.4)';
    return props.type === 'Public' ? 'rgba(0, 204, 0, 0.3)' : 'rgba(255, 165, 0, 0.3)';
  }};
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-width: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: ${props => {
      if (props.isPriority) return '#ffd700';
      return props.type === 'Public' ? '#00cc00' : '#ffa500';
    }};
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

const NewsCardBadges = styled.div`
  display: flex;
  gap: 5px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const PriorityBadge = styled.span`
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid #ffd700;
  color: #ffd700;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 0.8rem;
    border-radius: 4px;
  }
`;

const TypeBadge = styled.span<{ type: 'Public' | 'Internal' }>`
  background: ${props => props.type === 'Public' ? 'rgba(0, 204, 0, 0.2)' : 'rgba(255, 165, 0, 0.2)'};
  border: 1px solid ${props => props.type === 'Public' ? '#00cc00' : '#ffa500'};
  color: ${props => props.type === 'Public' ? '#00cc00' : '#ffa500'};
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 0.8rem;
    border-radius: 4px;
  }
`;

const NewsCardContent = styled.p`
  color: #b0b0b0;
  margin: 10px 0 0 0;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  
  /* Ограничиваем текст двумя строками */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
    margin: 15px 0 0 0;
  }
`;

const NewsCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
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
  position: static;
  display: flex;
  gap: 5px;
  opacity: 1;
  margin-top: auto;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    gap: 8px;
    padding-top: 12px;
  }
`;

const EditButton = styled.button`
  background: rgba(0, 212, 255, 0.8);
  border: 1px solid #00d4ff;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 1);
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.9rem;
    border-radius: 6px;
  }
`;

const DeleteButton = styled.button`
  background: rgba(244, 67, 54, 0.8);
  border: 1px solid #f44336;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 1);
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 0.9rem;
    border-radius: 6px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;

  @media (max-width: 768px) {
    gap: 15px;
    margin-top: 25px;
  }
`;

const PaginationButton = styled.button`
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
    background: rgba(255, 255, 255, 0.1);
    color: #666;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 1rem;
    border-radius: 10px;
  }
`;

const PaginationInfo = styled.div`
  color: #b0b0b0;
  font-size: 0.9rem;
  font-weight: bold;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export default ClanNewsTab; 