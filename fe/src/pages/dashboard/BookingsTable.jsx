import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
  RefreshCcw
} from 'lucide-react';

import { initiateKhaltiPayment } from '../../services/khalti';

const BookingsTable = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [submissionData, setSubmissionData] = useState({ message: '', files: [] });

    const { data: bookings = [], isLoading, error } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await api.get('/bookings/my');
            return res.data.data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => api.put(`/bookings/${id}/status`, { status }),
        onSuccess: () => {
          queryClient.invalidateQueries(['bookings']);
          alert("Booking status updated!");
        }
    });

    const submitWorkMutation = useMutation({
        mutationFn: ({ id, files, message }) => api.patch(`/bookings/${id}/deliverables`, { files, message }),
        onSuccess: () => {
          queryClient.invalidateQueries(['bookings']);
          alert("Work submitted for client review!");
          setExpandedBooking(null);
        }
    });

    const revisionMutation = useMutation({
        mutationFn: ({ id, feedback }) => api.post(`/bookings/${id}/revision`, { feedback }),
        onSuccess: () => {
          queryClient.invalidateQueries(['bookings']);
          alert("Revision request sent to provider.");
          setExpandedBooking(null);
        }
    });

    const payMutation = useMutation({
        mutationFn: ({ id, transactionId }) => api.post(`/bookings/${id}/pay`, { transactionId }),
        onSuccess: () => {
          queryClient.invalidateQueries(['bookings']);
          alert("Payment successfully verified via Khalti!");
        }
    });

    const handlePayRequest = async (booking) => {
       try {
          const result = await initiateKhaltiPayment({
             amount: booking.basePrice * 100,
             purchase_id: booking._id,
             purchase_name: `Payment for ${booking.serviceId?.title || 'Service'}`
          });
          payMutation.mutate({ id: booking._id, transactionId: result.transaction_id });
       } catch (err) {
          console.error("Payment Error:", err);
          alert("Payment failed. Please try again.");
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

    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-600/10"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Bookings...</p>
      </div>
    );

    return (
        <div className="flex flex-col gap-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Manage Task Operations</h1>
                <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mt-2">Oversee delivery, revisions, and automated khalti payments</p>
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
                            {bookings.map((booking) => (
                                <React.Fragment key={booking._id}>
                                <tr className="group hover:bg-slate-50/30 transition-all">
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-6">
                                           <div className="w-16 h-16 rounded-[28px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                               {booking.serviceId?.serviceType === 'remote' ? <Terminal className="w-7 h-7" /> : <MapPin className="w-7 h-7" />}
                                           </div>
                                           <div>
                                               <p className="font-black text-slate-900 text-lg mb-1">{booking.serviceId?.title || 'Bespoke Task'}</p>
                                               <div className="flex items-center gap-2">
                                                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                                                     {user.role === 'client' ? 'Expert' : 'Client'}: <span className="text-slate-900 font-black">{user.role === 'client' ? booking.providerId?.name : booking.clientId?.name}</span>
                                                  </p>
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
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                       <div className="flex justify-end gap-3 items-center">
                                          {user.role === 'provider' && booking.status === 'Pending' && (
                                            <>
                                              <button onClick={() => updateStatusMutation.mutate({ id: booking._id, status: 'Accepted' })} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all">Accept</button>
                                              <button onClick={() => updateStatusMutation.mutate({ id: booking._id, status: 'Rejected' })} className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all">Reject</button>
                                            </>
                                          )}

                                          {booking.status === 'Accepted' && (
                                             <button 
                                               onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                                               className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                             >
                                                {user.role === 'provider' ? 'Manage Work' : 'View Requirements'}
                                                {expandedBooking === booking._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                             </button>
                                          )}

                                          {user.role === 'client' && booking.status === 'Completed' && !booking.paid && (
                                             <>
                                                <button onClick={() => handlePayRequest(booking)} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200">Release Payment</button>
                                                <button onClick={() => setExpandedBooking(booking._id)} className="p-3.5 rounded-2xl bg-slate-100 text-slate-500 hover:text-blue-600 transition-all"><RefreshCcw className="w-5 h-5" /></button>
                                             </>
                                          )}
                                       </div>
                                    </td>
                                </tr>
                                {expandedBooking === booking._id && (
                                    <tr className="bg-slate-50/50">
                                       <td colSpan="3" className="px-10 py-12">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-top duration-500">
                                             {/* Client Requirements Side */}
                                             <div className="space-y-6">
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                   <FileText className="w-4 h-4 text-blue-600" /> Project Requirements
                                                </h4>
                                                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5">
                                                   <p className="text-sm font-medium text-slate-600 leading-relaxed mb-6">{booking.requirements?.description || 'No detailed instructions provided.'}</p>
                                                   {booking.requirements?.files?.length > 0 && (
                                                       <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                                                          {booking.requirements.files.map((f, i) => (
                                                              <a key={i} href={f} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-tight text-blue-600 border border-blue-50 hover:bg-blue-50 transition-colors">
                                                                  <Download className="w-3 h-3" /> Asset {i+1}
                                                              </a>
                                                          ))}
                                                       </div>
                                                   )}
                                                </div>
                                             </div>

                                             {/* Provider Action Side */}
                                             <div className="space-y-6">
                                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                   <UploadCloud className="w-4 h-4 text-emerald-600" /> Digital Workflow
                                                </h4>
                                                <div className="space-y-4">
                                                   {user.role === 'provider' ? (
                                                       <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5 space-y-6">
                                                          <textarea 
                                                            className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/20"
                                                            placeholder="Describe the completed work artifacts or provide status updates..."
                                                            value={submissionData.message}
                                                            onChange={(e) => setSubmissionData({...submissionData, message: e.target.value})}
                                                          />
                                                          <ImageUpload 
                                                            label="Upload Final Deliverables"
                                                            onUploadSuccess={(url) => setSubmissionData(prev => ({ ...prev, files: [...prev.files, url] }))}
                                                          />
                                                          <button 
                                                            onClick={() => submitWorkMutation.mutate({ id: booking._id, ...submissionData })}
                                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all"
                                                          >
                                                             Confirm Work Submission
                                                          </button>
                                                       </div>
                                                   ) : (
                                                       <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5 space-y-6">
                                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Deliverables from Expert</p>
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
        </div>
    );
};

export default BookingsTable;
