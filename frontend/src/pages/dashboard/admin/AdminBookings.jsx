import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { 
  Terminal, 
  MapPin, 
  ChevronDown, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  XCircle,
  Activity,
  Shield,
  Search,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/bookings/my');
            setBookings(res.data.data || res.data || []);
        } catch (err) {
            toast.error('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const handleVerdict = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            toast.success(`Booking ${status}.`);
            fetchBookings();
        } catch (err) {
            toast.error('Action failed.');
        }
    };

    const sortedBookings = bookings
        .filter(b => activeFilter === 'all' || b.status === activeFilter);

    if (loading) return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Loading Bookings...</p>
      </div>
    );

    const totalPages = Math.ceil(sortedBookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = sortedBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header & Filter Dock */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-100/50">
                <div>
                    <h1 className="text-xl font-black text-slate-950 tracking-tighter leading-none uppercase">Bookings</h1>
                    <div className="flex items-center gap-2 mt-2">
                       <p className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[7px] font-black uppercase tracking-widest leading-none">{bookings.length} TOTAL</p>
                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Active</p>
                   </div>
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'Pending Review', label: 'Review' },
                        { key: 'Accepted', label: 'Active' },
                        { key: 'Completed', label: 'Done' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveFilter(tab.key); setCurrentPage(1); }}
                            className={`px-3 py-1.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
                                activeFilter === tab.key 
                                ? 'bg-slate-950 text-white shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* High-Density Table Console */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100/50">
                            <th className="px-5 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Service</th>
                            <th className="px-5 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Users</th>
                            <th className="px-5 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                            <th className="px-5 py-2.5 text-right text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {paginatedBookings.map((booking) => (
                            <React.Fragment key={booking._id}>
                                <tr 
                                    className={`group transition-all cursor-pointer relative ${expandedBooking === booking._id ? 'bg-blue-50/20' : 'hover:bg-slate-50/30'}`} 
                                    onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                                >
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm shrink-0">
                                                {booking.serviceId?.serviceType === 'remote' ? <Terminal className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-xs text-slate-950 truncate uppercase tracking-tight">{booking.serviceId?.title || 'System Task'}</p>
                                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">HEX: {booking._id?.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex flex-col gap-1 items-center">
                                            <p className="text-[8px] font-black text-slate-700 uppercase tracking-tighter shrink-0">C: {booking.clientId?.name}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter shrink-0">P: {booking.providerId?.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border transition-all ${
                                            booking.status === 'Completed' ? 'bg-emerald-600 text-white border-emerald-600' : 
                                            booking.status === 'Pending Review' ? 'bg-amber-500 text-white border-amber-500' : 
                                            'bg-slate-950 text-white border-slate-950 text-[7px]'
                                        }`}>{booking.status}</span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        {booking.status === 'Pending Review' ? (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleVerdict(booking._id, 'Completed'); }}
                                                    className="px-3 py-1.5 bg-emerald-600 text-white rounded text-[8px] font-black uppercase tracking-widest hover:bg-slate-950 transition-all shadow-sm"
                                                >
                                                    VERIFY
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleVerdict(booking._id, 'Rejected'); }}
                                                    className="px-3 py-1.5 bg-red-600 text-white rounded text-[8px] font-black uppercase tracking-widest hover:bg-slate-950 transition-all shadow-sm"
                                                >
                                                    CANCEL
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1.5">
                                                 <button 
                                                     className={`px-3 py-1.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${expandedBooking === booking._id ? 'bg-slate-950 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-950'}`}
                                                 >
                                                     VIEW
                                                 </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                {expandedBooking === booking._id && (
                                    <tr className="bg-slate-50/10">
                                        <td colSpan="4" className="px-5 py-6 transition-all animate-in zoom-in-95 duration-200 border-b border-slate-50">
                                            <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-100 p-5 shadow-lg space-y-5">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2 italic">
                                                            <Activity className="w-2.5 h-2.5" /> Client Notes
                                                        </h4>
                                                        <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 text-[10px] text-slate-600 leading-relaxed font-bold italic">
                                                            "{booking.requirements?.description || 'No notes provided.'}"
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2 italic">
                                                            <Shield className="w-2.5 h-2.5" /> Provider Work
                                                        </h4>
                                                        <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 space-y-4">
                                                            {booking.deliverables?.message && <p className="text-[9px] font-bold text-slate-500 italic bg-white p-2.5 rounded border-l-2 border-emerald-500">"{booking.deliverables.message}"</p>}
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {booking.deliverables?.files?.map((f, i) => (
                                                                    <a key={i} href={f} target="_blank" rel="noreferrer" className="w-10 h-10 rounded border border-slate-100 overflow-hidden hover:scale-105 transition-all shadow-sm">
                                                                        <img src={f} className="w-full h-full object-cover" />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                            {(!booking.deliverables?.message && !booking.deliverables?.files?.length) && (
                                                                <div className="py-4 text-center opacity-40">
                                                                    <Activity className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                                                                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">No work submitted</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">
                <p>Showing: {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedBookings.length)} / {sortedBookings.length}</p>
                <div className="flex items-center gap-6">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">PREV</button>
                    <span className="text-slate-900 font-black">{currentPage} | {totalPages || 1}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">NEXT</button>
                </div>
            </div>
        </div>
    );
};

export default AdminBookings;
