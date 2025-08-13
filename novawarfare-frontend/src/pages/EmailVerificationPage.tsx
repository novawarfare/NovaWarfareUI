import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../constants/api';
import { performLogout } from '../services/authService';

const Background = styled.div`
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #143d14 0%, #0a1a08 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Courier New', monospace;
`;

const TopPanel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  background: rgba(0, 51, 0, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  z-index: 4;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: white;
  letter-spacing: 1px;
  
  span {
    color: #66ff66;
  }
`;

const StatusPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 12px;
  color: #66ff66;
  letter-spacing: 1px;
  line-height: 20px;
`;

const CenterBlock = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const VerificationFrame = styled.div`
  background: rgba(0, 25, 0, 0.7);
  border: 1px solid #66ff66;
  box-shadow: 0 0 30px #00330055;
  padding: 30px;
  border-radius: 0;
  width: 500px;
  position: relative;
  text-align: center;
  z-index: 1;
`;

const CornerMarker = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #66ff66;
  border-style: solid;
  border-width: 0;
  
  &.top-left {
    top: 0;
    left: 0;
    border-left-width: 2px;
    border-top-width: 2px;
  }
  
  &.top-right {
    top: 0;
    right: 0;
    border-right-width: 2px;
    border-top-width: 2px;
  }
  
  &.bottom-left {
    bottom: 0;
    left: 0;
    border-left-width: 2px;
    border-bottom-width: 2px;
  }
  
  &.bottom-right {
    bottom: 0;
    right: 0;
    border-right-width: 2px;
    border-bottom-width: 2px;
  }
`;

const ScanLine = styled.div`
  position: absolute;
  left: 20px;
  right: 20px;
  height: 1px;
  background: #66ff66;
  opacity: 0.7;
  z-index: 0;
  animation: scanAnimation 10s linear infinite;
  
  @keyframes scanAnimation {
    from { top: 120px; }
    to { top: 520px; }
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
  font-weight: bold;
  
  .slash {
    color: #66ff66;
    margin: 0 6px;
  }
`;

const StatusText = styled.div<{ success?: boolean; error?: boolean; }>`
  font-size: 16px;
  color: ${props => props.success ? '#66ff66' : props.error ? '#ff3333' : '#ffffff'};
  margin: 15px 0;
  padding: 10px;
  border: 1px dashed ${props => props.success ? '#66ff66' : props.error ? '#ff3333' : 'transparent'};
  background: ${props => props.success ? 'rgba(102, 255, 102, 0.1)' : props.error ? 'rgba(255, 51, 51, 0.1)' : 'transparent'};
`;

const LoadingIcon = styled.div`
  width: 40px;
  height: 40px;
  margin: 20px auto;
  border: 2px solid rgba(102, 255, 102, 0.3);
  border-radius: 50%;
  border-top-color: #66ff66;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const VerificationStatus = styled.div<{ success?: boolean; error?: boolean; }>`
  display: inline-block;
  margin: 20px 0;
  padding: 8px 15px;
  background-color: ${props => props.success ? 'rgba(102, 255, 102, 0.2)' : props.error ? 'rgba(255, 51, 51, 0.2)' : 'rgba(255, 204, 0, 0.2)'};
  border: 1px solid ${props => props.success ? '#66ff66' : props.error ? '#ff3333' : '#ffcc00'};
  color: ${props => props.success ? '#66ff66' : props.error ? '#ff3333' : '#ffcc00'};
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  animation: ${props => props.success || props.error ? 'none' : 'blink 1.5s infinite'};
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const Button = styled.button`
  background: rgba(0, 40, 0, 0.5);
  border: 2px solid #66ff66;
  color: #fff;
  font-size: 18px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  text-transform: uppercase;
  padding: 8px 25px;
  margin: 15px 0;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(102, 255, 102, 0.2);
  }
`;

const ProgressBar = styled.div`
  height: 5px;
  width: 100%;
  background-color: rgba(0, 51, 0, 0.5);
  margin: 20px 0;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 30%;
    background-color: #66ff66;
    animation: progress 2s ease-in-out forwards;
  }
  
  @keyframes progress {
    from { width: 0; }
    to { width: 100%; }
  }
`;

enum VerificationState {
  LOADING,
  SUCCESS,
  ERROR
}

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verificationState, setVerificationState] = useState<VerificationState>(VerificationState.LOADING);
  const [message, setMessage] = useState<string>('Verifying your email address...');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationState(VerificationState.ERROR);
        setMessage('No verification token provided. Please check your email link and try again.');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/EmailVerification/${token}`);
        console.log('Ответ верификации:', response);
        setVerificationState(VerificationState.SUCCESS);
        setMessage('Your email has been successfully verified! You can now access all features of NovaWarfare.');
        
        // Дополнительная задержка для UX перед редиректом
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } catch (error) {
        console.error('Verification error:', error);
        
        // Обрабатываем ошибку 401 (истекший токен)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log('Получен статус 401 при верификации email');
          performLogout();
          return;
        }
        
        setVerificationState(VerificationState.ERROR);
        setMessage('Invalid or expired verification token. Please try registering again.');
      }
    };

    // Задержка для более естественной анимации загрузки
    const timer = setTimeout(() => {
      verifyEmail();
    }, 2000);

    return () => clearTimeout(timer);
  }, [token, navigate]);

  const getStatusBadge = () => {
    switch (verificationState) {
      case VerificationState.LOADING:
        return <VerificationStatus>Verifying</VerificationStatus>;
      case VerificationState.SUCCESS:
        return <VerificationStatus success>Verified</VerificationStatus>;
      case VerificationState.ERROR:
        return <VerificationStatus error>Failed</VerificationStatus>;
    }
  };

  const handleNavigate = () => {
    navigate(verificationState === VerificationState.SUCCESS ? '/login' : '/register');
  };

  return (
    <Background>
      <TopPanel>
        <Logo>NOVA<span>WARFARE</span></Logo>
        <StatusPanel>
          <div>STATUS: ACTIVE</div>
          <div>SECURE CONNECTION: ESTABLISHED</div>
        </StatusPanel>
      </TopPanel>
      
      <CenterBlock>
        <VerificationFrame>
          <CornerMarker className="top-left" />
          <CornerMarker className="top-right" />
          <CornerMarker className="bottom-left" />
          <CornerMarker className="bottom-right" />
          <ScanLine />
          
          <Title>
            <span className="slash">//</span> EMAIL VERIFICATION <span className="slash">//</span>
          </Title>
          
          {verificationState === VerificationState.LOADING && <ProgressBar />}
          {verificationState === VerificationState.LOADING && <LoadingIcon />}
          
          {getStatusBadge()}
          
          <StatusText 
            success={verificationState === VerificationState.SUCCESS}
            error={verificationState === VerificationState.ERROR}
          >
            {message}
          </StatusText>
          
          <Button onClick={handleNavigate}>
            {verificationState === VerificationState.SUCCESS ? 'PROCEED TO LOGIN' : 'RETURN TO REGISTRATION'}
          </Button>
        </VerificationFrame>
      </CenterBlock>
    </Background>
  );
};

export default EmailVerificationPage; 