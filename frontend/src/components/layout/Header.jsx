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
            <header className="fixed top-0 inset-x-0 h-20 bg-white/70 backdrop-blur-2xl border-b border-slate-100/80 z-[100] flex items-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                <div className="max-w-7xl mx-auto px-8 w-full flex items-center justify-between">
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-all shadow-xl shadow-blue-500/20">
                            <Zap className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter transition-colors group-hover:text-blue-600">TaskRabbit<span className="text-blue-500">.</span></span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-10 mx-auto">
                        <Link to="/search" className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:scale-105 ${location.pathname === '/search' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>Discovery</Link>
                        <Link to="/nearby" className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:scale-105 ${location.pathname === '/nearby' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>Map Search</Link>
                        <Link to="/how-it-works" className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:scale-105 ${location.pathname === '/how-it-works' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}>How It Works</Link>
                    </nav>

                    {/* Authentication and Account Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                                    {/* Notifications Center */}
                                    <button
                                        onClick={() => {
                                            setIsNotifModalOpen(true);
                                            fetchNotifications();
                                        }}
                                        className="relative p-2.5 text-slate-400 hover:text-blue-600 transition-all hover:bg-blue-50/50 rounded-xl border border-transparent hover:border-blue-100 active:scale-95"
                                        title="Activity Center"
                                    >
                                        <Bell className="w-4 h-4" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[7px] font-black text-white shadow-sm">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Direct Messaging Link */}
                                    <Link
                                        to={`/${user.role}/messages`}
                                        className="relative p-2.5 text-slate-400 hover:text-blue-600 transition-all hover:bg-blue-50/50 rounded-xl border border-transparent hover:border-blue-100 active:scale-95"
                                        title="Communications"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        {unreadMessages > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-[7px] font-black text-white shadow-sm">
                                                {unreadMessages > 9 ? '9+' : unreadMessages}
                                            </span>
                                        )}
                                    </Link>
                                </div>

                                {/* User Profile Trigger */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-3 p-1.5 rounded-2xl bg-white border border-slate-100 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white overflow-hidden shadow-lg shadow-slate-900/10 text-[10px] font-black tracking-tighter group-hover:bg-blue-600 transition-colors">
                                            {user.profilePicture ? (
                                                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                getNameInitials(user.name)
                                            )}
                                        </div>
                                        <div className="text-left hidden sm:block pr-1">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none group-hover:text-blue-600 transition-colors">{user.name?.split(' ')[0]}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Hub Active</p>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-500 mr-1 ${isProfileOpen ? 'rotate-180 text-blue-600' : ''}`} />
                                    </button>

                                    {/* Account Dropdown */}
                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                            <div className="absolute top-[130%] right-0 w-72 bg-white rounded-[32px] shadow-2xl border border-slate-100 py-4 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right backdrop-blur-3xl overflow-hidden ring-1 ring-black/5">
                                                <div className="px-6 py-5 border-b border-slate-50 mb-3 bg-slate-50/50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Administrative Profile</p>
                                                    <p className="text-sm font-black text-slate-900 truncate tracking-tight">{user.name}</p>
                                                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">Status: Operational</p>
                                                </div>
                                                <div className="px-3 space-y-1">
                                                    <Link
                                                        to={`/${user.role}/dashboard`}
                                                        onClick={() => setIsProfileOpen(false)}
                                                        className="flex items-center gap-4 px-5 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all group"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        <span className="text-xs font-black uppercase tracking-widest">Dashboard Hub</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setIsProfileOpen(false);
                                                            setIsProfileModalOpen(true);
                                                        }}
                                                        className="w-full flex items-center gap-4 px-5 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all group text-left"
                                                    >
                                                        <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                        <span className="text-xs font-black uppercase tracking-widest">Identity Settings</span>
                                                    </button>
                                                </div>
                                                <div className="px-3 mt-3 pt-3 border-t border-slate-50">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all group text-left"
                                                    >
                                                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                        <span className="text-xs font-black uppercase tracking-widest flex-1">Terminate Session</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link to="/login" className="hidden sm:block text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 hover:text-blue-600 transition-colors px-2">Access Portal</Link>
                                <Link to="/register">
                                    <Button className="rounded-2xl px-10 h-14 font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-500/20 active:scale-95 transition-all">Claim Workspace</Button>
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-900 ml-2 bg-slate-50 rounded-xl"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Response View */}
                {isMenuOpen && (
                    <div className="fixed inset-0 top-20 bg-white/95 backdrop-blur-xl z-[90] animate-in fade-in slide-in-from-top duration-300 lg:hidden px-8 py-12">
                        <nav className="flex flex-col gap-10 text-center">
                            <Link onClick={() => setIsMenuOpen(false)} to="/search" className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Marketplace</Link>
                            <Link onClick={() => setIsMenuOpen(false)} to="/nearby" className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Map Search</Link>
                            <Link onClick={() => setIsMenuOpen(false)} to="/how-it-works" className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Methodology</Link>

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
                                    <Link onClick={() => setIsMenuOpen(false)} to={`/${user.role}/dashboard`} className="text-3xl font-black text-blue-600 tracking-tighter">Hub Dashboard</Link>
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
