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
      fontSize: '16px',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontWeight: '500',
      color: '#1e293b',
      letterSpacing: '0.025em',
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
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-600/30 mb-8">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Payment Successful!</h2>
        <p className="text-sm text-slate-500 font-medium mb-2">Your payment of <span className="font-black text-emerald-600">Rs. {(booking.basePrice || 0).toFixed(2)}</span> has been processed.</p>
        <p className="text-xs text-slate-400 font-bold mb-10">The provider has been notified and funds will be released.</p>
        <button
          onClick={() => navigate('/dashboard/bookings')}
          className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* ─── Left Column – Order Summary ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden">
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-8 py-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">Order Summary</h3>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Booking #{booking._id?.slice(-8)}</p>
            </div>

            {/* Details */}
            <div className="p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  {booking.serviceId?.serviceType === 'remote' ? (
                    <Terminal className="w-5 h-5 text-blue-600" />
                  ) : (
                    <MapPin className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-black text-slate-900">{booking.serviceId?.title || 'Service'}</p>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">{booking.serviceId?.serviceType === 'remote' ? 'Remote Service' : 'On-site Service'}</p>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</p>
                  <p className="font-bold text-slate-800 text-sm">{booking.providerId?.name || 'Service Provider'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled</p>
                  <p className="font-bold text-slate-800 text-sm">
                    {new Date(booking.scheduleDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    {booking.timeSlot?.start && ` • ${booking.timeSlot.start} – ${booking.timeSlot.end}`}
                  </p>
                </div>
              </div>

              {booking.status && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                    <p className="font-bold text-emerald-600 text-sm">{booking.status}</p>
                  </div>
                </div>
              )}

              <div className="h-px bg-slate-100" />

              {/* Price Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Service Fee</span>
                  <span className="font-bold text-slate-800">Rs. {(booking.basePrice || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Platform Fee</span>
                  <span className="font-bold text-slate-800">Rs. 0.00</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900">Total</span>
                  <span className="text-2xl font-black text-slate-900">Rs. {(booking.basePrice || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Lock, label: '256-bit SSL', sub: 'Encryption' },
              { icon: ShieldCheck, label: 'PCI DSS', sub: 'Compliant' },
              { icon: BadgeCheck, label: 'Stripe', sub: 'Secured' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-slate-100 py-4 px-3">
                <Icon className="w-5 h-5 text-slate-400" />
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-wide">{label}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right Column – Payment Form ─────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-blue-900/5 p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Payment Details</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter your card information</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Card Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> Card Number
                </label>
                <div className="bg-slate-50/80 border-2 border-slate-200 rounded-2xl px-5 py-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all">
                  <CardNumberElement options={{
                    ...elementStyle,
                    showIcon: true,
                  }} />
                </div>
              </div>

              {/* Expiry & CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Expiry Date
                  </label>
                  <div className="bg-slate-50/80 border-2 border-slate-200 rounded-2xl px-5 py-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all">
                    <CardExpiryElement options={elementStyle} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                    <Lock className="w-3 h-3" /> CVC
                  </label>
                  <div className="bg-slate-50/80 border-2 border-slate-200 rounded-2xl px-5 py-4 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:bg-white transition-all">
                    <CardCvcElement options={elementStyle} />
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center animate-in fade-in slide-in-from-top duration-300">
                  {error}
                </div>
              )}

              {/* Stripe Badge */}
              <div className="flex items-center justify-center gap-2 text-slate-400 pt-2">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Secured by Stripe</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!stripe || processing || !clientSecret}
                className="w-full py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-3"
              >
                {processing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Pay Rs. {(booking.basePrice || 0).toFixed(2)}
                  </>
                )}
              </button>

              {/* Footer Note */}
              <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed">
                By clicking "Pay" you agree to release the payment once you're satisfied with the delivered work.
                <br />
                Your payment is protected by our <span className="font-bold text-blue-500">Buyer Protection Policy</span>.
              </p>
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
          navigate('/dashboard/bookings', { replace: true });
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
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Preparing Secure Checkout...</p>
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
          onClick={() => navigate('/dashboard/bookings')}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate('/dashboard/bookings')}
          className="p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 text-slate-400 hover:text-blue-600 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Secure Checkout</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Complete your payment securely
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
