import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '../../services/api';
import { toast } from 'sonner';
import { CreditCard, X, ShieldCheck, Lock } from 'lucide-react';

let stripePromise = null;

const getStripe = async () => {
  if (!stripePromise) {
    const { data } = await api.get('/payments/stripe-key');
    stripePromise = loadStripe(data.publishableKey);
  }
  return stripePromise;
};

const cardElementOptions = {
  style: {
    base: {
      fontSize: '14px',
      fontFamily: '"Inter", system-ui, sans-serif',
      fontWeight: '600',
      color: '#1e293b',
      letterSpacing: '0.02em',
      '::placeholder': {
        color: '#94a3b8',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
};

// Inner form component that uses Stripe hooks
const CheckoutForm = ({ bookingId, amount, serviceName, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const createIntent = async () => {
      try {
        const { data } = await api.post('/payments/create-intent', { bookingId });
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize payment');
      }
    };
    createIntent();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setError('');

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm on our backend
        await api.post('/payments/confirm', {
          bookingId,
          paymentIntentId: paymentIntent.id,
        });

        toast.success('Payment successful! Provider has been notified.');
        onSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Display */}
      <div className="text-center py-5 bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-2xl border border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
        <p className="text-2xl font-black text-slate-900 tracking-tighter">
          ${(amount || 0).toFixed(2)}
        </p>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{serviceName}</p>
      </div>

      {/* Card Input */}
      <div className="space-y-2">
        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Card Details</label>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 focus-within:border-slate-950 transition-all">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-black uppercase tracking-widest text-center">
          {error}
        </div>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-slate-400 pt-1">
        <Lock className="w-3 h-3" />
        <span className="text-[8px] font-black uppercase tracking-widest">Secured by Stripe</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing || !clientSecret}
        className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all disabled:opacity-50"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-3">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            PROCESSING...
          </span>
        ) : (
          `CONFIRM & PAY $${(amount || 0).toFixed(2)}`
        )}
      </button>
    </form>
  );
};

// Main modal wrapper
const StripePaymentModal = ({ isOpen, onClose, bookingId, amount, serviceName, onSuccess }) => {
  const [stripeInstance, setStripeInstance] = useState(null);
  const [loadingStripe, setLoadingStripe] = useState(true);

  useEffect(() => {
    if (isOpen) {
      getStripe().then((s) => {
        setStripeInstance(s);
        setLoadingStripe(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Complete Payment</h3>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Secure Checkout</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {loadingStripe ? (
            <div className="py-16 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Payment Gateway...</p>
            </div>
          ) : stripeInstance ? (
            <Elements stripe={stripeInstance}>
              <CheckoutForm
                bookingId={bookingId}
                amount={amount}
                serviceName={serviceName}
                onSuccess={onSuccess}
                onClose={onClose}
              />
            </Elements>
          ) : (
            <div className="py-16 text-center text-red-500 text-xs font-black uppercase tracking-widest">
              Failed to load Stripe. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripePaymentModal;
