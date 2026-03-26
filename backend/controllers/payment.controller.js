import Stripe from 'stripe';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

// Create a Stripe PaymentIntent for a booking
export const createPaymentIntent = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findById(bookingId).populate('serviceId');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.clientId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (!['Pending', 'Completed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Booking must be Pending or Completed to initiate payment' });
    }
    if (booking.paid) return res.status(400).json({ success: false, message: 'Booking already paid' });

    const amountInCents = Math.round((booking.finalPrice || booking.basePrice || booking.price) * 100);

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        bookingId: booking._id.toString(),
        clientId: req.user.id,
        providerId: booking.providerId.toString(),
        serviceName: booking.serviceId?.title || 'Service'
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: amountInCents
    });
  } catch (error) {
    console.error('Create PaymentIntent Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Confirm payment after Stripe Elements completes
export const confirmPayment = async (req, res) => {
  const { bookingId, paymentIntentId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.clientId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Verify with Stripe
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: `Payment not completed. Status: ${paymentIntent.status}` });
    }

    const grossAmount = paymentIntent.amount / 100;
    const commission = grossAmount * 0.10; // 10% platform fee
    const netAmount = grossAmount - commission;

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      clientId: req.user.id,
      providerId: booking.providerId,
      stripePaymentIntentId: paymentIntentId,
      grossAmount,
      platformCommission: commission,
      netProviderAmount: netAmount,
      status: 'HELD',
      paidAt: Date.now()
    });

    // Mark booking as paid
    booking.paid = true;
    booking.stripePaymentIntentId = paymentIntentId;
    await booking.save();

    // Notify provider
    const conversation = await Conversation.findOne({ participants: { $all: [booking.providerId, booking.clientId] } });
    await Notification.create({
      recipient: booking.providerId,
      sender: req.user.id,
      type: 'payment_received',
      title: 'Payment Received',
      message: `You have received a payment of $${grossAmount.toFixed(2)} for the completed booking.`,
      bookingId: booking._id,
      conversationId: conversation?._id
    });

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Stripe publishable key
export const getStripeKey = async (req, res) => {
  res.status(200).json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
};

export const getMyPayments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'client') query.clientId = req.user.id;
    else if (req.user.role === 'provider') query.providerId = req.user.id;
    
    const payments = await Payment.find(query)
      .populate('bookingId')
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
