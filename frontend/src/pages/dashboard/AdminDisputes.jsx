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
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const AdminDisputes = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedDispute, setExpandedDispute] = useState(null);
    const [verdict, setVerdict] = useState('');
    const [resolutionStatus, setResolutionStatus] = useState('Completed'); // or Cancelled
    const [finalPrice, setFinalPrice] = useState('');

    const fetchDisputedBookings = async () => {
        try {
            setLoading(true);
            // Reusing getBookings logic for admin which fetches all bookings, we can filter by isDisputed or status='Disputed'
            const res = await api.get('/bookings');
            const allBookings = res.data.data || res.data || [];
            // Assuming we only get bookings where isDisputed is true or status is Disputed
            const disputedBookings = allBookings.filter(b => b.isDisputed || b.status === 'Disputed' || (b.dispute && b.dispute.status === 'Open'));
            setBookings(disputedBookings);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to fetch disputes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputedBookings();
    }, []);

    const handleResolve = async (bookingId) => {
        if (!verdict.trim()) return toast.error('Please provide an administrative verdict');
        if (resolutionStatus === 'Completed' && finalPrice === '') return toast.error('Please provide a final price point for the completed service');
        
        try {
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
        }
    };

    const filteredDisputes = bookings.filter(b => 
        b.serviceId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.providerId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dispute Resolution Console</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2">Mediate Conflict and Enforce Policy</p>
                </div>
                <button onClick={fetchDisputedBookings} className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white rounded-[44px] shadow-2xl shadow-blue-900/5 border border-slate-50 overflow-hidden flex flex-col">
                {/* Controls */}
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <div className="relative w-full max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search active disputes by service or parties..." 
                            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 text-xs font-bold focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Case Details</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Involved Parties</th>
                                <th className="px-10 py-8 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Action Required</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan="3" className="px-10 py-32 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Scanning Dispute Registry...</td></tr>
                            ) : filteredDisputes.length > 0 ? filteredDisputes.map((booking) => (
                                <React.Fragment key={booking._id}>
                                <tr className="group hover:bg-red-50/30 transition-all">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100 text-red-500">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 mb-0.5">{booking.serviceId?.title || 'Unknown Service'}</p>
                                                <p className="text-xs font-bold text-slate-500 line-clamp-1 max-w-sm">{booking.dispute?.reason || booking.rejectionReason}</p>
                                                <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] mt-2">Logged: {new Date(booking.dispute?.createdAt || booking.updatedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-xs font-bold text-slate-700"><span className="text-[9px] text-slate-400 uppercase tracking-widest font-black mr-2">Client:</span> {booking.clientId?.name}</p>
                                            <p className="text-xs font-bold text-slate-700"><span className="text-[9px] text-slate-400 uppercase tracking-widest font-black mr-2">Tasker:</span> {booking.providerId?.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end items-center gap-3">
                                            <Link 
                                              to={`/dashboard/messages?to=${booking.clientId?._id}`} 
                                              className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" 
                                              title="View Client Comms"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                onClick={() => {
                                                    setExpandedDispute(expandedDispute === booking._id ? null : booking._id);
                                                    setVerdict(booking.dispute?.adminVerdict || '');
                                                    setResolutionStatus('Completed');
                                                    setFinalPrice(booking.basePrice || '');
                                                }}
                                                className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-colors shadow-md shadow-red-600/20"
                                            >
                                                {expandedDispute === booking._id ? 'Close Panel' : 'Review & Resolve'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedDispute === booking._id && (
                                    <tr className="bg-red-50/10">
                                        <td colSpan="3" className="p-10">
                                           <div className="max-w-3xl mx-auto bg-white rounded-[32px] border border-red-100 p-8 shadow-2xl shadow-red-900/5">
                                              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                 <FileText className="w-4 h-4 text-red-500" /> Dispute Mediation
                                              </h3>
                                              
                                              <div className="space-y-6">
                                                 <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Platform Resolution Status</label>
                                                    <div className="flex items-center gap-4">
                                                       <button 
                                                         onClick={() => setResolutionStatus('Completed')} 
                                                         className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2
                                                            ${resolutionStatus === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-500'}
                                                         `}
                                                       >
                                                         <CheckCircle2 className="w-4 h-4" /> Rule in Favor of Service delivery (Complete)
                                                       </button>
                                                       <button 
                                                         onClick={() => setResolutionStatus('Cancelled')} 
                                                         className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2
                                                            ${resolutionStatus === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-red-200 hover:text-red-500'}
                                                         `}
                                                       >
                                                         <XSquare className="w-4 h-4" /> Nullify Contract (Cancel Booking)
                                                       </button>
                                                    </div>
                                                 </div>

                                                 {resolutionStatus === 'Completed' && (
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adjusted Final Payout (NPR)</label>
                                                        <input 
                                                          type="number" 
                                                          value={finalPrice} 
                                                          onChange={e => setFinalPrice(e.target.value)}
                                                          className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-red-500/20"
                                                          placeholder="e.g. 5000"
                                                        />
                                                    </div>
                                                 )}

                                                 <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Administrative Verdict / Justification</label>
                                                    <textarea 
                                                      value={verdict} 
                                                      onChange={e => setVerdict(e.target.value)}
                                                      className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-red-500/20 min-h-[120px]"
                                                      placeholder="Provide the official platform reasoning for this resolution. This may be visible to parties involved..."
                                                    />
                                                 </div>

                                                 <button 
                                                   onClick={() => handleResolve(booking._id)}
                                                   className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10 hover:bg-red-600 hover:shadow-red-600/20 transition-all"
                                                 >
                                                    Enforce Resolution
                                                 </button>
                                              </div>
                                           </div>
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-10 py-32 text-center text-slate-400">
                                         <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20 text-emerald-500" />
                                         <p className="text-xs font-black uppercase tracking-widest text-emerald-600">No Active Disputes in the Queue</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDisputes;
