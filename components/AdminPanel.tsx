
import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { Product, User, Order, PaymentSettings, ChatMessage, AppNotification } from '../types';

interface AdminProps {
  store: any;
  onSwitchToShop: () => void;
}

export const AdminPanel: React.FC<AdminProps> = ({ store, onSwitchToShop }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PRODUCTS' | 'ORDERS' | 'SETTINGS' | 'NOTIFS'>('DASHBOARD');
  
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [processingOrder, setProcessingOrder] = useState<Order | null>(null);
  const [vatInput, setVatInput] = useState(0);
  const [deliveryInput, setDeliveryInput] = useState(0);

  const [settings, setSettings] = useState<PaymentSettings>(store.settings);

  useEffect(() => {
    setSettings(store.settings);
  }, [store.settings]);

  const adminNotifs = store.notifications.filter((n: any) => n.userId === 'admin');
  const unreadNotifs = adminNotifs.filter((n: any) => !n.read).length;

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct?.id) {
      store.updateProduct(editingProduct as Product);
    } else {
      store.addProduct({ ...editingProduct, id: Math.random().toString(36).substr(2, 9), rating: 5, reviewsCount: 0 } as Product);
    }
    setEditingProduct(null);
    setIsAdding(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.saveSettings(settings);
    alert('Master configurations updated successfully.');
  };

  const pendingOrdersCount = store.orders.filter((o: Order) => o.status === 'PENDING' || o.status === 'WAITING_APPROVAL').length;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <aside className="w-80 bg-white border-r border-gray-100 flex flex-col p-10">
        <h1 className="text-3xl font-black tracking-tighter mb-16">AURAX ADMIN</h1>
        <nav className="flex-1 space-y-3">
           {[
             { id: 'DASHBOARD', label: 'Overview' },
             { id: 'PRODUCTS', label: 'Inventory' },
             { id: 'ORDERS', label: 'Order Pipeline' },
             { id: 'NOTIFS', label: 'System Alerts' },
             { id: 'SETTINGS', label: 'Master Config' }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`w-full text-left px-8 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
             >
               {tab.label}
               {tab.id === 'ORDERS' && pendingOrdersCount > 0 && <span className="ml-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px]">{pendingOrdersCount}</span>}
               {tab.id === 'NOTIFS' && unreadNotifs > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full"></span>}
             </button>
           ))}
        </nav>
        <button onClick={onSwitchToShop} className="mt-auto flex items-center gap-3 font-black text-[11px] uppercase tracking-widest text-gray-400 hover:text-black transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 0118 0z"></path></svg>
          Shop Front
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-16">
         <header className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter">{activeTab}</h2>
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
               <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs">A</div>
               <span className="text-xs font-bold uppercase tracking-widest">Main Admin</span>
            </div>
         </header>

         {activeTab === 'DASHBOARD' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Revenue</p>
                 <p className="text-5xl font-black">${store.orders.filter((o: any) => o.status === 'PAID' || o.status === 'SHIPPED').reduce((a: any, b: any) => a + b.total, 0)}</p>
              </div>
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Action Required</p>
                 <p className="text-5xl font-black">{pendingOrdersCount}</p>
              </div>
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Catalog Size</p>
                 <p className="text-5xl font-black">{store.products.length}</p>
              </div>
           </div>
         )}

         {activeTab === 'NOTIFS' && (
           <div className="max-w-3xl space-y-4">
              {adminNotifs.length === 0 ? (
                <div className="text-center py-32 text-gray-400 italic">No alerts recorded.</div>
              ) : (
                adminNotifs.map((n: any) => (
                  <div key={n.id} onClick={() => store.markNotificationRead(n.id)} className={`p-8 rounded-[32px] border transition cursor-pointer ${n.read ? 'bg-gray-100 opacity-60 border-transparent' : 'bg-white border-black shadow-lg'}`}>
                     <div className="flex justify-between items-center mb-2">
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${n.type === 'SUCCESS' ? 'bg-green-100 text-green-700' : n.type === 'WARNING' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{n.type}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{new Date(n.timestamp).toLocaleString()}</span>
                     </div>
                     <h4 className="font-black text-sm uppercase tracking-tight mb-2">{n.title}</h4>
                     <p className="text-sm text-gray-600 leading-relaxed font-medium">{n.message}</p>
                  </div>
                ))
              )}
           </div>
         )}

         {activeTab === 'ORDERS' && (
           <div className="space-y-6">
              {store.orders.sort((a: any, b: any) => b.createdAt - a.createdAt).map((o: Order) => (
                <div key={o.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="flex items-center gap-10">
                      <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center font-mono font-black text-xs text-gray-400 border border-gray-100">
                         {o.paymentMethod === 'bKash' ? 'BK' : o.paymentMethod === 'Nagad' ? 'NG' : 'COD'}
                      </div>
                      <div>
                         <div className="flex items-center gap-4 mb-2">
                            <p className="font-black text-xl tracking-tight uppercase">{o.id}</p>
                            <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                              o.status === 'SHIPPED' ? 'bg-black text-white' :
                              o.status === 'PAID' ? 'bg-green-50 text-green-600' :
                              'bg-gray-50 text-gray-400'
                            }`}>{o.status.replace('_', ' ')}</span>
                         </div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User: {o.userId} • Total: ${o.total || 'Calculating...'}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      {o.status === 'PENDING' && (
                        <button 
                          onClick={() => {
                            setProcessingOrder(o);
                            setVatInput(Math.round(o.subtotal * (store.settings.vatPercentage / 100)));
                            setDeliveryInput(o.deliveryMethod === 'Premium' ? store.settings.premiumDeliveryFee : store.settings.standardDeliveryFee);
                          }}
                          className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition"
                        >
                          Send Quote
                        </button>
                      )}
                      {o.status === 'WAITING_APPROVAL' && (
                         <button 
                          onClick={() => store.updateOrder({...o, status: 'PAID', updatedAt: Date.now()})}
                          className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition"
                         >
                           Approve Payment
                         </button>
                      )}
                      {o.status === 'PAID' && (
                         <button 
                          onClick={() => store.updateOrder({...o, status: 'SHIPPED', updatedAt: Date.now()})}
                          className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition flex items-center gap-2"
                         >
                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/></svg>
                           Confirm Shipped
                         </button>
                      )}
                   </div>
                </div>
              ))}
           </div>
         )}

         {activeTab === 'PRODUCTS' && (
           <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                 <h3 className="font-bold text-xl uppercase tracking-tighter">Inventory Control</h3>
                 <button onClick={() => { setIsAdding(true); setEditingProduct({}); }} className="bg-black text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl">New Arrival</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs uppercase tracking-widest font-bold">
                   <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
                      <tr>
                         <th className="px-10 py-6">Model</th>
                         <th className="px-10 py-6">Price</th>
                         <th className="px-10 py-6">Stock</th>
                         <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                      {store.products.map((p: Product) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                           <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                              <div className="flex flex-col">
                                <span className="text-black font-black">{p.name}</span>
                                <span className="text-[9px] text-gray-400">{p.brand}</span>
                              </div>
                            </div>
                           </td>
                           <td className="px-10 py-6 font-black text-sm">${p.price}</td>
                           <td className="px-10 py-6 text-gray-500">{p.stock} units</td>
                           <td className="px-10 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => { setEditingProduct(p); setIsAdding(true); }} className="p-3 text-gray-400 hover:text-black transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                                <button onClick={() => { if(window.confirm('Delete product?')) store.deleteProduct(p.id); }} className="p-3 text-red-400 hover:text-red-600 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           </div>
         )}

         {activeTab === 'SETTINGS' && (
           <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-12 max-w-2xl">
              <h3 className="text-2xl font-black mb-10 tracking-tighter uppercase">Master Config</h3>
              <form onSubmit={handleSaveSettings} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">bKash Number</label>
                       <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-none focus:ring-1 focus:ring-black" value={settings.bkashNumber} onChange={e => setSettings({...settings, bkashNumber: e.target.value})} required />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Nagad Number</label>
                       <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-none focus:ring-1 focus:ring-black" value={settings.nagadNumber} onChange={e => setSettings({...settings, nagadNumber: e.target.value})} required />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Concierge Direct Phone</label>
                       <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-none focus:ring-1 focus:ring-black" value={settings.adminPhone} onChange={e => setSettings({...settings, adminPhone: e.target.value})} required />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">VAT %</label>
                       <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-none focus:ring-1 focus:ring-black" value={settings.vatPercentage} onChange={e => setSettings({...settings, vatPercentage: Number(e.target.value)})} required />
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-black text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl transition active:scale-95">Update Global Protocol</button>
              </form>
           </div>
         )}
      </main>

      {/* Product Editor Modal */}
      {isAdding && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsAdding(false)}></div>
            <div className="relative bg-white p-12 rounded-[40px] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300">
               <h3 className="text-3xl font-black mb-8 tracking-tighter uppercase">Product Editor</h3>
               <form onSubmit={handleSaveProduct} className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Watch Name</label>
                     <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={editingProduct?.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Brand</label>
                     <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={editingProduct?.brand || ''} onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})} required />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                     <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold appearance-none" value={editingProduct?.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})} required>
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price ($)</label>
                     <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={editingProduct?.price || ''} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} required />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock</label>
                     <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={editingProduct?.stock || ''} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} required />
                  </div>
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Image URL</label>
                     <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={editingProduct?.image || ''} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} required />
                  </div>
                  <button type="submit" className="col-span-2 bg-black text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl transition active:scale-95">Commit Records</button>
               </form>
            </div>
         </div>
      )}

      {/* Quote Calculation Modal */}
      {processingOrder && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setProcessingOrder(null)}></div>
            <div className="relative bg-white p-12 rounded-[40px] w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
               <h3 className="text-3xl font-black mb-10 tracking-tighter uppercase">Finalization</h3>
               <div className="space-y-6 mb-12">
                  <div className="flex justify-between items-center text-sm uppercase tracking-widest font-bold text-gray-400"><span>Base:</span> <span className="text-black font-black text-xl">${processingOrder.subtotal}</span></div>
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Custom VAT ($)</label>
                        <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={vatInput} onChange={e => setVatInput(Number(e.target.value))} />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Delivery Fee ($)</label>
                        <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={deliveryInput} onChange={e => setDeliveryInput(Number(e.target.value))} />
                     </div>
                  </div>
                  <div className="pt-8 border-t border-gray-100 flex justify-between items-end">
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Final Quote:</span>
                     <span className="text-5xl font-black tracking-tighter">${processingOrder.subtotal + vatInput + deliveryInput}</span>
                  </div>
               </div>
               <button 
                onClick={() => {
                  const total = processingOrder.subtotal + vatInput + deliveryInput;
                  store.updateOrder({...processingOrder, total, vat: vatInput, deliveryCharge: deliveryInput, status: 'WAITING_APPROVAL', updatedAt: Date.now()});
                  setProcessingOrder(null);
                  alert('Quote transmitted.');
                }}
                className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl"
               >
                 Transmit To Client
               </button>
            </div>
         </div>
      )}
    </div>
  );
};
