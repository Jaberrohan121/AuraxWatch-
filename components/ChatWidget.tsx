
import React, { useState } from 'react';
import { ChatMessage } from '../types';

interface ChatProps {
  store: any;
}

export const ChatWidget: React.FC<ChatProps> = ({ store }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');

  const userMessages = store.chats.filter((c: ChatMessage) => c.userId === store.currentUser?.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: store.currentUser.id,
      sender: store.currentUser.role === 'ADMIN' ? 'ADMIN' : 'USER',
      text,
      timestamp: Date.now(),
    };

    store.sendMessage(msg);
    setText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition flex items-center gap-3 font-bold"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          Support Chat
        </button>
      ) : (
        <div className="bg-white w-80 h-[450px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border">
          <div className="bg-black text-white p-4 flex justify-between items-center">
            <span className="font-bold">Aurax Support</span>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-400">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
             {userMessages.length === 0 && (
               <p className="text-center text-xs text-gray-400 mt-10 italic">How can we help you today?</p>
             )}
             {userMessages.map((m: ChatMessage) => (
               <div key={m.id} className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === 'USER' ? 'bg-black text-white rounded-tr-none' : 'bg-white border text-gray-900 rounded-tl-none'}`}>
                    {m.text}
                  </div>
               </div>
             ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t bg-white flex gap-2">
            <input
              type="text"
              className="flex-1 text-sm outline-none px-2"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="bg-black text-white p-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
