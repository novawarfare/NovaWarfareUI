import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container>
      <Content>
        <ErrorCode>404</ErrorCode>
        <ErrorTitle>Page Not Found</ErrorTitle>
        <ErrorDescription>
          The page you're looking for doesn't exist or has been moved.
        </ErrorDescription>
        <ButtonGroup>
          <BackButton onClick={handleGoBack}>
            Go Back
          </BackButton>
          <HomeButton onClick={handleGoHome}>
            Go Home
          </HomeButton>
        </ButtonGroup>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
`;

const Content = styled.div`
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  color: #00d4ff;
  margin: 0;
  font-weight: bold;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  
  @media (max-width: 768px) {
    font-size: 6rem;
  }
`;

const ErrorTitle = styled.h2`
  font-size: 2rem;
  color: #ffffff;
  margin: 20px 0;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ErrorDescription = styled.p`
  font-size: 1.1rem;
  color: #b0b0b0;
  margin: 20px 0 40px 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 0.1);
    border-color: #00d4ff;
    transform: translateY(-2px);
  }
`;

const HomeButton = styled.button`
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #0099cc, #007aa3);
    transform: translateY(-2px);
  }
`;

export default NotFoundPage; 