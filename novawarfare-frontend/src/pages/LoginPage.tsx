import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resendVerificationEmail } from '../services/authService';

const Background = styled.div`
  min-height: 100vh;
  background: radial-gradient(ellipse at center, #071d07 0%, #041004 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Courier New', monospace;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='2' height='2' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.2' fill='%23004000' fill-opacity='0.3'/%3E%3C/svg%3E");
    pointer-events: none;
  }
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
  padding: 20px 24px 18px 24px;
  border-radius: 0;
  max-width: 320px;
  position: relative;
  text-align: center;
  z-index: 1;
`;

const AccessTitle = styled.h1`
  font-size: 1.3rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  font-weight: bold;
  &::before, &::after {
    content: '//';
    color: #66ff66;
    margin: 0 5px;
  }
`;

const SubStatus = styled.div`
  color: #66ff66;
  font-size: 12px;
  margin-bottom: 16px;
  letter-spacing: 1px;
`;

const InputBlock = styled.div`
  margin-bottom: 12px;
`;

const InputLabel = styled.div`
  color: #66ff66;
  font-size: 13px;
  margin-bottom: 3px;
  letter-spacing: 1px;
  text-align: left;
`;

const InputField = styled.input`
  width: 100%;
  background: transparent;
  border: 1px solid #66ff66;
  color: #fff;
  font-size: 15px;
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
  font-size: 10px;
  margin-bottom: 6px;
  letter-spacing: 1px;
`;

const EncryptionText = styled.div`
  color: #66ff66;
  font-size: 10px;
  margin-bottom: 6px;
  letter-spacing: 1px;
`;

const AuthorizeButton = styled.button`
  width: 100%;
  background: linear-gradient(90deg, #2e5e2e 0%, #66ff66 100%);
  border: 1px solid #66ff66;
  color: #fff;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  text-transform: uppercase;
  padding: 7px 0;
  margin: 12px 0 14px 0;
  cursor: pointer;
  border-radius: 0;
  letter-spacing: 1px;
  box-shadow: 0 0 0 1px #66ff66 inset;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #66ff66;
    color: #0a1a08;
  }
`;

const LinkRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
`;

const FrameLink = styled(Link)`
  color: #66ff66;
  font-size: 11px;
  text-decoration: none;
  letter-spacing: 1px;
  padding: 3px 7px;
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
  margin-bottom: 10px;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #66ff66;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 6px;
  
  &:hover {
    color: #fff;
  }
`;

const LoginPage: React.FC = () => {
  const { login, isAdmin } = useAuth();
  const [personnelId, setPersonnelId] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setResendStatus('');
    setLoading(true);
    try {
      await login(personnelId, securityCode);
      
      // Check if user is admin
      if (isAdmin()) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendStatus('');
    try {
      const success = await resendVerificationEmail(personnelId);
      if (success) {
        setResendStatus('Verification email has been resent. Please check your inbox.');
      } else {
        setResendStatus('Failed to resend email. Please try again later.');
      }
    } catch (err) {
      setResendStatus('An error occurred. Please try again later.');
    }
  };

  // Check if error mentions unverified email
  const isEmailVerificationError = localError.toLowerCase().includes('email') && 
                                  localError.toLowerCase().includes('not verified');

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
          
          <line x1="0" y1="300" x2="800" y2="300" stroke="#66ff66" strokeWidth="1" opacity="0.3">
            <animate attributeName="y1" from="0" to="600" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="y2" from="0" to="600" dur="3s" repeatCount="indefinite"/>
          </line>
          <line x1="400" y1="0" x2="400" y2="600" stroke="#66ff66" strokeWidth="1" opacity="0.3">
            <animate attributeName="x1" from="0" to="800" dur="4s" repeatCount="indefinite"/>
            <animate attributeName="x2" from="0" to="800" dur="4s" repeatCount="indefinite"/>
          </line>
          
          <circle cx="400" cy="300" r="5" fill="url(#scanline)">
            <animate attributeName="r" values="5;50;5" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
        </g>
      </HudGrid>
      <CenterBlock>
        <AccessFrame>
          <AccessTitle>SYSTEM ACCESS</AccessTitle>
          <SubStatus>INITIALIZING SECURE CONNECTION...</SubStatus>
          <form onSubmit={handleSubmit} autoComplete="off">
            {localError && 
              <ErrorMsg>
                {localError}
                {isEmailVerificationError && (
                  <div>
                    <ResendButton type="button" onClick={handleResendVerification}>
                      RESEND VERIFICATION EMAIL
                    </ResendButton>
                  </div>
                )}
              </ErrorMsg>
            }
            {resendStatus && <StatusText>{resendStatus}</StatusText>}
            <InputBlock>
              <InputLabel>PERSONNEL ID:</InputLabel>
              <InputField
                type="text"
                value={personnelId}
                onChange={e => setPersonnelId(e.target.value)}
                autoFocus
                required
              />
              <StatusText>STATUS: AWAITING INPUT</StatusText>
            </InputBlock>
            <InputBlock>
              <InputLabel>SECURITY CODE:</InputLabel>
              <InputField
                type="password"
                value={securityCode}
                onChange={e => setSecurityCode(e.target.value)}
                required
              />
              <EncryptionText>ENCRYPTION: LEVEL 4</EncryptionText>
            </InputBlock>
            <AuthorizeButton type="submit" disabled={loading}>
              {loading ? 'AUTHORIZING...' : 'AUTHORIZE'}
            </AuthorizeButton>
          </form>
          <LinkRow>
            <FrameLink to="/register">NEW CLEARANCE REQUEST</FrameLink>
            <FrameLink to="/forgot-password">CODE RESET PROTOCOL</FrameLink>
          </LinkRow>
        </AccessFrame>
      </CenterBlock>
    </Background>
  );
};

export default LoginPage; 