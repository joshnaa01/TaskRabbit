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
                console.error("Chat sync failed");
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

        <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] gap-4 bg-white rounded-3xl border border-slate-100">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Syncing channel...</p>
        </div>

    return (
        <div className="h-[calc(100vh-140px)] bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex ring-1 ring-slate-100/50 transition-all animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* Tactical Sidebar */}
            <div className="w-72 border-r border-slate-50 flex flex-col bg-slate-50/40 relative z-20">
                <div className="p-4 border-b border-slate-50 bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                           <h2 className="text-sm font-black text-slate-950 tracking-tighter leading-none uppercase italic">Comm_Stream</h2>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Sync_Encrypted</p>
                        </div>
                        {user?.role === 'admin' && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => {
                                        if (!showUserSearch) fetchAvailableUsers();
                                        setShowUserSearch(!showUserSearch);
                                    }}
                                    className={`w-7 h-7 rounded flex items-center justify-center transition-all shadow-sm ${showUserSearch ? 'bg-slate-950 text-white' : 'bg-white border border-slate-100 text-slate-400 hover:text-blue-600'}`}
                                >
                                    <UserIcon className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => { fetchAvailableUsers(); setShowGroupModal(true); }}
                                    className="w-7 h-7 bg-slate-200 text-slate-500 rounded hover:bg-slate-950 hover:text-white transition-all flex items-center justify-center"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="relative group/search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300" />
                        <input
                            type="text"
                            placeholder="QUERY_CONV..."
                            className="w-full bg-slate-50 border border-transparent rounded py-1.5 pl-8 pr-3 text-[8px] font-black uppercase tracking-widest focus:bg-white focus:border-blue-600/20 transition-all outline-none placeholder:text-slate-200"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {conversations.length > 0 ? conversations.map((conv) => {
                        const other = getOtherParticipant(conv);
                        const isSelected = selectedConv?._id === conv._id;
                        return (
                            <button
                                key={conv._id}
                                onClick={() => setSelectedConv(conv)}
                                className={`w-full flex items-center gap-2.5 p-2.5 rounded transition-all relative group/conv ${isSelected ? 'bg-white shadow-sm ring-1 ring-slate-100/50' : 'hover:bg-white/40'}`}
                            >
                                {isSelected && (
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-full"></div>
                                )}
                                <div className="relative shrink-0">
                                    <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-[8px] font-black overflow-hidden ring-1 ring-white shadow-sm ${conv.isGroup ? 'bg-indigo-600' : 'bg-slate-950'}`}>
                                        {conv.isGroup ? (
                                            <Users className="w-3.5 h-3.5" />
                                        ) : other?.profilePicture ? (
                                            <img src={other.profilePicture} alt={other.name} className="w-full h-full object-cover" />
                                        ) : (
                                            getNameInitials(other?.name)
                                        )}
                                    </div>
                                    {!conv.isGroup && <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>}
                                </div>
                                <div className="min-w-0 text-left">
                                    <p className={`font-black tracking-tight text-[10px] truncate uppercase ${isSelected ? 'text-blue-600' : 'text-slate-950'}`}>{other?.name}</p>
                                    <p className="text-[7px] font-black text-slate-400 truncate mt-0.5 line-clamp-1 italic uppercase opacity-60">{conv.lastMessage || 'Channel Established'}</p>
                                </div>
                            </button>
                        );
                    }) : (
                        <div className="py-20 text-center opacity-10">
                            <MessageSquare className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Empty Register</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Intelligence Chat Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {selectedConv ? (
                    <>
                        {/* Header Area */}
                        <div className="px-6 py-3 border-b border-slate-50 flex items-center justify-between bg-white relative z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-[8px] font-black overflow-hidden shadow-sm ${selectedConv.isGroup ? 'bg-indigo-600' : 'bg-slate-950'}`}>
                                    {selectedConv.isGroup ? <Users className="w-4 h-4" /> : (
                                        getOtherParticipant(selectedConv)?.profilePicture ? <img src={getOtherParticipant(selectedConv)?.profilePicture} className="w-full h-full object-cover" /> : getNameInitials(getOtherParticipant(selectedConv)?.name)
                                    )}
                                </div>
                                <div>
                                    <p className="font-black text-slate-950 text-xs tracking-tight uppercase italic leading-none">{getOtherParticipant(selectedConv)?.name}</p>
                                    <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest mt-1">Live_Node</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-slate-950 text-white rounded text-[6px] font-black uppercase tracking-[0.2em] border border-slate-900">
                                    SECURE_TUNNEL
                                </span>
                                <button className="p-1.5 text-slate-300 hover:text-slate-950 transition-all">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Tactical Message Stream */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/20 custom-scrollbar">
                            {messages.map((msg, i) => {
                                const isMe = msg.senderId === (user?.id || user?._id);
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-${isMe ? 'right' : 'left'}-1`}>
                                        <div className={`max-w-[90%] sm:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-3 py-2 rounded text-[11px] font-bold leading-tight shadow-sm break-words ${isMe 
                                                ? 'bg-slate-950 text-white rounded-tr-none' 
                                                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                                                {msg.type === 'voice' ? (
                                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                                        <div className="flex items-center gap-2 opacity-60">
                                                           <Mic className="w-3 h-3" />
                                                           <span className="text-[7px] font-black uppercase tracking-widest italic">Enc_Voice_Payload</span>
                                                        </div>
                                                        <audio src={msg.fileUrl} controls className={`h-7 w-full ${isMe ? 'brightness-[10] invert contrast-200' : 'brightness-95 hover:brightness-100'} transition-all`} />
                                                    </div>
                                                ) : msg.content}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5 px-1 opacity-40">
                                                {!isMe && (
                                                   <span className="text-[6px] font-black text-slate-900 uppercase tracking-widest">{msg.senderName?.split(' ')[0]}</span>
                                                )}
                                                <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        {/* Signal Input Area */}
                        <div className="p-4 border-t border-slate-50 bg-white">
                             {isRecording ? (
                                <div className="flex items-center justify-between bg-red-50/50 border border-dashed border-red-200 rounded p-3 pl-6 animate-in zoom-in-95 duration-500">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-sm"></div>
                                        <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.2em]">Capture_Audio: {formatTime(recordingTime)}</span>
                                    </div>
                                    <button onClick={stopRecording} className="w-10 h-10 bg-red-600 text-white rounded flex items-center justify-center shadow-lg active:scale-95 transition-all">
                                        <Square className="w-4 h-4 fill-white" />
                                    </button>
                                </div>
                             ) : (
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-50 p-1 rounded border border-slate-100/50 focus-within:bg-white focus-within:border-slate-300 transition-all">
                                    <button onClick={startRecording} type="button" className="w-9 h-9 bg-white border border-slate-100 text-slate-300 rounded hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center active:scale-95 shadow-sm">
                                        <Mic className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Signal_Input..."
                                        className="flex-1 bg-transparent border-none py-2 px-2 text-[11px] font-black uppercase text-slate-800 outline-none placeholder:text-slate-200 italic"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button type="submit" disabled={!newMessage.trim()} className="w-9 h-9 bg-slate-950 text-white rounded hover:bg-blue-600 disabled:opacity-30 shadow-md transition-all flex items-center justify-center active:scale-95">
                                       <Send className="w-3.5 h-3.5" />
                                    </button>
                                </form>
                             )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden bg-slate-50/30">
                        <div className="relative z-10 opacity-30">
                            <div className="w-16 h-16 bg-white rounded border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <MessageSquare className="w-6 h-6 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">Terminal Standby</h3>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] max-w-[200px] mx-auto mt-4 italic">
                                Initialize communication channel from registry
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tactical Group Configuration */}
            {showGroupModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 animate-in fade-in duration-500">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowGroupModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-500 border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">Deploy Group</h3>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.35em] mt-2 italic">Assemble Multi-Node Stream</p>
                            </div>
                            <button onClick={() => setShowGroupModal(false)} className="p-2 rounded hover:bg-slate-50 text-slate-300 hover:text-slate-950 transition-all">
                               <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                            <div className="space-y-1.5">
                               <label className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 italic">Cluster_Identifier</label>
                               <input
                                   type="text"
                                   placeholder="GROUP_ID..."
                                   className="w-full bg-slate-50 border border-slate-100 rounded py-3 px-6 text-[10px] font-black text-slate-950 outline-none focus:bg-white focus:border-slate-900 transition-all uppercase placeholder:text-slate-200 italic"
                                   value={groupName}
                                   onChange={(e) => setGroupName(e.target.value)}
                               />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 italic">Node_Selection</label>
                                <div className="relative group/usersearch">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                                    <input
                                        type="text"
                                        placeholder="SEARCH_DB..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded py-2.5 pl-10 pr-4 text-[9px] font-black text-slate-600 focus:bg-white outline-none transition-all uppercase italic"
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto">
                                    {availableUsers.filter(p => !userSearchTerm || p.name.toLowerCase().includes(userSearchTerm.toLowerCase())).map((p) => (
                                        <button
                                            key={p._id}
                                            onClick={() => toggleUserSelection(p._id)}
                                            className={`group/item w-full flex items-center justify-between p-3 rounded transition-all border ${selectedUsers.includes(p._id) ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white border-slate-50 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center overflow-hidden shadow-sm ${selectedUsers.includes(p._id) ? 'bg-white/20' : 'bg-slate-100'}`}>
                                                    {p.profilePicture ? <img src={p.profilePicture} className="w-full h-full object-cover" /> : getNameInitials(p.name)}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">{p.name}</p>
                                                    <p className={`text-[7px] font-black uppercase tracking-widest ${selectedUsers.includes(p._id) ? 'text-slate-400' : 'text-slate-400 italic'}`}>{p.role}</p>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedUsers.includes(p._id) ? 'bg-white border-white' : 'bg-white border-slate-200'}`}>
                                                {selectedUsers.includes(p._id) && <CheckCircle className="w-3.5 h-3.5 text-slate-950" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 mt-4">
                            <button
                                onClick={handleCreateGroup}
                                disabled={creatingGroup || selectedUsers.length === 0}
                                className="w-full py-4 bg-slate-950 text-white rounded font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-blue-700 transition-all disabled:opacity-30"
                            >
                                {creatingGroup ? 'COMMITTING...' : 'INITIALIZE_STREAM'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
