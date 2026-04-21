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
    const [feedback, setFeedback] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const ITEMS_PER_PAGE = 8;

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
            toast.success('Work verified and released to client');
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
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Adjudication Surveillance Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100/50">
                <div>
                   <h1 className="text-xl font-black text-slate-950 tracking-tighter leading-none uppercase italic">Work Verification</h1>
                   <div className="flex items-center gap-2 mt-2">
                       <p className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[7px] font-black uppercase tracking-widest leading-none">{bookings.length} PENDING VERIFICATION</p>
                       <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">System Active</p>
                   </div>
                </div>
                
                <button 
                  onClick={fetchPendingReviews} 
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-950 hover:text-white rounded text-[8px] font-black uppercase tracking-widest transition-all border border-slate-100 shadow-sm"
                >
                    <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Verification Registry Matrix */}
            <div className="grid grid-cols-1 gap-3">
                {loading ? (
                    <div className="py-24 text-center flex flex-col items-center gap-4 opacity-30">
                       <RefreshCcw className="w-8 h-8 animate-spin text-slate-300" />
                       <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Loading reviews...</p>
                    </div>
                ) : bookings.length > 0 ? bookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((booking) => (
                    <div key={booking._id} className="relative group/card bg-white border border-slate-100 rounded-xl p-4 hover:shadow-xl transition-all overflow-hidden shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="relative w-10 h-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all">
                                    {booking.serviceId?.serviceType === 'remote' ? <Terminal className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xs font-black text-slate-950 truncate tracking-tight uppercase leading-none mb-1.5">{booking.serviceId?.title}</h3>
                                    <div className="flex items-center gap-4">
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                                            P: <span className="text-slate-950">{booking.providerId?.name}</span>
                                        </p>
                                        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                                            C: <span className="text-slate-950">{booking.clientId?.name}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/admin/messages?to=${booking.providerId?._id}`}
                                    className="w-8 h-8 bg-white border border-slate-100 rounded flex items-center justify-center text-slate-300 hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                    onClick={() => setExpandedReview(expandedReview === booking._id ? null : booking._id)}
                                    className={`px-4 py-1.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${
                                        expandedReview === booking._id 
                                            ? 'bg-slate-950 text-white' 
                                            : 'bg-indigo-600 text-white hover:bg-slate-950 shadow-sm'
                                    }`}
                                >
                                    {expandedReview === booking._id ? 'CANCEL' : 'REVIEW'}
                                </button>
                            </div>
                        </div>

                        {expandedReview === booking._id && (
                            <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 relative z-10">
                                <div className="space-y-3">
                                    <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Submitted Work</h4>
                                    <div className="bg-slate-50/50 p-3 rounded-lg text-[10px] text-slate-600 leading-relaxed font-bold border border-slate-100 italic">
                                        "{booking.deliverables?.message || "Null set input."}"
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {booking.deliverables?.files?.map((f, i) => (
                                            <a key={i} href={f} target="_blank" rel="noreferrer" className="aspect-square rounded bg-slate-100 overflow-hidden border border-slate-200 hover:scale-105 transition-all shadow-sm">
                                                <img src={f} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-50/30 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                                    <button
                                        onClick={() => handleApprove(booking._id)}
                                        disabled={actionLoading}
                                        className="w-full py-2.5 bg-emerald-600 text-white rounded font-black text-[8px] uppercase tracking-widest hover:bg-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> APPROVE WORK
                                    </button>
                                    
                                    <div className="h-px bg-slate-200/50 mx-4"></div>
                                    
                                    <div className="flex flex-col gap-2">
                                        <textarea
                                            placeholder="Reason for rejection..."
                                            className="w-full bg-white border border-slate-100 rounded p-3 text-[9px] font-black text-slate-950 placeholder:text-slate-200 outline-none focus:border-rose-500 transition-all min-h-[70px] shadow-sm uppercase italic"
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleReject(booking._id)}
                                            disabled={actionLoading}
                                            className="w-full py-2.5 text-rose-600 bg-white border border-rose-100 rounded font-black text-[8px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <AlertCircle className="w-3.5 h-3.5" /> REJECT WORK
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="py-20 text-center bg-white border-2 border-dashed border-slate-100 rounded-3xl opacity-30">
                        <CheckCircle2 className="w-10 h-10 text-slate-100 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">No pending reviews</p>
                    </div>
                )}
            </div>

            {/* Tactical Pagination */}
            {bookings.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">
                    <p>Showing: {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, bookings.length)} / {bookings.length}</p>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">PREVIOUS</button>
                        <span className="text-slate-950 font-black">{currentPage} | {Math.ceil(bookings.length / ITEMS_PER_PAGE)}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * ITEMS_PER_PAGE >= bookings.length} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">NEXT</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompletionReviews;
