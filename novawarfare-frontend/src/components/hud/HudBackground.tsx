import React from 'react';
import styled, { keyframes } from 'styled-components';

const scanAnimation = keyframes`
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100vh);
  }
`;

const pulseAnimation = keyframes`
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.7;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #001a00 0%, #003300 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(#00cc00 1px, transparent 1px);
  background-size: 10px 10px;
  opacity: 0.1;
  pointer-events: none;
`;

const HudGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.2;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 700px;
    height: 700px;
    border: 1px solid #00cc00;
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 500px;
    border: 1px solid #00cc00;
    border-radius: 50%;
  }
`;

const ScanLine = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 0.5px;
  background: #00ff00;
  opacity: 0.8;
  animation: ${scanAnimation} 5s linear infinite, ${pulseAnimation} 2s linear infinite;
  pointer-events: none;
  z-index: 9999;
  box-shadow: 0 0 5px #00ff00, 0 0 3px #00ff00;
`;

interface HudBackgroundProps {
  children: React.ReactNode;
}

const HudBackground: React.FC<HudBackgroundProps> = ({ children }) => {
  return (
    <Container>
      <BackgroundPattern />
      <HudGrid />
      <ScanLine />
      {children}
    </Container>
  );
};

export default HudBackground; 