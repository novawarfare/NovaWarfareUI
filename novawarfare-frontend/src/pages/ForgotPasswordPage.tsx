import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { initiatePasswordReset } from '../services/passwordResetService';

// Стили компонентов
const Background = styled.div`
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #143d14 0%, #0a1a08 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Courier New', monospace;
`;

const HudGrid = styled.svg`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  z-index: 3;
  opacity: 0.3;
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

const AccessFrame = styled.div`
  background: rgba(0, 25, 0, 0.9);
  border: 2px solid #66ff66;
  box-shadow: 0 0 30px #00330055;
  padding: 25px 30px 20px 30px;
  border-radius: 0;
  min-width: 340px;
  position: relative;
  text-align: center;
  z-index: 1;
`;

const AccessTitle = styled.h1`
  font-size: 1.5rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 20px;
  font-weight: bold;
  &::before, &::after {
    content: '//';
    color: #66ff66;
    margin: 0 6px;
  }
`;

const SubStatus = styled.div`
  color: #66ff66;
  font-size: 12px;
  margin-bottom: 20px;
  letter-spacing: 1px;
`;

const InputBlock = styled.div`
  margin-bottom: 12px;
`;

const InputLabel = styled.div`
  color: #66ff66;
  font-size: 14px;
  margin-bottom: 3px;
  letter-spacing: 1px;
  text-align: left;
`;

const InputField = styled.input`
  width: 100%;
  background: transparent;
  border: 1px solid #66ff66;
  color: #fff;
  font-size: 16px;
  padding: 6px 10px;
  margin-bottom: 0;
  outline: none;
  font-family: 'Courier New', monospace;
  border-radius: 0;
  text-align: center;
  letter-spacing: 1px;
  transition: border 0.2s;
  &:focus {
    border-color: #99ff99;
  }
`;

const StatusText = styled.div`
  color: #66ff66;
  font-size: 11px;
  margin-bottom: 12px;
  letter-spacing: 1px;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(90deg, #2e5e2e 0%, #66ff66 100%);
  border: 1px solid #66ff66;
  color: #fff;
  font-size: 18px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  text-transform: uppercase;
  padding: 8px 0;
  margin: 12px 0 16px 0;
  cursor: pointer;
  border-radius: 0;
  letter-spacing: 1px;
  box-shadow: 0 0 0 1px #66ff66 inset;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #66ff66;
    color: #0a1a08;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LinkRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 12px;
`;

const FrameLink = styled(Link)`
  color: #66ff66;
  font-size: 12px;
  text-decoration: none;
  letter-spacing: 1px;
  padding: 4px 8px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  &:hover {
    color: #fff;
    border-color: #66ff66;
  }
`;

const ErrorMsg = styled.div`
  color: #ff3333;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  text-align: center;
  margin-bottom: 8px;
`;

const SuccessMsg = styled.div`
  color: #66ff66;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
  padding: 10px;
  border: 1px dashed #66ff66;
  background: rgba(102, 255, 102, 0.1);
`;

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await initiatePasswordReset(email);
      
      if (response.success) {
        setSuccess(true);
        setSuccessMessage(response.message);
        // Сохраняем email в sessionStorage для использования на следующем шаге
        sessionStorage.setItem('resetEmail', email);
        
        // Переход на страницу ввода кода через 3 секунды
        setTimeout(() => {
          navigate('/reset-password-code');
        }, 3000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Error processing request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <HudGrid width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#66ff66" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#66ff66" stopOpacity="0.1"/>
          </linearGradient>
          <radialGradient id="scanline" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#66ff66" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#66ff66" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <g>
          <path d="M0,0 L800,0 L800,600 L0,600 Z" fill="none" stroke="url(#gridGradient)" strokeWidth="0.5"/>
          <circle cx="400" cy="300" r="250" fill="none" stroke="url(#gridGradient)" strokeWidth="1">
            <animate attributeName="r" from="250" to="260" dur="4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="400" cy="300" r="200" fill="none" stroke="url(#gridGradient)" strokeWidth="1">
            <animate attributeName="r" from="200" to="210" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="400" cy="300" r="150" fill="none" stroke="url(#gridGradient)" strokeWidth="1">
            <animate attributeName="r" from="150" to="160" dur="2s" repeatCount="indefinite"/>
          </circle>
        </g>
      </HudGrid>
      
      <CenterBlock>
        <AccessFrame>
          <AccessTitle>PASSWORD RECOVERY</AccessTitle>
          <SubStatus>RECOVERY PROTOCOL ACTIVATED</SubStatus>
          
          {success ? (
            <SuccessMsg>
              {successMessage}
              <br />
              Redirecting to the next step...
            </SuccessMsg>
          ) : (
            <form onSubmit={handleSubmit} autoComplete="off">
              {error && <ErrorMsg>{error}</ErrorMsg>}
              
              <InputBlock>
                <InputLabel>ENTER YOUR EMAIL:</InputLabel>
                <InputField
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <StatusText>RECOVERY INSTRUCTIONS WILL BE SENT</StatusText>
              </InputBlock>
              
              <SubmitButton type="submit" disabled={loading || !email}>
                {loading ? 'PROCESSING...' : 'SUBMIT'}
              </SubmitButton>
            </form>
          )}
          
          <LinkRow>
            <FrameLink to="/login">BACK TO LOGIN</FrameLink>
            <FrameLink to="/register">REGISTRATION</FrameLink>
          </LinkRow>
        </AccessFrame>
      </CenterBlock>
    </Background>
  );
};

export default ForgotPasswordPage; 