import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    AlertCircle,
    Search,
    RefreshCcw,
    CheckCircle2,
    XSquare,
    MessageSquare,
    FileText,
    Gavel
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminDisputes = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedDispute, setExpandedDispute] = useState(null);
    const [verdict, setVerdict] = useState('');
    const [resolutionStatus, setResolutionStatus] = useState('Completed');
    const [finalPrice, setFinalPrice] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const fetchDisputedBookings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/bookings');
            const allBookings = res.data.data || res.data || [];
            const disputedBookings = allBookings.filter(b => b.isDisputed || b.status === 'Disputed' || (b.dispute && b.dispute.status === 'Open'));
            setBookings(disputedBookings);
            setCurrentPage(1);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch disputes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDisputedBookings(); }, []);

    const handleResolve = async (bookingId) => {
        if (!verdict.trim()) return toast.error('Please provide an administrative verdict');
        if (resolutionStatus === 'Completed' && finalPrice === '') return toast.error('Please provide a final price point');

        try {
            setActionLoading(bookingId);
            const payload = {
                status: resolutionStatus,
                adminVerdict: verdict,
                finalPrice: finalPrice !== '' ? Number(finalPrice) : undefined
            };

            await api.post(`/admin/disputes/${bookingId}/resolve`, payload);
            toast.success('Dispute resolved successfully');
            setExpandedDispute(null);
            setVerdict('');
            fetchDisputedBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resolve dispute');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredDisputes = bookings.filter(b =>
        b.serviceId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.providerId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-100/50">
                <div>
                    <h1 className="text-xl font-black text-slate-950 tracking-tighter leading-none uppercase italic">Dispute Management</h1>
                    <div className="flex items-center gap-2 mt-2">
                       <p className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[7px] font-black uppercase tracking-widest leading-none">{bookings.length} DISPUTES</p>
                       <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">System Active</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative group/search">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-300 group-focus-within/search:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search disputes..."
                            className="bg-white border border-slate-200 rounded py-1.5 pl-8 pr-4 text-[8px] font-black uppercase tracking-[0.2em] outline-none focus:border-amber-500 transition-all w-40 placeholder:text-slate-200"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <button onClick={fetchDisputedBookings} className="p-1.5 rounded bg-white border border-slate-200 text-slate-300 hover:text-amber-600 hover:border-amber-200 transition-all">
                        <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* High-Density Dispute Registry */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-50">
                            <th className="px-5 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Dispute Details</th>
                            <th className="px-5 py-2.5 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Involved Users</th>
                            <th className="px-5 py-2.5 text-right text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan="3" className="px-8 py-24 text-center">
                                <div className="flex flex-col items-center gap-4 animate-pulse opacity-40">
                                    <RefreshCcw className="w-6 h-6 animate-spin text-slate-300" />
                                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300">Loading disputes...</p>
                                </div>
                            </td></tr>
                        ) : filteredDisputes.length > 0 ? filteredDisputes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((booking) => (
                            <React.Fragment key={booking._id}>
                                <tr className={`group transition-all ${expandedDispute === booking._id ? 'bg-amber-50/20' : 'hover:bg-slate-50/30'}`}>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-white border border-slate-100 flex items-center justify-center shrink-0 text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-all shadow-sm">
                                                <AlertCircle className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-xs text-slate-950 truncate uppercase tracking-tight leading-none mb-1">{booking.serviceId?.title || 'System Task'}</p>
                                                <p className="text-[7px] font-black text-amber-600 uppercase tracking-widest leading-none italic opacity-80">
                                                    LOG: {booking.dispute?.reason || booking.rejectionReason}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex flex-col gap-1 items-center">
                                            <p className="text-[8px] font-black text-slate-700 uppercase tracking-tighter shrink-0">C: {booking.clientId?.name}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter shrink-0">P: {booking.providerId?.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex justify-end items-center gap-1">
                                            <Link
                                                to={`/admin/messages?to=${booking.clientId?._id}`}
                                                className="w-8 h-8 rounded bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-950 hover:border-slate-300 transition-all shadow-sm"
                                            >
                                                <MessageSquare className="w-3 h-3" />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setExpandedDispute(expandedDispute === booking._id ? null : booking._id);
                                                    setVerdict(booking.dispute?.adminVerdict || '');
                                                    setResolutionStatus('Completed');
                                                    setFinalPrice(booking.basePrice || '');
                                                }}
                                                className={`px-3 py-1.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${expandedDispute === booking._id ? 'bg-slate-950 text-white' : 'bg-amber-600 text-white hover:bg-slate-900 shadow-sm'}`}
                                            >
                                                {expandedDispute === booking._id ? 'CANCEL' : 'RESOLVE'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedDispute === booking._id && (
                                    <tr className="bg-amber-50/10">
                                        <td colSpan="3" className="px-5 py-6 transition-all animate-in zoom-in-95 duration-200 border-b border-slate-50">
                                            <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-100 p-5 shadow-lg space-y-5">
                                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Gavel className="w-3.5 h-3.5 text-slate-400" />
                                                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-950 italic">Resolution Details</h3>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => setResolutionStatus('Completed')}
                                                            className={`py-2 px-4 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${resolutionStatus === 'Completed' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                                                        >
                                                            COMPLETE DISPUTE
                                                        </button>
                                                        <button
                                                            onClick={() => setResolutionStatus('Cancelled')}
                                                            className={`py-2 px-4 rounded text-[8px] font-black uppercase tracking-widest border transition-all ${resolutionStatus === 'Cancelled' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                                                        >
                                                            CANCEL DISPUTE
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <div className="space-y-2">
                                                            <label className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 italic">Dispute Reason</label>
                                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                                <p className="text-[10px] font-black text-slate-600 leading-relaxed italic truncate">
                                                                    "{booking.dispute?.reason || 'No input data.'}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {resolutionStatus === 'Completed' && (
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 italic">Final Price</label>
                                                                    <input
                                                                        type="number"
                                                                        value={finalPrice}
                                                                        onChange={e => setFinalPrice(e.target.value)}
                                                                        className="w-full bg-slate-50 rounded px-3 py-1.5 text-[10px] font-black border border-slate-100 outline-none focus:border-indigo-600 transition-all uppercase"
                                                                        placeholder="Final price..."
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="space-y-1.5">
                                                                <label className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1 italic">Resolution Verdict</label>
                                                                <textarea
                                                                    value={verdict}
                                                                    onChange={e => setVerdict(e.target.value)}
                                                                    className="w-full bg-slate-50 rounded p-3 text-[10px] font-black border border-slate-100 outline-none focus:border-indigo-600 transition-all min-h-[70px] resize-none uppercase placeholder:text-slate-200"
                                                                    placeholder="Enter verdict..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleResolve(booking._id)}
                                                        disabled={actionLoading === booking._id}
                                                        className="w-full py-2.5 rounded bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
                                                    >
                                                        {actionLoading === booking._id ? 'SAVING...' : 'RESOLVE DISPUTE'}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )) : (
                            <tr>
                                <td colSpan="3" className="px-8 py-24 text-center opacity-30">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Gavel className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">No Disputes</p>
                                    <p className="text-[8px] font-black text-slate-300 uppercase mt-2">Zero active disputes detected</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Tactical Pagination */}
            {filteredDisputes.length > ITEMS_PER_PAGE && (
                <div className="flex items-center justify-between px-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">
                    <p>Showing: {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredDisputes.length)} / {filteredDisputes.length}</p>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">PREVIOUS</button>
                        <span className="text-slate-950 font-black">{currentPage} | {Math.ceil(filteredDisputes.length / ITEMS_PER_PAGE)}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredDisputes.length / ITEMS_PER_PAGE), p + 1))} disabled={currentPage === Math.ceil(filteredDisputes.length / ITEMS_PER_PAGE)} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">NEXT</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDisputes;
