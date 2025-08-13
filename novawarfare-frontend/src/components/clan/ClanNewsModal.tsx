import React from 'react';
import styled from 'styled-components';
import { ClanNews } from '../../types/clanNews';
import YouTubePlayer from '../common/YouTubePlayer';
import clanNewsService from '../../services/clanNewsService';

interface ClanNewsModalProps {
  news: ClanNews;
  isOpen: boolean;
  onClose: () => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled.div`
  background: rgba(0, 25, 0, 0.95);
  border: 2px solid #00cc00;
  border-radius: 8px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 0;
  }
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(0, 204, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
`;

const NewsTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  background: rgba(204, 48, 0, 0.8);
  border: 1px solid #cc3000;
  color: #cc3000;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(204, 48, 0, 0.6);
    color: #ffffff;
  }
`;

const NewsMetadata = styled.div`
  padding: 0 20px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: rgba(0, 204, 0, 0.8);
  border-bottom: 1px solid rgba(0, 204, 0, 0.2);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
`;

const NewsType = styled.span<{ type: 'Public' | 'Internal' }>`
  background: ${props => props.type === 'Public' ? 'rgba(0, 204, 0, 0.2)' : 'rgba(255, 165, 0, 0.2)'};
  border: 1px solid ${props => props.type === 'Public' ? '#00cc00' : '#ffa500'};
  color: ${props => props.type === 'Public' ? '#00cc00' : '#ffa500'};
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
`;

const PriorityBadge = styled.span`
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid #ff0000;
  color: #ff0000;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const NewsImage = styled.div`
  width: 100%;
  height: 250px;
  background: rgba(0, 40, 0, 0.4);
  border: 1px solid rgba(0, 204, 0, 0.3);
  border-radius: 4px;
  margin-bottom: 20px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 204, 0, 0.5);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;

const NewsVideo = styled.div`
  margin-bottom: 20px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0, 204, 0, 0.3);
`;

const NewsContent = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #ffffff;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const ClanNewsModal: React.FC<ClanNewsModalProps> = ({ news, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick} onKeyDown={handleKeyDown} tabIndex={0}>
      <ModalContainer>
        <ModalHeader>
          <NewsTitle>{news.title}</NewsTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <NewsMetadata>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NewsType type={news.type}>{news.type}</NewsType>
            {news.isPriority && <PriorityBadge>Priority</PriorityBadge>}
          </div>
          
          <AuthorInfo>
            <span>By: {news.authorName}</span>
            <span>•</span>
            <span>{clanNewsService.formatDate(news.createdAt)}</span>
          </AuthorInfo>
        </NewsMetadata>
        
        <ModalContent>
          {news.imageUrl && (
            <NewsImage 
              style={{ backgroundImage: `url(${news.imageUrl})` }}
            >
              {!news.imageUrl && 'NO IMAGE AVAILABLE'}
            </NewsImage>
          )}
          
          {news.videoUrl && (
            <NewsVideo>
              <YouTubePlayer 
                videoUrl={news.videoUrl} 
                autoplay={false}
              />
            </NewsVideo>
          )}
          
          <NewsContent>{news.content}</NewsContent>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ClanNewsModal; 