import React, { useMemo } from 'react';
import { 
    X, 
    Bell, 
    CheckCircle2, 
    MessageSquare, 
    Info, 
    Zap, 
    Check, 
    CreditCard, 
    Clock, 
    AlertCircle, 
    ArrowRight,
    XSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const NotificationModal = ({ isOpen, onClose, notifications, onMarkRead, onRefresh }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
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
        if (!n.isRead) {
            handleSingleMarkRead(n._id);
        }
        onClose();

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

    const getNotificationStyles = (type) => {
        switch (type) {
            case 'message': 
                return {
                    icon: <MessageSquare className="w-4 h-4" />,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                    border: 'border-blue-100',
                    gradient: 'from-blue-500 to-indigo-600'
                };
            case 'booking_accepted': 
                return {
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-100',
                    gradient: 'from-emerald-500 to-teal-600'
                };
            case 'booking_request': 
                return {
                    icon: <Zap className="w-4 h-4" />,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                    border: 'border-amber-100',
                    gradient: 'from-amber-500 to-orange-600'
                };
            case 'booking_completed': 
                return {
                    icon: <CreditCard className="w-4 h-4" />,
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-50',
                    border: 'border-indigo-100',
                    gradient: 'from-indigo-500 to-purple-600'
                };
            case 'work_submitted': 
                return {
                    icon: <Clock className="w-4 h-4" />,
                    color: 'text-violet-600',
                    bg: 'bg-violet-50',
                    border: 'border-violet-100',
                    gradient: 'from-violet-500 to-fuchsia-600'
                };
            case 'booking_rejected': 
            case 'booking_cancelled':
                return {
                    icon: <XSquare className="w-4 h-4" />,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    border: 'border-red-100',
                    gradient: 'from-red-500 to-rose-600'
                };
            case 'dispute': 
                return {
                    icon: <AlertCircle className="w-4 h-4" />,
                    color: 'text-red-600',
                    bg: 'bg-red-50',
                    border: 'border-red-100',
                    gradient: 'from-red-500 to-rose-600'
                };
            default: 
                return {
                    icon: <Info className="w-4 h-4" />,
                    color: 'text-slate-600',
                    bg: 'bg-slate-50',
                    border: 'border-slate-100',
                    gradient: 'from-slate-500 to-slate-700'
                };
        }
    };

    const timeAgo = (date) => {
        const d = new Date(date);
        const now = new Date();
        const seconds = Math.floor((now - d) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    const groupedNotifications = useMemo(() => {
        const groups = {
            Today: [],
            Yesterday: [],
            Earlier: []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        notifications.forEach(n => {
            const date = new Date(n.createdAt);
            if (date >= today) groups.Today.push(n);
            else if (date >= yesterday) groups.Yesterday.push(n);
            else groups.Earlier.push(n);
        });

        return groups;
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] overflow-hidden flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300" 
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-[450px] bg-white h-full shadow-[-20px_0_50px_-12px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-500 ease-out">
                {/* Header */}
                <div className="px-8 pt-10 pb-6 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inbox</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {unreadCount} UNREAD • {notifications.length} TOTAL
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-all active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button 
                            onClick={onMarkRead}
                            className="mt-6 w-full py-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#fcfdfe]">
                    {notifications.length > 0 ? (
                        <div className="p-4 space-y-8">
                            {Object.entries(groupedNotifications).map(([label, items]) => (
                                items.length > 0 && (
                                    <div key={label} className="space-y-3">
                                        <div className="flex items-center gap-3 px-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
                                            <div className="flex-1 h-px bg-slate-100" />
                                        </div>
                                        <div className="space-y-2">
                                            {items.map((n) => {
                                                const styles = getNotificationStyles(n.type);
                                                return (
                                                    <div 
                                                        key={n._id} 
                                                        onClick={() => handleNotificationClick(n)}
                                                        className={`group relative p-5 rounded-[32px] border transition-all cursor-pointer ${
                                                            n.isRead 
                                                            ? 'bg-white border-slate-50 hover:border-slate-200 opacity-80 hover:opacity-100' 
                                                            : 'bg-white border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5'
                                                        }`}
                                                    >
                                                        {!n.isRead && (
                                                            <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                                                        )}

                                                        <div className="flex gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center bg-gradient-to-tr ${styles.gradient} shadow-lg shadow-blue-500/10`}>
                                                                <div className="text-white">
                                                                    {styles.icon}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between mb-1">
                                                                    <div className="flex flex-col">
                                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${styles.color} mb-0.5`}>
                                                                            {n.type?.replace('_', ' ')}
                                                                        </span>
                                                                        <h4 className={`text-sm tracking-tight leading-tight ${n.isRead ? 'font-bold text-slate-600' : 'font-black text-slate-900 line-clamp-1'}`}>
                                                                            {n.title}
                                                                        </h4>
                                                                    </div>
                                                                    <span className="text-[10px] font-medium text-slate-400 shrink-0">
                                                                        {timeAgo(n.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <p className={`text-xs leading-relaxed mb-3 ${n.isRead ? 'text-slate-400 font-medium' : 'text-slate-500 font-semibold line-clamp-2'}`}>
                                                                    {n.message}
                                                                </p>
                                                                
                                                                {/* Dynamic Actions */}
                                                                <div className="flex items-center gap-2">
                                                                    {n.type === 'message' && (
                                                                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                                            Reply Now <ArrowRight className="w-3 h-3" />
                                                                        </div>
                                                                    )}
                                                                    {n.type === 'booking_completed' && (
                                                                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                                            Proceed to Pay <CreditCard className="w-3 h-3" />
                                                                        </div>
                                                                    )}
                                                                    {!n.type && (
                                                                         <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                                            View Details <ArrowRight className="w-3 h-3" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {!n.isRead && (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSingleMarkRead(n._id);
                                                                }}
                                                                className="absolute top-4 right-4 p-2 bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                                                                title="Mark Read"
                                                            >
                                                                <Check className="w-3.5 h-3.5 font-bold" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6 animate-pulse">
                                <Bell className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">All caught up!</h3>
                            <p className="text-sm text-slate-400 font-medium max-w-[200px]">
                                Your inbox is empty. We'll notify you when something important happens.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer / Quick Stats */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Messages</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">
                                {notifications.filter(n => n.type === 'message' && !n.isRead).length}
                            </p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Alerts</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight">
                                {notifications.filter(n => n.type !== 'message' && !n.isRead).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;

