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
    Activity,
    PlayCircle,
    Navigation
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
                    toast.success('Work submitted for Admin & Client review.');
                    setIsEvidenceOpen(false);
                    setExpandedBooking(null);
                    break;
                case 'complete':
                    await api.patch(`/bookings/${bookingId}/complete`, extraData);
                    toast.success('Job submitted for Admin verification.');
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
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <RefreshCcw className="w-6 h-6 text-slate-300 animate-spin" />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading bookings...</p>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-xl font-black text-slate-950 uppercase tracking-tighter">Your Bookings</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                        View and manage your service requests.
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
                {[
                    { key: 'all', label: 'All', icon: Activity },
                    { key: 'Pending', label: 'Pending', icon: Clock3 },
                    { key: 'Accepted', label: 'Active', icon: PlayCircle },
                    { key: 'Completed', label: 'Done', icon: CheckCircle2 },
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
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100/50">
                                <th className="px-5 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Details</th>
                                <th className="px-5 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status & Date</th>
                                <th className="px-5 py-2.5 text-right text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {(() => {
                                const paginatedBookings = sortedBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

                                if (paginatedBookings.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">
                                                No bookings found.
                                            </td>
                                        </tr>
                                    );
                                }

                                return paginatedBookings.map((booking) => (
                                    <React.Fragment key={booking._id}>
                                        <tr
                                            className={`transition-colors cursor-pointer group ${expandedBooking === booking._id ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}
                                            onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-white transition-colors">
                                                        {booking.serviceId?.serviceType === 'remote' ? <Terminal className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 text-xs truncate tracking-tight uppercase leading-none mb-1">{booking.serviceId?.title || 'Service'}</p>
                                                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                            <UserCircle className="w-2.5 h-2.5" />
                                                            <p className="truncate">Client: <span className="text-slate-600">{booking.clientId?.name}</span></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyles(booking.status)} leading-none shadow-sm`}>
                                                        {booking.status}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-1.5 opacity-60">
                                                        <Calendar className="w-2.5 h-2.5" />
                                                        {new Date(booking.scheduleDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        <span className="mx-1">•</span>
                                                        <Clock className="w-2.5 h-2.5" />
                                                        {booking.timeSlot?.start}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {booking.status === 'Pending' ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleAction('accept', booking._id); }}
                                                            className="px-3 py-1.5 bg-emerald-600 text-white rounded text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/5"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleAction('reject', booking._id); }}
                                                            className="px-3 py-1.5 border border-red-100 text-red-600 bg-red-50 rounded text-[8px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : booking.status === 'Accepted' ? (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedBookingId(booking._id); setIsEvidenceOpen(true); }}
                                                        className="px-3 py-1.5 bg-slate-950 text-white rounded text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2 ml-auto active:scale-95 shadow-lg shadow-black/5"
                                                    >
                                                        <UploadCloud className="w-3 h-3" />
                                                        Submit Work
                                                    </button>
                                                ) : (
                                                    <div className="flex justify-end">
                                                        <div className={`p-1.5 rounded-lg transition-all ${expandedBooking === booking._id ? 'bg-slate-950 text-white' : 'text-slate-300 group-hover:text-slate-600 group-hover:bg-white'}`}>
                                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${expandedBooking === booking._id ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>

                                        {expandedBooking === booking._id && (
                                            <tr className="bg-slate-50/20">
                                                <td colSpan="3" className="px-5 py-6 border-b border-slate-100">
                                                    <div className="space-y-6 max-w-5xl mx-auto">
                                                        {/* Top Row: Requirements + Evidence */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Requirements Panel */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <FileText className="w-3 h-3" />
                                                                    Client Brief
                                                                </h4>
                                                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-slate-600 text-[11px] font-medium leading-relaxed italic">
                                                                    {booking.requirements?.description || 'No specific requirements provided.'}
                                                                </div>
                                                            </div>

                                                            {/* Evidence/Deliverables Panel */}
                                                            <div className="space-y-3">
                                                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                                    Work Evidence
                                                                </h4>
                                                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                                    {booking.deliverables?.files?.length > 0 ? (
                                                                        <div className="space-y-3">
                                                                            {booking.deliverables.message && (
                                                                                <div className="bg-slate-50 p-3 rounded-lg border-l-2 border-blue-500 text-[10px] text-slate-600 font-medium leading-relaxed">
                                                                                    "{booking.deliverables.message}"
                                                                                </div>
                                                                            )}
                                                                            <div className="grid grid-cols-3 gap-2">
                                                                                {booking.deliverables.files.map((f, i) => (
                                                                                    <a key={i} href={f} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group/img">
                                                                                        <img src={f} alt="Work submission" className="w-full h-full object-cover group-hover/img:opacity-75 transition-opacity" />
                                                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/10">
                                                                                            <Download className="w-4 h-4 text-white drop-shadow-md" />
                                                                                        </div>
                                                                                    </a>
                                                                                ))}
                                                                            </div>
                                                                            {booking.review && (
                                                                                <div className="pt-3 border-t border-slate-50 mt-3">
                                                                                    <h5 className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Client Review</h5>
                                                                                    <div className="flex items-center gap-0.5 mb-1.5">
                                                                                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-2.5 h-2.5 ${i < booking.review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} />)}
                                                                                    </div>
                                                                                    <p className="text-[10px] text-slate-600 font-medium italic">"{booking.review.comment}"</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="py-6 text-center">
                                                                            <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-2 opacity-50">
                                                                                <Clock3 className="w-4 h-4 text-slate-300" />
                                                                            </div>
                                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Work in Progress</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Route Map: Provider → Client */}
                                                        {booking.serviceId?.serviceType !== 'remote' && user?.location?.coordinates && booking.clientId?.location?.coordinates && (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                        <Navigation className="w-3 h-3 text-blue-500" />
                                                                        Route to Client
                                                                    </h4>
                                                                    <a
                                                                        href={`https://www.google.com/maps/dir/${user.location.coordinates[1]},${user.location.coordinates[0]}/${booking.clientId.location.coordinates[1]},${booking.clientId.location.coordinates[0]}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-1.5 active:scale-95 shadow-lg shadow-blue-600/20"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <Navigation className="w-3 h-3" />
                                                                        Get Directions
                                                                    </a>
                                                                </div>
                                                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                                                    <iframe
                                                                        title="Route Map"
                                                                        width="100%"
                                                                        height="300"
                                                                        frameBorder="0"
                                                                        style={{ border: 0 }}
                                                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(user.location.coordinates[0], booking.clientId.location.coordinates[0]) - 0.02},${Math.min(user.location.coordinates[1], booking.clientId.location.coordinates[1]) - 0.02},${Math.max(user.location.coordinates[0], booking.clientId.location.coordinates[0]) + 0.02},${Math.max(user.location.coordinates[1], booking.clientId.location.coordinates[1]) + 0.02}&layer=mapnik&marker=${booking.clientId.location.coordinates[1]},${booking.clientId.location.coordinates[0]}`}
                                                                    />
                                                                    <div className="flex items-center justify-between p-3 bg-slate-50 border-t border-slate-100">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">You</span>
                                                                            </div>
                                                                            <ArrowRight className="w-3 h-3 text-slate-300" />
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{booking.clientId?.name}</span>
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
                                                                            {booking.clientId?.location?.address ? booking.clientId.location.address.split(',').slice(0, 2).join(',') : 'Client Location'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
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
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <p>Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedBookings.length)} of {sortedBookings.length}</p>
                <div className="flex items-center gap-4">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="hover:text-blue-600 disabled:opacity-30 transition-all">PREVIOUS</button>
                    <span className="text-gray-900">{currentPage} / {Math.ceil(sortedBookings.length / ITEMS_PER_PAGE) || 1}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(sortedBookings.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(sortedBookings.length / ITEMS_PER_PAGE)} className="hover:text-blue-600 disabled:opacity-30 transition-all">NEXT</button>
                </div>
            </div>

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
