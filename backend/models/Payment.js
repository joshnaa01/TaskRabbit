import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  khaltiTransactionId: { type: String, required: true },
  grossAmount: { type: Number, required: true },
  platformCommission: { type: Number, required: true },
  netProviderAmount: { type: Number, required: true },
  status: { type: String, enum: ['HELD', 'RELEASED', 'REFUNDED'], default: 'HELD' },
  paidAt: { type: Date, default: Date.now },
  releasedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Payment', PaymentSchema);
