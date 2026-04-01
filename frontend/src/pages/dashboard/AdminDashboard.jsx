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
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

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
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('overview'); // overview or statistics

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, reviewsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/completion-reviews')
        ]);
        setStats(statsRes.data.data);
        setPendingReviews(reviewsRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Platform Core</h1>
          <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2">Executive Summary & Economic Telemetry</p>
        </div>
        
        <div className="flex bg-white/50 border border-slate-200 p-1.5 rounded-2xl shadow-sm">
          <button 
            onClick={() => setView('overview')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'overview' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setView('statistics')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'statistics' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Marketplace Statistics
          </button>
        </div>
      </div>

      {/* Top Metrics Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.users?.total || 0} 
          subtitle={`${stats?.users?.clients || 0} Clients, ${stats?.users?.providers || 0} Providers`}
          icon={Users} 
          colorClass="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="Platform Rev (30%)" 
          value={`Rs. ${stats?.revenue?.platformEarnings?.toLocaleString() || 0}`} 
          subtitle="Realized Marketplace Profit"
          icon={TrendingUp} 
          colorClass="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          title="Total Volume" 
          value={`Rs. ${stats?.revenue?.totalVolume?.toLocaleString() || 0}`} 
          subtitle="Total Transaction Throughput"
          icon={DollarSign} 
          colorClass="bg-indigo-50 text-indigo-600" 
        />
        <StatCard 
          title="Active Pipeline" 
          value={stats?.bookings?.active || 0} 
          subtitle="Live Production Tasks"
          icon={Activity} 
          colorClass="bg-amber-50 text-amber-600" 
        />
      </div>

      {view === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Pipeline Priority */}
          <div className="lg:col-span-2 bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 border border-indigo-100 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-indigo-50 bg-indigo-50/30 flex items-center justify-between">
               <h2 className="text-xl font-black text-indigo-900 flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-indigo-600" /> Verification Management
               </h2>
               <Link to="/admin/verification-queue" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-100/50 hover:bg-indigo-600 hover:text-white transition-all">Full Queue ({pendingReviews.length})</Link>
            </div>
            <div className="p-8 flex-1 overflow-y-auto max-h-[500px]">
              {pendingReviews.length > 0 ? (
                 <div className="space-y-6">
                   <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-xl shadow-indigo-200 mb-8 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Awaiting Verification</p>
                      <h3 className="text-2xl font-black mb-6">{pendingReviews[0].serviceId?.title}</h3>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-80">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Provider: <span className="text-blue-400">{pendingReviews[0].providerId?.name}</span>
                         </div>
                         <Link to="/admin/verification-queue" className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-shadow-lg transition-all">
                            Verify Artifact
                         </Link>
                      </div>
                   </div>
                   
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Registry Backlog ({pendingReviews.length - 1})</p>
                   {pendingReviews.slice(1).map(r => (
                     <div key={r._id} className="flex items-center gap-6 p-6 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
                           <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-black text-slate-900 truncate">{r.serviceId?.title}</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Assigned to {r.providerId?.name}</p>
                        </div>
                        <div className="text-right shrink-0">
                           <Link to="/admin/verification-queue" className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">Insight</Link>
                        </div>
                     </div>
                   ))}
                 </div>
              ) : (
                 <div className="text-center py-16">
                   <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Queue Fully Verified</p>
                 </div>
              )}
            </div>
          </div>

          {/* Top Performers Module (Admin Specific) */}
          <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <h2 className="text-xl font-black mb-8 relative z-10 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Marketplace Performance
            </h2>
            
            <div className="space-y-10 relative z-10">
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Revenue Leaders (Provider)</p>
                    {stats?.performance?.topProvidersByEarnings?.map((p, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-white/20">{i+1}</span>
                                <span className="text-sm font-black">{p.name}</span>
                            </div>
                            <span className="text-xs font-black text-blue-400">Rs. {p.totalEarnings.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 pt-8 border-t border-white/10">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Client Engagement leaders</p>
                    {stats?.performance?.topClients?.map((c, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-white/20">{i+1}</span>
                                <span className="text-sm font-black">{c.name}</span>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.count} Cycles Initiated</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trends */}
          <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-blue-900/5 border border-slate-50">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Revenue Split Growth
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.revenue?.monthlyTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="platformRevenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-blue-900/5 border border-slate-50 flex flex-col justify-center">
            <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-600" /> Booking Velocity (Global)
            </h3>
            <div className="grid grid-cols-3 gap-6">
               <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last 7 Days</p>
                  <p className="text-4xl font-black text-slate-900">{stats?.bookings?.periodicStats?.last7Days || 0}</p>
               </div>
               <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last 30 Days</p>
                  <p className="text-4xl font-black text-slate-900">{stats?.bookings?.periodicStats?.lastMonth || 0}</p>
               </div>
               <div className="text-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Year</p>
                  <p className="text-4xl font-black text-slate-900">{stats?.bookings?.periodicStats?.lastYear || 0}</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
