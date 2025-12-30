
import React, { useState } from 'react';
import { useStore } from './store';
import { AuthView } from './components/Auth';
import { ShopView } from './components/ShopUI';
import { AdminPanel } from './components/AdminPanel';

const App: React.FC = () => {
  const store = useStore();
  const [currentView, setCurrentView] = useState<'AUTH' | 'SHOP' | 'ADMIN'>('SHOP');

  // Logic to redirect to Auth if not logged in
  if (!store.currentUser && currentView !== 'AUTH') {
    return <AuthView store={store} onAuthenticated={() => setCurrentView('SHOP')} />;
  }

  // Admin access check
  if (currentView === 'ADMIN' && store.currentUser?.role !== 'ADMIN') {
    setCurrentView('SHOP');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'SHOP' && (
        <ShopView store={store} onSwitchToAdmin={() => setCurrentView('ADMIN')} />
      )}
      {currentView === 'ADMIN' && (
        <AdminPanel store={store} onSwitchToShop={() => setCurrentView('SHOP')} />
      )}
      {currentView === 'AUTH' && (
        <AuthView store={store} onAuthenticated={() => setCurrentView('SHOP')} />
      )}
    </div>
  );
};

export default App;
