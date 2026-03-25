import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Zap,
    User,
    LogOut,
    LayoutDashboard,
    ChevronDown,
    Bell,
    MessageSquare,
    Menu,
    X
} from 'lucide-react';
import { Button } from '../ui/Button';
import ProfileModal from '../dashboard/ProfileModal';
import NotificationModal from '../dashboard/NotificationModal';
import { getNameInitials } from '../../utils/getNameInitials';
import api from '../../services/api';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/notifications/my');
            const sorted = data.data || [];
            setNotifications(sorted);
            setUnreadCount(data.unreadCount || 0);

            // Count unread message type notifications specifically
            const msgCount = sorted.filter(n => !n.isRead && n.type === 'message').length;
            setUnreadMessages(msgCount);
        } catch (err) { }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // 15s refresh
        return () => clearInterval(interval);
    }, [user]);

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/mark-read');
            setUnreadCount(0);
            setUnreadMessages(0);
            fetchNotifications();
        } catch (err) { }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <header className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-[100] flex items-center shadow-sm">
                <div className="max-w-7xl mx-auto px-8 w-full flex items-center justify-between">
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
                            <Zap className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">TaskRabbit<span className="text-blue-500">.</span></span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-8 mx-12">
                        <Link to="/search" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors">Local Experts</Link>
                        <Link to="/search" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors">Catalog</Link>
                        <Link to="/how-it-works" className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors">Guide</Link>
                    </nav>

                    {/* Authentication and Account Actions */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                <div className="flex items-center gap-2">
                                    {/* Notifications Center */}
                                    <button
                                        onClick={() => {
                                            setIsNotifModalOpen(true);
                                            fetchNotifications();
                                        }}
                                        className="relative p-3 text-slate-400 hover:text-blue-600 transition-all bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5"
                                        title="Activity Center"
                                    >
                                        <Bell className="w-4 h-4" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[7px] font-black text-white animate-pulse">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Direct Messaging Link */}
                                    <Link
                                        to="/dashboard/messages"
                                        className="relative p-3 text-slate-400 hover:text-blue-600 transition-all bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 cursor-pointer block"
                                        title="Communications"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        {unreadMessages > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-[7px] font-black text-white">
                                                {unreadMessages > 9 ? '9+' : unreadMessages}
                                            </span>
                                        )}
                                    </Link>
                                </div>

                                {/* User Profile Trigger */}
                                <div className="relative ml-2">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white overflow-hidden shadow-lg shadow-blue-600/10 text-[10px] font-black tracking-tighter">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                getNameInitials(user.name)
                                            )}
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 hidden sm:block">
                                            {user.name?.split(' ')[0]}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Account Dropdown */}
                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                            <div className="absolute top-[120%] right-0 w-68 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right backdrop-blur-xl">
                                                <div className="px-6 py-4 border-b border-slate-50 mb-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed In As</p>
                                                    <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                                                </div>
                                                <Link
                                                    to="/dashboard"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-4 px-6 py-3 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all group"
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    <span className="text-xs font-black uppercase tracking-widest">Dashboard Hub</span>
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setIsProfileOpen(false);
                                                        setIsProfileModalOpen(true);
                                                    }}
                                                    className="w-full flex items-center gap-4 px-6 py-3 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all"
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-left">Identity Management</span>
                                                </button>
                                                <div className="px-3 mt-2 pt-2 border-t border-slate-50">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        <span className="text-xs font-black uppercase tracking-widest text-left flex-1">Terminate Session</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link to="/login" className="hidden sm:block text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-blue-600 transition-colors px-2">Access Portal</Link>
                                <Link to="/register">
                                    <Button className="rounded-2xl px-10 h-14 font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-500/20">Sign Up</Button>
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-900 ml-2"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Response View */}
                {isMenuOpen && (
                    <div className="fixed inset-0 top-20 bg-white z-[90] animate-in slide-in-from-top duration-300 lg:hidden px-8 py-12">
                        <nav className="flex flex-col gap-10 text-center">
                            <Link onClick={() => setIsMenuOpen(false)} to="/" className="text-4xl font-black text-slate-900 tracking-tight leading-none italic">Services</Link>
                            <Link onClick={() => setIsMenuOpen(false)} to="/nearby" className="text-4xl font-black text-slate-900 tracking-tight leading-none italic">Nearby</Link>
                            <Link onClick={() => setIsMenuOpen(false)} to="/how-it-works" className="text-4xl font-black text-slate-900 tracking-tight leading-none italic">How it Works</Link>

                            {!user && (
                                <div className="flex flex-col gap-5 mt-12 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                                    <Link onClick={() => setIsMenuOpen(false)} to="/login" className="text-xl font-black text-slate-900 uppercase tracking-widest">Portal Login</Link>
                                    <Link onClick={() => setIsMenuOpen(false)} to="/register">
                                        <Button className="w-full rounded-[24px] h-20 text-xl font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20">Claim Your Space</Button>
                                    </Link>
                                </div>
                            )}
                            {user && (
                                <div className="flex flex-col gap-6 mt-12 pt-12 border-t border-slate-100">
                                    <Link onClick={() => setIsMenuOpen(false)} to="/dashboard" className="text-3xl font-black text-blue-600 tracking-tight underline underline-offset-8">Hub Dashboard</Link>
                                    <button onClick={() => { setIsMenuOpen(false); setIsProfileModalOpen(true); }} className="text-xl font-black uppercase tracking-widest text-slate-900">Account Identity</button>
                                    <button onClick={handleLogout} className="text-xl font-black uppercase tracking-widest text-red-500">Sign Out</button>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </header>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            <NotificationModal
                isOpen={isNotifModalOpen}
                notifications={notifications}
                onClose={() => setIsNotifModalOpen(false)}
                onMarkRead={handleMarkAllRead}
                onRefresh={fetchNotifications}
            />
        </>
    );
};

export default Header;
