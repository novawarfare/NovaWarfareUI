import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getPublishedNewsById } from '../services/adminService';
import { NewsItem } from '../types/news';

const Container = styled.div`
  min-height: 100vh;
  background: rgba(0, 25, 0, 0.5);
  padding: 80px 16px 16px;
`;

const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const NewsHeader = styled.div`
  margin-bottom: 30px;
`;

const BreadcrumbNav = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  
  a {
    color: #00cc00;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: #ffffff;
    }
  }
  
  span {
    margin: 0 10px;
  }
`;

const Title = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 32px;
  color: #ffffff;
  margin-bottom: 10px;
  text-transform: uppercase;
`;

const NewsDetails = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
`;

const NewsCategory = styled.div`
  display: inline-block;
  padding: 4px 8px;
  background: rgba(0, 102, 0, 0.5);
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  text-transform: uppercase;
  border: 1px solid #00cc00;
`;

const NewsDate = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #aaaaaa;
`;

const NewsImage = styled.div<{ imageUrl?: string }>`
  width: 100%;
  height: 400px;
  background-image: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'url(/assets/images/news-placeholder.jpg)'};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.8);
  margin-bottom: 30px;
  border: 1px solid #00cc00;
`;

const ImageGallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
`;

const GalleryImage = styled.div<{ imageUrl: string }>`
  width: calc(33.333% - 7px);
  height: 120px;
  background-image: url(${props => props.imageUrl});
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid #00cc00;
  cursor: pointer;
  
  @media (max-width: 768px) {
    width: calc(50% - 5px);
  }
`;

const NewsContent = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  line-height: 1.8;
  margin-bottom: 40px;
  white-space: pre-line;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(0, 204, 0, 0.5);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(0, 204, 0, 0.5);
  }
`;

const BackButton = styled(Link)`
  display: inline-block;
  padding: 10px 20px;
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  text-transform: uppercase;
  margin-top: 20px;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  margin: 50px 0;
`;

const ErrorText = styled.div`
  text-align: center;
  color: #cc3000;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  margin: 50px 0;
`;

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchNewsDetails(id);
    }
  }, [id]);

  const fetchNewsDetails = async (newsId: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await getPublishedNewsById(newsId);
      setNewsItem(data);
    } catch (err) {
      console.error('Error loading news details:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
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
  
  // Get all available images from news item
  const getImages = (): string[] => {
    if (!newsItem) return [];
    
    // If we have imageUrls array with items, use it
    if (newsItem.imageUrls && newsItem.imageUrls.length > 0) {
      return newsItem.imageUrls;
    }
    
    // Otherwise fall back to the single imageUrl if available
    if (newsItem.imageUrl) {
      return [newsItem.imageUrl];
    }
    
    // No images available
    return [];
  };
  
  // Change current displayed image
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return (
      <Container>
        <Content>
          <LoadingText>Loading intelligence data...</LoadingText>
        </Content>
      </Container>
    );
  }

  if (error || !newsItem) {
    return (
      <Container>
        <Content>
          <ErrorText>{error || 'News not found'}</ErrorText>
          <BackButton to="/intel">RETURN TO INTEL DATABASE</BackButton>
        </Content>
      </Container>
    );
  }
  
  const images = getImages();
  const mainImage = images.length > 0 ? images[currentImageIndex] : undefined;

  return (
    <Container>
      <Content>
        <NewsHeader>
          <BreadcrumbNav>
            <Link to="/intel">INTEL DATABASE</Link>
            <span>&gt;</span>
            <Link to={`/intel?category=${newsItem.category}`}>
              {getCategoryName(newsItem.category)}
            </Link>
            <span>&gt;</span>
            INTEL FILE #{id}
          </BreadcrumbNav>
          
          <Title>{newsItem.title}</Title>
          
          <NewsDetails>
            <NewsCategory>{getCategoryName(newsItem.category)}</NewsCategory>
            <NewsDate>{formatDate(newsItem.publishedAt || newsItem.createdAt)}</NewsDate>
          </NewsDetails>
        </NewsHeader>
        
        {/* Main displayed image */}
        {mainImage && <NewsImage imageUrl={mainImage} />}
        
        {/* Gallery of all images */}
        {images.length > 1 && (
          <ImageGallery>
            {images.map((imageUrl, index) => (
              <GalleryImage 
                key={index} 
                imageUrl={imageUrl}
                onClick={() => handleImageClick(index)}
                style={{ 
                  border: index === currentImageIndex ? '2px solid #00ff00' : '1px solid #00cc00',
                  opacity: index === currentImageIndex ? 1 : 0.7
                }}
              />
            ))}
          </ImageGallery>
        )}
        
        <NewsContent>
          {newsItem.content}
        </NewsContent>
        
        <BackButton to="/intel">RETURN TO INTEL DATABASE</BackButton>
      </Content>
    </Container>
  );
};

export default NewsDetailPage; 