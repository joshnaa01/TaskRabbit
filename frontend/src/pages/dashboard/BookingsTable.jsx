import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import ImageUpload from '../../components/common/ImageUpload';
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
  Heart
} from 'lucide-react';

import { initiateKhaltiPayment } from '../../services/khalti';
import { toast } from 'sonner';


const BookingsTable = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [submissionData, setSubmissionData] = useState({ message: '', files: [] });
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
    const [actionLoading, setActionLoading] = useState(null); // tracks which booking ID is being acted on

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

    const handleAction = async (action, bookingId, extraData = {}) => {
        setActionLoading(bookingId);
        try {
            switch (action) {
                case 'accept':
                    await api.put(`/bookings/${bookingId}/status`, { status: 'Accepted' });
                    toast.success('Booking accepted!');
                    break;
                case 'reject':
                    const reason = prompt('Please provide a reason for rejection:');
                    if (!reason) return;
                    await api.put(`/bookings/${bookingId}/status`, { status: 'Rejected', rejectionReason: reason });
                    toast.error('Booking rejected.');
                    break;
                case 'complete':
                    await api.patch(`/bookings/${bookingId}/complete`, extraData);
                    toast.success('Task marked as completed!');
                    setExpandedBooking(null);
                    setSubmissionData({ message: '', files: [] });
                    break;
                case 'submitWork':
                    await api.patch(`/bookings/${bookingId}/deliverables`, extraData);
                    toast.success('Work submitted for client review!');
                    setExpandedBooking(null);
                    setSubmissionData({ message: '', files: [] });
                    break;
                case 'revision':
                    const feedback = prompt('Enter your revision feedback:');
                    if (!feedback) return;
                    await api.post(`/bookings/${bookingId}/revision`, { feedback });
                    toast.success('Revision request sent.');
                    break;
                case 'pay':
                    const result = await initiateKhaltiPayment({
                        amount: (extraData.price || 0) * 100,
                        purchase_id: bookingId,
                        purchase_name: `Payment for ${extraData.title || 'Service'}`
                    });
                    await api.post(`/bookings/${bookingId}/pay`, { transactionId: result.transaction_id });
                    toast.success('Payment verified via Khalti!');
                    break;
                case 'submitReview':
                    if (!extraData.comment) throw new Error('Feedback comment required');
                    await api.post('/reviews', { ...extraData, bookingId });
                    toast.success('✨ Impression Recorded. Thank you!');
                    setExpandedBooking(null);
                    setReviewData({ rating: 5, comment: '' });
                    break;
                case 'cancel':
                    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
                    await api.put(`/bookings/${bookingId}/status`, { status: 'Cancelled' });
                    toast.warning('Booking cancelled.');
                    break;
                default: break;
            }
            await fetchBookings(); // Refresh list after any action
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed. Please retry.');
        } finally {
            setActionLoading(null);
        }
    };


    const getStatusStyles = (status, paid) => {
        if (status === 'Completed' && !paid) return 'bg-amber-100 text-amber-700 border-amber-200';
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'accepted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    if (loading) return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-600/10"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Bookings...</p>
      </div>
    );

    if (error) return (
      <div className="p-12 text-center bg-red-50 rounded-[40px] border border-red-100">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-black text-red-900 mb-2">Syncing Failed</h3>
        <p className="text-sm font-bold text-red-600">{error}</p>
        <button onClick={fetchBookings} className="mt-6 bg-red-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all">Retry</button>
      </div>
    );

    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Task Operations</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2">Oversee delivery, revisions, and payments</p>
                </div>
                <button onClick={fetchBookings} className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 text-slate-400 hover:text-blue-600 transition-all" title="Refresh">
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white rounded-[44px] shadow-2xl shadow-blue-900/5 border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Service Artifact</th>
                                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Lifecycle Status</th>
                                <th className="px-10 py-8 text-right text-[11px] font-black text-slate-500 uppercase tracking-widest">Active Workflow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/50">
                            {bookings.length > 0 ? bookings.map((booking) => (
                                <React.Fragment key={booking._id}>
                                <tr className="group hover:bg-slate-50/30 transition-all">
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-6">
                                           <div className="w-16 h-16 rounded-[28px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                               {booking.serviceId?.serviceType === 'remote' ? <Terminal className="w-7 h-7" /> : <MapPin className="w-7 h-7" />}
                                           </div>
                                           <div>
                                               <p className="font-black text-slate-900 text-lg mb-1">{booking.serviceId?.title || 'Bespoke Task'}</p>
                                               <div className="flex flex-col gap-1">
                                                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                                                     {booking.clientId?._id === (user?.id || user?._id) ? 'Expert' : 'Client'}: <span className="text-slate-900 font-black">{booking.clientId?._id === (user?.id || user?._id) ? booking.providerId?.name : booking.clientId?.name}</span>
                                                  </p>
                                                  <div className="flex items-center gap-3 text-[10px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-lg border border-blue-100/50">
                                                     <Calendar className="w-3 h-3" />
                                                     {new Date(booking.scheduleDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                     {booking.timeSlot?.start && (
                                                       <>
                                                         <span className="opacity-30 mx-1">|</span>
                                                         <Clock className="w-3 h-3" />
                                                         {booking.timeSlot.start} – {booking.timeSlot.end}
                                                       </>
                                                     )}
                                                  </div>
                                               </div>
                                           </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest border uppercase shadow-sm ${getStatusStyles(booking.status, booking.paid)}`}>
                                                {booking.status}
                                            </span>
                                            {booking.paid && <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Verified Payment ✓</span>}
                                            {booking.status === 'Rejected' && booking.rejectionReason && (
                                                <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1 bg-red-50 px-2 py-0.5 rounded border border-red-100/50 max-w-[200px] truncate" title={booking.rejectionReason}>
                                                    Reason: {booking.rejectionReason}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                       <div className="flex justify-end gap-3 items-center">
                                          {/* Message Button */}
                                          <Link 
                                            to={`/dashboard/messages?to=${user?.role === 'client' ? booking.providerId?._id : booking.clientId?._id}`} 
                                            className="p-3.5 rounded-2xl bg-blue-50/50 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm" 
                                            title="Direct Message"
                                          >
                                             <MessageSquare className="w-4 h-4" />
                                          </Link>
                                          
                                          {/* Provider: Accept/Reject for Pending bookings */}
                                          {user?.role === 'provider' && booking.status === 'Pending' && (
                                            <>
                                              <button onClick={() => handleAction('accept', booking._id)} disabled={actionLoading === booking._id} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50">Accept</button>
                                              <button onClick={() => handleAction('reject', booking._id)} disabled={actionLoading === booking._id} className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50">Reject</button>
                                            </>
                                          )}

                                          {/* Expand panel for active bookings or completed with evidence */}
                                          {['Accepted', 'Completed'].includes(booking.status) && (
                                             <button 
                                               onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                                               className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                             >
                                                {user?.role === 'provider' && booking.status === 'Accepted' ? 'Finalize Work' : 'Evidence & Feedback'}
                                                {expandedBooking === booking._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                             </button>
                                          )}

                                          {/* Client: Pay + Revision for completed unpaid */}
                                          {user?.role === 'client' && booking.status === 'Completed' && !booking.paid && (
                                             <>
                                                <button onClick={() => handleAction('pay', booking._id, { price: booking.basePrice, title: booking.serviceId?.title })} disabled={actionLoading === booking._id} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 disabled:opacity-50">Release Payment</button>
                                                <button onClick={() => handleAction('revision', booking._id)} disabled={actionLoading === booking._id} className="p-3.5 rounded-2xl bg-slate-100 text-slate-500 hover:text-blue-600 transition-all disabled:opacity-50"><RefreshCcw className="w-5 h-5" /></button>
                                             </>
                                          )}

                                          {/* Client: Cancel Request */}
                                          {user?.role === 'client' && ['Pending', 'Accepted'].includes(booking.status) && (
                                            <button 
                                              onClick={() => handleAction('cancel', booking._id)} 
                                              disabled={actionLoading === booking._id} 
                                              className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-6 py-3 rounded-2xl hover:bg-red-100 transition-all disabled:opacity-50"
                                            >
                                              Cancel
                                            </button>
                                          )}
                                       </div>
                                    </td>
                                </tr>

                                {/* Expanded Work Panel */}
                                {expandedBooking === booking._id && (
                                    <tr className="bg-slate-50/50">
                                       <td colSpan="3" className="px-10 py-12">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-top duration-500">
                                             <div className="space-y-6">
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                   <FileText className="w-4 h-4 text-blue-600" /> Project Brief
                                                </h4>
                                                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5">
                                                   <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">{booking.requirements?.description || 'No detailed instructions provided.'}</p>
                                                   {booking.requirements?.files?.length > 0 && (
                                                       <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                                                          {booking.requirements.files.map((f, i) => (
                                                              <a key={i} href={f} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black uppercase text-blue-600 border border-blue-50 hover:bg-blue-50 transition-colors">
                                                                  <Download className="w-3 h-3" /> Attachment {i+1}
                                                              </a>
                                                          ))}
                                                       </div>
                                                   )}
                                                </div>
                                             </div>

                                             <div className="space-y-6">
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                   <UploadCloud className="w-4 h-4 text-emerald-600" /> Evidence & Delivery
                                                </h4>
                                                
                                                {/* Provider Submission Mode */}
                                                {user?.role === 'provider' && booking.status === 'Accepted' ? (
                                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5 space-y-6">
                                                       <textarea 
                                                         className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/20"
                                                         placeholder="Describe the completed work artifacts or provide a summary..."
                                                         value={submissionData.message}
                                                         onChange={(e) => setSubmissionData({...submissionData, message: e.target.value})}
                                                       />
                                                       <ImageUpload 
                                                         label="Upload Completion Photos"
                                                         onUploadSuccess={(url) => setSubmissionData(prev => ({ ...prev, files: [...prev.files, url] }))}
                                                       />
                                                       {submissionData.files.length > 0 && (
                                                           <div className="flex flex-wrap gap-2">
                                                              {submissionData.files.map((f, i) => (
                                                                  <img key={i} src={f} className="w-10 h-10 rounded-lg object-cover" />
                                                              ))}
                                                           </div>
                                                       )}
                                                       <button 
                                                         onClick={() => handleAction(booking.serviceId?.serviceType === 'remote' ? 'submitWork' : 'complete', booking._id, submissionData)}
                                                         disabled={actionLoading === booking._id}
                                                         className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all disabled:opacity-50"
                                                       >
                                                          {actionLoading === booking._id ? 'Processing...' : 'finalize & Declare Completion'}
                                                        </button>
                                                    </div>
                                                ) : (booking.deliverables?.files?.length > 0 || booking.deliverables?.message) ? (
                                                    /* Evidence Preview for Client/Admin/Provider */
                                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5 space-y-6">
                                                        {booking.deliverables.message && <p className="text-xs font-medium text-slate-600 leading-relaxed border-b border-slate-50 pb-4">{booking.deliverables.message}</p>}
                                                        <div className="grid grid-cols-2 gap-4">
                                                           {booking.deliverables.files.map((f, i) => (
                                                               <a key={i} href={f} target="_blank" rel="noreferrer" className="group relative block aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                                                                   <img src={f} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                       <Download className="w-5 h-5 text-white" />
                                                                   </div>
                                                               </a>
                                                           ))}
                                                        </div>
                                                        {/* Client Review Section - Only visible to client when completed */}
                                                        {user?.role === 'client' && booking.status === 'Completed' && (
                                                            <div className="pt-6 border-t border-slate-50 space-y-4">
                                                                <div className="flex items-center gap-1">
                                                                    {[1,2,3,4,5].map(star => (
                                                                        <button key={star} onClick={() => setReviewData({...reviewData, rating: star})}>
                                                                            <Star className={`w-6 h-6 ${star <= reviewData.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-100'}`} />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                <textarea 
                                                                    className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold border-none outline-none"
                                                                    placeholder="Leave a public review..."
                                                                    value={reviewData.comment}
                                                                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                                                                />
                                                                <button onClick={() => handleAction('submitReview', booking._id, reviewData)} className="w-full py-3 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                                    <Heart className="w-3 h-3 fill-white" /> Submit Impression
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5 text-center py-16">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                           <UploadCloud className="w-6 h-6 text-slate-300" />
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Work Artifacts</p>
                                                    </div>
                                                )}
                                             </div>
                                          </div>
                                       </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="px-10 py-32 text-center">
                                       <div className="flex flex-col items-center gap-4 opacity-50">
                                          <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center border border-slate-100">
                                              <XCircle className="w-10 h-10 text-slate-300" />
                                          </div>
                                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Active Sessions Found</p>
                                       </div>
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

export default BookingsTable;
