import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
  FileText,
  CreditCard,
  Check,
  UserCircle,
  AlertCircle,
  MessageSquare,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  Download,
  Terminal,
  MapPin,
  RefreshCcw,
  Star,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import EvidenceModal from '../../../components/dashboard/EvidenceModal';

const STATUS_PRIORITY = { 'Pending': 0, 'Accepted': 1, 'In Progress': 2, 'Pending Review': 3, 'Completed': 4, 'Rejected': 5, 'Cancelled': 6 };
const ITEMS_PER_PAGE = 8;

const ProviderBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/bookings/my');
            setBookings(res.data.data || res.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const sortedBookings = [...bookings]
        .filter(b => activeFilter === 'all' || b.status === activeFilter)
        .sort((a, b) => {
            const pa = STATUS_PRIORITY[a.status] ?? 99;
            const pb = STATUS_PRIORITY[b.status] ?? 99;
            if (pa !== pb) return pa - pb;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const handleAction = async (action, bookingId, extraData = {}) => {
        setActionLoading(bookingId);
        try {
            switch (action) {
                case 'accept':
                    await api.put(`/bookings/${bookingId}/status`, { status: 'Accepted' });
                    toast.success('Booking accepted.');
                    break;
                case 'reject':
                    const reason = prompt('Reason for rejection:');
                    if (!reason) return;
                    await api.put(`/bookings/${bookingId}/status`, { status: 'Rejected', rejectionReason: reason });
                    toast.error('Booking rejected.');
                    break;
                case 'submitWork':
                    await api.patch(`/bookings/${bookingId}/deliverables`, extraData);
                    toast.success('Work submitted for review.');
                    setIsEvidenceOpen(false);
                    setExpandedBooking(null);
                    break;
                case 'complete':
                    await api.patch(`/bookings/${bookingId}/complete`, extraData);
                    toast.success('Job completed.');
                    setIsEvidenceOpen(false);
                    setExpandedBooking(null);
                    break;
                default: break;
            }
            await fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed.');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'pending review': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            case 'expired': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    if (loading) return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading your jobs...</p>
      </div>
    );

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Bookings</h1>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2 tracking-[0.2em]">Manage your requests and active jobs</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {[
                    { key: 'all', label: 'All Jobs' },
                    { key: 'Pending', label: 'New Requests' },
                    { key: 'Accepted', label: 'Active' },
                    { key: 'Completed', label: 'Done' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveFilter(tab.key); setCurrentPage(1); }}
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
                            <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Service Details</th>
                            <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                            <th className="px-10 py-8 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                        {(() => {
                            const totalPages = Math.ceil(sortedBookings.length / ITEMS_PER_PAGE);
                            const paginatedBookings = sortedBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                            return paginatedBookings.map((booking) => (
                            <React.Fragment key={booking._id}>
                                <tr className="group hover:bg-slate-50/30 transition-all cursor-pointer" onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}>
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-[28px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                                {booking.serviceId?.serviceType === 'remote' ? <Terminal className="w-7 h-7" /> : <MapPin className="w-7 h-7" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg mb-1">{booking.serviceId?.title || 'Service'}</p>
                                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">Client: <span className="text-slate-900 font-black">{booking.clientId?.name}</span></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(booking.scheduleDate).toLocaleDateString()} • {booking.timeSlot?.start}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                        {booking.status === 'Pending' ? (
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleAction('accept', booking._id); }}
                                                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-emerald-500/10 transition-all"
                                                >
                                                    Accept
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleAction('reject', booking._id); }}
                                                    className="px-6 py-3 bg-white border border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-600 hover:border-red-100 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : booking.status === 'Accepted' ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSelectedBookingId(booking._id); setIsEvidenceOpen(true); }}
                                                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all"
                                            >
                                                Submit Work
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2 text-slate-300 font-black text-[10px] uppercase tracking-widest">
                                                View Details <ChevronDown className={`w-4 h-4 transition-transform ${expandedBooking === booking._id ? 'rotate-180' : ''}`} />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                {expandedBooking === booking._id && (
                                    <tr className="bg-slate-50/50">
                                        <td colSpan="3" className="px-10 py-12">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-top duration-500">
                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-blue-600" /> Requirements
                                                    </h4>
                                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5">
                                                        <p className="text-sm font-medium text-slate-600 leading-relaxed">{booking.requirements?.description || 'No description provided.'}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <UploadCloud className="w-4 h-4 text-emerald-600" /> Submitted Work
                                                    </h4>
                                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5">
                                                        {booking.deliverables?.files?.length > 0 ? (
                                                            <div className="space-y-6">
                                                                <p className="text-xs font-medium text-slate-600 mb-4">{booking.deliverables.message}</p>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {booking.deliverables.files.map((f, i) => (
                                                                        <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                                                                            <img src={f} className="w-full h-full object-cover" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="py-10 text-center opacity-30">
                                                                <Activity className="w-10 h-10 mx-auto mb-4" />
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Work in progress</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ));
                        })()}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {(() => {
                const totalPages = Math.ceil(sortedBookings.length / ITEMS_PER_PAGE);
                if (totalPages <= 1) return null;
                return (
                    <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, sortedBookings.length)} of {sortedBookings.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                                        currentPage === page 
                                            ? 'bg-slate-900 text-white shadow-lg' 
                                            : 'bg-white border border-slate-100 text-slate-500 hover:border-blue-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );
            })()}

            <EvidenceModal 
                isOpen={isEvidenceOpen}
                onClose={() => setIsEvidenceOpen(false)}
                bookingId={selectedBookingId}
                onSubmit={(id, data) => {
                    const booking = bookings.find(b => b._id === id);
                    const type = booking?.serviceId?.serviceType === 'remote' ? 'submitWork' : 'complete';
                    handleAction(type, id, data);
                }}
            />
        </div>
    );
};

export default ProviderBookings;
