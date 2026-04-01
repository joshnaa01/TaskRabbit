import React from 'react';
import { X, Bell, CheckCircle2, MessageSquare, Info, Zap, Check, CreditCard, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const NotificationModal = ({ isOpen, onClose, notifications, onMarkRead, onRefresh }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    if (!isOpen) return null;

    const rolePrefix = `/${user?.role || 'client'}`;

    const handleSingleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/mark-read`);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
        }
    };
    
    const handleNotificationClick = (n) => {
        // Mark as read when clicking
        if (!n.isRead) {
            handleSingleMarkRead(n._id);
        }
        
        // Modal close
        onClose();

        // Specific navigation logic using role-prefixed routes
        if (n.type === 'message' && n.conversationId) {
            navigate(`${rolePrefix}/messages?conversationId=${n.conversationId}`);
        } else if (n.type === 'message' && n.sender?._id) {
            navigate(`${rolePrefix}/messages?to=${n.sender._id}`);
        } else if (n.type === 'booking_completed' && n.bookingId) {
            navigate(`/client/checkout/${n.bookingId}`);
        } else if (n.bookingId) {
            navigate(`${rolePrefix}/bookings`);
        } else {
            navigate(`${rolePrefix}/dashboard`);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'booking_accepted': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'booking_request': return <Zap className="w-4 h-4 text-blue-500" />;
            case 'booking_completed': return <CreditCard className="w-4 h-4 text-indigo-500" />;
            case 'work_submitted': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'dispute': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-slate-400" />;
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-24 px-8 overflow-hidden">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>

            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-top-8 duration-500 relative flex flex-col max-h-[70vh]">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h2>
                            {unreadCount > 0 && (
                                <span className="px-2.5 py-1 bg-blue-600 text-white text-[8px] font-black rounded-full">{unreadCount} new</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasks & messages</span>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onMarkRead(); }}
                                    className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline ml-2"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {notifications.length > 0 ? (
                        <div className="space-y-2">
                            {notifications.map((n) => (
                                <div 
                                    key={n._id} 
                                    onClick={() => handleNotificationClick(n)}
                                    className={`group p-5 rounded-[28px] border transition-all relative cursor-pointer active:scale-[0.98] ${n.isRead ? 'bg-white border-slate-50 hover:bg-slate-50/50' : 'bg-blue-50/30 border-blue-100/50 hover:bg-white hover:shadow-lg hover:shadow-blue-500/5'}`}
                                >
                                    {!n.isRead && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSingleMarkRead(n._id);
                                            }}
                                            className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-lg shadow-blue-500/5 border border-blue-100/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500 hover:text-white"
                                            title="Mark as read"
                                        >
                                            <Check className="w-3 h-3" />
                                        </button>
                                    )}

                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${n.isRead ? 'bg-slate-50 border border-slate-100' : 'bg-white border border-blue-100'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm truncate pr-6 ${n.isRead ? 'font-bold text-slate-600' : 'font-extrabold text-slate-900'}`}>{n.title}</h4>
                                                {!n.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shrink-0 mt-1.5"></span>}
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-2">{n.message}</p>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">{timeAgo(n.createdAt)}</p>
                                            
                                            {/* Quick Actions */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {n.type === 'booking_completed' && n.bookingId && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/client/checkout/${n.bookingId}`); onClose(); }}
                                                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-1.5"
                                                    >
                                                        <CreditCard className="w-3 h-3" /> Pay Now
                                                    </button>
                                                )}
                                                {n.type === 'message' && (n.conversationId || n.sender?._id) && (
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            const url = n.conversationId ? `${rolePrefix}/messages?conversationId=${n.conversationId}` : `${rolePrefix}/messages?to=${n.sender._id}`;
                                                            navigate(url); 
                                                            onClose(); 
                                                        }}
                                                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-1.5"
                                                    >
                                                        <MessageSquare className="w-3 h-3" /> Reply
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <Bell className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                            <p className="font-black text-sm uppercase tracking-widest text-slate-300">No notifications yet</p>
                            <p className="text-xs text-slate-400 mt-2">You're all caught up!</p>
                        </div>
                    )}
                </div>

                {notifications.length > 0 && unreadCount > 0 && (
                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <button
                            onClick={onMarkRead}
                            className="w-full bg-white py-4 rounded-[24px] text-[11px] font-black uppercase tracking-widest border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
export default NotificationModal;
