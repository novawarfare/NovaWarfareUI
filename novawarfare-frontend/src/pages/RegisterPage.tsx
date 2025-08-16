import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import NotificationContainer from '../components/common/NotificationContainer';

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
  padding: 18px 22px 15px 22px;
  border-radius: 0;
  max-width: 300px;
  position: relative;
  text-align: center;
  z-index: 1;
`;

const AccessTitle = styled.h1`
  font-size: 1.2rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 15px;
  font-weight: bold;
  &::before, &::after {
    content: '//';
    color: #66ff66;
    margin: 0 5px;
  }
`;

const SubStatus = styled.div`
  color: #66ff66;
  font-size: 11px;
  margin-bottom: 15px;
  letter-spacing: 1px;
`;

const InputBlock = styled.div`
  margin-bottom: 10px;
`;

const InputLabel = styled.div`
  color: #66ff66;
  font-size: 12px;
  margin-bottom: 2px;
  letter-spacing: 1px;
  text-align: left;
`;

const InputField = styled.input`
  width: 100%;
  background: transparent;
  border: 1px solid #66ff66;
  color: #fff;
  font-size: 14px;
  padding: 5px 8px;
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
  font-size: 9px;
  margin-bottom: 5px;
  letter-spacing: 1px;
`;

const EncryptionText = styled.div`
  color: #66ff66;
  font-size: 9px;
  margin-bottom: 5px;
  letter-spacing: 1px;
