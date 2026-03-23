import { useAuth } from '../../context/AuthContext';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  User as UserIcon, 
  Settings, 
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  Search,
  CreditCard
} from 'lucide-react';
import { Button } from '../ui/Button';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', icon: BarChart3, path: '/dashboard' },
    { label: 'My Bookings', icon: Calendar, path: '/dashboard/bookings' },
    { label: 'Payments', icon: CreditCard, path: '/dashboard/payments' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
    { label: 'Profile Settings', icon: UserIcon, path: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-100 mb-8">
           <Link to="/" className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">TaskRabbit</Link>
        </div>
        
        <div className="px-6 space-y-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end
              className={({ isActive }) => `
                flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold tracking-wide transition-all group
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 ring-4 ring-blue-50' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <item.icon className="w-5 h-5 opacity-80" />
              {item.label}
              {({ isActive }) => isActive && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
              )}
            </NavLink>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100">
           <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 flex items-center gap-4 mb-6 overflow-hidden">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white shrink-0">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-black text-slate-900 truncate text-sm tracking-tight">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{user?.role || 'Guest'}</p>
              </div>
           </div>
           
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-red-500 font-black text-sm hover:bg-red-50 transition-colors group"
           >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
           <div className="lg:hidden">
              <Menu className="w-6 h-6 text-slate-600" />
           </div>
           
           <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tasks, taskers, messages..." 
                className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder:text-slate-400"
              />
           </div>

           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                 <Settings className="w-5 h-5" />
              </Button>
           </div>
        </header>

        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
           <div className="max-w-7xl mx-auto">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
