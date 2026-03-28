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
  Heart,
  Flag,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import ReviewModal from '../../../components/dashboard/ReviewModal';

const STATUS_PRIORITY = { 'Pending': 0, 'Accepted': 1, 'Pending Review': 2, 'Completed': 3, 'In Progress': 4, 'Rejected': 5, 'Cancelled': 6 };

const ClientBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

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
                case 'cancel':
                    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                    await api.put(`/bookings/${bookingId}/status`, { status: 'Cancelled' });
                    toast.warning('Booking cancelled.');
                    break;
                case 'pay':
                    navigate(`/client/checkout/${bookingId}`); 
                    return;
                case 'submitReview':
                    await api.post('/reviews', { ...extraData, bookingId });
                    toast.success('✨ Impression Recorded. Thank you!');
                    setExpandedBooking(null);
                    break;
                case 'dispute':
                    const reason = prompt('Enter a reason for the dispute:');
                    if (!reason) return;
                    await api.post(`/bookings/${bookingId}/dispute`, { reason });
                    toast.success('Dispute raised successfully.');
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

    const getStatusStyles = (status, paid) => {
        if (status === 'Completed' && !paid) return 'bg-amber-100 text-amber-700 border-amber-200';
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'pending review': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    if (loading) return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-600/10"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Collaboration Feed...</p>
      </div>
    );

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Collaborations</h1>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2 tracking-[0.2em]">Track your task lifecycle from initiation to final release</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                {[
                    { key: 'all', label: 'All Projects' },
                    { key: 'Pending', label: 'Invitations' },
                    { key: 'Accepted', label: 'Active Tasks' },
                    { key: 'Completed', label: 'History' },
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
                            <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Service Context</th>
                            <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Protocol Status</th>
                            <th className="px-10 py-8 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Workflow Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                        {sortedBookings.map((booking) => (
                            <React.Fragment key={booking._id}>
                                <tr className="group hover:bg-slate-50/30 transition-all cursor-pointer" onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}>
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-[28px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                {booking.serviceId?.serviceType === 'remote' ? <Terminal className="w-7 h-7" /> : <MapPin className="w-7 h-7" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg mb-1">{booking.serviceId?.title || 'Bespoke Inquiry'}</p>
                                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">Expert: <span className="text-slate-900 font-black">{booking.providerId?.name}</span></p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(booking.status, booking.paid)}`}>
                                                {booking.status} {booking.status === 'Completed' && !booking.paid ? '• Payout Pending' : ''}
                                            </span>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(booking.scheduleDate).toLocaleDateString()} • {booking.timeSlot?.start}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                        {booking.status === 'Completed' && !booking.paid ? (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAction('pay', booking._id); }}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-blue-500/20 transition-all"
                                            >
                                                Finalize Payment
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2 text-slate-300 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors">
                                                Inspection View <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${expandedBooking === booking._id ? 'rotate-180' : ''}`} />
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
                                                        <FileText className="w-4 h-4 text-blue-600" /> Interaction Brief
                                                    </h4>
                                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5">
                                                        <p className="text-sm font-medium text-slate-600 leading-relaxed">{booking.requirements?.description || 'No direct instructions archived.'}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                        <UploadCloud className="w-4 h-4 text-emerald-600" /> Artifact Release & Appraisal
                                                    </h4>
                                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5">
                                                        {booking.deliverables?.files?.length > 0 ? (
                                                            <div className="space-y-6">
                                                                <p className="text-xs font-medium text-slate-600 mb-4">{booking.deliverables.message}</p>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {booking.deliverables.files.map((f, i) => (
                                                                        <a key={i} href={f} target="_blank" rel="noreferrer" className="block relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group">
                                                                            <img src={f} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <Download className="w-5 h-5 text-white" />
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                                {booking.status === 'Completed' && (
                                                                    <div className="pt-8 border-t border-slate-50 mt-6">
                                                                        {booking.review ? (
                                                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                                                                                <div className="flex items-center gap-1 mb-2">
                                                                                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < booking.review.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />)}
                                                                                </div>
                                                                                <p className="text-xs font-medium text-slate-600 italic">"{booking.review.comment}"</p>
                                                                            </div>
                                                                        ) : (
                                                                            <button 
                                                                                onClick={() => { setSelectedBookingId(booking._id); setIsReviewOpen(true); }}
                                                                                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
                                                                            >
                                                                                <Heart className="w-4 h-4" /> Record My Impression
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="py-10 text-center opacity-30">
                                                                <UploadCloud className="w-10 h-10 mx-auto mb-4" />
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Waiting for Deliverables</p>
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

            <ReviewModal 
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                bookingId={selectedBookingId}
                onSubmit={(id, data) => handleAction('submitReview', id, data)}
            />
        </div>
    );
};

export default ClientBookings;