`;

const RegisterButton = styled.button`
  width: 100%;
  background: linear-gradient(90deg, #2e5e2e 0%, #66ff66 100%);
  border: 1px solid #66ff66;
  color: #fff;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  text-transform: uppercase;
  padding: 6px 0;
  margin: 10px 0 12px 0;
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
  gap: 10px;
  margin-top: 8px;
  font-size: 10px;
`;

const FrameLink = styled(Link)`
  color: #66ff66;
  font-size: 10px;
  text-decoration: none;
  letter-spacing: 1px;
  padding: 3px 6px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  &:hover {
    color: #fff;
    border-color: #66ff66;
  }
`;



const InfoOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 20, 0, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const InfoBox = styled.div`
  background: rgba(0, 30, 0, 0.9);
  border: 2px solid #66ff66;
  padding: 25px;
  max-width: 320px;
  width: 90%;
  position: relative;
`;

const InfoTitle = styled.h3`
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 15px;
  text-align: center;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  text-transform: uppercase;
  &::before, &::after {
    content: '//';
    color: #66ff66;
    margin: 0 5px;
  }
`;

const InfoText = styled.p`
  color: #fff;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 15px;
  font-family: 'Courier New', monospace;
  text-align: center;
`;

const InfoButton = styled.button`
  background: linear-gradient(90deg, #2e5e2e 0%, #66ff66 100%);
  border: 1px solid #66ff66;
  color: #fff;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  text-transform: uppercase;
  padding: 6px 20px;
  margin: 10px auto;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.2s;
  display: block;
  
  &:hover {
    background: #66ff66;
    color: #0a1a08;
  }
`;

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { notifications, removeNotification, showError } = useNotification();

  // Функция для форматирования телефонного номера
  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы для анализа
    const digits = value.replace(/\D/g, '');
    
    // Определяем, использовать ли формат +1 или обычный формат
    if (value.startsWith('+1')) {
      if (digits.length <= 1) {
        return '+1 ';
      } else if (digits.length <= 4) {
        return `+1 ${digits.slice(1)}`;
      } else if (digits.length <= 7) {
        return `+1 ${digits.slice(1, 4)} ${digits.slice(4)}`;
      } else {
        return `+1 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
      }
    } else {
      if (digits.length <= 3) {
        return digits.length ? `(${digits}` : '';
      } else if (digits.length <= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      }
    }
  };

  // Обработчик изменения телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Запрещаем редактирование "+1 " в начале, если оно есть
    if (inputValue.startsWith('+1') && !phone.startsWith('+1')) {
      setPhone('+1 ');
      setFormattedPhone('+1 ');
      return;
    }
    
    // Добавляем проверку на допустимые символы: цифры, пробелы, (), -, +
    const isValidChar = /^[0-9\s()\-+]*$/.test(inputValue);
    
    if (isValidChar) {
      setPhone(inputValue);
      setFormattedPhone(formatPhoneNumber(inputValue));
    }
  };

  // Форматируем телефон при вводе
  useEffect(() => {
    setFormattedPhone(formatPhoneNumber(phone));
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация имени (минимум 3 символа)
    if (name.trim().length < 3) {
      showError('Invalid Callsign', 'COMANDOS CALLSIGN MUST BE AT LEAST 3 CHARACTERS');
      return;
    }

    // Валидация пароля (минимум 7 символов: цифры, буквы и хотя бы один специальный символ)
    if (password.length < 7) {
      showError('Weak Security Code', 'SECURITY CODE MUST BE AT LEAST 7 CHARACTERS');
      return;
    }

    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasNumber || !hasLetter || !hasSpecialChar) {
      showError('Weak Security Code', 'SECURITY CODE MUST CONTAIN NUMBERS, LETTERS AND SPECIAL CHARACTERS');
      return;
    }

    if (password !== confirmPassword) {
      showError('Security Code Mismatch', 'SECURITY CODES DO NOT MATCH');
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      await register(name, email, password, cleanPhone);
      // После регистрации показываем сообщение о необходимости подтверждения email
      setRegistrationComplete(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Получаем точный текст ошибки от API
      const errorMessage = err.response?.data?.message || err.message || 'REGISTRATION FAILED: ACCESS DENIED';
      
      // Если это ошибка о существующем пользователе, используем более понятный заголовок
      if (errorMessage.includes('User with this email already exists')) {
        showError('User Already Exists', errorMessage);
      } else {
        showError('Registration Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Модальное окно после успешной регистрации
  if (registrationComplete) {
    return (
      <InfoOverlay>
        <InfoBox>
          <InfoTitle>REGISTRATION SUCCESSFUL</InfoTitle>
          
          <InfoText>
            Please check your email ({email}) to verify your account.
          </InfoText>
          
          <InfoText>
            A verification link has been sent to your email. Click the link to complete your registration.
          </InfoText>
          
          <InfoText>
            <strong style={{ color: '#66ff66' }}>IMPORTANT:</strong> The verification link will expire in 24 hours.
          </InfoText>
          
          <InfoButton onClick={() => navigate('/')}>
            RETURN TO HOME BASE
          </InfoButton>
        </InfoBox>
      </InfoOverlay>
    );
  }

  return (
    <Background>
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
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
          <AccessTitle>NEW COMANDOS REGISTRATION</AccessTitle>
          <SubStatus>INITIALIZING BIOMETRIC SIGNATURE...</SubStatus>
          
          <form onSubmit={handleSubmit} autoComplete="off">
            
            <InputBlock>
              <InputLabel>COMANDOS CALLSIGN:</InputLabel>
              <InputField
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              <StatusText>MINIMUM: 3 CHARACTERS</StatusText>
            </InputBlock>

            <InputBlock>
              <InputLabel>COMM FREQUENCY:</InputLabel>
              <InputField
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <StatusText>FORMAT:CLASSIFIED@DOMAIN.COM</StatusText>
            </InputBlock>

            <InputBlock>
              <InputLabel>PHONE NUMBER:</InputLabel>
              <InputField
                type="tel"
                value={formattedPhone}
                onChange={handlePhoneChange}
                required
                inputMode="tel"
                placeholder=""
                maxLength={17}
              />
              <StatusText>FORMAT: (555) 123-4567 OR +1 555 123 4567</StatusText>
            </InputBlock>

            <InputBlock>
              <InputLabel>SECURITY CODE:</InputLabel>
              <InputField
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <EncryptionText>REQUIRES: 7+ CHARS, NUMBERS, LETTERS, SYMBOLS</EncryptionText>
            </InputBlock>

            <InputBlock>
              <InputLabel>VERIFY CODE:</InputLabel>
              <InputField
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <StatusText>MUST MATCH SECURITY CODE</StatusText>
            </InputBlock>
            
            <RegisterButton type="submit" disabled={loading}>
              {loading ? 'PROCESSING...' : 'REGISTER'}
            </RegisterButton>
          </form>
          
          <LinkRow>
            <FrameLink to="/login">EXISTING CLEARANCE</FrameLink>
            <FrameLink to="/">RETURN TO HOME BASE</FrameLink>
          </LinkRow>
        </AccessFrame>
      </CenterBlock>
    </Background>
  );
};

export default RegisterPage; 