
import { useState, useEffect, useCallback } from 'react';
import { Product, User, Order, ChatMessage, PaymentSettings, AppNotification } from './types';
import { DEFAULT_PAYMENT_SETTINGS } from './constants';

const STORAGE_KEYS = {
  PRODUCTS: 'aurax_products',
  USERS: 'aurax_users',
  ORDERS: 'aurax_orders',
  CHATS: 'aurax_chats',
  SETTINGS: 'aurax_settings',
  CURRENT_USER: 'aurax_current_user',
  NOTIFICATIONS: 'aurax_notifications',
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Rolex Submariner Date 41mm',
    brand: 'Rolex',
    model: '126610LN',
    color: 'Oystersteel',
    availableColors: ['Oystersteel', 'Yellow Gold', 'Oystersteel and Gold'],
    age: 'Adult',
    category: 'Luxurious',
    description: 'The archetype of the diver’s watch, the Submariner has been a reference in its category for over 70 years. Renowned for its robustness and functional design, it is as at home underwater as it is at a gala event.',
    price: 12500,
    originalPrice: 15500,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&auto=format&fit=crop',
    stock: 3,
    rating: 5.0,
    reviewsCount: 12,
    specs: {
      "Movement": "3235, Manufacture Rolex (Self-winding mechanical)",
      "Power Reserve": "70 Hours",
      "Case": "41mm, Oystersteel",
      "Bezel": "Cerachrom insert in ceramic",
      "Water Resistance": "300m / 1,000 feet",
      "Crystal": "Scratch-resistant sapphire",
      "Strap": "Oyster, flat three-piece links"
    }
  },
  {
    id: '2',
    name: 'Patek Philippe Nautilus 5711/1A',
    brand: 'Patek Philippe',
    model: '5711/1A-010',
    color: 'Blue',
    availableColors: ['Blue', 'White', 'Olive Green'],
    age: 'Adult',
    category: 'Luxurious',
    description: 'With its rounded octagonal bezel and horizontal embossed dial, the Nautilus has been the personification of the elegant sports watch since 1976.',
    price: 95000,
    originalPrice: 110000,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=600&auto=format&fit=crop',
    stock: 1,
    rating: 4.9,
    reviewsCount: 8,
    specs: {
      "Movement": "Caliber 26-330 S C (Self-winding)",
      "Case": "40mm, Steel",
      "Dial": "Blue-black, gold applied markers",
      "Water Resistance": "120m",
      "Thickness": "8.3 mm",
      "Crystal": "Sapphire-crystal case back"
    }
  },
  {
    id: '3',
    name: 'Casio G-Shock GMW-B5000D',
    brand: 'Casio',
    model: 'Full Metal Silver',
    color: 'Silver',
    availableColors: ['Silver', 'Gold', 'Black'],
    age: 'Adult',
    category: 'Sports',
    description: 'A full-metal version of the first G-SHOCK model. This watch features the high-performance Tough Solar power system and Bluetooth connectivity.',
    price: 550,
    originalPrice: 600,
    image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?q=80&w=600&auto=format&fit=crop',
    stock: 15,
    rating: 4.7,
    reviewsCount: 156,
    specs: {
      "Structure": "Shock-resistant",
      "Power": "Tough Solar (Solar-powered)",
      "Accuracy": "Smartphone Link (approx. 4 times/day)",
      "Illumination": "Full auto LED backlight",
      "Water Resistance": "200m",
      "Functions": "World time, Stopwatch, Timer, Alarm"
    }
  },
  {
    id: '4',
    name: 'Omega Speedmaster Moonwatch',
    brand: 'Omega',
    model: 'Professional 310.30.42.50.01.001',
    color: 'Black',
    availableColors: ['Black', 'Sapphire Sandwich'],
    age: 'Adult',
    category: 'Formal',
    description: 'The Speedmaster Moonwatch is one of the world’s most iconic timepieces. Having been a part of all six moon missions, the legendary chronograph is an impressive representation of the brand’s adventurous pioneering spirit.',
    price: 6400,
    originalPrice: 7000,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=600&auto=format&fit=crop',
    stock: 5,
    rating: 4.8,
    reviewsCount: 45,
    specs: {
      "Movement": "Omega Calibre 3861",
      "Power Reserve": "50 Hours",
      "Case": "42mm, Steel",
      "Water Resistance": "50m",
      "Crystal": "Hesalite crystal"
    }
  }
];

export const useStore = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const savedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const savedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const savedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);

      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        // Migrating old 'Luxury' to 'Luxurious'
        const migrated = parsed.map((p: any) => p.category === 'Luxury' ? { ...p, category: 'Luxurious' } : p);
        setProducts(migrated);
      }
      else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      }

      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedChats) setChats(JSON.parse(savedChats));
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    } catch (e) {
      console.error("Storage Initialization Error:", e);
    }
  }, []);

  const persist = useCallback((key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const addNotification = (userId: string, title: string, message: string, type: AppNotification['type'] = 'INFO') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      title,
      message,
      type,
      read: false,
      timestamp: Date.now()
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    persist(STORAGE_KEYS.NOTIFICATIONS, updated);
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    persist(STORAGE_KEYS.NOTIFICATIONS, updated);
  };

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

  const updateUser = (u: User) => {
    const updatedUsers = users.map(user => user.id === u.id ? u : user);
    setUsers(updatedUsers);
    persist(STORAGE_KEYS.USERS, updatedUsers);
    if (currentUser?.id === u.id) {
      setCurrentUser(u);
      persist(STORAGE_KEYS.CURRENT_USER, u);
    }
  };

  const createOrder = (o: Order) => {
    const updated = [...orders, o];
    setOrders(updated);
    persist(STORAGE_KEYS.ORDERS, updated);
    addNotification('admin', 'New Order Received', `Order ${o.id} is pending quote from ${o.userId}.`, 'INFO');
  };

  const updateOrder = (o: Order) => {
    const updated = orders.map(item => item.id === o.id ? o : item);
    setOrders(updated);
    persist(STORAGE_KEYS.ORDERS, updated);

    // Automation for notifications based on status
    if (o.status === 'PAID') {
      addNotification('admin', 'Payment Received', `Payment verified for Order ${o.id}.`, 'SUCCESS');
      addNotification(o.userId, 'Payment Verified', `We have received your payment for ${o.id}. Processing shipping.`, 'SUCCESS');
    } else if (o.status === 'SHIPPED') {
      addNotification(o.userId, 'Order Shipped!', `Great news! Your order ${o.id} is on its way.`, 'SUCCESS');
    } else if (o.status === 'WAITING_APPROVAL') {
      // User just sent payment confirmation
      addNotification('admin', 'Payment Confirmation Sent', `User ${o.userId} has reported payment for ${o.id}. Check records.`, 'WARNING');
    }
  };

  const sendMessage = (m: ChatMessage) => {
    const updated = [...chats, m];
    setChats(updated);
    persist(STORAGE_KEYS.CHATS, updated);
    
    // Notify the other party
    if (m.sender === 'USER') {
      addNotification('admin', 'New Message', `User ${m.userId} sent a message.`, 'INFO');
    } else {
      addNotification(m.userId, 'Official Response', `Admin replied to your message.`, 'INFO');
    }
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
    users, registerUser, updateUser,
    orders, createOrder, updateOrder,
    chats, sendMessage,
    notifications, addNotification, markNotificationRead,
    settings, saveSettings,
    currentUser, login, logout
  };
};
