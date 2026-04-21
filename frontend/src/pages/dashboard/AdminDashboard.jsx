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
  ArrowRight,
  LayoutGrid,
  Shield,
  MessageSquare,
  ChevronDown
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

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, gradient }) => (
  <div className={`group relative bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-start gap-3 transition-all hover:shadow-xl hover:-translate-y-0.5 overflow-hidden`}>
    <div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-2xl`}></div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-500 ${colorClass}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="min-w-0 relative">
      <h3 className="text-slate-400 font-black uppercase tracking-widest text-[8px] mb-1 leading-none">{title}</h3>
      <p className="text-lg font-black text-slate-950 tracking-tighter leading-none">{value}</p>
      {subtitle && <p className="text-slate-400 font-bold text-[8px] truncate mt-1 bg-slate-50 px-1.5 py-0.5 rounded leading-none inline-block">{subtitle}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('overview');
  const [isViewDropOpen, setIsViewDropOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, reviewsRes, chatRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/completion-reviews'),
          api.get('/chat/conversations')
        ]);
        setStats(statsRes.data.data);
        setPendingReviews(reviewsRes.data.data || []);
        setConversations(chatRes.data.data?.slice(0, 5) || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-6 animate-pulse">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Loading Dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="p-12 text-center bg-red-50/50 rounded-[3rem] border-2 border-dashed border-red-100 animate-in zoom-in duration-500">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Error</p>
      <p className="text-xs text-red-900 mt-2 font-medium">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Try Again</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Glossy Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tighter flex items-center gap-2.5 uppercase">
            Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Platform Snapshot</p>
          </div>
        </div>

        <div className="relative">
            <button
              onClick={() => setIsViewDropOpen(!isViewDropOpen)}
              className="flex items-center gap-2 bg-white border border-slate-100 pr-3 pl-4 py-2 rounded-xl hover:bg-slate-50 transition-all active:scale-95 group"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">
                {view === 'overview' ? 'Overview' : 'Statistics'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isViewDropOpen ? 'rotate-180' : ''}`} />
            </button>
 
            {isViewDropOpen && (
              <>
            <div className="fixed inset-0 z-40" onClick={() => setIsViewDropOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-slate-100 shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutGrid },
                { id: 'statistics', label: 'Detailed Stats', icon: BarChart3 }
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => { setView(v.id); setIsViewDropOpen(false); }}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-all ${view === v.id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <v.icon className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">{v.label}</span>
                </button>
              ))}
            </div>
              </>
            )}
        </div>
      </div>

      {/* Main Stats Cluster */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Users"
          value={stats?.users?.total || 0}
          subtitle={`${stats?.users?.clients || 0} CL / ${stats?.users?.providers || 0} PR`}
          icon={Users}
          colorClass="bg-blue-50 text-blue-600"
          gradient="from-blue-400 to-transparent"
        />
        <StatCard
          title="Revenue"
          value={`Rs. ${stats?.revenue?.platformEarnings?.toLocaleString() || 0}`}
          subtitle="TOTAL EARNINGS"
          icon={TrendingUp}
          colorClass="bg-emerald-50 text-emerald-600"
          gradient="from-emerald-400 to-transparent"
        />
        <StatCard
          title="Transactions"
          value={`Rs. ${stats?.revenue?.totalVolume?.toLocaleString() || 0}`}
          subtitle="TOTAL VOLUME"
          icon={DollarSign}
          colorClass="bg-indigo-50 text-indigo-600"
          gradient="from-indigo-400 to-transparent"
        />
        <StatCard
          title="Bookings"
          value={stats?.bookings?.active || 0}
          subtitle="ACTIVE BOOKINGS"
          icon={Activity}
          colorClass="bg-amber-50 text-amber-600"
          gradient="from-amber-400 to-transparent"
        />
      </div>

      {view === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Reviews Deck */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 flex flex-col shadow-sm overflow-hidden h-[260px]">
                <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                  <h2 className="text-[9px] font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Pending Reviews
                  </h2>
                  <Link to="/admin/verification-queue" className="text-[8px] font-black uppercase tracking-widest text-blue-600 hover:underline">View All</Link>
                </div>
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar bg-white">
                  {pendingReviews.length > 0 ? (
                    <div className="space-y-2">
                      {pendingReviews.map(r => (
                        <div key={r._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/30 border border-transparent hover:border-slate-100 hover:bg-white transition-all group">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 text-slate-400 text-[9px] font-black">
                            {r.serviceId?.title?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-900 truncate uppercase mt-0.5">{r.serviceId?.title}</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate">{r.providerId?.name}</p>
                          </div>
                          <Link to="/admin/verification-queue" className="w-7 h-7 bg-white text-slate-300 rounded-lg flex items-center justify-center hover:text-blue-600 transition-all border border-slate-100 shadow-sm">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                      <CheckCircle2 className="w-6 h-6 mb-1.5" />
                      <p className="text-[8px] font-black uppercase">No pending reviews</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messaging Widget */}
            <div className="bg-white rounded-2xl border border-slate-100 flex flex-col shadow-sm overflow-hidden h-[260px]">
                <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                  <h2 className="text-[9px] font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-600" /> Recent Chats
                  </h2>
                  <Link to="/admin/messages" className="text-[8px] font-black uppercase tracking-widest text-purple-600 hover:underline">All Messages</Link>
                </div>
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar bg-white">
                  {conversations.length > 0 ? (
                    <div className="space-y-2">
                      {conversations.map(c => (
                        <div key={c._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/30 border border-transparent hover:border-slate-100 hover:bg-white transition-all group">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0 text-slate-400 font-black text-[9px]">
                            {c.participants?.[0]?.name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-950 truncate uppercase mb-0.5">{c.participants?.[0]?.name || 'Unknown'}</p>
                            <p className="text-[8px] text-slate-400 font-bold truncate italic">"{c.lastMessage?.content || 'No input'}"</p>
                          </div>
                          <Link to={`/admin/messages?conversationId=${c._id}`} className="w-7 h-7 bg-white text-slate-300 rounded-lg flex items-center justify-center hover:text-purple-600 transition-all border border-slate-100 shadow-sm">
                            <MessageSquare className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                      <MessageSquare className="w-6 h-6 mb-1.5" />
                      <p className="text-[8px] font-black uppercase">No active messages</p>
                    </div>
                  )}
                </div>
            </div>
          </div>

          {/* Performance Radar in Deep Slate */}
          {/* Rank Matrix */}
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-xl">
            <div className="relative p-6 flex flex-col h-full gap-6">
              <div>
                <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <TrendingUp className="w-3 h-3" /> Top Providers
                </p>
                <div className="space-y-3.5">
                  {stats?.performance?.topProvidersByEarnings?.slice(0, 4).map((p, i) => (
                    <div key={i} className="flex flex-col gap-1.5 group/item">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white/80 truncate flex items-center gap-2 italic uppercase">
                          <span className="text-white/20 text-[8px] font-black not-italic">{i + 1}</span> {p.name}
                        </span>
                        <span className="font-black text-white">Rs. {p.totalEarnings.toLocaleString()}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-1000"
                          style={{ width: `${Math.max(20, 100 - (i * 15))}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Users className="w-3 h-3" /> Top Clients
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {stats?.performance?.topClients?.slice(0, 4).map((c, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                      <span className="block text-[7px] font-black text-white/30 uppercase tracking-widest mb-1 truncate">{c.name}</span>
                      <span className="block text-xs font-black text-emerald-400 leading-none">{c.count} TX</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="mt-auto w-full py-3 bg-white/5 hover:bg-white text-white hover:text-slate-950 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10">
                View Reports
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Revenue Trends
              </h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50/50 rounded-md">
                <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                <span className="text-[8px] font-black text-blue-600 uppercase">System Active</span>
              </div>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.revenue?.monthlyTrends || []}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#cbd5e1' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#cbd5e1' }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc', radius: 4 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: 8 }}
                  />
                  <Bar dataKey="platformRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Matrix */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-emerald-600" /> Activity Stats
              </h3>
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Recent Activity</span>
            </div>
            <div className="grid grid-cols-3 gap-3 flex-1 items-center">
              {[
                { label: '7 Days', val: stats?.bookings?.periodicStats?.last7Days || 0, c: 'text-blue-600' },
                { label: '30 Days', val: stats?.bookings?.periodicStats?.lastMonth || 0, c: 'text-indigo-600' },
                { label: 'Yearly', val: stats?.bookings?.periodicStats?.lastYear || 0, c: 'text-slate-950' }
              ].map((v, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">{v.label}</p>
                  <p className={`text-xl font-black ${v.c} tracking-tighter leading-none`}>{v.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminDashboard;
