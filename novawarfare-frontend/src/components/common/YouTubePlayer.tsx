import React, { useState } from 'react';
import styled from 'styled-components';

interface YouTubePlayerProps {
  videoUrl: string;
  autoplay?: boolean;
  className?: string;
}

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: rgba(0, 25, 0, 0.3);
  border: 1px solid #00cc00;
  border-radius: 4px;
  overflow: hidden;
`;

const VideoFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
`;

const FullscreenButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #00cc00;
  color: #00cc00;
  padding: 8px 12px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  border-radius: 3px;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 51, 0, 0.8);
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #cc3000;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  text-align: center;
`;

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ 
  videoUrl, 
  autoplay = true, 
  className 
}) => {
  const [error, setError] = useState(false);

  // Функция для извлечения ID видео из YouTube URL
  const extractVideoId = (url: string): string | null => {
    try {
      // Поддерживаем различные форматы YouTube URL
      const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const videoId = extractVideoId(videoUrl);

  if (!videoId || error) {
    return (
      <PlayerContainer className={className}>
        <ErrorMessage>
          ВИДЕО НЕДОСТУПНО<br />
          ПРОВЕРЬТЕ ССЫЛКУ
        </ErrorMessage>
      </PlayerContainer>
    );
  }

  // Создаем embed URL с параметрами
  const embedUrl = `https://www.youtube.com/embed/${videoId}?` +
    `autoplay=${autoplay ? 1 : 0}&` +
    `mute=${autoplay ? 1 : 0}&` +
    `controls=1&` +
    `modestbranding=1&` +
    `rel=0&` +
    `showinfo=0`;

  const openFullscreen = () => {
    const fullscreenUrl = `https://www.youtube.com/watch?v=${videoId}`;
    window.open(fullscreenUrl, '_blank');
  };

  return (
    <PlayerContainer className={className}>
      <VideoFrame
        src={embedUrl}
        title="Mission Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={() => setError(true)}
      />
      <FullscreenButton onClick={openFullscreen} title="Открыть в полноэкранном режиме">
        FULLSCREEN
      </FullscreenButton>
    </PlayerContainer>
  );
};

export default YouTubePlayer; 