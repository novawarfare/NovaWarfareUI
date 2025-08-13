import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { getPublishedNews } from '../services/adminService';
import { NewsItem } from '../types/news';

const Container = styled.div`
  min-height: 100vh;  
  background: rgba(0, 25, 0, 0.5);
  padding: 60px 16px 16px;
  position: relative;
  z-index: auto;
  
  @media (max-width: 768px) {
    padding: 80px 12px 20px;
  }
`;

const Content = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  transform: scale(0.90);
  
  @media (max-width: 768px) {
    transform: none;
    max-width: 100%;
  }
`;

const Title = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 26px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 30px;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 20px;
  }
`;

const MobileFilterHeader = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
`;

const MobileFilterButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 10px 16px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const FilterOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 998;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileFilterPanel = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  background: linear-gradient(135deg, #0a1a08 0%, #001a00 100%);
  border-right: 2px solid #00cc00;
  padding: 80px 20px 20px;
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  z-index: 999;
  overflow-y: auto;
  
  @media (min-width: 769px) {
    display: none;
  }
  
  @media (max-width: 320px) {
    width: 100%;
  }
`;

const MobileFilterHeader2 = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 204, 0, 0.3);
`;

const MobileFilterTitle = styled.h3`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #00cc00;
  margin: 0;
  text-transform: uppercase;
`;

const MobileFilterClose = styled.button`
  background: none;
  border: none;
  color: #00cc00;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #ffffff;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const CategoryButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'rgba(0, 102, 0, 0.5)' : 'rgba(0, 51, 0, 0.3)'};
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 16px;
    text-align: left;
    width: 100%;
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 20px;
  }
`;

const NewsCard = styled.div`
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  padding: 15px;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 18px;
    
    &:hover {
      transform: none;
    }
  }
`;

const NewsImage = styled.div<{ imageUrl?: string }>`
  height: 180px;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'url(/assets/images/news-placeholder.jpg)'};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.8);
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    height: 200px;
    margin-bottom: 15px;
  }
`;

const NewsTitle = styled.h3`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-bottom: 12px;
  }
`;

const NewsCategory = styled.div`
  display: inline-block;
  padding: 3px 6px;
  background: rgba(0, 102, 0, 0.5);
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  text-transform: uppercase;
  margin-bottom: 10px;
  border: 1px solid #00cc00;
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 10px;
    margin-bottom: 12px;
  }
`;

const NewsDate = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #aaaaaa;
  margin-bottom: 10px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 12px;
  }
`;

const NewsExcerpt = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #ffffff;
  line-height: 1.5;
  margin-bottom: 15px;
  
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 18px;
  }
`;

const ReadMoreLink = styled(Link)`
  display: inline-block;
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px 16px;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? 'rgba(0, 102, 0, 0.5)' : 'rgba(0, 51, 0, 0.3)'};
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 8px 12px;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 30px 0;
  }
`;

const ErrorText = styled.div`
  text-align: center;
  color: #cc3000;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 30px 0;
  }
`;

const NoNewsText = styled.div`
  text-align: center;
  color: #aaaaaa;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  margin: 40px 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin: 50px 0;
  }
`;

const NewsIdBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 25, 0, 0.7);
  padding: 3px 8px;
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 10px;
    top: 12px;
    left: 12px;
  }
`;

