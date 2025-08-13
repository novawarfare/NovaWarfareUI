import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useCart } from '../contexts/CartContext';
import HudBackground from '../components/hud/HudBackground';

const blinkAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const Container = styled.div`
  padding: 60px 20px 30px;
  max-width: 850px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 80px 12px 20px;
    max-width: 100%;
  }
`;

const PageTitle = styled.h1`
  font-family: 'Courier New', monospace;
  font-size: 24px;
  color: #ffffff;
  text-align: center;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  &::before, &::after {
    content: "//";
    color: #00cc00;
    margin: 0 12px;
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    letter-spacing: 1px;
    margin-bottom: 15px;
    
    &::before, &::after {
      margin: 0 8px;
    }
  }
`;

const StatusBar = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  
  @media (max-width: 768px) {
    font-size: 10px;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 15px;
  }
`;

const MainPanel = styled.div`
  border: 1px solid #00cc00;
  margin-bottom: 20px;
`;

const CartHeader = styled.div`
  background: rgba(0, 25, 0, 0.5);
  border-bottom: 1px solid #00cc00;
  padding: 10px 14px;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  text-transform: uppercase;
  position: relative;
  
  &::before {
    content: "•";
    margin-right: 8px;
    color: #00cc00;
  }
  
  &::after {
    content: "•";
    margin-left: 8px;
    color: #00cc00;
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 10px;
  }
`;

const PendingStatus = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #00cc00;
  animation: ${blinkAnimation} 2s infinite;
  font-size: 14px;
  
  @media (max-width: 768px) {
    position: static;
    transform: none;
    font-size: 12px;
    margin-top: 5px;
  }
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 40px 140px 1fr 100px 120px 100px;
  background: rgba(0, 40, 0, 0.8);
  padding: 8px 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  border-bottom: 1px solid rgba(0, 204, 0, 0.3);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableCell = styled.div`
  padding: 4px;
`;

const CartItemRow = styled.div`
  display: grid;
  grid-template-columns: 40px 140px 1fr 100px 120px 100px;
  padding: 14px 16px;
  font-family: 'Courier New', monospace;
  color: #ffffff;
  background: rgba(0, 25, 0, 0.5);
  border-bottom: 1px solid rgba(0, 204, 0, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
`;

// Мобильная версия карточки товара
const MobileCartItem = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    background: rgba(0, 25, 0, 0.5);
    border-bottom: 1px solid rgba(0, 204, 0, 0.1);
    padding: 15px;
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const MobileItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const MobileCheckbox = styled.div`
  width: 20px;
  height: 20px;
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.5);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  
  &.checked::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 10px;
    height: 10px;
    background: #00cc00;
  }
`;

const MobileItemInfo = styled.div`
  flex: 1;
  margin-left: 12px;
`;

const MobileMissionName = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 4px;
`;

const MobileMissionId = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  margin-bottom: 6px;
`;

const MobileMissionDetails = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #00cc00;
  margin-bottom: 10px;
`;

const MobileItemControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const MobileQuantityContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MobileQuantityLabel = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
`;

const MobileQuantityInput = styled.input`
  width: 50px;
  height: 30px;
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  text-align: center;
`;

const MobilePriceContainer = styled.div`
  text-align: right;
`;

const MobileItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
`;

const MobilePricing = styled.div`
  text-align: right;
`;

const MobileUnitPrice = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
`;

const MobileTotalPrice = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
`;

const CheckboxCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CustomCheckbox = styled.div`
  width: 20px;
  height: 20px;
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.5);
  position: relative;
  cursor: pointer;
  
  &.checked::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 10px;
    height: 10px;
    background: #00cc00;
  }
`;

const MissionId = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
`;

const MissionName = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 6px;
`;

const MissionDetails = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
`;

const QuantityField = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const QuantityInput = styled.input`
  width: 50px;
  height: 34px;
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  text-align: center;
`;

const PriceCell = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #00cc00;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TotalCell = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #00cc00;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OrderSummary = styled.div`
  display: grid;
  grid-template-columns: 5fr 1fr;
  background: rgba(0, 25, 0, 0.5);
  border-top: 1px solid #00cc00;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SystemMessage = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  padding: 16px;
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 11px;
    text-align: center;
    border-bottom: 1px solid #00cc00;
  }
`;

const SummaryDetails = styled.div`
  padding: 16px;
  border-left: 1px solid #00cc00;
  
  @media (max-width: 768px) {
    border-left: none;
    padding: 12px;
  }
`;

const SummaryRow = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-top: 12px;
    font-size: 16px;
    color: #ffffff;
    font-weight: bold;
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
    
    &:last-child {
      font-size: 18px;
    }
  }
`;

const TransactionStatus = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  padding: 12px 16px;
  text-align: center;
  background: rgba(0, 25, 0, 0.5);
  border-top: 1px solid #00cc00;
  
  @media (max-width: 768px) {
    font-size: 10px;
    padding: 10px 12px;
  }
