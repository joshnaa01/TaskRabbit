import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import axios from 'axios'; 

export const verifyKhaltiPayment = async (req, res) => {
  const { token, amount, bookingId } = req.body;
  
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    if (booking.status !== 'Accepted') {
      return res.status(400).json({ success: false, message: 'Booking must be Accepted by provider before payment' });
    }

    let data = { token, amount };
    // let config = {
    //   headers: { 'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}` }
    // };
    
    // axios.post("https://khalti.com/api/v2/payment/verify/", data, config) -> Mocked below:
    const khaltiTransactionId = token; // simulated response token

    const commission = (amount / 100) * 0.10; // 10%
    const netAmount = (amount / 100) - commission;

    const payment = await Payment.create({
      bookingId,
      clientId: req.user.id,
      providerId: booking.providerId,
      khaltiTransactionId,
      grossAmount: amount / 100, // Khalti amount is in paisa
      platformCommission: commission,
      netProviderAmount: netAmount,
      status: 'HELD',
      paidAt: Date.now()
    });

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Khalti Verification Failed', error: error.message });
  }
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
