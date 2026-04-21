import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  CreditCard,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ITEMS_PER_PAGE = 8;

const PaymentsTable = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await api.get('/payments/my');
                setPayments(res.data.data || res.data || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'HELD': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'RELEASED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'REFUNDED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (loading) return <div className="h-96 bg-slate-100 rounded-[40px] animate-pulse"></div>;
    if (error) return <div className="p-10 text-red-500 font-bold tracking-tight">Error connecting to payment gateway: {error}</div>;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Fiscal Control Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-100/50">
                <div>
                   <h1 className="text-xl font-black text-slate-950 tracking-tighter leading-none uppercase italic">Payment_Log</h1>
                   <div className="flex items-center gap-3 mt-2">
                       <p className="px-1.5 py-0.5 bg-slate-950 text-white rounded text-[8px] font-black uppercase tracking-[0.2em] leading-none">Fiscal_Flow</p>
                       <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Sync_Complete</p>
                   </div>
                </div>
            </div>

            {/* High-Fidelity Transaction Matrix */}
            <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden ring-1 ring-slate-100/50">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50/20 border-b border-slate-100/50">
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction_ID</th>
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Quant_Val</th>
                                <th className="px-5 py-3 text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal_Node</th>
                                <th className="px-5 py-3 text-center text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Status_Code</th>
                                <th className="px-5 py-3 text-right text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Matrix_Op</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/30">
                            {payments?.length > 0 ? (() => {
                                const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
                                const paginated = payments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                                return paginated.map((payment) => (
                                <tr key={payment._id} className="group/row hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-3">
                                           <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border transition-all duration-300 ${payment.status === 'HELD' ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'}`}>
                                               {payment.status === 'HELD' ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                                           </div>
                                           <div>
                                               <p className="font-black text-slate-950 text-[11px] mb-0.5 tracking-tight group-hover/row:text-blue-600 transition-colors uppercase leading-none">#{payment.bookingId?.toString().slice(-6).toUpperCase()}</p>
                                               <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[120px] italic">
                                                   REF: {payment.stripePaymentIntentId?.slice(-10).toUpperCase() || 'EXTERNAL'}
                                                </p>
                                           </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex flex-col">
                                            <p className="text-[11px] font-black text-slate-950 tracking-tight leading-none mb-1 italic">Rs. {payment.grossAmount}</p>
                                            <p className="text-[7px] uppercase font-black text-slate-400 tracking-widest leading-none opacity-40">NPR_CURR</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex flex-col">
                                           <p className="text-[9px] font-black text-slate-950 uppercase tracking-tight leading-none mb-1">{new Date(payment.paidAt).toLocaleDateString()}</p>
                                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none opacity-40">{new Date(payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex justify-center">
                                            <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border border-slate-100/50 shadow-sm ${getStatusStyle(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5 text-right">
                                       <button className="w-7 h-7 inline-flex items-center justify-center rounded bg-white border border-slate-100 text-slate-300 hover:text-slate-950 hover:bg-slate-50 transition-all shadow-sm">
                                          <ArrowRight className="w-3.5 h-3.5" />
                                       </button>
                                    </td>
                                </tr>
                            )); })() : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center opacity-20">
                                       <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                                       <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Empty Fiscal Register</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tactical Pagination Console */}
            {payments?.length > ITEMS_PER_PAGE && (() => {
                const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
                return (
                    <div className="flex items-center justify-between px-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">
                        <p>INDEX: {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, payments.length)} / {payments.length}</p>
                        <div className="flex items-center gap-6">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">PREV_SEQ</button>
                            <span className="text-slate-950 font-black">{currentPage} | {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="hover:text-slate-950 disabled:opacity-20 transition-all font-black">NEXT_SEQ</button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default PaymentsTable;
