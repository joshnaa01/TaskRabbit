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
  X,
  AlertCircle,
  CheckCircle2,
  Map as MapIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import Header from './Header';
import NotificationModal from '../dashboard/NotificationModal';
import ProfileModal from '../dashboard/ProfileModal';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Notifications
        const res = await api.get('/notifications/my');
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);

        // Messages (Aggregate unread for badge)
        const chatRes = await api.get('/chat/conversations');
        const unreadMsg = (chatRes.data.data || []).reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
        setUnreadMessages(unreadMsg);

        // Admin Queue
        if (user?.role === 'admin') {
           const reviewRes = await api.get('/admin/completion-reviews');
           setPendingReviewsCount(reviewRes.data.data?.length || 0);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };
    if (user) {
        fetchData();
        const interval = setInterval(fetchData, 15000); // 15s polling for high-velocity hub
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
    const rolePrefix = `/${user?.role}`;
    const shared = [
      { label: 'Dashboard', icon: BarChart3, path: `${rolePrefix}/dashboard` },
      { label: 'Bookings', icon: Calendar, path: `${rolePrefix}/bookings` },
      { label: 'Messages', icon: MessageSquare, path: `${rolePrefix}/messages` },
    ];

    const clientItems = [
      { label: 'Map Search', icon: MapIcon, path: '/nearby' },
      { label: 'Payments', icon: CreditCard, path: '/client/payments' },
    ];

    const providerItems = [
      { label: 'Services', icon: Briefcase, path: '/provider/services' },
      { label: 'Earnings', icon: DollarSign, path: '/provider/earnings' },
    ];

    const adminItems = [
      { label: 'Users', icon: Users, path: '/admin/users' },
      { label: 'Categories', icon: Tag, path: '/admin/categories' },
      { label: 'Applications', icon: CheckCircle2, path: '/admin/verification-queue' },
      { label: 'Payments', icon: CreditCard, path: '/admin/payments' },
      { label: 'Disputes', icon: AlertCircle, path: '/admin/disputes' },
      { label: 'Map', icon: MapIcon, path: '/admin/map' },
    ];

    switch (user?.role) {
      case 'provider': return [...shared, ...providerItems];
      case 'admin':    return [...shared, ...adminItems];
      default:         return [...shared, ...clientItems];
    }
  };

  const navItems = getNavItems();
  const badge = user?.role === 'provider' ? { label: 'Provider', color: 'bg-indigo-600' } : { label: 'Client', color: 'bg-emerald-600' };

  if (user?.role === 'client') {
     return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
           {/* Unified Global Header */}
           <Header />

           {/* Dashboard Sub-Nav for Clients */}
           <div className="fixed top-20 inset-x-0 h-14 bg-white/40 backdrop-blur-xl border-b border-slate-100/50 z-40 flex items-center shadow-sm">
              <div className="max-w-7xl mx-auto px-8 w-full flex items-center justify-between">
                 <div className="flex items-center gap-10">
                    {navItems.map((item) => {
                       const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                       const hasBadge = (item.label === 'Messages' && unreadMessages > 0);
                       return (
                          <Link 
                             key={item.label} 
                             to={item.path} 
                             className={`text-[9px] font-black uppercase tracking-[0.25em] transition-all relative py-2 flex items-center gap-2 group
                                ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}
                             `}
                          >
                             <span>{item.label}</span>
                             {hasBadge && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                             )}
                             {isActive && !hasBadge && (
                                <span className="w-1 h-1 rounded-full bg-blue-600 animate-in fade-in zoom-in duration-300" />
                             )}
                             <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 ${isActive ? 'scale-x-100 opacity-0' : 'opacity-0'}`} />
                          </Link>
                       );
                    })}
                 </div>

                 {/* Notification Bell for Client Sub-Nav */}
                 <button
                    onClick={() => setShowNotif(!showNotif)}
                    className="relative p-2.5 text-slate-400 hover:text-blue-600 transition-all hover:bg-blue-50/50 rounded-xl border border-transparent hover:border-blue-100 active:scale-95"
                 >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                       <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[7px] font-black text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                       </span>
                    )}
                 </button>
              </div>
           </div>

           {/* Mobile Tab Bar (Bottom) */}
           <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 h-18 flex items-center justify-around z-50 px-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] pb-safe">
              {navItems.map((item) => {
                 const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                 return (
                    <Link key={item.label} to={item.path} className={`flex flex-col items-center gap-1.5 py-2 px-4 rounded-2xl transition-all ${isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-50'}`}>
                       <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                       <span className="text-[7px] font-black uppercase tracking-[0.15em]">{item.label}</span>
                    </Link>
                 );
              })}
           </div>

           {/* Content Container */}
           <main className="flex-1 pt-[140px] pb-24 md:pb-12 bg-[#F8FAFC]">
              <div className="max-w-7xl mx-auto px-8">
                 {children}
              </div>
           </main>

           {/* Client Notification Modal */}
           <NotificationModal 
               isOpen={showNotif} 
               onClose={() => setShowNotif(false)} 
               notifications={notifications}
               onMarkRead={async () => {
                   await markRead();
                   const res = await api.get('/notifications/my');
                   setNotifications(res.data.data);
                   setUnreadCount(res.data.unreadCount);
               }}
               onRefresh={async () => {
                   const res = await api.get('/notifications/my');
                   setNotifications(res.data.data);
                   setUnreadCount(res.data.unreadCount);
               }}
           />
        </div>
     );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar (For Providers/Admins) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 lg:static lg:translate-x-0
        ${user?.role === 'client' ? 'bg-white border-r border-slate-100' : 'bg-slate-950'}
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
            {/* Logo area */}
            <div className={`h-16 flex items-center px-6 border-b ${user?.role === 'client' ? 'border-slate-100' : 'border-white/5'}`}>
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center mr-2.5 shadow-lg shadow-blue-600/20">
                   <Zap className="w-4 h-4 text-white fill-white" />
                </div>
                <span className={`text-lg font-black tracking-tighter ${user?.role === 'client' ? 'text-slate-900' : 'text-white'}`}>TaskRabbit<span className="text-blue-500">.</span></span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`lg:hidden ml-auto ${user?.role === 'client' ? 'text-slate-400' : 'text-slate-500'}`}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto custom-scrollbar">
               {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  const isClient = user?.role === 'client';
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative
                        ${isActive 
                           ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                           : isClient 
                             ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' 
                             : 'text-slate-400 hover:text-white hover:bg-white/5'}
                      `}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'group-hover:text-blue-600 transition-colors'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                      {((item.label === 'Messages' && unreadMessages > 0) || (item.label === 'Applications' && pendingReviewsCount > 0)) && (
                         <span className="absolute top-2.5 right-3 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-slate-950 animate-pulse" />
                      )}
                    </Link>
                  );
               })}
            </nav>

            {/* Account area */}
            <div className={`p-4 border-t ${user?.role === 'client' ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-black/40'}`}>
                <button 
                   onClick={() => setIsProfileModalOpen(true)}
                   className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all group"
                >
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user?.role === 'client' ? 'bg-white text-slate-400 border border-slate-100' : 'bg-slate-800 text-slate-400'} overflow-hidden shadow-sm`}>
                      {user?.profilePicture ? (
                         <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                         <User className="w-4 h-4" />
                      )}
                   </div>
                   <div className="min-w-0 text-left">
                      <p className={`text-[11px] font-black truncate leading-tight ${user?.role === 'client' ? 'text-slate-900' : 'text-white'}`}>{user?.name}</p>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate">Account Settings</p>
                   </div>
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-slate-500 hover:text-red-400 transition-colors hover:bg-white/5">
                   <LogOut className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0 shadow-sm">
            <div className="lg:hidden">
               <button onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="w-5 h-5 text-slate-600" />
               </button>
            </div>
            
            <div className="flex-1 max-w-lg mx-6 relative hidden md:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search for something..." 
                 className="w-full bg-slate-50 border-none rounded-lg py-2 pl-10 pr-4 text-[11px] font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
               />
            </div>

            <div className="flex items-center gap-3">
               <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${badge.color}/5 border border-current/5`}>
                  <span className={`w-1 h-1 rounded-full ${badge.color} animate-pulse`}></span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{badge.label}</span>
               </div>
               
               {/* Notifications */}
               <div>
                  <button 
                    className={`p-2 rounded-lg relative transition-all ${showNotif ? 'bg-slate-100 text-blue-600 shadow-inner' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                    onClick={() => {
                        setShowNotif(!showNotif);
                        if (!showNotif) {
                            // Optionally refresh instead of marking all read
                            api.get('/notifications/my').then(res => {
                                setNotifications(res.data.data);
                                setUnreadCount(res.data.unreadCount);
                            });
                        }
                    }}
                  >
                     <Bell className="w-4 h-4" />
                     {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-black flex items-center justify-center rounded-full ring-2 ring-white">
                           {unreadCount}
                        </span>
                     )}
                  </button>
               </div>

               <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                  <Settings className="w-4 h-4" />
               </button>
            </div>
         </header>

         <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
               {children}
            </div>
         </main>
      </div>

      {/* Profile Modal for Provider/Admin */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

      {/* Admin/Provider Notification Modal */}
      <NotificationModal 
        isOpen={showNotif} 
        onClose={() => setShowNotif(false)} 
        notifications={notifications}
        onMarkRead={markRead}
        onRefresh={() => {
            api.get('/notifications/my').then(res => {
                setNotifications(res.data.data);
                setUnreadCount(res.data.unreadCount);
            });
        }}
      />
    </div>
  );
};

export default DashboardLayout;
