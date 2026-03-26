import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  Calendar, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5 flex items-start gap-4 hover:shadow-2xl transition-shadow group">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${colorClass}`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{value}</p>
      {subtitle && <p className="text-slate-400 font-medium text-xs font-bold">{subtitle}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-6">
      <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Gathering Platform Data...</p>
    </div>
  );

  if (error) return (
    <div className="p-12 text-center bg-red-50 rounded-[40px] border border-red-100">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-black text-red-900 mb-2">Metrics Unavailable</h3>
      <p className="text-sm font-bold text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Overview</h1>
        <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2">Executive Summary & Telemetry</p>
      </div>

      {/* Top Metrics Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.users.total} 
          subtitle={`${stats.users.clients} Clients, ${stats.users.providers} Providers`}
          icon={Users} 
          colorClass="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="Total Services" 
          value={stats.services.total} 
          subtitle="Active on marketplace"
          icon={Briefcase} 
          colorClass="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          title="Platform Bookings" 
          value={stats.bookings.total} 
          subtitle={`${stats.bookings.active} Active Currently`}
          icon={Calendar} 
          colorClass="bg-amber-50 text-amber-600" 
        />
        <StatCard 
          title="Est. Revenue (NPR)" 
          value={`Rs. ${stats.revenue.total}`} 
          subtitle={`Platform Share: Rs. ${stats.revenue.platformEarnings}`}
          icon={DollarSign} 
          colorClass="bg-indigo-50 text-indigo-600" 
        />
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Bookings Feed */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 border border-slate-50 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
             <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
               <Activity className="w-5 h-5 text-blue-600" /> Live Feed
             </h2>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Past 5 Transactions</span>
          </div>
          <div className="p-8 flex-1 overflow-y-auto">
            {stats.recentBookings.length > 0 ? (
               <div className="space-y-6">
                 {stats.recentBookings.map(b => (
                   <div key={b._id} className="flex items-start gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600 group-hover:scale-110 transition-transform">
                         <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-black text-slate-900 truncate">{b.serviceId?.title || 'Unknown Service'}</p>
                         <p className="text-xs text-slate-500 font-bold truncate">Client: {b.clientId?.name} • Pro: {b.providerId?.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                         <p className="text-xs font-black text-slate-900">Rs. {b.basePrice}</p>
                         <p className="text-[10px] font-black text-blue-500 uppercase">{b.status}</p>
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
               <div className="text-center py-12 opacity-50">
                 <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No activity recorded</p>
               </div>
            )}
          </div>
        </div>

        {/* Quick Actions & More */}
        <div className="bg-slate-900 rounded-[40px] shadow-2xl p-10 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/20 rounded-full -ml-32 -mb-32 blur-3xl mix-blend-screen"></div>
          
          <h2 className="text-3xl font-black mb-4 relative z-10">Command Center</h2>
          <p className="text-slate-400 font-medium mb-10 leading-relaxed max-w-sm relative z-10">
             To perform deep moderation, resolve disputes, or manage financial payouts, access the dedicated administrative consoles.
          </p>

          <div className="space-y-4 relative z-10">
             <Link to="/dashboard/categories" className="w-full bg-white/10 hover:bg-white/20 border border-white/5 p-5 rounded-2xl flex items-center gap-4 transition-all block">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm tracking-wide">Manage Service Categories</span>
             </Link>
             <Link to="/dashboard/users" className="w-full bg-white/10 hover:bg-white/20 border border-white/5 p-5 rounded-2xl flex items-center gap-4 transition-all block">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm tracking-wide">Verify Tasker Profiles</span>
             </Link>
             <Link to="/dashboard/payments" className="w-full bg-white/10 hover:bg-white/20 border border-white/5 p-5 rounded-2xl flex items-center gap-4 transition-all block">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm tracking-wide">Run Financial Reports</span>
             </Link>
             <Link to="/dashboard/disputes" className="w-full bg-white/10 hover:bg-white/20 border border-white/5 p-5 rounded-2xl flex items-center gap-4 transition-all block">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="font-bold text-sm tracking-wide">Dispute Resolution</span>
             </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
