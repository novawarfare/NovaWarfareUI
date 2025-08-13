import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { verifyResetCode } from '../services/passwordResetService';

// Стили компонентов (большинство стилей аналогичны ForgotPasswordPage)
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

// Стиль для ввода кода
const CodeInput = styled.input`
  width: 40px;
  height: 50px;
  margin: 0 4px;
  background: transparent;
  border: 1px solid #66ff66;
  color: #fff;
  font-size: 24px;
  text-align: center;
  outline: none;
  font-family: 'Courier New', monospace;
  transition: border 0.2s;
  
  &:focus {
    border-color: #99ff99;
    background: rgba(102, 255, 102, 0.1);
  }
`;

const CodeInputContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
`;

const EmailText = styled.div`
  color: #66ff66;
  font-size: 14px;
  margin-bottom: 20px;
  word-break: break-all;
  background: rgba(102, 255, 102, 0.1);
  padding: 5px;
  border: 1px dashed #66ff66;
`;

const ResetPasswordCodePage: React.FC = () => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Инициализация ссылок на инпуты
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Получаем email из sessionStorage при загрузке компонента
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('resetEmail');
    if (!storedEmail) {
      // Если email не найден, перенаправляем на предыдущий шаг
      navigate('/forgot-password');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  // Обработчик изменения цифры кода
  const handleChange = (index: number, value: string) => {
    // Проверяем, что введена только цифра
    if (value && !/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value.slice(0, 1); // Берем только один символ
    setCode(newCode);

    // Фокусируемся на следующем поле, если текущее заполнено
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Обработчик клавиши Backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        // Если текущее поле пустое, и нажат Backspace, фокусируемся на предыдущем
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else if (code[index] !== '') {
        // Если текущее поле не пустое, и нажат Backspace, очищаем его
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Проверяем, что все поля заполнены
    if (code.some(digit => digit === '')) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    
    setLoading(true);
    const fullCode = code.join('');

    try {
      const response = await verifyResetCode(email, fullCode);
      
      if (response.success) {
        setSuccess(true);
        
        // Сохраняем код для следующего шага
        sessionStorage.setItem('resetCode', fullCode);
        
        // Переход на страницу ввода нового пароля
        setTimeout(() => {
          navigate('/reset-password-new');
        }, 1500);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Error verifying code. Please try again later.');
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
        </defs>
        <g>
          <path d="M0,0 L800,0 L800,600 L0,600 Z" fill="none" stroke="url(#gridGradient)" strokeWidth="0.5"/>
          <circle cx="400" cy="300" r="250" fill="none" stroke="url(#gridGradient)" strokeWidth="1">
            <animate attributeName="r" from="250" to="260" dur="4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="400" cy="300" r="200" fill="none" stroke="url(#gridGradient)" strokeWidth="1">
            <animate attributeName="r" from="200" to="210" dur="3s" repeatCount="indefinite"/>
          </circle>
        </g>
      </HudGrid>
      
      <CenterBlock>
        <AccessFrame>
          <AccessTitle>CODE VERIFICATION</AccessTitle>
          <SubStatus>STEP 2 OF 3 - VERIFICATION</SubStatus>
          
          {success ? (
            <SuccessMsg>
              Code confirmed. Proceeding to set new password...
            </SuccessMsg>
          ) : (
            <form onSubmit={handleSubmit} autoComplete="off">
              {error && <ErrorMsg>{error}</ErrorMsg>}
              
              <InputBlock>
                <InputLabel>ENTER CODE FROM EMAIL:</InputLabel>
                <EmailText>{email}</EmailText>
                
                <CodeInputContainer>
                  {Array(6).fill(0).map((_, index) => (
                    <CodeInput
                      key={index}
                      ref={el => { inputRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={code[index]}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      autoFocus={index === 0}
                    />
                  ))}
                </CodeInputContainer>
                
                <StatusText>CODE VALID FOR 1 HOUR</StatusText>
              </InputBlock>
              
              <SubmitButton 
                type="submit" 
                disabled={loading || code.some(digit => digit === '')}
              >
                {loading ? 'VERIFYING...' : 'CONFIRM'}
              </SubmitButton>
            </form>
          )}
          
          <LinkRow>
            <FrameLink to="/forgot-password">CHANGE EMAIL</FrameLink>
            <FrameLink to="/login">BACK TO LOGIN</FrameLink>
          </LinkRow>
        </AccessFrame>
      </CenterBlock>
    </Background>
  );
};

export default ResetPasswordCodePage; 