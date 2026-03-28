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
  Search
} from 'lucide-react';
import { toast } from 'sonner';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/bookings/my');
            setBookings(res.data.data || res.data || []);
        } catch (err) {
            toast.error('Registry sync failure.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const handleVerdict = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            toast.success(`Protocol ${status} recorded.`);
            fetchBookings();
        } catch (err) {
            toast.error('Command execution failed.');
        }
    };

    const sortedBookings = bookings
        .filter(b => activeFilter === 'all' || b.status === activeFilter);

    if (loading) return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Accessing Platform Registry...</p>
      </div>
    );

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                    <Shield className="w-10 h-10 text-slate-900 fill-slate-900/5" /> Global Operations Ledger
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2 tracking-[0.2em]">High-level oversight of all active and historical platform transactions</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {[
                    { key: 'all', label: 'Universal Feed' },
                    { key: 'Pending Review', label: 'Verification Queue' },
                    { key: 'Accepted', label: 'Active Sessions' },
                    { key: 'Completed', label: 'Archived Cycles' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveFilter(tab.key)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            activeFilter === tab.key ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-[44px] shadow-2xl shadow-blue-900/5 border border-slate-50 overflow-hidden">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Transaction Context</th>
                            <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Stakeholders</th>
                            <th className="px-10 py-8 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">System Overwrite</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                        {sortedBookings.map((booking) => (
                            <React.Fragment key={booking._id}>
                                <tr className="group hover:bg-slate-50/30 transition-all cursor-pointer" onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}>
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                                {booking.serviceId?.serviceType === 'remote' ? <Terminal className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-base mb-1">{booking.serviceId?.title || 'System Entry'}</p>
                                                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">{booking.status}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-black text-slate-900">C: {booking.clientId?.name}</p>
                                            <p className="text-[10px] font-black text-slate-400">P: {booking.providerId?.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                        {booking.status === 'Pending Review' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleVerdict(booking._id, 'Completed'); }}
                                                    className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleVerdict(booking._id, 'Rejected'); }}
                                                    className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-500/10"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2 text-slate-300 font-black text-[10px] uppercase tracking-widest">
                                                Registry Log <ChevronDown className={`w-4 h-4 transition-transform ${expandedBooking === booking._id ? 'rotate-180' : ''}`} />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                {expandedBooking === booking._id && (
                                    <tr className="bg-slate-50/50">
                                        <td colSpan="3" className="px-10 py-12">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in duration-500">
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-blue-600" /> Interaction Log
                                                    </h4>
                                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-xs text-slate-500 leading-relaxed font-medium">
                                                        {booking.requirements?.description || 'No specialized parameters recorded.'}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                                        <UploadCloud className="w-4 h-4 text-emerald-600" /> Evidence Audit
                                                    </h4>
                                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                                                        {booking.deliverables?.message && <p className="text-xs font-semibold text-slate-600">{booking.deliverables.message}</p>}
                                                        <div className="flex flex-wrap gap-2">
                                                            {booking.deliverables?.files?.map((f, i) => (
                                                                <a key={i} href={f} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                                                    <img src={f} className="w-full h-full object-cover" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                        {(!booking.deliverables?.message && !booking.deliverables?.files?.length) && (
                                                            <div className="py-8 text-center opacity-20">
                                                                <Activity className="w-8 h-8 mx-auto mb-2" />
                                                                <p className="text-[8px] font-black uppercase">No Artifacts Archived</p>
                                                            </div>
                                                        )}
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
        </div>
    );
};

export default AdminBookings;
