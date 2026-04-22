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
    Activity,
    PlayCircle,
    SearchCode
} from 'lucide-react';
import { toast } from 'sonner';
import ReviewModal from '../../../components/dashboard/ReviewModal';

const STATUS_PRIORITY = { 'Pending': 0, 'Accepted': 1, 'Pending Review': 2, 'Completed': 3, 'In Progress': 4, 'Rejected': 5, 'Cancelled': 6 };
const ITEMS_PER_PAGE = 8;

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
                case 'cancel':
                    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                    await api.put(`/bookings/${bookingId}/status`, { status: 'Cancelled' });
                    toast.warning('Booking cancelled.');
                    break;
                case 'pay':
                    navigate(`/client/checkout/${bookingId}`);
                    return;
                case 'submitReview':
                    const booking = bookings.find(b => b._id === bookingId);
                    if (booking?.review) {
                        await api.put(`/reviews/${booking.review._id}`, extraData);
                        toast.success('Review updated successfully. Thank you!');
                    } else {
                        await api.post('/reviews', { ...extraData, bookingId });
                        toast.success('Review submitted. Thank you!');
                    }
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
        if (status === 'Completed' && !paid) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'pending review': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'expired': return 'bg-rose-100 text-rose-800 border-rose-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-6">
            <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading your bookings...</p>
        </div>
    );

    const totalPages = Math.ceil(sortedBookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = sortedBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-blue-900/5">
                <div>
                    <h1 className="text-xl font-black text-slate-950 uppercase tracking-tighter italic">My Bookings</h1>
                    <p className="text-slate-400 mt-1.5 text-[9px] font-black uppercase tracking-widest leading-none">View and manage your service requests.</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { key: 'all', label: 'All Bookings', icon: Activity },
                    { key: 'Pending', label: 'Pending', icon: Clock3 },
                    { key: 'Accepted', label: 'Active', icon: PlayCircle },
                    { key: 'Pending Review', label: 'Admin Review', icon: SearchCode },
                    { key: 'Completed', label: 'Completed', icon: CheckCircle2 },
                ].map(tab => {
                    const isActive = activeFilter === tab.key;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveFilter(tab.key); setCurrentPage(1); }}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isActive
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                        >
                            <Icon className="w-3 h-3" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/50">
                                <th className="px-5 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Service</th>
                                <th className="px-5 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Amount</th>
                                <th className="px-5 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status & Date</th>
                                <th className="px-5 py-2.5 text-right text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : paginatedBookings.map((booking) => (
                                <React.Fragment key={booking._id}>
                                    <tr
                                        className={`transition-colors cursor-pointer ${expandedBooking === booking._id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                        onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                                    >
                                        <td className="px-6 py-6 border-b border-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                                    {booking.serviceId?.serviceType === 'remote' ? <Terminal className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg mb-1">{booking.serviceId?.title || 'Unknown Service'}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <UserCircle className="w-4 h-4" />
                                                        <p>Provider: <span className="font-medium">{booking.providerId?.name}</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-b border-gray-50 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="font-bold text-gray-900">Rs. {(booking.finalPrice || booking.basePrice || 0).toLocaleString()}</p>
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${booking.paid ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'}`}>
                                                    {booking.paid ? 'Paid' : 'Unpaid'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-b border-gray-50 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyles(booking.status, booking.paid)}`}>
                                                    {booking.status}
                                                </span>
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(booking.scheduleDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                                                    <Clock className="w-4 h-4" />
                                                    {booking.timeSlot?.start}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 border-b border-gray-50 text-right">
                                            {booking.status === 'Completed' && !booking.paid ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleAction('pay', booking._id); }}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ml-auto"
                                                >
                                                    <CreditCard className="w-4 h-4" /> Pay Now
                                                </button>
                                            ) : (
                                                <div className="flex justify-end pr-2">
                                                    <div className={`p-2 rounded-full transition-colors ${expandedBooking === booking._id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}>
                                                        <ChevronDown className={`w-5 h-5 transition-transform ${expandedBooking === booking._id ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedBooking === booking._id && (
                                        <tr className="bg-gray-50/50">
                                            <td colSpan="4" className="px-6 py-8 border-b border-gray-100">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                                                    {/* Requirements Panel */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                            <FileText className="w-3 h-3" />
                                                            Booking Requirements
                                                        </h4>
                                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-gray-700 text-sm">
                                                            {booking.requirements?.description || 'No specific requirements provided.'}
                                                        </div>

                                                        {['Pending'].includes(booking.status) && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleAction('cancel', booking._id); }}
                                                                className="mt-4 px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors flex items-center gap-2"
                                                            >
                                                                <XCircle className="w-4 h-4" /> Cancel Booking
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Deliverables/Work Panel */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                                Work Evidence
                                                            </h4>
                                                            {booking.status === 'Completed' && !booking.review && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setSelectedBookingId(booking._id); setIsReviewOpen(true); }}
                                                                    className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
                                                                >
                                                                    <Star className="w-4 h-4" /> Leave Review
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                                            {booking.deliverables?.files?.length > 0 ? (
                                                                <div className="space-y-4">
                                                                    {booking.deliverables.message && (
                                                                        <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-blue-500 text-sm text-gray-700">
                                                                            "{booking.deliverables.message}"
                                                                        </div>
                                                                    )}
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                                        {booking.deliverables.files.map((f, i) => (
                                                                            <a key={i} href={f} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                                                                                <img src={f} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <Download className="w-6 h-6 text-white drop-shadow-md" />
                                                                                </div>
                                                                            </a>
                                                                        ))}
                                                                    </div>

                                                                        {booking.review && (
                                                                            <div className="pt-4 border-t border-slate-50 mt-4">
                                                                                <div className="flex items-center justify-between mb-1.5">
                                                                                    <h5 className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Your Review</h5>
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); setSelectedBookingId(booking._id); setIsReviewOpen(true); }}
                                                                                        className="text-[8px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                                                                    >
                                                                                        Edit
                                                                                    </button>
                                                                                </div>
                                                                                <div className="flex items-center gap-1 mb-2">
                                                                                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < booking.review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} />)}
                                                                                </div>
                                                                                <p className="text-[10px] text-slate-600 font-medium italic">"{booking.review.comment}"</p>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            ) : (
                                                                    <div className="py-8 text-center">
                                                                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 opacity-50">
                                                                            <Clock3 className="w-4 h-4 text-slate-300" />
                                                                        </div>
                                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Work in Progress</p>
                                                                    </div>
                                                            )}

                                                            {['Pending Review', 'Completed'].includes(booking.status) && (
                                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleAction('dispute', booking._id); }}
                                                                        className="text-xs text-red-600 font-semibold hover:underline flex items-center gap-1"
                                                                    >
                                                                        <Flag className="w-3 h-3" /> Report an Issue
                                                                    </button>
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

            <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <p>Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedBookings.length)} of {sortedBookings.length}</p>
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="hover:text-blue-600 disabled:opacity-30 transition-all">PREVIOUS</button>
                    <span className="text-gray-900">{currentPage} / {Math.ceil(sortedBookings.length / ITEMS_PER_PAGE) || 1}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(sortedBookings.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(sortedBookings.length / ITEMS_PER_PAGE)} className="hover:text-blue-600 disabled:opacity-30 transition-all">NEXT</button>
                </div>
            </div>

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                initialData={bookings.find(b => b._id === selectedBookingId)?.review}
                onSubmit={(data) => handleAction('submitReview', selectedBookingId, data)}
            />
        </div>
    );
};

export default ClientBookings;
