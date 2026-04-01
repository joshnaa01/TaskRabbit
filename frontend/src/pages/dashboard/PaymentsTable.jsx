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
        <div className="flex flex-col gap-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payments</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mt-2">Track your transactions and payouts</p>
                </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Transaction Details</th>
                                <th className="px-10 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                <th className="px-10 py-6 text-xs font-black text-slate-500 uppercase tracking-widest">Date & Time</th>
                                <th className="px-10 py-6 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-10 py-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payments?.length > 0 ? (() => {
                                const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
                                const paginated = payments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                                return paginated.map((payment) => (
                                <tr key={payment._id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-6">
                                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-black ${payment.status === 'HELD' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                               {payment.status === 'HELD' ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                                           </div>
                                           <div>
                                               <p className="font-black text-slate-900 text-lg mb-1">Booking: #{payment.bookingId?.toString().slice(-6)}</p>
                                               <p className="text-sm text-slate-400 font-bold flex items-center gap-2">
                                                  ID: <span className="font-black text-slate-500">{payment.khaltiTransactionId?.slice(0, 10)}...</span>
                                               </p>
                                           </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex flex-col">
                                            <p className="text-xl font-black text-slate-900 tracking-tighter">Rs. {payment.grossAmount}</p>
                                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">NPR</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm font-black text-slate-900 flex items-center gap-2 tracking-tight">
                                               <Clock className="w-4 h-4 text-blue-600" /> {new Date(payment.paidAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm font-bold text-slate-500 flex items-center gap-2 tracking-tight">
                                               <CheckCircle2 className="w-4 h-4 text-slate-400" /> {new Date(payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10">
                                        <div className="flex justify-center">
                                            <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black tracking-widest border uppercase ${getStatusStyle(payment.status)}`}>
                                                {payment.status === 'HELD' ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                {payment.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-10 text-right">
                                       <button className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 text-slate-400 hover:text-blue-600">
                                          <ArrowRight className="w-6 h-6" />
                                       </button>
                                    </td>
                                </tr>
                            )); })() : (
                                <tr>
                                    <td colSpan={5} className="px-10 py-24 text-center">
                                       <div className="flex flex-col items-center">
                                          <div className="p-6 bg-slate-50 rounded-full mb-6">
                                             <CreditCard className="w-12 h-12 text-slate-200" />
                                          </div>
                                          <h3 className="text-xl font-black text-slate-900 mb-2">No Transactions Yet</h3>
                                          <p className="text-slate-400 text-sm font-medium">Your payment history will appear here once you book a service.</p>
                                       </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {payments?.length > ITEMS_PER_PAGE && (() => {
                const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
                return (
                    <div className="flex items-center justify-between px-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, payments.length)} of {payments.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Previous</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === page ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-500 hover:border-blue-200'}`}>{page}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">Next</button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default PaymentsTable;
