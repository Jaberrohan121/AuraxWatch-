
import { useState, useEffect, useCallback } from 'react';
import { Product, User, Order, ChatMessage, PaymentSettings } from './types';
import { DEFAULT_PAYMENT_SETTINGS } from './constants';

const STORAGE_KEYS = {
  PRODUCTS: 'aurax_products',
  USERS: 'aurax_users',
  ORDERS: 'aurax_orders',
  CHATS: 'aurax_chats',
  SETTINGS: 'aurax_settings',
  CURRENT_USER: 'aurax_current_user',
};

// Seed initial products if none exist
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Gold Chrono',
    brand: 'Rolex',
    model: 'Daytona',
    color: 'Gold',
    age: 'Adult',
    category: 'Luxury',
    description: 'The ultimate luxury timepiece in 18ct gold.',
    price: 35000,
    image: 'https://picsum.photos/seed/watch1/600/600',
    stock: 5,
  },
  {
    id: '2',
    name: 'TechPro Smart X',
    brand: 'Apple',
    model: 'Series 9',
    color: 'Midnight',
    age: 'Adult',
    category: 'Smart',
    description: 'Stay connected with the smartest watch on your wrist.',
    price: 450,
    image: 'https://picsum.photos/seed/watch2/600/600',
    stock: 20,
  },
  {
    id: '3',
    name: 'Rugged Sport Z',
    brand: 'Casio',
    model: 'G-Shock',
    color: 'Red',
    age: 'Adult',
    category: 'Sports',
    description: 'Shock resistant and ready for any adventure.',
    price: 150,
    image: 'https://picsum.photos/seed/watch3/600/600',
    stock: 50,
  }
];

export const useStore = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load Initial State
  useEffect(() => {
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const savedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedChats) setChats(JSON.parse(savedChats));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));
  }, []);

  // Persistence Helpers
  const persist = useCallback((key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const addProduct = (p: Product) => {
    const updated = [...products, p];
    setProducts(updated);
    persist(STORAGE_KEYS.PRODUCTS, updated);
  };

  const updateProduct = (p: Product) => {
    const updated = products.map(item => item.id === p.id ? p : item);
    setProducts(updated);
    persist(STORAGE_KEYS.PRODUCTS, updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    persist(STORAGE_KEYS.PRODUCTS, updated);
  };

  const registerUser = (u: User) => {
    const updated = [...users, u];
    setUsers(updated);
    persist(STORAGE_KEYS.USERS, updated);
  };

  const createOrder = (o: Order) => {
    const updated = [...orders, o];
    setOrders(updated);
    persist(STORAGE_KEYS.ORDERS, updated);
  };

  const updateOrder = (o: Order) => {
    const updated = orders.map(item => item.id === o.id ? o : item);
    setOrders(updated);
    persist(STORAGE_KEYS.ORDERS, updated);
  };

  const sendMessage = (m: ChatMessage) => {
    const updated = [...chats, m];
    setChats(updated);
    persist(STORAGE_KEYS.CHATS, updated);
  };

  const saveSettings = (s: PaymentSettings) => {
    setSettings(s);
    persist(STORAGE_KEYS.SETTINGS, s);
  };

  const login = (u: User) => {
    setCurrentUser(u);
    persist(STORAGE_KEYS.CURRENT_USER, u);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  return {
    products, addProduct, updateProduct, deleteProduct,
    users, registerUser,
    orders, createOrder, updateOrder,
    chats, sendMessage,
    settings, saveSettings,
    currentUser, login, logout
  };
};
