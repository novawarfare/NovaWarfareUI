import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { Order, OrderStatusUpdateRequest } from '../../types/order';
import { 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder 
} from '../../services/adminService';

// Стили
const Container = styled.div`
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 15px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
`;

const SearchButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 0 20px;
  cursor: pointer;
`;

const FilterBar = styled.div`
  display: flex;
  margin-bottom: 15px;
  gap: 10px;
`;

const FilterSelect = styled.select`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
`;

const DataTable = styled.div`
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  margin-bottom: 20px;
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 100px 150px 150px 130px 130px 130px;
`;

const TableHeaderRow = styled.div`
  display: contents;
  
  div {
    background: rgba(0, 40, 0, 0.8);
    padding: 10px 15px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #00cc00;
    border-bottom: 1px solid rgba(0, 204, 0, 0.3);
    border-right: 1px solid rgba(0, 204, 0, 0.1);
    
    &:last-child {
      border-right: none;
    }
  }
`;

const TableDataRow = styled.div`
  display: contents;
  
  div {
    padding: 15px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #ffffff;
    border-bottom: 1px dashed rgba(0, 204, 0, 0.1);
    border-right: 1px solid rgba(0, 204, 0, 0.1);
    
    &:last-child {
      border-right: none;
    }
    
    &.completed {
      color: #00cc00;
    }
    
    &.processing {
      color: #cccc00;
    }
    
    &.cancelled {
      color: #cc3000;
    }
    
    &.refunded {
      color: #aaaaaa;
    }
  }
  
  &:last-child div {
    border-bottom: none;
  }
`;

const ActionButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 8px 10px;
  cursor: pointer;
  margin-right: 5px;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  margin-bottom: 15px;
  align-items: center;
`;

const FormLabel = styled.label`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #ffffff;
`;

const FormInput = styled.input`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
`;

const FormSelect = styled.select`
  background: rgba(0, 25, 0, 0.5);
  border: 1px solid #00cc00;
  padding: 10px;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const SubmitButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  padding: 12px 25px;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div`
  border: 1px solid #00cc00;
  background: rgba(0, 25, 0, 0.3);
  padding: 20px;
  text-align: center;
`;

const MetricLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 16px;
  color: #00cc00;
  margin-bottom: 10px;
`;

const MetricValue = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 36px;
  color: #ffffff;
  margin-bottom: 10px;
`;

const MetricFooter = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #00cc00;
`;

const OrderDetailSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #00cc00;
`;

const DetailTable = styled.div`
  width: 100%;
  margin-top: 15px;
  border: 1px solid rgba(0, 204, 0, 0.3);
`;

const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 4fr 1fr 1fr 1fr;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(0, 204, 0, 0.3);
  
  &:last-child {
    border-bottom: none;
  }
  
  div {
    padding: 5px 10px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: #ffffff;
  }
`;

const DetailHeaderRow = styled(DetailRow)`
  background: rgba(0, 40, 0, 0.5);
  
  div {
    color: #00cc00;
    font-weight: bold;
  }
`;

