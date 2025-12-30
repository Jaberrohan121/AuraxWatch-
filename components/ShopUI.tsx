
import React, { useState, useMemo } from 'react';
import { CATEGORIES } from '../constants';
import { Product, Order, OrderItem } from '../types';
import { ChatWidget } from './ChatWidget';

interface ShopProps {
  store: any;
  onSwitchToAdmin: () => void;
}

export const ShopView: React.FC<ShopProps> = ({ store, onSwitchToAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<{ productId: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'Standard' | 'Premium'>('Standard');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Cash on Delivery'>('Cash on Delivery');

  const filteredProducts = useMemo(() => {
    return store.products.filter((p: Product) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [store.products, searchTerm, selectedCategory]);

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => {
    const p = store.products.find((p: Product) => p.id === item.productId);
    return acc + (p?.price || 0) * item.quantity;
  }, 0);

  const placeOrder = () => {
    const orderItems: OrderItem[] = cart.map(item => {
      const p = store.products.find((p: Product) => p.id === item.productId);
      return {
        productId: item.productId,
        name: p?.name || 'Unknown',
        quantity: item.quantity,
        unitPrice: p?.price || 0
      };
    });

    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      userId: store.currentUser.id,
      items: orderItems,
      subtotal: cartTotal,
      vat: 0,
      deliveryCharge: 0,
      total: 0,
      status: 'PENDING',
      deliveryMethod,
      paymentMethod,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    store.createOrder(newOrder);
    setCart([]);
    setIsCheckingOut(false);
    setIsCartOpen(false);
    alert('Order placed! Please wait for admin approval and quote.');
  };

  const userOrders = store.orders.filter((o: Order) => o.userId === store.currentUser?.id);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black tracking-tighter">AURAX</h1>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`hover:text-gray-300 ${!selectedCategory ? 'text-white border-b-2' : 'text-gray-400'}`}
              >
                All Watches
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`hover:text-gray-300 ${selectedCategory === cat ? 'text-white border-b-2' : 'text-gray-400'}`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search watches..."
                className="bg-gray-800 text-sm px-4 py-2 rounded-full w-48 md:w-64 focus:w-80 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {store.currentUser?.role === 'ADMIN' && (
              <button onClick={onSwitchToAdmin} className="text-sm bg-yellow-600 px-3 py-1.5 rounded font-bold">Admin Panel</button>
            )}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </button>
            <button onClick={() => store.logout()} className="text-sm font-medium hover:underline text-gray-300">Sign Out</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      {!selectedCategory && !searchTerm && (
        <section className="bg-gray-900 text-white py-20 px-4 relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
            <span className="text-yellow-500 font-bold tracking-widest text-sm uppercase mb-4">New Arrivals 2024</span>
            <h2 className="text-5xl md:text-7xl font-black mb-6 max-w-4xl">Timeless Elegance For Your Wrist.</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl">Discover the world's finest timepieces curated by AURAX experts. From heritage luxury to cutting-edge smart technology.</p>
            <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition">Shop Collection</button>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-yellow-500/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-full bg-gradient-to-r from-blue-500/10 to-transparent"></div>
        </section>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold">
            {searchTerm ? `Results for "${searchTerm}"` : (selectedCategory || 'Trending Now')}
          </h3>
          <p className="text-gray-500 text-sm font-medium">{filteredProducts.length} watches available</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((p: Product) => (
            <div key={p.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition flex flex-col">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[10px] font-black px-2 py-1 rounded-full text-black uppercase">{p.brand}</span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-gray-900 leading-tight">{p.name}</h4>
                  <span className="text-black font-black text-lg">${p.price}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{p.description}</p>
                <div className="mt-auto space-y-3">
                   <div className="flex gap-2 text-[10px] font-bold text-gray-400">
                    <span className="border px-2 py-0.5 rounded">{p.category}</span>
                    <span className="border px-2 py-0.5 rounded">{p.color}</span>
                    <span className="border px-2 py-0.5 rounded">{p.age}</span>
                  </div>
                  <button
                    onClick={() => addToCart(p.id)}
                    className="w-full bg-black text-white py-2.5 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User Order History */}
        {userOrders.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl font-bold mb-8">My Order History</h3>
            <div className="space-y-6">
              {userOrders.sort((a: any, b: any) => b.createdAt - a.createdAt).map((o: Order) => (
                <div key={o.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h4 className="font-mono font-black text-sm flex items-center gap-2">
                        {o.id}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.status === 'WAITING_APPROVAL' ? 'bg-blue-100 text-blue-700' :
                          o.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{new Date(o.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Grand Total</p>
                      <p className="text-2xl font-black">{o.status === 'PENDING' ? '--' : `$${o.total}`}</p>
                    </div>
                  </div>

                  {/* Payment/Instruction Section */}
                  <div className="bg-gray-50 rounded-xl p-5 mb-6">
                    {o.status === 'PENDING' && (
                      <p className="text-sm italic text-gray-500">Wait for admin to process your quote...</p>
                    )}

                    {o.status === 'WAITING_APPROVAL' && (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                          <p className="text-sm font-bold text-yellow-800">Final Quote Received!</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Estimated delivery: <span className="font-bold">{o.deliveryDays} days</span>
                          </p>
                        </div>
                        {o.paymentMethod === 'Cash on Delivery' ? (
                          <div className="p-4 border rounded bg-white">
                            <p className="text-sm font-medium">For Cash on Delivery, please approve to confirm.</p>
                            <p className="text-xs text-gray-500 mt-2">Admin Contact: <span className="font-bold">{store.settings.adminPhone}</span></p>
                          </div>
                        ) : (
                          <div className="p-4 border rounded bg-white">
                            <p className="text-sm font-medium">Please pay to: <span className="font-black text-pink-600">{o.paymentMethod === 'bKash' ? store.settings.bkashNumber : store.settings.nagadNumber}</span></p>
                            <p className="text-xs text-gray-500 mt-2">After approval, proceed to make the payment.</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => {
                              store.updateOrder({...o, status: o.paymentMethod === 'Cash on Delivery' ? 'PAID' : 'AWAITING_PAYMENT'});
                              alert(o.paymentMethod === 'Cash on Delivery' ? 'Order confirmed! We will deliver soon.' : 'Quote approved! Please complete the payment.');
                            }}
                            className="bg-black text-white px-6 py-2 rounded-lg text-sm font-bold"
                          >
                            Approve Order
                          </button>
                          <button 
                            onClick={() => store.updateOrder({...o, status: 'CANCELLED'})}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-bold"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    )}

                    {o.status === 'AWAITING_PAYMENT' && (
                      <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                        <p className="text-sm font-bold text-pink-700">Awaiting Payment Verification</p>
                        <p className="text-xs text-pink-600 mt-2">
                          Send <span className="font-black">${o.total}</span> via <span className="font-black">{o.paymentMethod}</span> to:
                        </p>
                        <p className="text-xl font-black text-pink-800 my-2">
                          {o.paymentMethod === 'bKash' ? store.settings.bkashNumber : store.settings.nagadNumber}
                        </p>
                        <button 
                          onClick={() => {
                            alert('Admin has been notified. They will confirm once payment is received.');
                          }}
                          className="bg-pink-600 text-white px-4 py-2 rounded-lg text-xs font-bold mt-2"
                        >
                          I Have Paid
                        </button>
                      </div>
                    )}

                    {o.status === 'PAID' && (
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-green-700">Notice: Payment Complete!</p>
                          <p className="text-xs text-green-600 mt-1">Your watch will arrive in approx. <span className="font-black">{o.deliveryDays} days</span>.</p>
                        </div>
                        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      </div>
                    )}

                    {o.status === 'SHIPPED' && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm font-bold text-blue-700">Order Shipped!</p>
                        <p className="text-xs text-blue-600 mt-1">Your item is on its way. Estimated arrival in 1-2 days.</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                     <div>
                       <p className="text-gray-400 mb-1">Items</p>
                       <p className="text-black font-bold">{o.items.length} Units</p>
                     </div>
                     <div>
                       <p className="text-gray-400 mb-1">Method</p>
                       <p className="text-black font-bold">{o.deliveryMethod}</p>
                     </div>
                     <div>
                       <p className="text-gray-400 mb-1">Payment</p>
                       <p className="text-black font-bold">{o.paymentMethod}</p>
                     </div>
                     <div>
                       <p className="text-gray-400 mb-1">Contact Admin</p>
                       <p className="text-black font-bold">{store.settings.adminPhone}</p>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                  <p className="font-bold">Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => {
                  const p = store.products.find((p: Product) => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={p?.image} alt={p?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900">{p?.name}</h4>
                          <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-3 border rounded-lg px-2 py-1">
                            <button 
                              onClick={() => {
                                if (item.quantity > 1) {
                                  setCart(prev => prev.map(i => i.productId === item.productId ? {...i, quantity: i.quantity - 1} : i));
                                }
                              }}
                              className="w-5 h-5 flex items-center justify-center text-gray-500"
                            >-</button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => {
                                setCart(prev => prev.map(i => i.productId === item.productId ? {...i, quantity: i.quantity + 1} : i));
                              }}
                              className="w-5 h-5 flex items-center justify-center text-gray-500"
                            >+</button>
                          </div>
                          <p className="font-black">${(p?.price || 0) * item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t bg-gray-50">
                <div className="space-y-4 mb-6">
                   {!isCheckingOut ? (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Subtotal</span>
                        <span className="text-2xl font-black">${cartTotal}</span>
                      </div>
                   ) : (
                     <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Delivery Method</label>
                          <div className="grid grid-cols-2 gap-2">
                             <button onClick={() => setDeliveryMethod('Standard')} className={`p-3 border rounded-lg text-sm font-bold ${deliveryMethod === 'Standard' ? 'border-black bg-black text-white' : 'bg-white'}`}>Standard</button>
                             <button onClick={() => setDeliveryMethod('Premium')} className={`p-3 border rounded-lg text-sm font-bold ${deliveryMethod === 'Premium' ? 'border-black bg-black text-white' : 'bg-white'}`}>Premium</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Payment Method</label>
                          <div className="grid grid-cols-3 gap-2">
                             <button onClick={() => setPaymentMethod('bKash')} className={`p-2 border rounded-lg text-[10px] font-black ${paymentMethod === 'bKash' ? 'border-pink-500 bg-pink-500 text-white' : 'bg-white'}`}>bKash</button>
                             <button onClick={() => setPaymentMethod('Nagad')} className={`p-2 border rounded-lg text-[10px] font-black ${paymentMethod === 'Nagad' ? 'border-orange-500 bg-orange-500 text-white' : 'bg-white'}`}>Nagad</button>
                             <button onClick={() => setPaymentMethod('Cash on Delivery')} className={`p-2 border rounded-lg text-[10px] font-black ${paymentMethod === 'Cash on Delivery' ? 'border-gray-800 bg-gray-800 text-white' : 'bg-white'}`}>COD</button>
                          </div>
                        </div>
                        {(paymentMethod === 'bKash' || paymentMethod === 'Nagad') && (
                          <div className="p-3 bg-white border border-dashed rounded-lg text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Pay to admin:</p>
                            <p className="font-black text-lg">{paymentMethod === 'bKash' ? store.settings.bkashNumber : store.settings.nagadNumber}</p>
                          </div>
                        )}
                     </div>
                   )}
                </div>
                <button
                  onClick={isCheckingOut ? placeOrder : () => setIsCheckingOut(true)}
                  className="w-full bg-black text-white py-4 rounded-xl font-black hover:bg-gray-800 transition"
                >
                  {isCheckingOut ? 'Place Order' : 'Proceed to Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-2xl font-black tracking-tighter mb-4">AURAX</h2>
            <p className="text-gray-500 text-sm leading-relaxed">Defining time since 2024. The world's most exclusive watch shop for enthusiasts and collectors.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Categories</h4>
            <ul className="text-sm text-gray-500 space-y-2">
              {CATEGORIES.map(c => <li key={c} className="hover:text-black cursor-pointer">{c}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>Track Order</li>
              <li>Delivery Info</li>
              <li>Returns</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>Email: contact@aurax.com</li>
              <li>Phone: {store.settings.adminPhone}</li>
              <li>Address: Banani, Dhaka</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t text-center text-xs text-gray-400">
          &copy; 2024 AURAX Watch Shop. All rights reserved.
        </div>
      </footer>

      {/* Customer Support Chat */}
      <ChatWidget store={store} />
    </div>
  );
};
