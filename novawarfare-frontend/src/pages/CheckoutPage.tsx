import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  background: rgba(0, 25, 0, 0.5);
  padding: 100px 20px 20px;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Form = styled.form`
  background: rgba(0, 40, 0, 0.6);
  border: 1px solid #00cc00;
  padding: 30px;
`;

const Title = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 32px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 40px;
  text-transform: uppercase;
`;

const FormSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  background: rgba(0, 40, 0, 0.6);
  border: 1px solid #00cc00;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #99ff99;
  }
`;

const OrderSummary = styled.div`
  background: rgba(0, 40, 0, 0.6);
  border: 1px solid #00cc00;
  padding: 30px;
  height: fit-content;
`;

const SummaryTitle = styled.h2`
  font-family: 'Courier New', monospace;
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #99ff99;
`;

const Total = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 204, 0, 0.2);
  font-family: 'Courier New', monospace;
  font-size: 20px;
  color: #00cc00;
  font-weight: bold;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(90deg, #00cc00 0%, #99ff99 100%);
  border: none;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 30px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff3333;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
`;

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Здесь будет логика отправки заказа на сервер
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      clearCart();
      navigate('/profile');
    } catch (err) {
      setError('Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Container>
      <Content>
        <Form onSubmit={handleSubmit}>
          <Title>ОФОРМЛЕНИЕ ЗАКАЗА</Title>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <FormSection>
            <SectionTitle>КОНТАКТНАЯ ИНФОРМАЦИЯ</SectionTitle>
            <Input
              type="text"
              placeholder="ФИО"
              defaultValue={user?.name || ''}
              required
            />
            <Input
              type="email"
              placeholder="EMAIL"
              defaultValue={user?.email || ''}
              required
            />
            <Input
              type="tel"
              placeholder="ТЕЛЕФОН"
              required
            />
          </FormSection>

          <FormSection>
            <SectionTitle>АДРЕС ДОСТАВКИ</SectionTitle>
            <Input
              type="text"
              placeholder="АДРЕС"
              required
            />
            <Input
              type="text"
              placeholder="ГОРОД"
              required
            />
            <Input
              type="text"
              placeholder="ИНДЕКС"
              required
            />
          </FormSection>

          <FormSection>
            <SectionTitle>ПЛАТЕЖНАЯ ИНФОРМАЦИЯ</SectionTitle>
            <Input
              type="text"
              placeholder="НОМЕР КАРТЫ"
              required
            />
            <Input
              type="text"
              placeholder="ИМЯ НА КАРТЕ"
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Input
                type="text"
                placeholder="ММ/ГГ"
                required
              />
              <Input
                type="text"
                placeholder="CVV"
                required
              />
            </div>
          </FormSection>
        </Form>

        <OrderSummary>
          <SummaryTitle>ИТОГИ ЗАКАЗА</SummaryTitle>
          {items.map((item) => (
            <SummaryItem key={item.id}>
              <span>{item.name} x {item.quantity}</span>
              <span>{item.price * item.quantity} CREDITS</span>
            </SummaryItem>
          ))}
          <Total>
            <span>ИТОГО</span>
            <span>{totalPrice} CREDITS</span>
          </Total>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'ОФОРМЛЕНИЕ...' : 'ПОДТВЕРДИТЬ ЗАКАЗ'}
          </SubmitButton>
        </OrderSummary>
      </Content>
    </Container>
  );
};

export default CheckoutPage; 