const IntelPage: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchNews();
  }, [currentCategory, currentPage]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPublishedNews(currentPage, 9, currentCategory);
      setNewsItems(response.news);
      setTotalPages(Math.ceil(response.totalCount / 9));
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
    setCurrentPage(1);
    setIsMobileFilterOpen(false); // Закрываем мобильное меню при выборе категории
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
  };

  // Format date as "MM/DD/YYYY"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Function to truncate text to a specific number of words
  const truncateText = (text: string, maxWords = 30) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Function to get category name in English
  const getCategoryName = (category: string): string => {
    switch(category) {
      case 'General': return 'GENERAL';
      case 'Updates': return 'UPDATES';
      case 'Events': return 'EVENTS';
      case 'Announcements': return 'ANNOUNCEMENTS';
      case 'Guides': return 'GUIDES';
      default: return category;
    }
  };

  // Компонент фильтров для переиспользования
  const FilterContent = () => (
    <CategoryFilter>
      <CategoryButton
        active={currentCategory === ''}
        onClick={() => handleCategoryChange('')}
      >
        ALL
      </CategoryButton>
      <CategoryButton
        active={currentCategory === 'General'}
        onClick={() => handleCategoryChange('General')}
      >
        GENERAL
      </CategoryButton>
      <CategoryButton
        active={currentCategory === 'Updates'}
        onClick={() => handleCategoryChange('Updates')}
      >
        UPDATES
      </CategoryButton>
      <CategoryButton
        active={currentCategory === 'Events'}
        onClick={() => handleCategoryChange('Events')}
      >
        EVENTS
      </CategoryButton>
      <CategoryButton
        active={currentCategory === 'Announcements'}
        onClick={() => handleCategoryChange('Announcements')}
      >
        ANNOUNCEMENTS
      </CategoryButton>
      <CategoryButton
        active={currentCategory === 'Guides'}
        onClick={() => handleCategoryChange('Guides')}
      >
        GUIDES
      </CategoryButton>
    </CategoryFilter>
  );

  return (
    <>
      <Container>
        <Content>
          <Title>// INTELLIGENCE DATA //</Title>
          
          <MobileFilterHeader>
            <MobileFilterButton onClick={toggleMobileFilter}>
              📊 CATEGORIES
            </MobileFilterButton>
            <div style={{ fontSize: '10px', color: '#00cc00', fontFamily: 'Courier New, monospace' }}>
              {currentCategory ? getCategoryName(currentCategory) : 'ALL INTEL'}
            </div>
          </MobileFilterHeader>
          
          <FilterBar>
            <FilterContent />
          </FilterBar>
          
          {loading ? (
            <LoadingText>Loading data...</LoadingText>
          ) : error ? (
            <ErrorText>{error}</ErrorText>
          ) : newsItems.length === 0 ? (
            <NoNewsText>No news available in this category</NoNewsText>
          ) : (
            <NewsGrid>
              {newsItems.map((newsItem, index) => (
                <NewsCard key={newsItem.id}>
                  <NewsIdBadge>
                    #{(currentPage - 1) * 9 + index + 1}
                  </NewsIdBadge>
                  <Link to={`/intel/${newsItem.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <NewsImage imageUrl={
                      newsItem.imageUrls && newsItem.imageUrls.length > 0 
                        ? newsItem.imageUrls[0] 
                        : newsItem.imageUrl
                    } />
                    <NewsCategory>{getCategoryName(newsItem.category)}</NewsCategory>
                    <NewsTitle>{newsItem.title}</NewsTitle>
                    <NewsDate>{formatDate(newsItem.publishedAt || newsItem.createdAt)}</NewsDate>
                    <NewsExcerpt>{truncateText(newsItem.content)}</NewsExcerpt>
                  </Link>
                  <ReadMoreLink to={`/intel/${newsItem.id}`}>READ MORE</ReadMoreLink>
                </NewsCard>
              ))}
            </NewsGrid>
          )}
          
          {totalPages > 1 && (
            <Pagination>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationButton
                  key={i}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationButton>
              ))}
            </Pagination>
          )}
        </Content>
      </Container>

      {/* Mobile Filter Panel */}
      <FilterOverlay $isOpen={isMobileFilterOpen} onClick={closeMobileFilter} />
      <MobileFilterPanel $isOpen={isMobileFilterOpen}>
        <MobileFilterHeader2>
          <MobileFilterTitle>INTEL CATEGORIES</MobileFilterTitle>
          <MobileFilterClose onClick={closeMobileFilter}>✕</MobileFilterClose>
        </MobileFilterHeader2>
        <FilterContent />
      </MobileFilterPanel>
    </>
  );
};

export default IntelPage; 