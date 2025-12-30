
import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { Product, User, Order, PaymentSettings, ChatMessage } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminProps {
  store: any;
  onSwitchToShop: () => void;
}

export const AdminPanel: React.FC<AdminProps> = ({ store, onSwitchToShop }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PRODUCTS' | 'USERS' | 'ORDERS' | 'SETTINGS' | 'CHAT'>('DASHBOARD');
  
  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Order Calculation State
  const [processingOrder, setProcessingOrder] = useState<Order | null>(null);
  const [vatInput, setVatInput] = useState(0);
  const [deliveryInput, setDeliveryInput] = useState(0);
  const [deliveryDaysInput, setDeliveryDaysInput] = useState(3);

  // Settings Form
  const [settingsForm, setSettingsForm] = useState<PaymentSettings>(store.settings);

  // Customer Detail State
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Chat State
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Chart Data
  const data = store.orders.filter((o: Order) => o.status === 'PAID').map((o: Order) => ({
    name: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: o.total
  }));

  const totalRevenue = store.orders
    .filter((o: Order) => o.status === 'PAID')
    .reduce((acc: number, o: Order) => acc + o.total, 0);

  const pendingOrders = store.orders.filter((o: Order) => o.status === 'PENDING').length;

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct?.id) {
      store.updateProduct(editingProduct as Product);
    } else {
      store.addProduct({
        ...editingProduct,
        id: Math.random().toString(36).substr(2, 9),
      } as Product);
    }
    setEditingProduct(null);
    setIsAdding(false);
  };

  const sendOrderQuote = () => {
    if (!processingOrder) return;
    const total = processingOrder.subtotal + Number(vatInput) + Number(deliveryInput);
    const updatedOrder: Order = {
      ...processingOrder,
      vat: Number(vatInput),
      deliveryCharge: Number(deliveryInput),
      deliveryDays: Number(deliveryDaysInput),
      total,
      status: 'WAITING_APPROVAL',
      updatedAt: Date.now()
    };
    store.updateOrder(updatedOrder);
    setProcessingOrder(null);
    alert('Quote and delivery time sent to customer!');
  };

  const handleAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatUserId || !adminReplyText.trim()) return;

    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: selectedChatUserId,
      sender: 'ADMIN',
      text: adminReplyText,
      timestamp: Date.now(),
    };

    store.sendMessage(msg);
    setAdminReplyText('');
  };

  const chatUsers = Array.from(new Set(store.chats.map((c: ChatMessage) => c.userId)));

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-8 border-b border-gray-800">
          <h1 className="text-2xl font-black tracking-tighter">AURAX <span className="text-xs text-yellow-500 align-top uppercase">Admin</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'DASHBOARD', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'PRODUCTS', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'USERS', label: 'Customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'ORDERS', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
            { id: 'SETTINGS', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
            { id: 'CHAT', label: 'Chat Help', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === item.id ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20' : 'hover:bg-gray-800 text-gray-400'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
              {item.label}
              {item.id === 'ORDERS' && pendingOrders > 0 && (
                <span className="ml-auto bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse">{pendingOrders}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
           <button onClick={onSwitchToShop} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              Back to Shop
           </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-gray-900">{activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500">{new Date().toDateString()}</span>
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center font-black text-black">A</div>
            </div>
          </header>

          {activeTab === 'DASHBOARD' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: 'Total Revenue', value: `$${totalRevenue}`, color: 'bg-green-100 text-green-700' },
                   { label: 'Pending Orders', value: pendingOrders, color: 'bg-yellow-100 text-yellow-700' },
                   { label: 'Total Products', value: store.products.length, color: 'bg-blue-100 text-blue-700' },
                   { label: 'Total Customers', value: store.users.length, color: 'bg-purple-100 text-purple-700' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">{stat.label}</p>
                      <p className={`text-3xl font-black`}>{stat.value}</p>
                   </div>
                 ))}
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6">Economy & Sales Growth</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="sales" fill="#EAB308" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PRODUCTS' && (
            <div className="space-y-6">
              <div className="flex justify-between">
                <button onClick={() => { setIsAdding(true); setEditingProduct({}); }} className="bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                   Add New Product
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {store.products.map((p: Product) => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={p.image} className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-bold">{p.name}</h4>
                        <p className="text-xs text-gray-500">{p.brand} • {p.category} • ${p.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => { setEditingProduct(p); setIsAdding(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                       <button onClick={() => store.deleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'USERS' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 border-b">
                   <tr>
                     <th className="px-6 py-4">Name</th>
                     <th className="px-6 py-4">Email</th>
                     <th className="px-6 py-4">Phone</th>
                     <th className="px-6 py-4">Orders</th>
                     <th className="px-6 py-4">Joined</th>
                     <th className="px-6 py-4">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {store.users.map((u: User) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 font-bold">{u.fullName}</td>
                      <td className="px-6 py-4 text-gray-500">{u.email}</td>
                      <td className="px-6 py-4">{u.phone}</td>
                      <td className="px-6 py-4">
                        {store.orders.filter((o: Order) => o.userId === u.id).length} orders
                      </td>
                      <td className="px-6 py-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setViewingUser(u)}
                          className="text-yellow-600 font-bold hover:underline"
                        >
                          User Info
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'ORDERS' && (
             <div className="space-y-4">
                {store.orders.sort((a: any, b: any) => b.createdAt - a.createdAt).map((o: Order) => (
                  <div key={o.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono font-black text-sm">{o.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                          o.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                      <p className="text-xs text-gray-500">By {store.users.find((u: User) => u.id === o.userId)?.fullName} • {o.paymentMethod} • Subtotal: ${o.subtotal}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-black">{o.status === 'PENDING' ? '--' : `$${o.total}`}</p>
                        <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</p>
                      </div>
                      {o.status === 'PENDING' && (
                        <button 
                          onClick={() => {
                            setProcessingOrder(o);
                            setVatInput(o.subtotal * (store.settings.vatPercentage / 100));
                            setDeliveryInput(o.deliveryMethod === 'Premium' ? store.settings.premiumDeliveryFee : store.settings.standardDeliveryFee);
                            setDeliveryDaysInput(3);
                          }} 
                          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold"
                        >
                          Process Quote
                        </button>
                      )}
                      {o.status === 'AWAITING_PAYMENT' && (
                        <button 
                          onClick={() => {
                            store.updateOrder({...o, status: 'PAID'});
                            alert('Payment manually confirmed by admin!');
                          }} 
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                        >
                          Confirm Payment
                        </button>
                      )}
                      {o.status === 'PAID' && (
                        <button onClick={() => store.updateOrder({...o, status: 'SHIPPED'})} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Mark Shipped</button>
                      )}
                    </div>
                  </div>
                ))}
             </div>
          )}

          {activeTab === 'SETTINGS' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
              <h3 className="text-xl font-bold mb-6">Payment & Shop Configuration</h3>
              <form onSubmit={(e) => { e.preventDefault(); store.saveSettings(settingsForm); alert('Settings updated!'); }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">bKash Number</label>
                    <input className="w-full p-3 border rounded-lg" value={settingsForm.bkashNumber} onChange={(e) => setSettingsForm({...settingsForm, bkashNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nagad Number</label>
                    <input className="w-full p-3 border rounded-lg" value={settingsForm.nagadNumber} onChange={(e) => setSettingsForm({...settingsForm, nagadNumber: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Admin Contact (Phone)</label>
                  <input className="w-full p-3 border rounded-lg" value={settingsForm.adminPhone} onChange={(e) => setSettingsForm({...settingsForm, adminPhone: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Standard Delivery</label>
                    <input type="number" className="w-full p-3 border rounded-lg" value={settingsForm.standardDeliveryFee} onChange={(e) => setSettingsForm({...settingsForm, standardDeliveryFee: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Premium Delivery</label>
                    <input type="number" className="w-full p-3 border rounded-lg" value={settingsForm.premiumDeliveryFee} onChange={(e) => setSettingsForm({...settingsForm, premiumDeliveryFee: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">VAT %</label>
                    <input type="number" className="w-full p-3 border rounded-lg" value={settingsForm.vatPercentage} onChange={(e) => setSettingsForm({...settingsForm, vatPercentage: Number(e.target.value)})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold">Save All Settings</button>
              </form>
            </div>
          )}

          {activeTab === 'CHAT' && (
            <div className="bg-white h-[600px] rounded-2xl shadow-sm border border-gray-100 flex overflow-hidden">
               <div className="w-1/3 border-r overflow-y-auto">
                 <div className="p-4 border-b font-bold text-gray-400 text-xs uppercase tracking-widest bg-gray-50">Active Conversations</div>
                 {chatUsers.length === 0 ? (
                    <p className="p-4 text-xs text-gray-400">No active chats yet.</p>
                 ) : (
                    chatUsers.map((uid: string) => {
                      const user = store.users.find((u: User) => u.id === uid);
                      const lastMsg = store.chats.filter((c: any) => c.userId === uid).pop();
                      return (
                        <button 
                          key={uid} 
                          onClick={() => setSelectedChatUserId(uid)}
                          className={`w-full text-left p-4 hover:bg-gray-50 border-b transition ${selectedChatUserId === uid ? 'bg-yellow-50 border-l-4 border-l-yellow-500' : ''}`}
                        >
                           <p className="font-bold">{user?.fullName || 'Guest'}</p>
                           <p className="text-xs text-gray-500 truncate">{lastMsg?.text}</p>
                        </button>
                      );
                    })
                 )}
               </div>
               <div className="flex-1 flex flex-col">
                 {selectedChatUserId ? (
                    <>
                      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                         <span className="font-bold">{store.users.find((u: any) => u.id === selectedChatUserId)?.fullName}</span>
                         <span className="text-xs text-gray-500">Support Chat</span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {store.chats.filter((c: any) => c.userId === selectedChatUserId).map((m: ChatMessage) => (
                           <div key={m.id} className={`flex ${m.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${m.sender === 'ADMIN' ? 'bg-yellow-500 text-black' : 'bg-gray-100'}`}>
                                 {m.text}
                              </div>
                           </div>
                        ))}
                      </div>
                      <form onSubmit={handleAdminReply} className="p-4 border-t bg-white flex gap-2">
                        <input 
                          className="flex-1 p-3 border rounded-xl outline-none" 
                          placeholder="Type reply..." 
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                        />
                        <button type="submit" className="bg-black text-white px-6 rounded-xl font-bold">Reply</button>
                      </form>
                    </>
                 ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                       <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                       <p className="text-lg font-bold">Select a conversation</p>
                    </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </main>

      {/* User Info Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingUser(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-4xl relative z-10 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-8 border-b">
              <h3 className="text-2xl font-bold mb-2">Customer Profile</h3>
              <p className="text-gray-500">Detailed information and order history for {viewingUser.fullName}</p>
            </div>
            <div className="p-8 overflow-y-auto space-y-8">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div><p className="text-xs font-bold text-gray-400 uppercase">Full Name</p><p className="font-bold">{viewingUser.fullName}</p></div>
                  <div><p className="text-xs font-bold text-gray-400 uppercase">Email</p><p className="font-bold">{viewingUser.email}</p></div>
                  <div><p className="text-xs font-bold text-gray-400 uppercase">Phone</p><p className="font-bold">{viewingUser.phone}</p></div>
                  <div><p className="text-xs font-bold text-gray-400 uppercase">Joined</p><p className="font-bold">{new Date(viewingUser.createdAt).toLocaleDateString()}</p></div>
                  <div className="col-span-full"><p className="text-xs font-bold text-gray-400 uppercase">Address</p><p className="font-bold">{viewingUser.address}</p></div>
               </div>

               <div>
                 <h4 className="font-bold mb-4 border-b pb-2">Order History</h4>
                 <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-500 border-b">
                        <tr><th className="px-4 py-3">Order ID</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th></tr>
                      </thead>
                      <tbody>
                        {store.orders.filter((o: any) => o.userId === viewingUser.id).map((o: Order) => (
                           <tr key={o.id} className="border-b last:border-0">
                              <td className="px-4 py-3 font-mono">{o.id}</td>
                              <td className="px-4 py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 bg-white border rounded-full">{o.status}</span></td>
                              <td className="px-4 py-3 text-right font-bold">${o.total}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </div>
            </div>
            <div className="p-8 border-t bg-gray-50 flex justify-end rounded-b-3xl">
               <button onClick={() => setViewingUser(null)} className="bg-black text-white px-8 py-3 rounded-xl font-bold">Close Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl relative z-10 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">{editingProduct?.id ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveProduct} className="grid grid-cols-2 gap-4">
              <input className="p-3 border rounded-lg col-span-2" placeholder="Product Name" value={editingProduct?.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
              <input className="p-3 border rounded-lg" placeholder="Brand" value={editingProduct?.brand || ''} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} required />
              <input className="p-3 border rounded-lg" placeholder="Model" value={editingProduct?.model || ''} onChange={e => setEditingProduct({...editingProduct, model: e.target.value})} required />
              <select className="p-3 border rounded-lg" value={editingProduct?.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})} required>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="p-3 border rounded-lg" type="number" placeholder="Price" value={editingProduct?.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} required />
              <input className="p-3 border rounded-lg" type="number" placeholder="Stock" value={editingProduct?.stock || 0} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} required />
              <input className="p-3 border rounded-lg" placeholder="Color" value={editingProduct?.color || ''} onChange={e => setEditingProduct({...editingProduct, color: e.target.value})} />
              <input className="p-3 border rounded-lg" placeholder="Age Group" value={editingProduct?.age || ''} onChange={e => setEditingProduct({...editingProduct, age: e.target.value})} />
              <input className="p-3 border rounded-lg col-span-2" placeholder="Image URL" value={editingProduct?.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} />
              <textarea className="p-3 border rounded-lg col-span-2" placeholder="Description" rows={3} value={editingProduct?.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}></textarea>
              <button type="submit" className="col-span-2 bg-black text-white py-4 rounded-xl font-bold mt-4">Save Product</button>
            </form>
          </div>
        </div>
      )}

      {/* Order Processing Modal */}
      {processingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setProcessingOrder(null)}></div>
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative z-10 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6">Calculate Final Quote</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between font-medium"><span>Subtotal:</span> <span>${processingOrder.subtotal}</span></div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">VAT Amount ($)</label>
                    <input type="number" className="w-full p-3 border rounded-lg" value={vatInput} onChange={e => setVatInput(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Charge ($)</label>
                    <input type="number" className="w-full p-3 border rounded-lg" value={deliveryInput} onChange={e => setDeliveryInput(Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estimated Delivery (Days)</label>
                  <input type="number" className="w-full p-3 border rounded-lg" value={deliveryDaysInput} onChange={e => setDeliveryDaysInput(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex justify-between text-2xl font-black border-t pt-4">
                <span>Grand Total:</span>
                <span>${Number(processingOrder.subtotal) + Number(vatInput) + Number(deliveryInput)}</span>
              </div>
            </div>
            <button onClick={sendOrderQuote} className="w-full bg-black text-white py-4 rounded-xl font-bold">Send Quote to Customer</button>
          </div>
        </div>
      )}
    </div>
  );
};
