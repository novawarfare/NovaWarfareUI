import React from 'react';
import styled, { keyframes } from 'styled-components';

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  type, 
  title, 
  message, 
  onClose, 
  duration = 5000 
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          color: '#00ff00',
          bgColor: 'rgba(0, 255, 0, 0.25)',
          borderColor: '#00ff00',
          icon: '✓'
        };
      case 'error':
        return {
          color: '#ff0000',
          bgColor: 'rgba(255, 0, 0, 0.25)',
          borderColor: '#ff0000',
          icon: '✗'
        };
      case 'info':
        return {
          color: '#00d4ff',
          bgColor: 'rgba(0, 212, 255, 0.25)',
          borderColor: '#00d4ff',
          icon: 'ℹ'
        };
      default:
        return {
          color: '#ffffff',
          bgColor: 'rgba(255, 255, 255, 0.25)',
          borderColor: '#ffffff',
          icon: '•'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <NotificationOverlay>
      <NotificationContainer config={config}>
        <NotificationHeader>
          <NotificationIcon>{config.icon}</NotificationIcon>
          <NotificationTitle>{title}</NotificationTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </NotificationHeader>
        <NotificationMessage>{message}</NotificationMessage>
        <ProgressBar config={config} duration={duration} />
      </NotificationContainer>
    </NotificationOverlay>
  );
};

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const NotificationOverlay = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  animation: ${slideIn} 0.3s ease-out;
`;

const NotificationContainer = styled.div<{ config: any }>`
  background: ${props => props.config.bgColor};
  border: 2px solid ${props => props.config.borderColor};
  color: ${props => props.config.color};
  padding: 20px;
  min-width: 300px;
  max-width: 400px;
  font-family: 'Courier New', monospace;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: ${props => props.config.borderColor};
    opacity: 0.2;
    z-index: -1;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const NotificationIcon = styled.span`
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 10px;
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.7;
  }
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 15px;
`;

const progressAnimation = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

const ProgressBar = styled.div<{ config: any; duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => props.config.borderColor};
  animation: ${progressAnimation} ${props => props.duration}ms linear;
`;

export default Notification; 