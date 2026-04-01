import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    CheckCircle2,
    XSquare,
    MessageSquare,
    FileText,
    Clock,
    Download,
    Terminal,
    MapPin,
    RefreshCcw,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminCompletionReviews = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedReview, setExpandedReview] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const [feedback, setFeedback] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchPendingReviews = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/completion-reviews');
            setBookings(res.data.data || []);
            setCurrentPage(1);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch pending reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const handleApprove = async (bookingId) => {
        if (!window.confirm('Are you sure you want to approve this completion? Evidence will be released to the client.')) return;
        setActionLoading(bookingId);
        try {
            await api.post(`/admin/completion-reviews/${bookingId}/approve`);
            toast.success('Work completion approved');
            setExpandedReview(null);
            fetchPendingReviews();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (bookingId) => {
        if (!feedback.trim()) return toast.error('Please provide feedback for rejection');
        setActionLoading(bookingId);
        try {
            await api.post(`/admin/completion-reviews/${bookingId}/reject`, { feedback });
            toast.success('Completion rejected. Provider notified for revisions.');
            setExpandedReview(null);
            setFeedback('');
            fetchPendingReviews();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Work Verification</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2">Review submitted work before client payment</p>
                </div>
                <button onClick={fetchPendingReviews} className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white rounded-[44px] shadow-2xl shadow-blue-900/5 border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Task Details</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Submission Info</th>
                                <th className="px-10 py-8 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="3" className="px-10 py-32 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading submissions...</td></tr>
                            ) : bookings.length > 0 ? bookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((booking) => (
                                <React.Fragment key={booking._id}>
                                    <tr className="group hover:bg-indigo-50/30 transition-all">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 text-indigo-500 font-black">
                                                    {booking.serviceId?.serviceType === 'remote' ? <Terminal className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 mb-0.5">{booking.serviceId?.title || 'Service'}</p>
                                                    <p className="text-xs font-bold text-slate-500">Provider: <span className="text-slate-900">{booking.providerId?.name}</span> • Client: <span className="text-slate-900">{booking.clientId?.name}</span></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">
                                                    <Clock className="w-3 h-3" />
                                                    SUBMITTED {new Date(booking.deliverables?.submittedAt || booking.updatedAt).toLocaleDateString()}
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pending Approval</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex justify-end items-center gap-3">
                                                <Link
                                                    to={`/admin/messages?to=${booking.providerId?._id}`}
                                                    className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="Message Provider"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setExpandedReview(expandedReview === booking._id ? null : booking._id)}
                                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md
                                                    ${expandedReview === booking._id
                                                            ? 'bg-slate-900 text-white shadow-slate-900/20'
                                                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'}
                                                `}
                                                >
                                                    {expandedReview === booking._id ? 'Close' : 'Review Work'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedReview === booking._id && (
                                        <tr className="bg-emerald-50/10">
                                            <td colSpan="3" className="p-10 border-b border-emerald-100/50">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
                                                    {/* Deliverables Panel */}
                                                    <div className="bg-white rounded-[32px] border border-emerald-100 p-8 shadow-2xl shadow-emerald-900/5 h-full">
                                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-emerald-500" /> Submitted Work
                                                        </h3>

                                                        <div className="space-y-6">
                                                            {booking.deliverables?.message ? (
                                                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Provider's Note</p>
                                                                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{booking.deliverables.message}"</p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs italic text-slate-400 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">No explanatory note provided by the tasker.</p>
                                                            )}

                                                            <div className="grid grid-cols-2 gap-4">
                                                                {booking.deliverables?.files?.length > 0 ? (
                                                                    booking.deliverables.files.map((f, i) => (
                                                                        <a key={i} href={f} target="_blank" rel="noreferrer" className="group relative block aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                                                                            <img src={f} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                                                                <Download className="w-5 h-5 text-white" />
                                                                            </div>
                                                                        </a>
                                                                    ))
                                                                ) : (
                                                                    <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                                                                        <AlertCircle className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No files attached</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Adjudication Action Center */}
                                                    <div className="flex flex-col gap-6">
                                                        {/* Approval Section */}
                                                        <div className="bg-white rounded-[32px] border border-emerald-200 p-8 shadow-xl shadow-emerald-900/5 relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                                                <CheckCircle2 className="w-24 h-24 text-emerald-600" />
                                                            </div>
                                                            <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2">Approve Work</h3>
                                                            <p className="text-[11px] font-bold text-slate-500 mb-6 max-w-[280px]">Accept the work as completed. The client will be notified to make payment.</p>

                                                            <button
                                                                onClick={() => handleApprove(booking._id)}
                                                                disabled={actionLoading}
                                                                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4" /> {actionLoading === booking._id ? 'Approving...' : 'Approve'}
                                                            </button>
                                                        </div>

                                                        {/* Rejection Section */}
                                                        <div className="bg-white rounded-[32px] border border-rose-100 p-8 shadow-xl shadow-rose-900/5 relative overflow-hidden">
                                                            <h3 className="text-xs font-black text-rose-700 uppercase tracking-widest mb-2">Request Changes</h3>
                                                            <p className="text-[11px] font-bold text-slate-500 mb-6 max-w-[280px]">Ask the provider to redo or improve their work before approving.</p>

                                                            <div className="space-y-4">
                                                                <div className="relative">
                                                                    <textarea
                                                                        placeholder="Detail why this submission doesn't meet quality standards..."
                                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-4 focus:ring-rose-500/5 focus:bg-white focus:border-rose-200 min-h-[120px] transition-all"
                                                                        value={feedback}
                                                                        onChange={(e) => setFeedback(e.target.value)}
                                                                    />
                                                                    <div className="absolute bottom-4 right-4 opacity-20">
                                                                        <AlertCircle className="w-5 h-5" />
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => handleReject(booking._id)}
                                                                    disabled={actionLoading}
                                                                    className="w-full py-4 text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                                                >
                                                                    <XSquare className="w-4 h-4" /> {actionLoading === booking._id ? 'Rejecting...' : 'Reject'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-10 py-32 text-center text-slate-400">
                                        <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20 text-emerald-500" />
                                        <p className="text-xs font-black uppercase tracking-widest text-emerald-600">No pending reviews</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {bookings.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-2 pt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, bookings.length)} of {bookings.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 transition-all">Previous</button>
                        {Array.from({ length: Math.ceil(bookings.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === page ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-500 hover:border-blue-200'}`}>{page}</button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(bookings.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(bookings.length / ITEMS_PER_PAGE)} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 transition-all">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompletionReviews;
