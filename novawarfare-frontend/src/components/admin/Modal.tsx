import React, { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 25, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalContainer = styled.div`
  background: rgba(0, 35, 0, 0.95);
  border: 2px solid #cc3000;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0 20px rgba(204, 48, 0, 0.3);
  position: relative;
`;

const ModalHeader = styled.div`
  background: rgba(50, 0, 0, 0.5);
  padding: 15px 20px;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  color: #ffffff;
  text-transform: uppercase;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #cc3000;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #cc3000;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #ffffff;
  }
`;

const ModalContent = styled.div`
  padding: 20px;
`;

const StatusLine = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(204, 48, 0, 0.5);
  display: flex;
  justify-content: space-between;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  color: #cc3000;
  padding: 2px 10px;
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const sessionId = `MOD-${Math.floor(Math.random() * 1000000)}`;

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <div>{title}</div>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalContent>
          {children}
        </ModalContent>
        <StatusLine>
          SESSION: {sessionId} • SECURE PROTOCOL ACTIVE
        </StatusLine>
      </ModalContainer>
    </Overlay>
  );
};

export default Modal; 