
import React, { useState } from 'react';
import { User, Order } from '../types';

interface ProfileProps {
  store: any;
  onLogout: () => void;
}

const ShippingAnimation = () => (
  <div className="relative w-full h-12 bg-gray-50 rounded-full overflow-hidden border border-gray-100 mt-4">
    <div className="absolute inset-y-0 left-0 bg-black/5 animate-[shipping_4s_infinite_linear]" style={{ width: '40%' }}></div>
    <div className="absolute inset-0 flex items-center px-4">
      <div className="flex items-center gap-3 animate-[truck_4s_infinite_linear]">
         <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
           <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
         </svg>
         <span className="text-[8px] font-black uppercase tracking-widest">In Transit</span>
      </div>
    </div>
    <style>{`
      @keyframes truck {
        0% { transform: translateX(-50px); }
        100% { transform: translateX(350px); }
      }
      @keyframes shipping {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(250%); }
      }
    `}</style>
  </div>
);

export const ProfileView: React.FC<ProfileProps> = ({ store, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SETTINGS' | 'NOTIFS'>('ORDERS');
  const user = store.currentUser;
  const orders = store.orders.filter((o: Order) => o.userId === user?.id).sort((a: any, b: any) => b.createdAt - a.createdAt);
  const userNotifs = store.notifications.filter((n: any) => n.userId === user?.id);
  
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Cash on Delivery'>('bKash');

  const [editName, setEditName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateUser({
      ...user,
      fullName: editName,
      phone: editPhone,
      address: editAddress
    });
    alert('Profile updated successfully.');
  };

  const handleApproveAndPay = (order: Order | null) => {
    if (!order) return;

    if (paymentMethod === 'Cash on Delivery') {
       store.updateOrder({...order, status: 'WAITING_APPROVAL', paymentMethod: 'Cash on Delivery', updatedAt: Date.now()});
       alert('Confirmation request sent. Our concierge will contact you for delivery.');
       setSelectedPaymentOrder(null);
    } else {
       const providerNumber = paymentMethod === 'bKash' ? store.settings.bkashNumber : store.settings.nagadNumber;
       const isConfirmed = window.confirm(`Ready to finalize? You are sending $${order.total} to our ${paymentMethod} gateway (${providerNumber}). Click OK if you have already sent the payment.`);
       
       if (isConfirmed) {
         store.updateOrder({
           ...order, 
           status: 'WAITING_APPROVAL', 
           paymentMethod, 
           updatedAt: Date.now()
         });
         alert('Payment report received. Admin will verify and mark your order as PAID shortly.');
         setSelectedPaymentOrder(null);
       }
    }
  };

  const currentPaymentNumber = paymentMethod === 'bKash' ? store.settings.bkashNumber : store.settings.nagadNumber;
  const unreadCount = userNotifs.filter((n: any) => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
             <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black mb-4">{user?.fullName.charAt(0)}</div>
             <p className="font-bold text-center text-lg">{user?.fullName}</p>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Aurax Member</p>
          </div>
          <nav className="flex flex-col gap-2">
             <button onClick={() => setActiveTab('ORDERS')} className={`px-8 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-left transition ${activeTab === 'ORDERS' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>My Acquisitions</button>
             <button onClick={() => setActiveTab('NOTIFS')} className={`px-8 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-left transition relative ${activeTab === 'NOTIFS' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
                Alerts
                {unreadCount > 0 && <span className="absolute top-1/2 -translate-y-1/2 right-6 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
             </button>
             <button onClick={() => setActiveTab('SETTINGS')} className={`px-8 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-left transition ${activeTab === 'SETTINGS' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>Profile Settings</button>
             <button onClick={onLogout} className="px-8 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-left text-red-500 hover:bg-red-50 transition">Disconnect</button>
          </nav>
        </div>

        <div className="flex-1 w-full">
           {activeTab === 'ORDERS' && (
             <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b">
                       <h3 className="text-xl font-bold uppercase tracking-tighter">Order History</h3>
                    </div>
                    {orders.length === 0 ? (
                      <div className="p-24 text-center text-gray-400 italic font-medium">No orders found.</div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                          {orders.map(o => (
                            <div key={o.id} className="p-8 hover:bg-gray-50/50 transition">
                               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ref: {o.id}</p>
                                    <h4 className="font-black text-lg">{o.items[0]?.name} {o.items.length > 1 ? `+ ${o.items.length - 1} more` : ''}</h4>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                       o.status === 'SHIPPED' ? 'bg-black text-white' :
                                       o.status === 'PAID' ? 'bg-green-50 text-green-600' :
                                       o.status === 'WAITING_APPROVAL' ? 'bg-blue-50 text-blue-600' :
                                       'bg-gray-50 text-gray-400'
                                     }`}>{o.status.replace('_', ' ')}</span>
                                     <span className="font-black text-lg">{o.status === 'PENDING' ? 'Estimating...' : `$${o.total}`}</span>
                                  </div>
                               </div>

                               {o.status === 'SHIPPED' && <ShippingAnimation />}
                               
                               <div className="flex flex-wrap gap-4 mt-6">
                                  {o.status === 'WAITING_APPROVAL' && (
                                    <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                       <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping"></span>
                                       Awaiting Admin Verification
                                    </div>
                                  )}
                                  {o.status === 'AWAITING_PAYMENT' || (o.status === 'WAITING_APPROVAL' && o.total > 0) ? (
                                     <button onClick={() => setSelectedPaymentOrder(o)} className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-8 py-3 rounded-2xl hover:opacity-80 transition">Settle Bill</button>
                                  ) : null}
                               </div>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
             </div>
           )}

           {activeTab === 'NOTIFS' && (
             <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-bold mb-8 uppercase tracking-tighter">Activity Feed</h3>
                <div className="space-y-4">
                   {userNotifs.length === 0 ? (
                     <p className="text-center py-20 text-gray-400 italic">No recent activity.</p>
                   ) : (
                     userNotifs.map((n: any) => (
                       <div 
                        key={n.id} 
                        onClick={() => store.markNotificationRead(n.id)}
                        className={`p-6 rounded-2xl border transition cursor-pointer ${n.read ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-black shadow-sm'}`}
                       >
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-black text-sm uppercase tracking-tight">{n.title}</h4>
                             <span className="text-[9px] text-gray-400">{new Date(n.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">{n.message}</p>
                       </div>
                     ))
                   )}
                </div>
             </div>
           )}

           {activeTab === 'SETTINGS' && (
             <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12">
                <h3 className="text-2xl font-bold mb-10 tracking-tighter uppercase">Identity Configuration</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Full Name</label>
                         <input className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-1 focus:ring-black font-bold" value={editName} onChange={e => setEditName(e.target.value)} required />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Phone Number</label>
                         <input className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-1 focus:ring-black font-bold" value={editPhone} onChange={e => setEditPhone(e.target.value)} required />
                      </div>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Address</label>
                      <textarea className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-1 focus:ring-black font-bold" rows={4} value={editAddress} onChange={e => setEditAddress(e.target.value)} required />
                   </div>
                   <button type="submit" className="bg-black text-white px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:shadow-lg transition">Save Profile</button>
                </form>
             </div>
           )}
        </div>
      </div>

      {selectedPaymentOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPaymentOrder(null)}></div>
           <div className="relative bg-white w-full max-w-lg rounded-[40px] p-10 md:p-14 shadow-2xl animate-in zoom-in duration-300">
              <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase">Settlement</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">Choose your gateway. For high-value transactions, our concierge is available via the direct line below.</p>
              
              <div className="bg-gray-50 p-8 rounded-[32px] mb-8 space-y-3">
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400"><span>Subtotal:</span> <span className="text-black font-black">${selectedPaymentOrder.subtotal}</span></div>
                 <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400"><span>Logistics & VAT:</span> <span className="text-black font-black">${selectedPaymentOrder.vat + selectedPaymentOrder.deliveryCharge}</span></div>
                 <div className="flex justify-between text-3xl font-black pt-6 border-t mt-4 text-black tracking-tighter">
                    <span>TOTAL:</span> <span>${selectedPaymentOrder.total}</span>
                 </div>
              </div>
              
              <div className="mb-10">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Payment Method</label>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['bKash', 'Nagad', 'Cash on Delivery'].map(m => (
                      <button 
                        key={m} 
                        onClick={() => setPaymentMethod(m as any)} 
                        className={`py-5 rounded-2xl border-2 text-center font-black text-[10px] uppercase tracking-widest transition-all ${paymentMethod === m ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 hover:border-black'}`}
                      >
                        {m === 'Cash on Delivery' ? 'COD' : m}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {paymentMethod !== 'Cash on Delivery' ? (
                    <div className="p-6 bg-orange-50 border border-orange-100 rounded-[32px] flex flex-col justify-center">
                       <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-2">{paymentMethod} Merchant</p>
                       <p className="text-xl font-black text-orange-700">{currentPaymentNumber}</p>
                       <button onClick={() => { navigator.clipboard.writeText(currentPaymentNumber); alert('Copied'); }} className="mt-4 text-[8px] bg-orange-200 text-orange-700 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest w-fit">Copy ID</button>
                    </div>
                  ) : (
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-[32px] flex flex-col justify-center">
                       <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Verification</p>
                       <p className="text-xs font-bold text-blue-700">COD available upon manual approval of shipping address.</p>
                    </div>
                  )}

                  <div className="p-6 bg-gray-900 text-white rounded-[32px] flex flex-col justify-center">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Concierge Support</p>
                      <p className="text-xl font-black tracking-tight">{store.settings.adminPhone}</p>
                      <a href={`tel:${store.settings.adminPhone}`} className="mt-4 text-[8px] bg-white/10 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest w-fit hover:bg-white/20 transition">Call Now</a>
                  </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setSelectedPaymentOrder(null)} className="flex-1 py-5 font-black text-[10px] uppercase tracking-widest text-gray-300 hover:text-black transition">Cancel</button>
                 <button 
                  onClick={() => handleApproveAndPay(selectedPaymentOrder)} 
                  className="flex-1 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition"
                 >
                   Confirm Payment
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
