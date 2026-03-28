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
    Clock,
    Users,
    CheckCircle,
    Plus,
    X,
    Mic,
    Square,
    Play,
    Pause,
    Loader2
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

    // Admin Group Creation State
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState('');

    // Voice Message State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const recordingTimerRef = useRef(null);

    // Direct Message Search State
    const [showUserSearch, setShowUserSearch] = useState(false);
    const [dmSearchQuery, setDmSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

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

    // Handle pre-selected IDs from navigation state (AdminUsers.jsx)
    useEffect(() => {
        if (location.state?.preSelectedIds && user?.role === 'admin') {
            const preIds = location.state.preSelectedIds;
            fetchAvailableUsers();
            setSelectedUsers(preIds);
            setShowGroupModal(true);
            // Clear location state to prevent modal reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, user]);

    // Handle DM Search
    useEffect(() => {
        const searchUsers = async () => {
            if (dmSearchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            try {
                // Reuse admin/users for search if admin, or maybe a public search if implemented
                // For now, let's assume admin for simplicity as requested
                const res = await api.get('/admin/users');
                const filtered = (res.data.data || []).filter(u =>
                    u.name.toLowerCase().includes(dmSearchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(dmSearchQuery.toLowerCase())
                );
                setSearchResults(filtered);
            } catch (err) {
                console.error("Search failed");
            }
        };
        const timer = setTimeout(searchUsers, 300);
        return () => clearTimeout(timer);
    }, [dmSearchQuery]);

    const handleStartDM = async (targetUser) => {
        try {
            const res = await api.get(`/chat/conversations/${targetUser._id}`);
            const sessionData = res.data.data;
            if (!conversations.some(c => c._id === sessionData._id)) {
                setConversations(prev => [sessionData, ...prev]);
            }
            setSelectedConv(sessionData);
            setShowUserSearch(false);
            setDmSearchQuery('');
        } catch (err) {
            toast.error("Failed to initiate chat");
        }
    };

    // Socket.io Setup
    useEffect(() => {
        socket.current = io(BACKEND_URL);

        // General message listener
        socket.current.on('newMessage', (msg) => {
            setMessages(prev => {
                // Find if the message already exists to prevent duplicates
                if (prev.some(m => m._id === msg._id)) return prev;
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

            // If we're an admin and just selected a conversation, make sure it's in the list
            if (user?.role === 'admin' && !conversations.some(c => c._id === selectedConv._id)) {
                setConversations(prev => [selectedConv, ...prev]);
            }

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

    // Voice Message Logic
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/m4a' });
                await sendVoiceMessage(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            toast.error("Microphone access denied or not available");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            clearInterval(recordingTimerRef.current);
        }
    };

    const sendVoiceMessage = async (blob) => {
        try {
            const formData = new FormData();
            formData.append('file', blob, `voice_${Date.now()}.m4a`);

            const uploadRes = await api.post('/upload', formData);
            const voiceUrl = uploadRes.data.url;

            socket.current.emit('sendMessage', {
                conversationId: selectedConv._id,
                senderId: user.id || user._id,
                senderName: user.name,
                content: 'Voice message',
                fileUrl: voiceUrl,
                type: 'voice'
            });
        } catch (err) {
            toast.error("Failed to upload voice message");
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        if (conv.isGroup) return { name: conv.groupName || 'Group Chat', isGroup: true };
        return conv.participants?.find(p => p._id !== (user?.id || user?._id)) || { name: 'Chat Participant' };
    };

    const fetchAvailableUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setAvailableUsers(res.data.data || []);
        } catch (err) {
            toast.error("Failed to fetch user list");
        }
    };

    const toggleUserSelection = (id) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return toast.error("Please enter a group name");
        if (selectedUsers.length === 0) return toast.error("Select at least one participant");

        setCreatingGroup(true);
        try {
            const res = await api.post('/chat/groups', {
                participantIds: selectedUsers,
                groupName: groupName.trim()
            });
            const newConv = res.data.data;
            setConversations(prev => [newConv, ...prev]);
            setSelectedConv(newConv);
            setShowGroupModal(false);
            setGroupName('');
            setSelectedUsers([]);
            toast.success("Group created successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Group creation failed");
        } finally {
            setCreatingGroup(false);
        }
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
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Internal Comms</h2>
                        {user?.role === 'admin' && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        if (!showUserSearch) fetchAvailableUsers();
                                        setShowUserSearch(!showUserSearch);
                                    }}
                                    className={`p-2 rounded-xl transition-all shadow-sm ${showUserSearch ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                    title="New Direct Message"
                                >
                                    <UserIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { fetchAvailableUsers(); setShowGroupModal(true); }}
                                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    title="New Group Broadcast"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Booking Context Active</p>

                    {showUserSearch && (
                        <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Type name or email..."
                                    className="w-full bg-blue-50 border-blue-100 rounded-2xl py-3.5 pl-12 text-xs font-bold focus:ring-2 focus:ring-blue-600/10 placeholder:text-slate-400"
                                    value={dmSearchQuery}
                                    onChange={(e) => setDmSearchQuery(e.target.value)}
                                />
                            </div>
                            {searchResults.length > 0 ? (
                                <div className="mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                                    {searchResults.map(u => (
                                        <button
                                            key={u._id}
                                            onClick={() => handleStartDM(u)}
                                            className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 text-left transition-all border-b border-slate-50 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 overflow-hidden">
                                                {u.profilePicture ? <img src={u.profilePicture} className="w-full h-full object-cover" /> : getNameInitials(u.name)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900">{u.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : availableUsers.length > 0 && !dmSearchQuery ? (
                                <div className="mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                                    <p className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Suggested Contacts (Providers First)</p>
                                    {[...availableUsers]
                                        .sort((a, b) => (a.role === 'provider' ? -1 : 1))
                                        .slice(0, 20)
                                        .map(u => (
                                            <button
                                                key={u._id}
                                                onClick={() => handleStartDM(u)}
                                                className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 text-left transition-all border-b border-slate-50 last:border-0"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 overflow-hidden">
                                                    {u.profilePicture ? <img src={u.profilePicture} className="w-full h-full object-cover" /> : getNameInitials(u.name)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">{u.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{u.role}</p>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            ) : null}
                        </div>
                    )}

                    {!showUserSearch && (
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full bg-slate-100 border-none rounded-2xl py-3.5 pl-12 text-xs font-bold focus:ring-2 focus:ring-blue-600/10 placeholder:text-slate-400"
                            />
                        </div>
                    )}
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
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-[11px] font-black overflow-hidden ring-2 ring-white ${conv.isGroup ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                                        {conv.isGroup ? (
                                            <Users className="w-5 h-5" />
                                        ) : other?.profilePicture ? (
                                            <img src={other.profilePicture} alt={other.name} className="w-full h-full object-cover" />
                                        ) : (
                                            getNameInitials(other?.name)
                                        )}
                                    </div>
                                    {!conv.isGroup && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white"></span>}
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
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black overflow-hidden ${selectedConv.isGroup ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                                    {selectedConv.isGroup ? (
                                        <Users className="w-4 h-4" />
                                    ) : getOtherParticipant(selectedConv)?.profilePicture ? (
                                        <img src={getOtherParticipant(selectedConv)?.profilePicture} className="w-full h-full object-cover" />
                                    ) : (
                                        getNameInitials(getOtherParticipant(selectedConv)?.name)
                                    )}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm tracking-tight">{getOtherParticipant(selectedConv)?.name}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${selectedConv.isGroup ? 'bg-indigo-400' : 'bg-emerald-500'}`}></span>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {selectedConv.isGroup ? `${selectedConv.participants?.length} Participants • Active` : 'Direct Channel • Active'}
                                        </p>
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
                                            {msg.type === 'voice' ? (
                                                <div className={`p-4 rounded-[28px] ${isMe ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-900 border border-slate-100 shadow-sm'}`}>
                                                    <div className="flex items-center gap-3 min-w-[200px]">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                                                            <Mic className="w-3 h-3" />
                                                        </div>
                                                        <audio 
                                                            src={msg.fileUrl} 
                                                            controls 
                                                            className={`h-6 w-full max-w-[180px] ${isMe ? 'brightness-200 contrast-125' : ''}`}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`px-6 py-4 rounded-[28px] text-sm font-medium leading-relaxed shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                                    {msg.content}
                                                </div>
                                            )}
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        {/* Message Input - Enforce Contextual State */}
                        {selectedConv.status === 'closed' ? (
                            <div className="p-10 bg-slate-50/50 border-t border-slate-100 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom duration-500">
                                <div className="w-14 h-14 bg-white rounded-[24px] flex items-center justify-center shadow-xl border border-slate-100 mb-6 group hover:rotate-6 transition-transform">
                                    <ShieldCheck className="w-6 h-6 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-2">Secure Link Suspended</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest max-w-[320px] leading-relaxed">This operational channel has been transitioned to read-only following verified fulfillment and payout completion.</p>
                            </div>
                        ) : (
                            <div className="p-8 border-t border-slate-50 bg-white">
                                {isRecording ? (
                                    <div className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-[32px] p-2 pr-4 animate-in fade-in slide-in-from-left duration-300">
                                        <div className="flex items-center gap-4 pl-6">
                                            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-500/50" />
                                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Analog Signal Active • {formatTime(recordingTime)}</span>
                                        </div>
                                        <button 
                                            onClick={stopRecording}
                                            className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 active:scale-95"
                                        >
                                            <Square className="w-4 h-4 fill-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                                        <button 
                                            type="button"
                                            onClick={startRecording}
                                            className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-600 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group active:scale-95"
                                            title="Record Intelligence"
                                        >
                                            <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </button>
                                        <div className="flex-1 flex items-center gap-4 bg-slate-50 rounded-[32px] p-2 pr-4 shadow-inner ring-1 ring-slate-100 transition-all focus-within:ring-blue-600/20 focus-within:bg-white">
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
                                            <button 
                                                type="submit" 
                                                disabled={!newMessage.trim()}
                                                className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
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

            {/* Admin Group Creation Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowGroupModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 pt-10 overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Create Broadcast Group</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Select participants for multi-channel comms</p>
                            </div>
                            <button onClick={() => setShowGroupModal(false)} className="p-2 text-slate-300 hover:text-slate-900"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Group Identification</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Kathmandu Plumbing Squad"
                                    className="w-full bg-slate-50 border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-blue-600/10 placeholder:text-slate-300 transition-all border outline-none"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search people..."
                                        className="w-full bg-slate-50 border-slate-100 rounded-2xl py-3 pl-12 text-[10px] font-bold focus:ring-2 focus:ring-blue-600/10"
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Select Participants ({selectedUsers.length})</label>
                                    <button
                                        onClick={() => setSelectedUsers([])}
                                        className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                    >
                                        Clear Selection
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {availableUsers
                                        .filter(p =>
                                            p.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                            p.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                                            p.role.toLowerCase().includes(userSearchTerm.toLowerCase())
                                        )
                                        .map((p) => (
                                            <button
                                                key={p._id}
                                                onClick={() => toggleUserSelection(p._id)}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedUsers.includes(p._id) ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' : 'bg-slate-50/50 border-slate-50 hover:bg-slate-50'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center overflow-hidden">
                                                        {p.profilePicture ? <img src={p.profilePicture} className="w-full h-full object-cover" /> : <p className="text-[10px] font-black text-slate-400">{getNameInitials(p.name)}</p>}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-black text-slate-900">{p.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.role}</p>
                                                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                            <p className="text-[9px] font-bold text-slate-400 truncate max-w-[150px]">{p.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {selectedUsers.includes(p._id) && <CheckCircle className="w-5 h-5 text-blue-600 fill-blue-50" />}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 mt-4 border-t border-slate-50">
                            <button
                                onClick={handleCreateGroup}
                                disabled={creatingGroup || selectedUsers.length === 0}
                                className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-slate-900 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                {creatingGroup ? 'Establishing Channel...' : 'Initialize Group Comms'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
