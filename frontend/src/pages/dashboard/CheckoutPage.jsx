import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '../../services/api';
import { toast } from 'sonner';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  MapPin,
  Terminal,
  Sparkles,
  BadgeCheck,
  Receipt,
  Wallet,
} from 'lucide-react';

let stripePromise = null;

const getStripe = async () => {
  if (!stripePromise) {
    const { data } = await api.get('/payments/stripe-key');
    stripePromise = loadStripe(data.publishableKey);
  }
  return stripePromise;
};

const elementStyle = {
  style: {
    base: {
      fontSize: '14px',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontWeight: '500',
      color: '#1e293b',
      letterSpacing: '0.01em',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

// ─── Inner Checkout Form ─────────────────────────────────────────────
const CheckoutForm = ({ booking, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const createIntent = async () => {
      try {
        const { data } = await api.post('/payments/create-intent', { bookingId: booking._id });
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize payment');
      }
    };
    createIntent();
  }, [booking._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setError('');

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await api.post('/payments/confirm', {
          bookingId: booking._id,
          paymentIntentId: paymentIntent.id,
        });

        setSuccess(true);
        toast.success('Payment successful! Provider has been notified.');
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ─── Success State ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20 mb-6">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase">Payment Successful!</h2>
        <p className="text-xs text-slate-500 font-medium mb-1">Your payment of <span className="font-black text-emerald-600">Rs. {(booking.basePrice || 0).toFixed(2)}</span> has been processed.</p>
        <p className="text-[10px] text-slate-400 font-bold mb-8 uppercase tracking-widest leading-none">Provider notified • Funds secured</p>
        <button
          onClick={() => navigate('/client/bookings')}
          className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ─── Left Column – Order Summary ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-blue-900/5 overflow-hidden">
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center text-white">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[10px] font-black text-white tracking-widest uppercase">Order Summary</h3>
              </div>
              <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1.5 leading-none">ID: #{booking._id?.slice(-8).toUpperCase()}</p>
            </div>

            {/* Details */}
            <div className="p-5 space-y-3.5">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  {booking.serviceId?.serviceType === 'remote' ? (
                    <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-slate-950 uppercase truncate tracking-tight">{booking.serviceId?.title || 'Service'}</p>
                  <p className="text-[7px] text-slate-400 font-black uppercase mt-0.5 tracking-widest leading-none">{booking.serviceId?.serviceType === 'remote' ? 'Remote Delivery' : 'On-site Task'}</p>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Provider</p>
                  <p className="font-bold text-slate-800 text-[10px] mt-0.5">{booking.providerId?.name || 'Provider'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Scheduled</p>
                  <p className="font-bold text-slate-800 text-[10px] mt-0.5">
                    {new Date(booking.scheduleDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    {booking.timeSlot?.start && ` @ ${booking.timeSlot.start}`}
                  </p>
                </div>
              </div>

              {booking.status && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Confirmation</p>
                    <p className="font-bold text-emerald-600 text-[10px] mt-0.5">{booking.status}</p>
                  </div>
                </div>
              )}

              <div className="h-px bg-slate-100" />

              {/* Price Breakdown */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wider">Service Fee</span>
                  <span className="font-bold text-slate-800">Rs. {booking.basePrice?.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Total Payable</span>
                  <span className="text-base font-black text-slate-950 leading-none">Rs. {booking.basePrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Lock, label: 'SSL', sub: 'SECURE' },
              { icon: ShieldCheck, label: 'PCI', sub: 'COMPLIANT' },
              { icon: BadgeCheck, label: 'STRIPE', sub: 'VERIFIED' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1 bg-white rounded-xl border border-slate-100 py-3 px-1 shadow-sm">
                <Icon className="w-3 h-3 text-slate-400" />
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-800 uppercase tracking-tighter mb-0.5">{label}</p>
                  <p className="text-[6px] font-black text-slate-300 uppercase tracking-widest leading-none">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right Column – Payment Form ─────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-blue-900/5 p-6 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest">Payment Details</h3>
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.25em] mt-1.5 leading-none">Securely pay with your card</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Card Number */}
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Card Number</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus-within:border-slate-950 transition-all">
                  <CardNumberElement options={{
                    ...elementStyle,
                    showIcon: true,
                  }} />
                </div>
              </div>

              {/* Expiry & CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-0.5">Expiry Date</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus-within:border-slate-950 transition-all">
                    <CardExpiryElement options={elementStyle} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-0.5">CVC Code</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus-within:border-slate-950 transition-all">
                    <CardCvcElement options={elementStyle} />
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[8px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-1 duration-300">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!stripe || processing || !clientSecret}
                className="w-full py-3.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.25em] shadow-xl shadow-slate-950/10 hover:bg-slate-900 transition-all disabled:opacity-30 flex items-center justify-center gap-3 mt-4"
              >
                {processing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    PROCESSING TRANSACTION...
                  </>
                ) : (
                  <>
                    <Wallet className="w-3.5 h-3.5" />
                    PAY Rs. {booking.basePrice?.toFixed(2)}
                  </>
                )}
              </button>

              {/* Footer Note */}
              <div className="text-center space-y-2 pt-2">
                <div className="flex items-center justify-center gap-2 text-slate-300">
                  <Lock className="w-2.5 h-2.5" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Secured by Stripe Infrastructure</span>
                </div>
                <p className="text-[7px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed max-w-[240px] mx-auto opacity-60">
                  Funds held in escrow. Released to provider only after service completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

// ─── Main Page Component ─────────────────────────────────────────────
const CheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [stripeInstance, setStripeInstance] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        // Load Stripe + Booking in parallel
        const [stripe, bookingsRes] = await Promise.all([
          getStripe(),
          api.get('/bookings/my'),
        ]);

        setStripeInstance(stripe);

        const bookings = bookingsRes.data.data || bookingsRes.data || [];
        const found = bookings.find((b) => b._id === bookingId);

        if (!found) {
          setError('Booking not found.');
          return;
        }

        if (found.paid) {
          toast.info('This booking has already been paid.');
          navigate('/client/bookings', { replace: true });
          return;
        }

        setBooking(found);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load checkout.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-600/10" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Checkout Unavailable</h2>
        <p className="text-sm text-slate-500 font-medium">{error}</p>
        <button
          onClick={() => navigate('/client/bookings')}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/client/bookings')}
          className="p-2.5 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Secure Checkout</h1>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
            Complete your payment to continue
          </p>
        </div>
      </div>

      {/* Stripe Elements Wrapper */}
      {stripeInstance && booking ? (
        <Elements stripe={stripeInstance}>
          <CheckoutForm booking={booking} onSuccess={() => {}} />
        </Elements>
      ) : (
        <div className="text-center py-20 text-red-500 text-xs font-black uppercase tracking-widest">
          Failed to load Stripe. Please try again.
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
