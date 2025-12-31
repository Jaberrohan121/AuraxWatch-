
import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { Product, Order, OrderItem, Category } from '../types';
import { ProfileView } from './Profile';
import { MessageCenter } from './MessageCenter';

interface ShopProps {
  store: any;
  onSwitchToAdmin: () => void;
}

export const ShopView: React.FC<ShopProps> = ({ store, onSwitchToAdmin }) => {
  const [view, setView] = useState<'HOME' | 'PROFILE' | 'MESSAGES' | 'DETAIL'>('HOME');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [cart, setCart] = useState<{ productId: string; quantity: number; selectedColor?: string }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'Standard' | 'Premium'>('Standard');

  // Available brands for filtering
  const brands = useMemo<string[]>(() => {
    if (!store.products) return [];
    const uniqueBrands = new Set<string>((store.products as Product[]).map((p: Product) => p.brand));
    return Array.from(uniqueBrands);
  }, [store.products]);

  const filteredProducts = useMemo(() => {
    return (store.products as Product[]).filter((p: Product) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesBrand = !selectedBrand || p.brand === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
  }, [store.products, searchTerm, selectedCategory, selectedBrand]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return (store.products as Product[])
      .filter((p: Product) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
      .slice(0, 4);
  }, [store.products, selectedProduct]);

  const addToCart = (productId: string, color?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId && item.selectedColor === color);
      if (existing) {
        return prev.map(item => (item.productId === productId && item.selectedColor === color) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId, quantity: 1, selectedColor: color }];
    });
  };

  const cartTotal = cart.reduce((acc, item) => {
    const p = (store.products as Product[]).find((p: Product) => p.id === item.productId);
    return acc + (p?.price || 0) * item.quantity;
  }, 0);

  const handlePlaceOrder = () => {
    const orderItems: OrderItem[] = cart.map(item => {
      const p = (store.products as Product[]).find((p: Product) => p.id === item.productId);
      return {
        productId: item.productId,
        name: p?.name || 'Unknown',
        quantity: item.quantity,
        unitPrice: p?.price || 0,
        selectedColor: item.selectedColor
      };
    });

    const newOrder: Order = {
      id: 'AUR-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: store.currentUser.id,
      items: orderItems,
      subtotal: cartTotal,
      vat: 0,
      deliveryCharge: 0,
      total: 0,
      status: 'PENDING',
      deliveryMethod,
      paymentMethod: 'Cash on Delivery', 
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    store.createOrder(newOrder);
    setCart([]);
    setIsCheckoutModalOpen(false);
    setIsCartOpen(false);
    setView('PROFILE');
    alert('Request Received. Our concierge will review your selection and contact you with a customized quote.');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-10 lg:gap-16">
            <h1 
              className="text-2xl md:text-3xl font-black tracking-tighter cursor-pointer hover:opacity-70 transition" 
              onClick={() => { setView('HOME'); setSelectedCategory(null); setSelectedBrand(null); setSelectedProduct(null); setSearchTerm(''); }}
            >
              AURAX
            </h1>
            <div className="hidden lg:flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
               {CATEGORIES.map(cat => (
                 <button 
                  key={cat} 
                  onClick={() => { setSelectedCategory(cat); setView('HOME'); setSelectedBrand(null); setSelectedProduct(null); }} 
                  className={`hover:text-black transition relative py-2 ${selectedCategory === cat ? 'text-black' : ''}`}
                 >
                   {cat}
                   {selectedCategory === cat && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-in fade-in slide-in-from-bottom-1"></span>}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search models..." 
                className="bg-gray-100 px-6 py-2.5 rounded-full text-xs w-48 lg:w-64 focus:w-80 transition-all outline-none border border-transparent focus:border-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button onClick={() => setView('PROFILE')} className="hover:text-gray-400 transition p-2 relative">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {store.notifications.filter((n: any) => n.userId === store.currentUser?.id && !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative hover:text-gray-400 transition p-2">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              {cart.length > 0 && <span className="absolute top-1 right-1 bg-black text-white text-[8px] md:text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">{cart.length}</span>}
            </button>
            {store.currentUser?.role === 'ADMIN' && (
              <button onClick={onSwitchToAdmin} className="hidden md:block text-[10px] font-bold uppercase border-2 border-black px-4 py-2 rounded-lg hover:bg-black hover:text-white transition">Admin</button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {view === 'HOME' && (
          <div className="max-w-7xl mx-auto px-6 py-8 md:py-16">
            {!searchTerm && !selectedCategory && !selectedBrand && (
              <>
                <div className="relative h-[400px] md:h-[600px] rounded-[32px] md:rounded-[48px] overflow-hidden mb-16 md:mb-24 aurax-gradient shadow-2xl">
                  <div className="absolute inset-0 opacity-50 grayscale hover:grayscale-0 transition-all duration-1000">
                    <img src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-10 md:px-20 text-white z-10">
                    <p className="text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-4 md:mb-6 opacity-60">Spring Collection 2024</p>
                    <h2 className="text-4xl md:text-7xl font-black mb-6 md:mb-8 leading-[1] tracking-tighter">THE ART OF<br/>HOROLOGY.</h2>
                    <p className="max-w-md text-gray-300 text-sm md:text-lg mb-8 md:mb-10 font-light leading-relaxed">Discover a world where precision meets timeless elegance. Hand-picked models for the discerning collector.</p>
                    <button onClick={() => setSelectedCategory('Luxurious')} className="bg-white text-black w-fit px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm tracking-widest hover:scale-105 transition active:scale-95 shadow-xl">EXPLORE LUXURIOUS</button>
                  </div>
                </div>

                {/* Browse by Category Section */}
                <div className="mb-24">
                  <h3 className="text-2xl font-black mb-10 tracking-tighter uppercase">Browse by Category</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className="group flex flex-col items-center p-6 bg-gray-50 rounded-[32px] hover:bg-black hover:text-white transition-all duration-300"
                      >
                        <div className="w-12 h-12 mb-4 bg-white rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                           </svg>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Filter Bar */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h4 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
                    {searchTerm ? `Results for "${searchTerm}"` : (selectedBrand ? selectedBrand : (selectedCategory || 'The Collection'))}
                  </h4>
                  <div className="h-1.5 w-24 bg-black mt-4"></div>
                </div>
                
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  <button 
                    onClick={() => { setSelectedBrand(null); setSelectedCategory(null); }}
                    className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition ${!selectedBrand && !selectedCategory ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                  >
                    All Brands
                  </button>
                  {brands.map(brand => (
                    <button 
                      key={brand}
                      onClick={() => { setSelectedBrand(brand); setSelectedCategory(null); }}
                      className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition ${selectedBrand === brand ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Quick Filter Scroller */}
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar border-b border-gray-100">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!selectedCategory ? 'bg-gray-100 text-black' : 'text-gray-300 hover:text-black'}`}
                >
                  All Categories
                </button>
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-gray-100 text-black' : 'text-gray-300 hover:text-black'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {filteredProducts.map((p: Product) => (
                  <div 
                    key={p.id} 
                    className="group cursor-pointer"
                    onClick={() => { setSelectedProduct(p); setSelectedColor(p.color); setView('DETAIL'); window.scrollTo(0,0); }}
                  >
                    <div className="aspect-[4/5] bg-gray-100 rounded-[32px] overflow-hidden mb-6 relative group-hover:shadow-2xl transition duration-500">
                      <img src={p.image} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                      <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">Quick View</span>
                      </div>
                      {p.stock < 3 && (
                        <div className="absolute bottom-6 left-6">
                           <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">Limited Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="px-2">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.brand}</p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase">{p.category}</p>
                      </div>
                      <h5 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-gray-500 transition">{p.name}</h5>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-xl">${p.price.toLocaleString()}</p>
                        {p.originalPrice && <p className="text-sm text-gray-300 line-through">${p.originalPrice.toLocaleString()}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center">
                 <svg className="w-16 h-16 mx-auto text-gray-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 <p className="text-gray-400 font-medium text-lg italic">No timepieces found matching your criteria.</p>
                 <button onClick={() => { setSearchTerm(''); setSelectedCategory(null); setSelectedBrand(null); }} className="mt-6 text-black font-bold uppercase text-[10px] tracking-widest border-b-2 border-black pb-1 hover:opacity-50 transition">Clear Filters</button>
              </div>
            )}
          </div>
        )}

        {view === 'DETAIL' && selectedProduct && (
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 animate-in fade-in duration-700">
            <button onClick={() => setView('HOME')} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-12 hover:opacity-50 transition group">
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Catalog
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-32">
              <div className="sticky top-32 h-fit bg-gray-50 rounded-[48px] p-10 md:p-20 flex items-center justify-center group overflow-hidden">
                <img src={selectedProduct.image} className="w-full h-auto object-contain drop-shadow-2xl transition duration-500 group-hover:scale-105" />
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] inline-block mb-2">{selectedProduct.brand} • {selectedProduct.category}</span>
                  <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tighter">{selectedProduct.name}</h2>
                </div>
                
                <div className="flex items-baseline gap-6 mb-12">
                   <span className="text-4xl md:text-5xl font-black">${selectedProduct.price.toLocaleString()}</span>
                   {selectedProduct.originalPrice && (
                     <span className="text-xl md:text-2xl text-gray-300 line-through font-light">${selectedProduct.originalPrice.toLocaleString()}</span>
                   )}
                </div>

                <div className="mb-10 p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">The Narrative</h3>
                   <p className="text-gray-600 text-lg leading-relaxed font-light italic">"{selectedProduct.description}"</p>
                </div>

                {selectedProduct.availableColors && (
                  <div className="mb-12">
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Execution & Finish</h3>
                     <div className="flex flex-wrap gap-3">
                        {selectedProduct.availableColors.map(c => (
                          <button 
                            key={c}
                            onClick={() => setSelectedColor(c)}
                            className={`px-6 py-3 rounded-2xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all ${selectedColor === c ? 'bg-black text-white border-black shadow-lg scale-105' : 'border-gray-200 hover:border-black text-gray-500'}`}
                          >
                            {c}
                          </button>
                        ))}
                     </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => { addToCart(selectedProduct.id, selectedColor); setIsCartOpen(true); }}
                    className="flex-1 bg-black text-white py-6 rounded-3xl font-black tracking-[0.2em] text-[10px] md:text-xs hover:scale-[1.02] active:scale-[0.98] transition shadow-2xl flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    ADD TO COLLECTION
                  </button>
                  <button className="p-6 rounded-3xl border-2 border-gray-100 hover:bg-gray-50 transition group">
                     <svg className="w-6 h-6 text-gray-300 group-hover:text-red-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24 mb-32 pt-24 border-t border-gray-100">
               <div className="lg:col-span-2">
                  <h3 className="text-3xl font-black mb-12 tracking-tighter uppercase">Horological Specifications</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                     {selectedProduct.specs ? Object.entries(selectedProduct.specs).map(([key, value]) => (
                       <div key={key} className="pb-6 border-b border-gray-100 hover:bg-gray-50/50 transition px-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{key}</p>
                          <p className="text-lg font-medium text-gray-800">{value}</p>
                       </div>
                     )) : (
                       <>
                        <div className="pb-6 border-b border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Reference</p>
                           <p className="text-lg font-medium">{selectedProduct.model}</p>
                        </div>
                        <div className="pb-6 border-b border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Category</p>
                           <p className="text-lg font-medium">{selectedProduct.category}</p>
                        </div>
                        <div className="pb-6 border-b border-gray-100">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Availability</p>
                           <p className="text-lg font-medium">{selectedProduct.stock > 0 ? 'Immediate Dispatch' : 'By Reservation'}</p>
                        </div>
                       </>
                     )}
                  </div>
               </div>
               <div className="space-y-8">
                  <div className="bg-gray-900 text-white rounded-[40px] p-10 shadow-2xl">
                     <h3 className="text-xl font-black mb-6 tracking-tight uppercase">AURAX CONCIERGE</h3>
                     <p className="text-gray-400 text-sm mb-10 leading-relaxed font-light">Every acquisition from Aurax is accompanied by an international warranty and a certificate of authenticity signed by our master watchmakers.</p>
                     <ul className="space-y-6">
                        <li className="flex gap-4 items-start">
                           <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg></div>
                           <div className="text-[10px] font-bold uppercase tracking-widest">Verified Provenance</div>
                        </li>
                        <li className="flex gap-4 items-start">
                           <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg></div>
                           <div className="text-[10px] font-bold uppercase tracking-widest">Insured Global Delivery</div>
                        </li>
                     </ul>
                  </div>
               </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="mb-24">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-3xl font-black tracking-tighter uppercase">Curated Pairings</h3>
                  <div className="h-0.5 flex-1 mx-8 bg-gray-100 hidden md:block"></div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                   {relatedProducts.map((p: Product) => (
                     <div key={p.id} className="group cursor-pointer" onClick={() => { setSelectedProduct(p); setView('DETAIL'); window.scrollTo(0,0); }}>
                        <div className="aspect-square bg-gray-50 rounded-[32px] overflow-hidden mb-6 group-hover:shadow-xl transition duration-500">
                           <img src={p.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                        </div>
                        <h5 className="font-bold text-sm truncate mb-1 uppercase tracking-tight">{p.name}</h5>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${p.price.toLocaleString()}</p>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'PROFILE' && <ProfileView store={store} onLogout={() => { store.logout(); setView('HOME'); }} />}
        {view === 'MESSAGES' && <MessageCenter store={store} />}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-8 md:p-12 animate-in slide-in-from-right duration-500">
            <div className="flex justify-between items-center mb-16">
               <h2 className="text-3xl font-black tracking-tighter uppercase">PRIVATE SELECTION</h2>
               <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition duration-500 p-2">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar pr-2">
              {cart.length === 0 ? (
                <div className="text-center py-24 flex flex-col items-center">
                   <svg className="w-12 h-12 text-gray-100 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                   <p className="text-gray-300 font-bold tracking-[0.2em] text-[10px] uppercase italic">Curator's Gallery is Empty</p>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const p = (store.products as Product[]).find((p: Product) => p.id === item.productId);
                  return (
                    <div key={idx} className="flex gap-6 items-center animate-in slide-in-from-right duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                       <div className="w-20 h-24 bg-gray-50 rounded-2xl shrink-0 overflow-hidden shadow-sm border border-gray-100 p-2">
                        <img src={p?.image} className="w-full h-full object-contain" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate uppercase tracking-tight">{p?.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{p?.brand} {item.selectedColor ? `• ${item.selectedColor}` : ''}</p>
                          <div className="flex justify-between items-center mt-3">
                             <span className="font-black text-sm">${p?.price.toLocaleString()}</span>
                             <div className="flex items-center gap-4">
                                <span className="text-[10px] text-gray-400 font-bold">QTY: {item.quantity}</span>
                                <button onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))} className="text-[9px] text-red-500 font-bold uppercase tracking-widest hover:underline">Dismiss</button>
                             </div>
                          </div>
                       </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-12 pt-12 border-t border-gray-100">
                 <div className="flex justify-between text-2xl font-black tracking-tighter mb-8 items-baseline">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">Base Estimate</span>
                    <span>${cartTotal.toLocaleString()}</span>
                 </div>
                 <button onClick={() => setIsCheckoutModalOpen(true)} className="w-full bg-black text-white py-6 rounded-3xl font-black tracking-[0.2em] text-[10px] uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition">REQUEST FORMAL QUOTE</button>
                 <p className="text-center text-[8px] text-gray-400 uppercase tracking-widest mt-6 font-medium">Pricing excludes local taxes and premium logistics.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsCheckoutModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[48px] p-10 md:p-14 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-0.5 bg-black"></div>
                <h2 className="text-3xl font-black tracking-tighter uppercase">Order Request</h2>
             </div>
             <p className="text-gray-400 text-sm mb-12 leading-relaxed">Please confirm your logistics preference. Our concierge team will calculate the final quote based on your location and selection.</p>
             
             <div className="space-y-8 mb-12">
                <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4"><span>Subtotal:</span> <span className="text-black font-black">${cartTotal.toLocaleString()}</span></div>
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400"><span>Estimated Dispatch:</span> <span className="text-black font-black">24-48 Hours</span></div>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Logistics Tier</label>
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setDeliveryMethod('Standard')} 
                        className={`py-5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${deliveryMethod === 'Standard' ? 'border-black bg-black text-white shadow-xl scale-105' : 'border-gray-100 text-gray-400 hover:border-black'}`}
                      >
                        Standard Secure
                      </button>
                      <button 
                        onClick={() => setDeliveryMethod('Premium')} 
                        className={`py-5 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${deliveryMethod === 'Premium' ? 'border-black bg-black text-white shadow-xl scale-105' : 'border-gray-100 text-gray-400 hover:border-black'}`}
                      >
                        White Glove
                      </button>
                   </div>
                   <p className="mt-4 text-[8px] text-gray-400 uppercase tracking-widest text-center italic">Premium logistics includes full insurance and hand-delivery.</p>
                </div>
             </div>

             <div className="flex gap-4">
                <button onClick={() => setIsCheckoutModalOpen(false)} className="flex-1 py-5 font-black text-[10px] uppercase tracking-widest text-gray-300 hover:text-black transition">Cancel</button>
                <button onClick={handlePlaceOrder} className="flex-1 py-5 bg-black text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition">SEND ACQUISITION REQUEST</button>
             </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black text-white pt-24 pb-12 px-6 md:px-10 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-20 border-b border-white/5 pb-20 mb-12">
            <div className="md:col-span-2">
               <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-8">AURAX</h3>
               <p className="text-gray-500 max-w-sm mb-12 text-base md:text-lg font-light leading-relaxed">Authorized dealer of distinguished timepieces. We provide global collectors with access to rare and iconic watch models.</p>
               <div className="flex gap-4">
                  {['INSTAGRAM', 'TWITTER', 'LINKEDIN'].map(social => (
                    <button key={social} className="text-[10px] font-bold tracking-widest uppercase py-2 px-4 border border-white/10 rounded-full hover:bg-white hover:text-black transition">{social}</button>
                  ))}
               </div>
            </div>
            <div>
               <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-10 text-gray-400">Discover</h4>
               <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  {CATEGORIES.slice(0, 4).map(c => <li key={c} onClick={() => setSelectedCategory(c)} className="hover:text-white transition cursor-pointer">{c} Collection</li>)}
                  <li className="hover:text-white transition cursor-pointer">Archive</li>
               </ul>
            </div>
            <div>
               <h4 className="font-black text-[10px] uppercase tracking-[0.3em] mb-10 text-gray-400">Services</h4>
               <ul className="space-y-4 text-sm text-gray-500 font-medium">
                  <li className="hover:text-white transition cursor-pointer">Private Consultations</li>
                  <li className="hover:text-white transition cursor-pointer">Watch Maintenance</li>
                  <li className="hover:text-white transition cursor-pointer">Shipping & Returns</li>
                  <li className="hover:text-white transition cursor-pointer">Legal Notice</li>
               </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-[9px] text-gray-600 uppercase font-bold tracking-[0.4em] gap-8">
             <span>© 2024 AURAX HOROLOGY GROUP. ALL RIGHTS RESERVED.</span>
             <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                <span className="hover:text-white transition cursor-pointer">PRIVACY POLICY</span>
                <span className="hover:text-white transition cursor-pointer">TERMS OF SALE</span>
                <span className="hover:text-white transition cursor-pointer">COOKIE PREFERENCES</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
