import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, NavLink, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  Search,
  CreditCard,
  Briefcase,
  DollarSign,
  Shield,
  Zap,
  Tag,
  Users,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import Header from './Header';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications/my');
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      } catch (err) {
        console.error("Notifications fetch failure");
      }
    };
    if (user) {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }
  }, [user]);

  const markRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      setUnreadCount(0);
    } catch (err) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const shared = [
      { label: 'Overview', icon: BarChart3, path: '/dashboard' },
      { label: 'Bookings', icon: Calendar, path: '/dashboard/bookings' },
      { label: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
    ];

    const clientItems = [
      { label: 'Payments', icon: CreditCard, path: '/dashboard/payments' },
    ];

    const providerItems = [
      { label: 'My Services', icon: Briefcase, path: '/dashboard/services' },
      { label: 'Earnings', icon: DollarSign, path: '/dashboard/earnings' },
    ];

    const adminItems = [
      { label: 'Platform Controls', icon: Shield, path: '/admin' },
      { label: 'Identity Directory', icon: Users, path: '/dashboard/users' },
      { label: 'Service Domains', icon: Tag, path: '/dashboard/categories' },
      { label: 'Secure Payments', icon: CreditCard, path: '/dashboard/payments' },
    ];

    switch (user?.role) {
      case 'provider': return [...shared, ...providerItems];
      case 'admin':    return [...shared, ...adminItems];
      default:         return [...shared, ...clientItems];
    }
  };

  const navItems = getNavItems();
  const badge = user?.role === 'provider' ? { label: 'Expert Access', color: 'bg-indigo-600' } : { label: 'Member Access', color: 'bg-emerald-600' };

  if (user?.role === 'client') {
     return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
           {/* Unified Global Header */}
           <Header />

           {/* Dashboard Sub-Nav for Clients */}
           <div className="fixed top-20 inset-x-0 h-16 bg-white/50 backdrop-blur-md border-b border-slate-50 z-40 flex items-center">
              <div className="max-w-7xl mx-auto px-8 w-full flex items-center gap-8">
                 {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                    return (
                       <Link 
                          key={item.label} 
                          to={item.path} 
                          className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all relative py-1
                             ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}
                          `}
                       >
                          {item.label}
                       </Link>
                    );
                 })}
              </div>
           </div>

           {/* Mobile Tab Bar (Bottom) */}
           <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 h-16 flex items-center justify-around z-50 px-4 shadow-2xl shadow-blue-900/10">
              {navItems.map((item) => {
                 const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                 return (
                    <Link key={item.label} to={item.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                       <item.icon className="w-5 h-5" />
                       <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                    </Link>
                 );
              })}
           </div>

           {/* Content Container */}
           <main className="flex-1 pt-44 pb-24 md:pb-12 bg-[#F8FAFC]">
              <div className="max-w-7xl mx-auto px-8">
                 {/* Page Header Area for Client */}
                 <div className="mb-10 flex items-center justify-between">
                    <div>
                       <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
                          {navItems.find(i => location.pathname === i.path || (i.path !== '/dashboard' && location.pathname.startsWith(i.path)))?.label || 'Dashboard'}
                       </h1>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Identity Hub — Secure Access</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/5">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Client Sync Active</span>
                    </div>
                 </div>
                 {children}
              </div>
           </main>

           {/* Notification Modal for Client Topnav */}
           {showNotif && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center md:items-start md:justify-end md:p-8 md:pt-24 pointer-events-none">
                 <div className="pointer-events-auto w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-slate-100 py-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-6 mb-4 flex items-center justify-between border-b border-slate-50 pb-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Notifications</p>
                       <button onClick={() => setShowNotif(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                       {notifications.length > 0 ? notifications.map((n) => (
                          <div key={n._id} className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                             <p className="text-xs font-black text-slate-900 mb-1 group-hover:text-blue-600">{n.title}</p>
                             <p className="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                             <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                       )) : (
                          <div className="py-12 text-center text-slate-100">
                             <Zap className="w-8 h-8 mx-auto mb-2 opacity-20" />
                             <p className="text-[9px] font-black uppercase tracking-widest">No alerts recorded</p>
                          </div>
                       )}
                    </div>
                 </div>
                 <div className="fixed inset-0 bg-slate-900/5 backdrop-blur-[2px] -z-10 pointer-events-auto" onClick={() => setShowNotif(false)} />
              </div>
           )}
        </div>
     );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar (For Providers/Admins) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 lg:static lg:translate-x-0
        ${user?.role === 'client' ? 'bg-white border-r border-slate-100' : 'bg-slate-900'}
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
            {/* Logo area */}
            <div className={`h-20 flex items-center px-8 border-b ${user?.role === 'client' ? 'border-slate-50' : 'border-white/5'}`}>
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                   <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <span className={`text-xl font-black tracking-tight ${user?.role === 'client' ? 'text-slate-900' : 'text-white'}`}>TaskRabbit<span className="text-blue-500">.</span></span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`lg:hidden ml-auto ${user?.role === 'client' ? 'text-slate-400' : 'text-slate-500'}`}
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
               {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  const isClient = user?.role === 'client';
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group
                        ${isActive 
                           ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                           : isClient 
                             ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' 
                             : 'text-slate-400 hover:text-white hover:bg-white/5'}
                      `}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-blue-600 transition-colors'}`} />
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    </Link>
                  );
               })}
            </nav>

            {/* Account area */}
            <div className={`p-4 border-t ${user?.role === 'client' ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-black/20'}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.role === 'client' ? 'bg-white text-slate-400 border border-slate-100' : 'bg-slate-800 text-slate-400'}`}>
                      <User className="w-5 h-5" />
                   </div>
                   <div className="min-w-0">
                      <p className={`text-xs font-black truncate ${user?.role === 'client' ? 'text-slate-900' : 'text-white'}`}>{user?.name}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate">{user?.role}</p>
                   </div>
                   <button onClick={handleLogout} className="ml-auto p-2 text-slate-500 hover:text-red-400 transition-colors">
                      <LogOut className="w-4 h-4" />
                   </button>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
            <div className="lg:hidden">
               <button onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="w-6 h-6 text-slate-600" />
               </button>
            </div>
            
            <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search platform assets..." 
                 className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all placeholder:text-slate-400"
               />
            </div>

            <div className="flex items-center gap-4">
               <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl ${badge.color}/10 border border-current/5`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.color} animate-pulse`}></span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{badge.label}</span>
               </div>
               
               {/* Notifications */}
               <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full relative transition-all ${showNotif ? 'bg-slate-100 text-blue-600' : ''}`}
                    onClick={() => {
                        if (!showNotif) markRead();
                        setShowNotif(!showNotif);
                    }}
                  >
                     <Bell className="w-5 h-5" />
                     {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
                           {unreadCount}
                        </span>
                     )}
                  </Button>

                  {showNotif && (
                     <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)}></div>
                        <div className="absolute top-14 right-0 w-80 bg-white rounded-[32px] shadow-2xl shadow-blue-900/20 border border-slate-100 py-6 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-6 mb-4 flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Notifications</p>
                            <span className="text-[8px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">{notifications.length} Total</span>
                            </div>
                            <div className="max-h-96 overflow-y-auto space-y-1">
                            {notifications.length > 0 ? notifications.map((n) => (
                                <div key={n._id} className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <p className="text-xs font-black text-slate-900 mb-1 group-hover:text-blue-600">{n.title}</p>
                                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed line-clamp-2">{n.message}</p>
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
                                </div>
                            )) : (
                                <div className="py-12 text-center text-slate-300">
                                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">No alerts recorded</p>
                                </div>
                            )}
                            </div>
                        </div>
                     </>
                  )}
               </div>

               <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="w-5 h-5" />
               </Button>
            </div>
         </header>

         <main className="flex-1 p-8 lg:p-12 overflow-y-auto bg-slate-50">
            <div className="max-w-7xl mx-auto">
               {children}
            </div>
         </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