`;

const ButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 25px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const ActionButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  text-decoration: none;
  text-align: center;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 15px;
  }
`;

const CheckoutButton = styled(ActionButton)`
  color: #ffffff;
`;

const LinkButton = styled(Link)`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  text-decoration: none;
  text-align: center;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 15px;
  }
`;

const PaymentSection = styled.div`
  border: 1px solid #00cc00;
  margin-bottom: 25px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const PaymentHeader = styled.div`
  background: rgba(0, 25, 0, 0.5);
  border-bottom: 1px solid #00cc00;
  padding: 12px 16px;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 10px;
  }
`;

const PaymentFormContainer = styled.div`
  padding: 20px;
  background: rgba(0, 25, 0, 0.5);
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const FormGroup = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  margin-bottom: 16px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 18px;
  }
`;

const FormLabel = styled.label`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #ffffff;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const FormInput = styled.input`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px 12px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 204, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 12px;
  }
`;

const ExpirationGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 90px;
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

const AuthorizeButton = styled.button`
  width: 100%;
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  padding: 12px;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    padding: 15px;
    margin-top: 20px;
  }
`;

const EncryptionInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #00cc00;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 5px;
    text-align: center;
    font-size: 10px;
  }
`;

const ProtocolSection = styled.div`
  border: 1px solid #00cc00;
  margin-bottom: 25px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const ProtocolHeader = styled.div`
  background: rgba(0, 25, 0, 0.5);
  border-bottom: 1px solid #00cc00;
  padding: 12px 16px;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #ffffff;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px 10px;
  }
`;

const ProtocolContent = styled.div`
  padding: 20px;
  background: rgba(0, 25, 0, 0.5);
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    padding: 15px;
    font-size: 11px;
  }
