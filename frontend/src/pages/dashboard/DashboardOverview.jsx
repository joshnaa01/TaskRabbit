import { useState, useEffect } from 'react';
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
  CheckCircle,
  XCircle,
  Terminal,
  RefreshCw,
  MoreVertical,
  Briefcase,
  Target,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from '../../context/LocationContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DashboardOverview = () => {
    const { user } = useAuth();
    const { coords, error: geoError } = useLocation();
    const [bookings, setBookings] = useState([]);
    const [adminStats, setAdminStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings/my');
            setBookings(res.data.data || res.data || []);
            
            if (user?.role === 'admin') {
                const statsRes = await api.get('/admin/stats');
                setAdminStats(statsRes.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();

        // Re-enable operational geolocation sync for providers
        if (user?.role === 'provider' && navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(
                 async (position) => {
                     try {
                         await api.put('/auth/profile', {
                             lat: position.coords.latitude,
                             lng: position.coords.longitude
                         });
                         console.log("Operational Hub Sync: Success");
                     } catch (err) {
                         console.error("Operational Hub Sync: Failed");
                     }
                 },
                 (error) => console.log("Signal Interrupted: Location denied", error)
             );
        }
    }, [user]);

    const handleAction = async (status, bookingId) => {
        try {
            await api.put(`/bookings/${bookingId}/status`, { status });
            toast.success(`Task ${status === 'Accepted' ? 'Authorized' : 'Dismissed'}`);
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const activeBookings = bookings.filter(b => ['Pending', 'Accepted', 'In Progress'].includes(b.status)).length;
    const completedBookings = bookings.filter(b => b.status === 'Completed').length;
    
    // Earnings calculation (70/30 split) - Tracks all completed work
    const totalProviderEarnings = bookings.filter(b => b.status === 'Completed').reduce((acc, b) => acc + (b.commissionProvider || 0), 0);
    const totalPlatformRevenue = adminStats?.revenue?.platformEarnings || 0;

    const stats = user?.role === 'provider' ? [
        { label: 'My Earnings', value: loading ? '...' : `Rs. ${totalProviderEarnings.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: TrendingUp },
        { label: 'Active Jobs', value: loading ? '...' : activeBookings, color: 'text-blue-600', bg: 'bg-blue-50', icon: Zap },
        { label: 'Platform Fee (30%)', value: loading ? '...' : `Rs. ${(totalProviderEarnings / 0.7 * 0.3).toFixed(0)}`, color: 'text-slate-400', bg: 'bg-slate-50', icon: Target },
        { label: 'Avg Rating', value: '4.9', color: 'text-amber-600', bg: 'bg-amber-50', icon: Star }
    ] : user?.role === 'admin' ? [
        { label: 'Total Revenue', value: loading ? '...' : `Rs. ${totalPlatformRevenue.toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-50', icon: TrendingUp },
        { label: 'Market Volume', value: loading ? '...' : `Rs. ${adminStats?.revenue?.totalVolume?.toLocaleString() || 0}`, color: 'text-slate-900', bg: 'bg-white', icon: Target },
        { label: 'Pending Bookings', value: loading ? '...' : adminStats?.bookings?.active || 0, color: 'text-amber-600', bg: 'bg-amber-50', icon: Zap },
        { label: 'Total Users', value: loading ? '...' : adminStats?.users?.total || 0, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Zap }
    ] : [
        { label: 'Total Tasks', value: loading ? '...' : bookings.length, color: 'text-slate-900', bg: 'bg-white', icon: Target },
        { label: 'Active Tasks', value: loading ? '...' : activeBookings, color: 'text-blue-600', bg: 'bg-blue-50', icon: Zap },
        { label: 'Completed', value: loading ? '...' : completedBookings, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
        { label: 'Total Spent', value: `Rs. ${bookings.reduce((acc, b) => acc + (b.finalPrice || 0), 0)}`, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Target }
    ];

    const isClient = user?.role === 'client';

    return (
        <div className="flex flex-col gap-10">
            {/* Unified Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        {user?.role === 'provider' ? 'Provider Console' : user?.role === 'admin' ? 'Administrative Core' : 'Account Intelligence Hub'}, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2 tracking-[0.2em]">
                        {user?.role === 'provider' ? 'Maintain your performance ceiling and operational flow' : user?.role === 'admin' ? 'Strategic oversight of the marketplace economy' : 'Overview of your active service procurement'}
                    </p>
                </div>

                {user?.role === 'admin' && (
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        {['7d', '30d', '1y'].map(p => (
                           <button key={p} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">{p}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* ACTION PRIORITY (Client): Latest Unpaid Completed Booking */}
            {user?.role === 'client' && bookings.filter(b => b.status === 'Completed' && !b.paid).length > 0 && (
                <div className="bg-slate-900 rounded-[44px] p-1 shadow-2xl shadow-indigo-900/40 animate-in fade-in slide-in-from-top duration-700">
                    <div className="bg-white rounded-[42px] p-10 flex flex-col lg:flex-row items-center gap-10 border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        
                        <div className="lg:w-1/3 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-indigo-600 animate-ping"></div>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Action: Pay Now</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 leading-tight">Payment Due</h2>
                            <p className="text-slate-500 text-sm font-medium">The technician has completed the task. Please pay the remaining balance to close the booking.</p>
                        </div>

                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(() => {
                                const latestUnpaid = [...bookings].filter(b => b.status === 'Completed' && !b.paid).sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
                                const displayPrice = latestUnpaid.finalPrice || latestUnpaid.originalPrice || 0;
                                return (
                                    <>
                                        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex items-center gap-6 group hover:bg-indigo-50 transition-colors">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-slate-100">
                                               <CreditCard className="w-7 h-7" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{latestUnpaid.serviceId?.title}</p>
                                                <p className="text-lg font-black text-slate-900 truncate tracking-tight">Amount: Rs. {displayPrice.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <button 
                                                onClick={() => window.location.href = `/client/checkout/${latestUnpaid._id}`}
                                                className="w-full h-full bg-indigo-600 hover:bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 py-6"
                                            >
                                                Pay and Close
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* ACTION PRIORITY (Provider): New Booking Request */}
            {user?.role === 'provider' && bookings.filter(b => b.status === 'Pending').length > 0 && (
                <div className="bg-slate-900 rounded-[44px] p-1 shadow-2xl shadow-blue-900/40 animate-in fade-in slide-in-from-top duration-700">
                    <div className="bg-white rounded-[42px] p-10 flex flex-col lg:flex-row items-center gap-10 border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        
                        <div className="lg:w-1/3 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">New Request</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 leading-tight">Booking Request</h2>
                            <p className="text-slate-500 text-sm font-medium">A client has requested your service. Please check the details and accept the task.</p>
                        </div>

                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(() => {
                                const latestPending = [...bookings].filter(b => b.status === 'Pending').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                                return (
                                    <>
                                        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex items-center gap-6 group hover:bg-blue-50 transition-colors">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm ring-1 ring-slate-100">
                                               {latestPending.serviceId?.serviceType === 'remote' ? <Terminal className="w-7 h-7" /> : <MapPin className="w-7 h-7" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{latestPending.serviceId?.title}</p>
                                                <p className="text-lg font-black text-slate-900 truncate tracking-tight">{latestPending.clientId?.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 items-center">
                                            <button 
                                                onClick={() => handleAction('Accepted', latestPending._id)}
                                                className="w-full h-full bg-blue-600 hover:bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 py-4"
                                            >
                                                Accept Booking
                                            </button>
                                            <button 
                                                onClick={() => handleAction('Rejected', latestPending._id)}
                                                className="w-full md:w-20 h-full md:h-full bg-white border border-slate-100 text-slate-300 hover:text-red-500 rounded-[32px] flex items-center justify-center transition-all py-4"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {stats.map((stat, i) => (
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

            {/* Analytics & Performance View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Status Distribution or Trends */}
                <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 p-10 shadow-2xl shadow-blue-900/5">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-600" /> 
                            {user?.role === 'admin' ? 'Marketplace Velocity' : 'Production Trends'}
                        </h3>
                        {user?.role === 'admin' && (
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Revenue</span>
                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-100"></div> Volume</span>
                            </div>
                        )}
                    </div>
                    <div className="h-64 flex items-end justify-between gap-4 px-6 relative">
                        {/* Periodic Indicators (7d, 30d, 1y) for Admin */}
                        {user?.role === 'admin' && adminStats?.bookings?.periodicStats && (
                            <div className="absolute top-0 right-0 flex gap-6 pr-6">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">7D</p>
                                    <p className="text-lg font-black text-slate-900 leading-none">{adminStats.bookings.periodicStats.last7Days}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">30D</p>
                                    <p className="text-lg font-black text-slate-900 leading-none">{adminStats.bookings.periodicStats.lastMonth}</p>
                                </div>
                            </div>
                        )}

                        {(adminStats?.revenue?.monthlyTrends || [40, 60, 45, 80, 55, 70, 90, 60]).map((item, i) => {
                            const val = typeof item === 'number' ? item : item.platformRevenue;
                            return (
                                <div key={i} className="flex-1 group relative">
                                    <div 
                                        className={`w-full ${val > 50 ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-slate-100'} rounded-t-2xl transition-all duration-1000 group-hover:scale-x-105`} 
                                        style={{ height: `${(val / (user?.role === 'admin' ? 5000 : 1)) || 20}%`, minHeight: '8px' }}
                                    ></div>
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {item.name || `T-${7-i}`}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Performers Module (Admin Only) */}
                {user?.role === 'admin' ? (
                    <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl shadow-blue-900/20 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-xl"></div>
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Top Nodes
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Revenue Leaders (Provider)</p>
                                {adminStats?.performance?.topProvidersByEarnings?.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black">{i+1}</div>
                                            <span className="text-sm font-black truncate max-w-[120px]">{p.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-blue-400">Rs. {p.totalEarnings.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Top Procuring Clients</p>
                                {adminStats?.performance?.topClients?.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-black">{i+1}</div>
                                            <span className="text-sm font-black truncate max-w-[120px]">{c.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.count} Tasks</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`${isClient ? 'bg-white border border-slate-100' : 'bg-slate-900'} rounded-[40px] p-10 shadow-2xl shadow-blue-900/20 relative overflow-hidden transition-colors`}>
                        <div className={`absolute top-0 right-0 w-64 h-64 ${isClient ? 'bg-blue-600/5' : 'bg-blue-600/10'} rounded-full -mr-32 -mt-32 blur-3xl`}></div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex items-center gap-4 mb-10">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ring-8 ${isClient ? 'bg-blue-600 text-white ring-blue-50' : 'bg-white/10 text-white ring-white/5'}`}>
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-black ${isClient ? 'text-slate-900' : 'text-white'}`}>{user?.role === 'provider' ? 'Payout Wallet' : 'Billing Insight'}</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Financial Portal</p>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center gap-6">
                                <div>
                                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">
                                            {user?.role === 'provider' ? 'Held for Payout (70%)' : 'Net Expenditure'}
                                    </p>
                                    <h2 className={`text-5xl font-black tracking-tighter ${isClient ? 'text-slate-900' : 'text-white'}`}>Rs. {user?.role === 'provider' ? totalProviderEarnings.toLocaleString() : bookings.reduce((acc, b) => acc + (b.finalPrice || 0), 0).toLocaleString()}</h2>
                                </div>
                                <div className="flex gap-4">
                                    <div className={`flex-1 border p-5 rounded-2xl ${isClient ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/10'}`}>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-emerald-500">Completed</p>
                                        <p className={`text-lg font-black ${isClient ? 'text-slate-900' : 'text-white'}`}>{completedBookings}</p>
                                    </div>
                                    <div className={`flex-1 border p-5 rounded-2xl ${isClient ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/10'}`}>
                                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-amber-500">Pipeline</p>
                                        <p className={`text-lg font-black ${isClient ? 'text-slate-900' : 'text-white'}`}>{activeBookings}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardOverview;
