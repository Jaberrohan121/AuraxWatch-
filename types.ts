
export type Category = 'Formal' | 'Luxury' | 'Smart' | 'Sports' | 'Kids' | 'Stylish';

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  color: string;
  age: string;
  category: Category;
  description: string;
  price: number;
  image: string;
  stock: number;
}

export type OrderStatus = 'PENDING' | 'WAITING_APPROVAL' | 'AWAITING_PAYMENT' | 'PAID' | 'SHIPPED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
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
  deliveryDays?: number; // Added: Delivery estimation in days
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

export interface PaymentSettings {
  bkashNumber: string;
  nagadNumber: string;
  adminPhone: string; // Added: Admin contact number
  standardDeliveryFee: number;
  premiumDeliveryFee: number;
  vatPercentage: number;
}
