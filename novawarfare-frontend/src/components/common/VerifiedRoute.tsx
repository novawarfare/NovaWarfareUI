import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const VerificationWarning = styled.div`
  background: rgba(0, 25, 0, 0.9);
  border: 2px solid #ff9900;
  box-shadow: 0 0 30px #00330055;
  padding: 25px 30px;
  margin: 20px auto;
  max-width: 600px;
  text-align: center;
  color: white;
`;

const WarningTitle = styled.h2`
  color: #ff9900;
  margin-bottom: 15px;
  font-size: 1.5rem;
`;

const WarningText = styled.p`
  margin-bottom: 15px;
  line-height: 1.5;
`;

const ResendButton = styled.button`
  background: rgba(255, 153, 0, 0.2);
  border: 1px solid #ff9900;
  color: #ff9900;
  font-size: 16px;
  padding: 8px 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 153, 0, 0.4);
  }
`;

const StatusMessage = styled.div<{ success?: boolean }>`
  color: ${props => props.success ? '#66ff66' : '#ff9900'};
  margin-top: 10px;
  font-size: 14px;
`;

interface VerifiedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const VerifiedRoute: React.FC<VerifiedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { user, isEmailVerified, resendVerification, initializing } = useAuth();
  const [resendStatus, setResendStatus] = useState('');
  const [success, setSuccess] = useState(false);

  // Ждем завершения инициализации
  if (initializing) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: "'Courier New', monospace",
      color: '#00cc00',
      backgroundColor: '#000'
    }}>
      ЗАГРУЗКА...
    </div>;
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to={redirectTo} />;
  }

  // Если email верифицирован, разрешаем доступ
  if (isEmailVerified()) {
    return <>{children}</>;
  }

  const handleResend = async () => {
    setResendStatus('Отправка письма...');
    setSuccess(false);
    try {
      const result = await resendVerification();
      if (result) {
        setResendStatus('Письмо для подтверждения email успешно отправлено. Пожалуйста, проверьте вашу почту.');
        setSuccess(true);
      } else {
        setResendStatus('Не удалось отправить письмо. Пожалуйста, попробуйте позже.');
      }
    } catch (err) {
      setResendStatus('Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
  };

  // Если email не верифицирован, показываем предупреждение
  return (
    <VerificationWarning>
      <WarningTitle>EMAIL NOT VERIFIED</WarningTitle>
      <WarningText>
        To access this section, you need to verify your email address.
        Please check your email ({user.email}) and click the link in the message.
      </WarningText>
      <WarningText>
        If you didn't receive the verification email, you can request to resend it.
      </WarningText>
      <ResendButton onClick={handleResend}>
        RESEND VERIFICATION EMAIL
      </ResendButton>
      {resendStatus && (
        <StatusMessage success={success}>
          {resendStatus}
        </StatusMessage>
      )}
    </VerificationWarning>
  );
};

export default VerifiedRoute; 