const DeleteButton = styled.button`
  background: rgba(0, 51, 0, 0.8);
  border: 1px solid #00cc00;
  color: #00cc00;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 8px 10px;
  cursor: pointer;
  margin-right: 5px;
  
  &:hover {
    background: rgba(0, 102, 0, 0.5);
  }
`;

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Загрузка заказов при монтировании
  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrders(page, 10, filterStatus);
      setOrders(response.orders);
      setTotalPages(Math.ceil(response.totalCount / 10));
    } catch (err) {
      setError('Ошибка при загрузке заказов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // В идеале здесь должен быть поиск на сервере, но пока сделаем клиентский поиск
    fetchOrders();
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const handleViewOrder = async (order: Order) => {
    try {
      // Получаем обновленные данные заказа, если нужны детали
      const fullOrder = await getOrderById(order.id);
      setSelectedOrder(fullOrder);
      setShowOrderDetails(true);
    } catch (err) {
      setError('Ошибка при загрузке данных заказа');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'COMPLETED' | 'PROCESSING' | 'CANCELLED' | 'REFUNDED') => {
    try {
      const updatedOrder = await updateOrderStatus(id, newStatus);
      
      // Обновляем заказ в текущем списке
      setOrders(orders.map(order => order.id === id ? updatedOrder : order));
      
      // Если открыт выбранный заказ, обновляем его тоже
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(updatedOrder);
      }
      
      // Обновляем полный список заказов
      await fetchOrders();
    } catch (err) {
      setError('Ошибка при обновлении статуса заказа');
      console.error(err);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      
      // Удаляем заказ из текущего списка
      setOrders(orders.filter(order => order.id !== id));
      
      // Если открыт удаляемый заказ, закрываем его
      if (selectedOrder && selectedOrder.id === id) {
        setShowOrderDetails(false);
        setSelectedOrder(null);
      }
      
      // Обновляем полный список заказов
      await fetchOrders();
    } catch (err) {
      setError('Ошибка при удалении заказа');
      console.error(err);
    }
  };

  // Форматирование суммы
  const formatAmount = (amount: number | undefined) => {
    if (amount === undefined) return "0 ₽";
    return `${amount} ₽`;
  };

  const filteredOrders = searchQuery
    ? orders.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.user?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (order.userEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase()))
    : orders;

  const getStatusActionButtons = (order: Order) => {
    switch (order.status) {
      case 'PROCESSING':
        return (
          <>
            <ActionButton onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}>COMPLETE</ActionButton>
            <ActionButton onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}>CANCEL</ActionButton>
          </>
        );
      case 'COMPLETED':
        return (
          <ActionButton onClick={() => handleUpdateStatus(order.id, 'REFUNDED')}>REFUND</ActionButton>
        );
      case 'CANCELLED':
        return null;
      case 'REFUNDED':
        return null;
      default:
        return null;
    }
  };

  return (
    <Container>
      <h2 style={{ fontFamily: 'Courier New, monospace', color: '#ffffff', marginTop: 0 }}>
        ORDER MANAGEMENT
      </h2>
      
      <MetricsGrid>
        <MetricCard>
          <MetricLabel>TOTAL ORDERS</MetricLabel>
          <MetricValue>{orders.length}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>COMPLETED</MetricLabel>
          <MetricValue>{orders.filter(o => o.status === 'COMPLETED').length}</MetricValue>
        </MetricCard>
        <MetricCard>
          <MetricLabel>REVENUE</MetricLabel>
          <MetricValue>
            {formatAmount(orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + (o.amount || 0), 0))}
          </MetricValue>
        </MetricCard>
      </MetricsGrid>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <SearchBar>
          <SearchInput 
            type="text"
            placeholder="SEARCH ORDERS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <SearchButton onClick={handleSearch}>SEARCH</SearchButton>
        </SearchBar>
        <FilterBar>
          <FormLabel>FILTER BY STATUS:</FormLabel>
          <FilterSelect value={filterStatus} onChange={handleFilterChange}>
            <option value="">ALL</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </FilterSelect>
        </FilterBar>
      </div>
      
      <DataTable>
        <TableGrid>
          <TableHeaderRow>
            <div>ORDER ID</div>
            <div>USER</div>
            <div>AMOUNT</div>
            <div>DATE</div>
            <div>STATUS</div>
            <div>ACTIONS</div>
          </TableHeaderRow>
          
          {loading ? (
            <TableDataRow>
              <div style={{gridColumn: 'span 6'}}>Loading...</div>
            </TableDataRow>
          ) : error ? (
            <TableDataRow>
              <div style={{gridColumn: 'span 6'}}>{error}</div>
            </TableDataRow>
          ) : filteredOrders.length === 0 ? (
            <TableDataRow>
              <div style={{gridColumn: 'span 6'}}>No orders found</div>
            </TableDataRow>
          ) : (
            filteredOrders.map(order => (
              <TableDataRow key={order.id}>
                <div>{order.id}</div>
                <div>{order.user}</div>
                <div>{formatAmount(order.amount)}</div>
                <div>{order.date}</div>
                <div className={order.status.toLowerCase()}>{order.status}</div>
                <div>
                  <ActionButton onClick={() => handleViewOrder(order)}>DETAILS</ActionButton>
                  {getStatusActionButtons(order)}
                  <DeleteButton onClick={() => handleDeleteOrder(order.id)}>DELETE</DeleteButton>
                </div>
              </TableDataRow>
            ))
          )}
        </TableGrid>
      </DataTable>
      
      {showOrderDetails && selectedOrder && (
        <Modal title={`ORDER DETAILS: ${selectedOrder.id}`} onClose={() => setShowOrderDetails(false)} isOpen={showOrderDetails}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Courier New, monospace', color: '#ffffff', margin: '0 0 15px 0' }}>
              CUSTOMER INFO
            </h3>
            <FormRow>
              <FormLabel>USER:</FormLabel>
              <div style={{ fontFamily: 'Courier New, monospace', color: '#ffffff' }}>{selectedOrder.user}</div>
            </FormRow>
            <FormRow>
              <FormLabel>EMAIL:</FormLabel>
              <div style={{ fontFamily: 'Courier New, monospace', color: '#ffffff' }}>{selectedOrder.userEmail}</div>
            </FormRow>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Courier New, monospace', color: '#ffffff', margin: '0 0 15px 0' }}>
              ORDER ITEMS
            </h3>
            <DataTable>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 80px 120px',
                fontFamily: 'Courier New, monospace',
                color: '#00cc00',
                padding: '10px',
                borderBottom: '1px solid rgba(0, 204, 0, 0.3)',
              }}>
                <div>ITEM</div>
                <div>QTY</div>
                <div>PRICE</div>
              </div>
              {selectedOrder.items.map((item, index) => (
                <div key={index} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 80px 120px',
                  fontFamily: 'Courier New, monospace',
                  color: '#ffffff',
                  padding: '10px',
                  borderBottom: index < selectedOrder.items.length - 1 ? '1px dashed rgba(0, 204, 0, 0.1)' : 'none',
                }}>
                  <div>{item.name}</div>
                  <div>{item.quantity}</div>
                  <div>{formatAmount(item.price)}</div>
                </div>
              ))}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 200px',
                fontFamily: 'Courier New, monospace',
                color: '#ffffff',
                padding: '15px 10px',
                borderTop: '1px solid rgba(0, 204, 0, 0.3)',
              }}>
                <div style={{ color: '#00cc00', textAlign: 'right' }}>TOTAL:</div>
                <div>{formatAmount(selectedOrder.amount)}</div>
              </div>
            </DataTable>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'Courier New, monospace', color: '#ffffff', margin: '0 0 15px 0' }}>
              ORDER INFORMATION
            </h3>
            <FormRow>
              <FormLabel>DATE:</FormLabel>
              <div style={{ fontFamily: 'Courier New, monospace', color: '#ffffff' }}>{selectedOrder.date}</div>
            </FormRow>
            <FormRow>
              <FormLabel>PAYMENT METHOD:</FormLabel>
              <div style={{ fontFamily: 'Courier New, monospace', color: '#ffffff' }}>{selectedOrder.paymentMethod}</div>
            </FormRow>
            <FormRow>
              <FormLabel>STATUS:</FormLabel>
              <div style={{ 
                fontFamily: 'Courier New, monospace', 
                color: selectedOrder.status === 'COMPLETED' ? '#00cc00' : 
                       selectedOrder.status === 'PROCESSING' ? '#cccc00' : 
                       selectedOrder.status === 'CANCELLED' ? '#cc3000' : '#aaaaaa'
              }}>
                {selectedOrder.status}
              </div>
            </FormRow>
          </div>
          
          <ButtonContainer>
            {getStatusActionButtons(selectedOrder)}
            <ActionButton onClick={() => setShowOrderDetails(false)}>CLOSE</ActionButton>
          </ButtonContainer>
        </Modal>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <ActionButton 
            key={i} 
            onClick={() => setPage(i + 1)}
            style={{ background: page === i + 1 ? 'rgba(0, 102, 0, 0.5)' : 'rgba(0, 51, 0, 0.8)' }}
          >
            {i + 1}
          </ActionButton>
        ))}
      </div>
    </Container>
  );
};

export default OrderManagement; 