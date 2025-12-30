
import { Category, PaymentSettings } from './types';

export const CATEGORIES: Category[] = ['Formal', 'Luxury', 'Smart', 'Sports', 'Kids', 'Stylish'];

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bkashNumber: '01700000000',
  nagadNumber: '01800000000',
  adminPhone: '01900000000', // Default admin contact
  standardDeliveryFee: 60,
  premiumDeliveryFee: 120,
  vatPercentage: 5,
};

export const ADMIN_CREDENTIALS = {
  email: 'admin3262@gmail.com',
  password: 'beautiful54321',
};
