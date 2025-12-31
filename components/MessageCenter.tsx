
import React, { useState } from 'react';
import { ChatMessage } from '../types';

interface MessageProps {
  store: any;
}

export const MessageCenter: React.FC<MessageProps> = ({ store }) => {
  const [activeTab, setActiveTab] = useState<'SELLER' | 'OFFICIAL'>('SELLER');
  const [text, setText] = useState('');
  
  const userMessages = store.chats.filter((c: ChatMessage) => c.userId === store.currentUser?.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: store.currentUser.id,
      sender: 'USER',
      text,
      timestamp: Date.now(),
    };

    store.sendMessage(msg);
    setText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white shadow-sm rounded-sm flex h-[600px] overflow-hidden">
        {/* Contacts Sidebar */}
        <div className="w-64 border-r flex flex-col">
          <div className="p-4 border-b bg-[#f5f5f5]">
            <h3 className="font-bold text-sm">Messages</h3>
          </div>
          <div className="flex border-b text-xs">
            <button 
              onClick={() => setActiveTab('SELLER')}
              className={`flex-1 py-3 text-center border-b-2 transition ${activeTab === 'SELLER' ? 'border-[#f85606] text-[#f85606] font-bold' : 'border-transparent text-gray-500'}`}
            >
              Seller Chats
            </button>
            <button 
              onClick={() => setActiveTab('OFFICIAL')}
              className={`flex-1 py-3 text-center border-b-2 transition ${activeTab === 'OFFICIAL' ? 'border-[#f85606] text-[#f85606] font-bold' : 'border-transparent text-gray-500'}`}
            >
              Notifications
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
             {activeTab === 'SELLER' && (
               <div className="p-4 flex items-center gap-3 bg-orange-50 border-l-4 border-l-[#f85606]">
                 <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-[#f85606] font-bold">A</div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">Aurax Official Store</p>
                    <p className="text-xs text-gray-500 truncate">{userMessages[userMessages.length-1]?.text || 'Start chatting...'}</p>
                 </div>
               </div>
             )}
             {activeTab === 'OFFICIAL' && (
               <div className="p-8 text-center text-gray-400 text-xs">
                 <p>No official notifications.</p>
               </div>
             )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-[#eff0f5]">
           <div className="bg-white p-4 border-b flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Aurax Official Store</span>
                <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold uppercase">Online</span>
             </div>
             <button className="text-[#f85606] text-xs font-bold hover:underline">View Store</button>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex justify-center">
                 <span className="text-[10px] bg-gray-200 text-gray-500 px-3 py-1 rounded-full uppercase font-bold tracking-tighter">Encrypted by Aurax</span>
              </div>
              
              {userMessages.length === 0 && (
                <div className="bg-white p-4 rounded text-center text-sm text-gray-500 shadow-sm">
                  Welcome to Aurax Support! Ask us about your orders or watch specifications.
                </div>
              )}

              {userMessages.map((m: ChatMessage) => (
                <div key={m.id} className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 text-sm shadow-sm ${
                    m.sender === 'USER' 
                    ? 'bg-[#f85606] text-white rounded-l-lg rounded-br-lg' 
                    : 'bg-white text-[#212121] rounded-r-lg rounded-bl-lg'
                  }`}>
                    {m.text}
                    <div className={`text-[9px] mt-1 text-right opacity-60`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
           </div>

           <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-3">
              <button type="button" className="text-gray-400 hover:text-[#f85606]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              </button>
              <input 
                className="flex-1 bg-[#f5f5f5] px-4 py-2 rounded-sm text-sm outline-none focus:bg-white focus:ring-1 focus:ring-[#f85606] transition"
                placeholder="Write your message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit" className="bg-[#f85606] text-white px-6 rounded-sm font-bold text-sm hover:bg-[#d34805]">SEND</button>
           </form>
        </div>
      </div>
    </div>
  );
};
