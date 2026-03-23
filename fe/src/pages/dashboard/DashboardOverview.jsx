import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  Star,
  Zap,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Target
} from 'lucide-react';

const DashboardOverview = () => {
    const { user } = useAuth();
    
    const { data: bookingsData } = useQuery({
        queryKey: ['bookings-count'],
        queryFn: async () => {
            const res = await api.get('/bookings');
            return res.data.data;
        }
    });

    const activeBookings = bookingsData?.filter(b => b.status === 'Accepted' || b.status === 'In Progress').length || 0;
    const completedBookings = bookingsData?.filter(b => b.status === 'Completed').length || 0;
    const totalBookings = bookingsData?.length || 0;

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome, {user?.name.split(' ')[0]}!</h1>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-2">Here's what's happening today</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { label: 'Total Tasks', value: totalBookings, color: 'text-slate-900', bg: 'bg-white', icon: Target },
                 { label: 'Active Now', value: activeBookings, color: 'text-blue-600', bg: 'bg-blue-50', icon: Zap },
                 { label: 'Completed', value: completedBookings, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                 { label: 'Avg Rating', value: '4.9', color: 'text-amber-600', bg: 'bg-amber-50', icon: Star }
               ].map((stat, i) => (
                 <div key={i} className={`${stat.bg} p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default`}>
                    <div className="relative z-10 flex flex-col items-start px-2">
                        <div className="p-3 bg-white rounded-2xl mb-6 shadow-sm ring-4 ring-slate-50">
                           <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <h4 className={`${stat.color} text-4xl font-black tracking-tight mb-2`}>{stat.value}</h4>
                    </div>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               {/* Activity Trend (Visual only for now) */}
               <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-2xl shadow-blue-900/5">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Task History
                     </h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last 30 Days</p>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-2 px-4">
                     {[40, 60, 45, 80, 55, 70, 90, 60].map((h, i) => (
                        <div key={i} className={`flex-1 ${i === 6 ? 'bg-blue-600' : 'bg-slate-100'} rounded-t-xl transition-all duration-1000`} style={{ height: `${h}%` }}></div>
                     ))}
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-slate-400 font-bold text-xs uppercase tracking-widest px-4">
                     <span>Mon</span>
                     <span>Wed</span>
                     <span>Fri</span>
                     <span>Sun</span>
                  </div>
               </div>

               {/* Upcoming Payment (Visual only for now) */}
               <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  <div className="relative z-10 h-full flex flex-col">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white ring-8 ring-white/5">
                           <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-white">Payment Stats</h3>
                           <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Client Account</p>
                        </div>
                     </div>
                     
                     <div className="flex-1 flex flex-col justify-center gap-6">
                        <div>
                           <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Held Escrow</p>
                           <h2 className="text-5xl font-black text-white tracking-tighter">Rs. 8,450</h2>
                        </div>
                        <div className="flex gap-4">
                           <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl">
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 text-emerald-500">Released</p>
                              <p className="text-lg font-black text-white">Rs. 24K</p>
                           </div>
                           <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-2xl">
                              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 text-amber-500">Processing</p>
                              <p className="text-lg font-black text-white">Rs. 1.2K</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
