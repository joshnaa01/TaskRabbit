import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    Calendar,
    CheckCircle2,
    TrendingUp,
    MessageCircle,
    MapPin,
    ArrowUpRight,
    Search,
    LayoutDashboard,
    Briefcase,
    Activity,
    Users,
    CircleDollarSign,
    Target,
    RefreshCcw,
    ArrowRight,
    Clock,
    DollarSign,
    Inbox,
    LocateFixed
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const miniMapIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [1, -34],
    shadowSize: [32, 32]
});

const DashboardOverview = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [adminStats, setAdminStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashData = async () => {
        try {
            setLoading(true);
            const [bookRes, chatRes, catRes] = await Promise.all([
                api.get('/bookings/my'),
                api.get('/chat/conversations'),
                api.get('/categories')
            ]);

            setBookings(bookRes.data.data || bookRes.data || []);
            setConversations((chatRes.data.data || []).slice(0, 5));
            setCategories((catRes.data.data || []).slice(0, 8));

            if (user?.role === 'admin') {
                const statsRes = await api.get('/admin/stats');
                setAdminStats(statsRes.data.data);
            }
        } catch (err) {
            console.error('Data Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashData();
    }, [user]);

    const isAdmin = user?.role === 'admin';
    const isProvider = user?.role === 'provider';
    const isClient = user?.role === 'client';

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'In Progress': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // --- ADMIN VIEW ---
    if (isAdmin) {
        const pieData = [
            { name: 'Clients', value: adminStats?.users?.clients || 10, color: '#3B82F6' },
            { name: 'Providers', value: adminStats?.users?.providers || 5, color: '#10B981' }
        ];

        const trendData = adminStats?.revenue?.monthlyTrends || [
            { name: 'Mon', platformRevenue: 400 },
            { name: 'Tue', platformRevenue: 300 },
            { name: 'Wed', platformRevenue: 600 },
            { name: 'Thu', platformRevenue: 800 },
            { name: 'Fri', platformRevenue: 500 },
            { name: 'Sat', platformRevenue: 900 },
            { name: 'Sun', platformRevenue: 1200 }
        ];

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-lg font-black text-slate-950 uppercase tracking-tighter leading-none">Dashboard Overview</h1>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1.5 leading-none">Platform metrics and statistics</p>
                    </div>
                    <button
                        onClick={fetchDashData}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 text-white rounded text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-black/5"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Sync Data
                    </button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Revenue', value: adminStats?.revenue?.platformEarnings || 0, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { title: 'Active', value: adminStats?.bookings?.active || 0, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { title: 'Registered', value: adminStats?.users?.total || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { title: 'Growth', value: '+12%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.title}</p>
                                <p className="text-sm font-black text-slate-900 tracking-tight truncate">
                                    {typeof stat.value === 'number' && stat.title.includes('Revenue') ? `Rs. ${stat.value.toLocaleString()}` : stat.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Revenue Trend */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-blue-500" />
                                Revenue History
                            </h3>
                        </div>
                        <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorRevs" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '10px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="platformRevenue" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevs)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* User Distribution */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                        <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-purple-500" />
                            User Distribution
                        </h3>
                        <div className="h-40 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={45} outerRadius={60} paddingAngle={8} dataKey="value" stroke="none">
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ fontSize: '10px', fontWeight: 'bold', borderRadius: '8px' }} />
                                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '8px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-auto pt-6">
                            <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 leading-none italic">Top Performers</h4>
                            <div className="space-y-2.5">
                                {adminStats?.performance?.topProvidersByEarnings?.slice(0, 3).map((p, i) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <span className="font-bold text-slate-600 uppercase tracking-tight truncate mr-2">{p.name}</span>
                                        <span className="font-black text-slate-950 shrink-0">Rs. {p.totalEarnings.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lists Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Recent Bookings */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                Recent Bookings
                            </h3>
                            <Link to="/admin/bookings" className="text-[8px] text-blue-600 font-black uppercase tracking-widest hover:underline">View All</Link>
                        </div>
                        <div className="space-y-2">
                            {bookings.map(b => (
                                <div key={b._id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-100 transition-all">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded bg-white border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                            <Briefcase className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-[10px] text-slate-900 truncate uppercase mt-0.5">{b.serviceId?.title}</p>
                                            <p className="text-[7px] text-slate-400 uppercase font-black tracking-widest leading-none mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border shrink-0 ${getStatusStyle(b.status)}`}>
                                        {b.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                                <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
                                Recent Messages
                            </h3>
                            <Link to="/admin/messages" className="text-[8px] text-blue-600 font-black uppercase tracking-widest hover:underline">Open Messages</Link>
                        </div>
                        <div className="space-y-2">
                            {conversations.length > 0 ? conversations.map(c => {
                                const other = c.participants.find(p => p._id !== user.id);
                                return (
                                    <div key={c._id} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-50 hover:bg-white hover:border-slate-100 transition-all cursor-pointer" onClick={() => navigate(`/admin/messages?to=${other?._id}`)}>
                                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center font-black text-[10px] shrink-0">
                                            {other?.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-[10px] text-slate-900 truncate uppercase">{other?.name || 'Null User'}</p>
                                            <p className="text-[8px] text-slate-400 truncate font-bold mt-0.5">{c.lastMessage}</p>
                                        </div>
                                        <ArrowRight className="w-3 h-3 text-slate-300" />
                                    </div>
                                );
                            }) : (
                                <div className="text-center py-6">
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">No active relays.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- CLIENT/PROVIDER GENERAL VIEW ---
    const activeTasks = bookings.filter(b => ['Pending', 'Accepted', 'In Progress', 'Pending Review'].includes(b.status));

    // Calculate simple stats
    const totalEarnings = bookings.filter(b => b.status === 'Completed').reduce((acc, b) => acc + (b.commissionProvider || ((b.finalPrice || 0) * 0.7)), 0);
    const totalSpent = bookings.filter(b => b.paid).reduce((acc, b) => acc + (b.finalPrice || 0), 0);
    const completedTasks = bookings.filter(b => b.status === 'Completed').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm shadow-blue-900/5">
                <div>
                    <h1 className="text-xl font-black text-slate-950 uppercase tracking-tighter leading-none italic">Welcome back, {user?.name?.split(' ')[0]}</h1>
                    <p className="text-slate-400 mt-1.5 text-[9px] font-black uppercase tracking-widest leading-none">Your account is active and ready</p>
                </div>
                <div className="flex gap-2">
                    {isClient && (
                        <Link
                            to="/search"
                            className="px-4 py-2 bg-slate-950 text-white rounded text-[8px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:bg-slate-900 transition-all active:scale-95 flex items-center gap-2"
                        >
                            Process New Order
                        </Link>
                    )}
                    <button
                        onClick={fetchDashData}
                        className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors border border-slate-100"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: isProvider ? 'Total Earnings' : 'Total Spent', value: isProvider ? totalEarnings : totalSpent, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { title: 'Active Bookings', value: activeTasks.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'Completed Tasks', value: completedTasks, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.title}</p>
                            <p className="text-sm font-black text-slate-950 tracking-tight leading-none">
                                {(stat.title === 'Total Earnings' || stat.title === 'Total Spent') ? `Rs. ${stat.value.toLocaleString()}` : stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main feed (left column) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Disputes Alert */}
                    {bookings.some(b => b.status === 'Disputed' || b.isDisputed) && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-[10px] font-black text-red-900 uppercase tracking-widest flex items-center gap-2 italic">
                                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                                    Dispute Alert
                                </h2>
                                <Link to={`/${isClient ? 'client' : 'bookings'}`} className="text-red-600 font-black text-[8px] uppercase tracking-widest hover:underline">
                                    View Details
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {bookings.filter(b => b.status === 'Disputed' || b.isDisputed).slice(0, 2).map(task => (
                                    <div key={task._id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-red-200/50">
                                        <div className="min-w-0">
                                            <p className="font-black text-red-900 text-[11px] truncate uppercase tracking-tight leading-none mb-1">{task.serviceId?.title}</p>
                                            <p className="text-[7px] text-red-600 font-black uppercase tracking-widest leading-none">Protocol Error: {task.status}</p>
                                        </div>
                                        <Link to={`/${isClient ? 'client' : 'provider'}/messages?to=${isClient ? task.providerId?._id : task.clientId?._id}`} className="p-2 bg-red-100/50 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Bookings Section */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-slate-500">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-[10px] font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                                <Inbox className="w-3.5 h-3.5 text-blue-500" />
                                Recent Activity
                            </h2>
                            <Link to={`/${isClient ? 'client' : 'provider'}/bookings`} className="text-blue-600 text-[8px] font-black uppercase tracking-widest hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-2.5">
                            {activeTasks.length > 0 ? activeTasks.map(task => (
                                <Link
                                    key={task._id}
                                    to={`/${isClient ? 'client' : 'provider'}/bookings`}
                                    className="block p-3 rounded-xl border border-slate-50 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all bg-slate-50/50 hover:bg-white"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-black text-[11px] text-slate-900 uppercase tracking-tight">{task.serviceId?.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${getStatusStyle(task.status)} shadow-sm`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <Calendar className="w-2.5 h-2.5" />
                                            <span>{new Date(task.date || task.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <Users className="w-2.5 h-2.5" />
                                            <span className="truncate">{isClient ? task.providerId?.name : task.clientId?.name}</span>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="text-center py-12 bg-slate-50/30 rounded-xl border border-slate-100 border-dashed">
                                    <Inbox className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">No active nodes detected</p>
                                    {isClient && (
                                        <Link to="/search" className="inline-block px-6 py-2 bg-slate-950 text-white rounded text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-black/10">
                                            Query Market
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category quick links (Client Only) */}
                    {isClient && (
                        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                            <h2 className="text-[10px] font-black text-slate-950 uppercase tracking-widest mb-5 flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                Recommended Blueprints
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {categories.slice(0, 4).map(cat => (
                                    <Link
                                        key={cat._id}
                                        to={`/search?category=${cat._id}`}
                                        className="p-4 rounded-xl bg-slate-50/50 hover:bg-slate-950 hover:text-white transition-all duration-300 border border-slate-100 text-center flex flex-col items-center gap-3 group shadow-sm active:scale-95"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-slate-950 shadow-sm transition-colors shrink-0">
                                            <Briefcase className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-black text-[9px] uppercase tracking-widest text-slate-700 group-hover:text-white transition-colors truncate w-full">{cat.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar (right column) */}
                <div className="space-y-6">
                    {/* Messages Widget */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-[10px] font-black text-slate-950 uppercase tracking-widest flex items-center gap-2">
                                <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
                                Recent Messages
                            </h2>
                            <Link to={`/${isClient ? 'client' : 'provider'}/messages`} className="text-blue-600 text-[8px] font-black uppercase tracking-widest hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {conversations.length > 0 ? conversations.map(c => {
                                const other = c.participants.find(p => p._id !== user.id);
                                return (
                                    <Link
                                        key={c._id}
                                        to={`/${isClient ? 'client' : 'provider'}/messages?to=${other?._id}`}
                                        className="flex gap-3 p-2.5 rounded-lg border border-slate-50 hover:bg-slate-50/50 transition-all hover:border-slate-100"
                                    >
                                        <div className="shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-black text-[10px] shadow-sm">
                                                {other?.name?.charAt(0) || '?'}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h4 className="font-black text-slate-900 truncate uppercase tracking-tight text-[10px] leading-none">{other?.name}</h4>
                                                <span className="text-[7px] font-black uppercase tracking-widest text-slate-300 shrink-0 ml-2">{new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 truncate font-bold">{c.lastMessage}</p>
                                        </div>
                                    </Link>
                                );
                            }) : (
                                <div className="text-center py-10 opacity-30">
                                    <MessageCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Null communication</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Map Widget (Provider Only) */}
                    {isProvider && (
                        <div className="bg-slate-950 p-6 rounded-xl text-white shadow-2xl shadow-blue-900/10 group/map relative overflow-hidden transition-all duration-500 hover:shadow-blue-500/10 border border-white/5">
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div>
                                    <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-1 text-blue-400">
                                        <LocateFixed className="w-4 h-4 group-hover/map:rotate-12 transition-transform" />
                                        Deployment Center
                                    </h2>
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">Global Sync Status: Active</p>
                                </div>
                                <Link to="/dashboard/profile" className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-all border border-white/10">
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                            
                            <div className="h-40 w-full rounded-lg overflow-hidden border border-white/5 shadow-inner relative z-10">
                                <MapContainer center={[user?.location?.coordinates[1] || 27.717, user?.location?.coordinates[0] || 85.324]} zoom={13} zoomControl={false} className="h-full w-full grayscale-[0.5] contrast-[1.2] opacity-80 group-hover/map:opacity-100 transition-opacity duration-1000">
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[user?.location?.coordinates[1] || 27.717, user?.location?.coordinates[0] || 85.324]} icon={miniMapIcon} />
                                </MapContainer>
                            </div>
                            
                            <div className="mt-4 flex flex-col gap-2 relative z-10">
                                <div className="p-2.5 bg-white/5 rounded-lg border border-white/5">
                                    <p className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none mb-1.5 leading-none">Network Address</p>
                                    <p className="text-[9px] font-black text-blue-100 truncate italic">"{user?.location?.address || 'Searching for physical node...'}"</p>
                                </div>
                            </div>
                            
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] transition-all group-hover:scale-110"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
