import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi there! I'm your AI assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Hide for admins and providers — placed AFTER all hooks
  if (user && user.role !== 'client') return null;

  const predefinedQuestions = [
    "How it works?",
    "Payment methods?",
    "Service guarantee?"
  ];

  const handleSend = async (messageText) => {
    if (!messageText.trim()) return;

    const userMsg = { text: messageText, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const res = await axios.post(`${apiUrl}/api/chatbot`, { message: messageText });

      setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
    } catch (error) {
      console.error("Chatbot response error:", error);
      setMessages(prev => [...prev, { text: "Sorry, I couldn't reach the server right now. Please try again later.", isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg focus:outline-none hover:bg-blue-700 transition-all z-[9999] ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl flex flex-col z-[9999] overflow-hidden border border-slate-200 transition-all" style={{ height: '540px' }}>
          {/* Header */}
          <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={22} className="opacity-90" />
              <div>
                <h3 className="font-semibold text-base leading-tight">AI Support</h3>
                <p className="text-[11px] text-blue-200">Usually replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1.5 rounded-full transition-colors focus:outline-none">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
            <p className="text-center text-xs text-slate-400 my-2">Today</p>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] p-3.5 text-[14px] leading-relaxed relative ${msg.isBot ? 'bg-white text-slate-700 border border-slate-100 rounded-3xl rounded-tl-sm shadow-sm' : 'bg-blue-600 text-white rounded-3xl rounded-tr-sm shadow-sm'}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-4 rounded-3xl bg-white border border-slate-100 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Predefined Questions */}
          <div className="px-4 py-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar">
            {predefinedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[13px] bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full transition-colors font-medium border border-slate-200 flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3.5 bg-white border-t border-slate-200/60 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-100/80 text-[14px] text-slate-700 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white outline-none border border-transparent focus:border-blue-600/30 transition-all placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center disabled:hover:bg-blue-600 transition-colors shrink-0"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </>
  );
};

export default Chatbot;
