import React from 'react';
import { X, Bell, CheckCircle2, MessageSquare, Info, Zap, Check } from 'lucide-react';
import { getNameInitials } from '../../utils/getNameInitials';
import api from '../../services/api';

const NotificationModal = ({ isOpen, onClose, notifications, onMarkRead, onRefresh }) => {
    if (!isOpen) return null;

    const handleSingleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/mark-read`);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'booking_accepted': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'booking_request': return <Zap className="w-4 h-4 text-blue-500" />;
            default: return <Info className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-24 px-8 overflow-hidden">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>

            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-top-8 duration-500 relative flex flex-col max-h-[70vh]">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Activity Feed</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Platform Communications</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-slate-100 rounded-2xl border border-slate-100 transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {notifications.length > 0 ? (
                        <div className="space-y-3">
                            {notifications.map((n) => (
                                <div key={n._id} className={`group p-5 rounded-[32px] border transition-all relative ${n.isRead ? 'bg-white border-slate-50' : 'bg-blue-50/30 border-blue-100/50'}`}>

                                    {!n.isRead && (
                                        <button
                                            onClick={() => handleSingleMarkRead(n._id)}
                                            className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-lg shadow-blue-500/5 border border-blue-100/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-500 hover:text-white"
                                            title="Mark as Read"
                                        >
                                            <Check className="w-3 h-3" />
                                        </button>
                                    )}

                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-extrabold text-slate-900 text-sm truncate pr-6">{n.title}</h4>
                                                {!n.isRead && <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shrink-0"></span>}
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 leading-relaxed mb-3">{n.message}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                                                    {getNameInitials(n.sender?.name)}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{n.sender?.name || 'System Agent'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center opacity-20">
                            <Bell className="w-16 h-16 mx-auto mb-6" />
                            <p className="font-black text-sm uppercase tracking-[0.2em]">Silence is Golden</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onMarkRead}
                        className="w-full bg-white py-4 rounded-[24px] text-[11px] font-black uppercase tracking-widest border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                    >
                        Archive All Communications
                    </button>
                </div>
            </div>
        </div>
    );
};
export default NotificationModal;
