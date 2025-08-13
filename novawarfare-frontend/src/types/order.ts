export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  name?: string;
  id?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED' | 'PROCESSING' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  user?: string;
  userEmail?: string;
  amount?: number;
  date?: string;
  paymentMethod?: string;
}

export interface OrderListResponse {
  orders: Order[];
  totalCount: number;
}

export interface OrderStatusUpdateRequest {
  status: string;
  paymentStatus: string;
} 