`;

const ProtocolItem = styled.div`
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  
  &:before {
    content: "•";
    margin-right: 8px;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #00cc00;
  padding: 24px;
  background: rgba(0, 25, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 20px;
  }
`;

const FooterBar = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00cc00;
  text-align: center;
  margin-top: 30px;
  border-top: 1px solid #00cc00;
  padding-top: 12px;
  
  @media (max-width: 768px) {
    font-size: 10px;
    margin-top: 20px;
  }
`;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});
  const [showPayment, setShowPayment] = useState(false);
  
  // Форма оплаты
  const [cardName, setCardName] = useState('COMMANDER JOHN DOE');
  const [cardNumber, setCardNumber] = useState('**** **** **** 4242');
  const [expiration, setExpiration] = useState('05 / 27');
  const [cvv, setCvv] = useState('***');
  const [email, setEmail] = useState('COMMANDER@NOVAWARFARE.COM');

  // Генерируем случайный transaction ID 
  const transactionId = `TR-${Math.floor(Math.random() * 100000)}`;
  
  // Расчеты
  const subtotal = totalPrice;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  const handleToggleSelect = (id: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleQuantityChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateQuantity(id, value);
    }
  };

  const handleProceedToCheckout = () => {
    setShowPayment(true);
  };

  const handleAuthorizePayment = () => {
    // В реальном приложении здесь была бы логика оплаты
    navigate('/success');
  };

  if (items.length === 0) {
    return (
      <Container>
        <PageTitle>INVENTORY MANAGEMENT</PageTitle>
        <StatusBar>
          <div>REQUISITION TERMINAL</div>
          <div>SECURE CHECKOUT PROTOCOL</div>
          <div>TRANSACTION ID: {transactionId}</div>
        </StatusBar>
        <MainPanel>
          <CartHeader>MISSION INVENTORY • EMPTY</CartHeader>
          <EmptyCart>INVENTORY IS EMPTY</EmptyCart>
        </MainPanel>
        <ButtonsContainer>
          <LinkButton to="/missions">RETURN TO MISSION DATABASE</LinkButton>
        </ButtonsContainer>
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>INVENTORY MANAGEMENT</PageTitle>
      <StatusBar>
        <div>REQUISITION TERMINAL</div>
        <div>SECURE CHECKOUT PROTOCOL</div>
        <div>TRANSACTION ID: {transactionId}</div>
      </StatusBar>
      
      <MainPanel>
        <CartHeader>
          MISSION INVENTORY 
          <PendingStatus>PENDING APPROVAL</PendingStatus>
        </CartHeader>
        
        <TableHeader>
          <TableCell></TableCell>
          <TableCell>MISSION ID</TableCell>
          <TableCell>DESIGNATION</TableCell>
          <TableCell>QTY</TableCell>
          <TableCell>UNIT PRICE</TableCell>
          <TableCell>TOTAL</TableCell>
        </TableHeader>
        
        {items.map((item) => (
          <React.Fragment key={item.id}>
            {/* Desktop version */}
            <CartItemRow>
              <CheckboxCell>
                <CustomCheckbox 
                  className={selectedItems[item.id] ? 'checked' : ''}
                  onClick={() => handleToggleSelect(item.id)}
                />
              </CheckboxCell>
              <MissionId>{item.missionId || `ASM-${String(item.id).padStart(3, '0')}`}</MissionId>
              <div>
                <MissionName>{item.name}</MissionName>
                <MissionDetails>
                  {item.gameType || 'AIRSOFT'} • LEVEL {item.difficulty || 3} • {item.terrain || 'URBAN'}
                </MissionDetails>
              </div>
              <QuantityField>
                <QuantityInput 
                  type="number" 
                  min="1" 
                  value={item.quantity} 
                  onChange={(e) => handleQuantityChange(item.id, e)}
                />
              </QuantityField>
              <PriceCell>${item.price.toLocaleString()}</PriceCell>
              <TotalCell>${(item.price * item.quantity).toLocaleString()}</TotalCell>
            </CartItemRow>
            
            {/* Mobile version */}
            <MobileCartItem>
              <MobileItemHeader>
                <CustomCheckbox 
                  className={selectedItems[item.id] ? 'checked' : ''}
                  onClick={() => handleToggleSelect(item.id)}
                />
                <MissionId>{item.missionId || `ASM-${String(item.id).padStart(3, '0')}`}</MissionId>
              </MobileItemHeader>
              
              <MissionName>{item.name}</MissionName>
              <MissionDetails>
                {item.gameType || 'AIRSOFT'} • LEVEL {item.difficulty || 3} • {item.terrain || 'URBAN'}
              </MissionDetails>
              
              <MobileItemFooter>
                <QuantityField>
                  <QuantityInput 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    onChange={(e) => handleQuantityChange(item.id, e)}
                  />
                </QuantityField>
                <MobilePricing>
                  <PriceCell>${item.price.toLocaleString()}</PriceCell>
                  <TotalCell>${(item.price * item.quantity).toLocaleString()}</TotalCell>
                </MobilePricing>
              </MobileItemFooter>
            </MobileCartItem>
          </React.Fragment>
        ))}
        
        <OrderSummary>
          <SystemMessage>
            SYSTEM: INVENTORY OPTIMIZATION ACTIVE
          </SystemMessage>
          <SummaryDetails>
            <SummaryRow>
              <span>SUBTOTAL:</span>
              <span>${subtotal.toLocaleString()}</span>
            </SummaryRow>
            <SummaryRow>
              <span>TAX (10%):</span>
              <span>${tax.toLocaleString()}</span>
            </SummaryRow>
            <SummaryRow>
              <span>TOTAL:</span>
              <span>${total.toLocaleString()}</span>
            </SummaryRow>
          </SummaryDetails>
        </OrderSummary>
        
        <TransactionStatus>
          SECURE TRANSACTION PROTOCOL INITIALIZED • AWAITING PAYMENT AUTHORIZATION
        </TransactionStatus>
      </MainPanel>
      
      <ButtonsContainer>
        <LinkButton to="/missions">RETURN TO MISSION DATABASE</LinkButton>
        <CheckoutButton onClick={handleProceedToCheckout}>
          PROCEED TO CHECKOUT
        </CheckoutButton>
      </ButtonsContainer>
      
      {showPayment && (
        <>
          <PaymentSection>
            <PaymentHeader>SECURE PAYMENT TRANSMISSION</PaymentHeader>
            <PaymentFormContainer>
              <FormGroup>
                <FormLabel>COMANDOS CALLSIGN:</FormLabel>
                <FormInput 
                  type="text" 
                  value={cardName} 
                  onChange={(e) => setCardName(e.target.value)} 
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>SECURITY CODE:</FormLabel>
                <FormInput 
                  type="text" 
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(e.target.value)} 
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel>EXPIRATION:</FormLabel>
                <ExpirationGroup>
                  <FormInput 
                    type="text" 
                    value={expiration} 
                    onChange={(e) => setExpiration(e.target.value)} 
                  />
                  <FormInput 
                    type="text" 
                    value={cvv} 
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="CVV:"
                  />
                </ExpirationGroup>
              </FormGroup>
              
              <FormGroup>
                <FormLabel>COMMUNICATION CHANNEL:</FormLabel>
                <FormInput 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </FormGroup>
              
              <AuthorizeButton onClick={handleAuthorizePayment}>
                AUTHORIZE PAYMENT
              </AuthorizeButton>
              
              <EncryptionInfo>
                <span>ENCRYPTION: 256-BIT AES</span>
                <span>CONNECTION: SECURE</span>
              </EncryptionInfo>
            </PaymentFormContainer>
          </PaymentSection>
          
          <ProtocolSection>
            <ProtocolHeader>MISSION ACQUISITION PROTOCOL</ProtocolHeader>
            <ProtocolContent>
              <ProtocolItem>
                Upon payment authorization, mission details will be transmitted to your secure account
              </ProtocolItem>
              <ProtocolItem>
                Digital mission briefings and coordinates will be delivered via encrypted channel
              </ProtocolItem>
              <ProtocolItem>
                All transmissions are logged and traceable via your command interface
              </ProtocolItem>
            </ProtocolContent>
          </ProtocolSection>
        </>
      )}
    </Container>
  );
};

export default CartPage; 