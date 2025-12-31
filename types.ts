
export type Category = 'Formal' | 'Casual' | 'Luxurious' | 'Smart' | 'Sports' | 'Kids' | 'Stylish';

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  color: string;
  availableColors?: string[];
  age: string;
  category: Category;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  stock: number;
  rating?: number;
  reviewsCount?: number;
  specs?: Record<string, string>;
}

export type OrderStatus = 'PENDING' | 'WAITING_APPROVAL' | 'AWAITING_PAYMENT' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedColor?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  vat: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  deliveryMethod: 'Standard' | 'Premium';
  deliveryDays?: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Cash on Delivery';
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  password?: string;
  role: 'USER' | 'ADMIN';
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sender: 'USER' | 'ADMIN';
  text: string;
  timestamp: number;
}

export interface AppNotification {
  id: string;
  userId: string; // 'admin' or specific userId
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  read: boolean;
  timestamp: number;
}

export interface PaymentSettings {
  bkashNumber: string;
  nagadNumber: string;
  adminPhone: string;
  standardDeliveryFee: number;
  premiumDeliveryFee: number;
  vatPercentage: number;
}
