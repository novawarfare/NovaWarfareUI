import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { NewsItem, NewsRequest } from '../../types/news';
import { 
  getNews, 
  getNewsById, 
  createNews, 
  updateNews, 
  deleteNews 
} from '../../services/adminService';
import NewsForm from './NewsForm';

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
  grid-template-columns: 100px 250px 120px 120px 200px;
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
    
    &.published {
      color: #00cc00;
    }
    
    &.draft {
      color: #cccc00;
    }
    
    &.archived {
      color: #aaaaaa;
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

const FormTextarea = styled.textarea`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
  min-height: 150px;
  resize: vertical;
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

const NewsManagement: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentStatus, setCurrentStatus] = useState('');

  // Загрузка новостей при монтировании
  useEffect(() => {
    fetchNews();
  }, [page, currentStatus]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getNews(page, 10, currentStatus);
      setNewsItems(response.news);
      setTotalPages(Math.ceil(response.totalCount / 10));
    } catch (err) {
      setError('Ошибка при загрузке новостей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // В идеале здесь должен быть поиск на сервере, но пока сделаем клиентский поиск
    fetchNews();
  };

  const handleAddNewsItem = () => {
    setEditingNews(null);
    setShowNewsForm(true);
  };

  const handleEditNewsItem = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setShowNewsForm(true);
  };

  const handleDeleteNewsItem = async (id: string) => {
    try {
      setError('');
      await deleteNews(id);
      setNewsItems(newsItems.filter(item => item.id !== id));
    } catch (err) {
      setError('Ошибка при удалении новости');
      console.error(err);
    }
  };

  const handlePublishNewsItem = async (id: string) => {
    try {
      setError('');
      // Получаем текущую информацию о новости
      const currentNews = newsItems.find(item => item.id === id);
      if (!currentNews) {
        setError('Новость не найдена');
        return;
      }

      // Создаем объект для обновления, меняя только статус
      const updateData: NewsRequest = {
        title: currentNews.title,
        content: currentNews.content,
        category: currentNews.category,
        imageUrl: currentNews.imageUrl,
        status: 'Published' // Используем правильный PascalCase
      };

      const updatedNews = await updateNews(id, updateData);
      setNewsItems(newsItems.map(item => item.id === id ? updatedNews : item));
    } catch (err) {
      setError('Ошибка при публикации новости');
      console.error(err);
    }
  };

  const handleArchiveNewsItem = async (id: string) => {
    try {
      setError('');
      // Получаем текущую информацию о новости
      const currentNews = newsItems.find(item => item.id === id);
      if (!currentNews) {
        setError('Новость не найдена');
        return;
      }

      // Создаем объект для обновления, меняя только статус
      const updateData: NewsRequest = {
        title: currentNews.title,
        content: currentNews.content,
        category: currentNews.category,
        imageUrl: currentNews.imageUrl,
        status: 'Archived' // Используем правильный PascalCase
      };

      const updatedNews = await updateNews(id, updateData);
      setNewsItems(newsItems.map(item => item.id === id ? updatedNews : item));
    } catch (err) {
      setError('Ошибка при архивации новости');
      console.error(err);
    }
  };

  const handleSaveSuccess = () => {
    setShowNewsForm(false);
    fetchNews();
  };

  const filteredNewsItems = searchQuery
    ? newsItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : newsItems;

  return (
    <Container>
      <h2 style={{ fontFamily: 'Courier New, monospace', color: '#ffffff', marginTop: 0 }}>
        NEWS MANAGEMENT
      </h2>
      
      <MetricsGrid>
        <MetricCard>
          <MetricLabel>TOTAL NEWS</MetricLabel>
          <MetricValue>{newsItems.length}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>PUBLISHED</MetricLabel>
          <MetricValue>{newsItems.filter(n => n.status === 'Published').length}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>ARCHIVED</MetricLabel>
          <MetricValue>{newsItems.filter(n => n.status === 'Archived').length}</MetricValue>
        </MetricCard>
      </MetricsGrid>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <SearchBar>
          <SearchInput 
            type="text"
            placeholder="SEARCH NEWS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <SearchButton onClick={handleSearch}>SEARCH</SearchButton>
        </SearchBar>
        <div>
          <ActionButton onClick={handleAddNewsItem}>+ NEW ARTICLE</ActionButton>
        </div>
      </div>
      
      <DataTable>
        <TableGrid>
          <TableHeaderRow>
            <div>ID</div>
            <div>TITLE</div>
            <div>DATE</div>
            <div>STATUS</div>
            <div>ACTIONS</div>
          </TableHeaderRow>
          
          {loading ? (
            <TableDataRow>
              <div style={{gridColumn: 'span 5'}}>Loading...</div>
            </TableDataRow>
          ) : error ? (
            <TableDataRow>
              <div style={{gridColumn: 'span 5'}}>{error}</div>
            </TableDataRow>
          ) : filteredNewsItems.length === 0 ? (
            <TableDataRow>
              <div style={{gridColumn: 'span 5'}}>No news found</div>
            </TableDataRow>
          ) : (
            filteredNewsItems.map((newsItem, index) => (
              <TableDataRow key={newsItem.id}>
                <div>{(page - 1) * 10 + index + 1}</div>
                <div>{newsItem.title}</div>
                <div>{newsItem.date || newsItem.createdAt}</div>
                <div className={newsItem.status.toLowerCase()}>{newsItem.status}</div>
                <div>
                  <ActionButton onClick={() => handleEditNewsItem(newsItem)}>EDIT</ActionButton>
                  
                  {newsItem.status === 'Draft' && (
                    <ActionButton onClick={() => handlePublishNewsItem(newsItem.id)}>PUBLISH</ActionButton>
                  )}
                  
                  {newsItem.status === 'Published' && (
                    <ActionButton onClick={() => handleArchiveNewsItem(newsItem.id)}>ARCHIVE</ActionButton>
                  )}
                  
                  <DeleteButton onClick={() => handleDeleteNewsItem(newsItem.id)}>DELETE</DeleteButton>
                </div>
              </TableDataRow>
            ))
          )}
        </TableGrid>
      </DataTable>
      
      {showNewsForm && (
        <Modal title={editingNews ? "EDIT NEWS" : "CREATE NEWS"} onClose={() => setShowNewsForm(false)} isOpen={showNewsForm}>
          <NewsForm 
            newsItem={editingNews || undefined}
            onSuccess={handleSaveSuccess}
            onCancel={() => setShowNewsForm(false)}
          />
        </Modal>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <ActionButton 
            key={i} 
            onClick={() => setPage(i + 1)}
            style={{ background: page === i + 1 ? 'rgba(0, 102, 0, 0.5)' : 'rgba(0, 51, 0, 0.8)' }}
          >
            {i + 1}
          </ActionButton>
        ))}
      </div>
    </Container>
  );
};

export default NewsManagement; 