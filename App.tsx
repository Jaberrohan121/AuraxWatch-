
import React, { useState } from 'react';
import { useStore } from './store';
import { AuthView } from './components/Auth';
import { ShopView } from './components/ShopUI';
import { AdminPanel } from './components/AdminPanel';
import { ChatWidget } from './components/ChatWidget';

const App: React.FC = () => {
  const store = useStore();
  const [currentView, setCurrentView] = useState<'AUTH' | 'SHOP' | 'ADMIN'>('SHOP');

  // Logic to redirect to Auth if not logged in
  if (!store.currentUser) {
    return <AuthView store={store} onAuthenticated={() => setCurrentView('SHOP')} />;
  }

  // Admin access check
  if (currentView === 'ADMIN' && store.currentUser?.role !== 'ADMIN') {
    return <ShopView store={store} onSwitchToAdmin={() => setCurrentView('ADMIN')} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {currentView === 'SHOP' && (
        <ShopView store={store} onSwitchToAdmin={() => setCurrentView('ADMIN')} />
      )}
      {currentView === 'ADMIN' && (
        <AdminPanel store={store} onSwitchToShop={() => setCurrentView('SHOP')} />
      )}
      <ChatWidget store={store} />
    </div>
  );
};

export default App;
