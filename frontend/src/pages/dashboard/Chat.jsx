import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { io } from 'socket.io-client';
import { getNameInitials } from '../../utils/getNameInitials';
import { 
  Send, 
  MessageSquare, 
  User as UserIcon, 
  Search, 
  MoreVertical, 
  Paperclip,
  Smile,
  ShieldCheck,
  MapPin,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

import { useLocation } from 'react-router-dom';

const Chat = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socket = useRef(null);
    const scrollRef = useRef(null);

    // Initial load and URL parameter handling
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await api.get('/chat/conversations');
                let allConvs = res.data.data || [];
                setConversations(allConvs);
                
                // Handle '?to=userId' in URL
                const params = new URLSearchParams(location.search);
                const toUserId = params.get('to');
                const conversationId = params.get('conversationId');
                
                if (conversationId) {
                    const existing = allConvs.find(c => c._id === conversationId);
                    if (existing) {
                        setSelectedConv(existing);
                    } else {
                        // If not in the list, maybe it exists but wasn't fetched?
                        // Or just let it be. Usually it should be in allConvs if user is a participant.
                    }
                } else if (toUserId) {
                    // Try to find if it already exists
                    const existing = allConvs.find(c => c.participants.some(p => p._id === toUserId));
                    if (existing) {
                        setSelectedConv(existing);
                    } else {
                        // Create it if not
                        const newSession = await api.get(`/chat/conversations/${toUserId}`);
                        const sessionData = newSession.data.data;
                        setConversations(prev => [sessionData, ...prev]);
                        setSelectedConv(sessionData);
                    }
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Failed to load conversations");
                setLoading(false);
            }
        };
        fetchConversations();
    }, [location.search]);

    // Socket.io Setup
    useEffect(() => {
        socket.current = io(BACKEND_URL);

        // General message listener
        socket.current.on('newMessage', (msg) => {
            // Update the message list if it's for the currently open conversation
            // We use the functional state update to ensure we have the latest values
            setMessages(prev => {
                // Find if the message already exists to prevent duplicates
                if (prev.some(m => m._id === msg._id)) return prev;
                // Only add if it's for the selected conversation (we'll check this in the effect below)
                return prev;
            });

            // Update last message in the sidebar regardless of which is open
            setConversations(prev => prev.map(c => 
                c._id === msg.conversationId 
                    ? { ...c, lastMessage: msg.content, updatedAt: new Date().toISOString() } 
                    : c
            ));
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    // Room and Message Management
    useEffect(() => {
        if (selectedConv) {
            // Leave previous rooms would be good, but server-side can handle it too
            socket.current.emit('joinChat', selectedConv._id);
            fetchMessages(selectedConv._id);

            // Add a specific listener for this conversation's messages
            const handleCurrentMessage = (msg) => {
                if (msg.conversationId === selectedConv._id) {
                    setMessages(prev => {
                        if (prev.some(m => m._id === msg._id)) return prev;
                        return [...prev, msg];
                    });
                }
            };

            socket.current.on('newMessage', handleCurrentMessage);

            return () => {
                socket.current.off('newMessage', handleCurrentMessage);
            };
        }
    }, [selectedConv]);

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async (convId) => {
        try {
            const res = await api.get(`/chat/messages/${convId}`);
            setMessages(res.data.data || []);
        } catch (err) {
            toast.error("Failed to sync message history");
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv) return;

        const messageData = {
            conversationId: selectedConv._id,
            senderId: user.id || user._id,
            content: newMessage,
            senderName: user.name
        };

        socket.current.emit('sendMessage', messageData);
        setNewMessage('');
        // Node backend saves to DB and emits back, so we'll get it via newMessage event
    };

    const getOtherParticipant = (conv) => {
        return conv.participants.find(p => p._id !== (user?.id || user?._id));
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] gap-6 bg-white rounded-[48px]">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entering Encrypted Channel...</p>
        </div>
    );

    return (
        <div className="h-[calc(100vh-160px)] bg-white rounded-[48px] shadow-2xl shadow-blue-900/5 border border-slate-50 overflow-hidden flex ring-1 ring-slate-100 transition-all">
            
            {/* Sidebar: Conversations List */}
            <div className="w-96 border-r border-slate-100 flex flex-col bg-slate-50/50">
                <div className="p-8 border-b border-slate-100 bg-white">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Internal Comms</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Booking Context Active</p>
                    
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search participants..." 
                          className="w-full bg-slate-100 border-none rounded-2xl py-3.5 pl-12 text-xs font-bold focus:ring-2 focus:ring-blue-600/10 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {conversations.length > 0 ? conversations.map((conv) => {
                        const other = getOtherParticipant(conv);
                        const isSelected = selectedConv?._id === conv._id;
                        return (
                            <button 
                                key={conv._id}
                                onClick={() => setSelectedConv(conv)}
                                className={`w-full flex items-center gap-4 p-5 rounded-[28px] transition-all group ${isSelected ? 'bg-white shadow-xl shadow-blue-900/5 ring-1 ring-slate-100' : 'hover:bg-white/50'}`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-black overflow-hidden ring-2 ring-white">
                                        {other?.profilePicture ? (
                                            <img src={other.profilePicture} alt={other.name} className="w-full h-full object-cover" />
                                        ) : (
                                            getNameInitials(other?.name)
                                        )}
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                                </div>
                                <div className="min-w-0 text-left">
                                    <p className={`font-black tracking-tight text-sm truncate ${isSelected ? 'text-blue-600' : 'text-slate-900'}`}>{other?.name}</p>
                                    <p className="text-[11px] font-bold text-slate-400 truncate mt-0.5 line-clamp-1">{conv.lastMessage || 'Start a secure session'}</p>
                                </div>
                            </button>
                        );
                    }) : (
                        <div className="p-10 text-center opacity-30">
                            <MessageSquare className="w-10 h-10 mx-auto mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Active Channels</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Window */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedConv ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-[10px] font-black overflow-hidden">
                                     {getOtherParticipant(selectedConv)?.profilePicture ? (
                                         <img src={getOtherParticipant(selectedConv)?.profilePicture} className="w-full h-full object-cover" />
                                     ) : (
                                         getNameInitials(getOtherParticipant(selectedConv)?.name)
                                     )}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm tracking-tight">{getOtherParticipant(selectedConv)?.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Direct Channel • Active</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                    <ShieldCheck className="w-3 h-3" /> Secure Transmission
                                </span>
                                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20">
                            {messages.map((msg, i) => {
                                const isMe = msg.senderId === (user?.id || user?._id);
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-6 py-4 rounded-[28px] text-sm font-medium leading-relaxed shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                                {msg.content}
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 border-t border-slate-50">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 rounded-[32px] p-2 pr-4 shadow-inner ring-1 ring-slate-100 transition-all focus-within:ring-blue-600/20 focus-within:bg-white">
                                <div className="flex items-center pl-4">
                                    <button type="button" className="p-3 text-slate-400 hover:text-blue-600 transition-all"><Paperclip className="w-5 h-5" /></button>
                                    <button type="button" className="p-3 text-slate-400 hover:text-blue-600 transition-all"><Smile className="w-5 h-5" /></button>
                                </div>
                                <input 
                                  type="text" 
                                  placeholder="Broadcast message to participant..." 
                                  className="flex-1 bg-transparent border-none py-4 text-sm font-bold outline-none focus:ring-0 placeholder:text-slate-400"
                                  value={newMessage}
                                  onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all">
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-slate-50/30">
                        <div className="w-32 h-32 bg-white rounded-[48px] shadow-2xl flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                             <MessageSquare className="w-12 h-12" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Command Center</h3>
                        <p className="text-slate-400 font-bold max-w-sm leading-relaxed uppercase tracking-widest text-[10px]">Select a secure session from the sidebar to bridge communications</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
