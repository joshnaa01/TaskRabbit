import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled', 'Disputed'], default: 'Pending' },
  scheduleDate: { type: Date, required: true },
  timeSlot: {
    start: { type: String },  // "09:00"
    end: { type: String },    // "11:00"
  },
  details: { type: String },
  address: { type: String, required: true },
  
  // Remote Work Specifics
  requirements: {
    description: { type: String },
    files: [{ type: String }] // URLs to multimedia/documents
  },
  deliverables: {
    files: [{ type: String }],
    message: { type: String },
    submittedAt: { type: Date }
  },
  revisions: [{
    feedback: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],

  basePrice: { type: Number },
  finalPrice: { type: Number },
  paid: { type: Boolean, default: false },
  khaltiTransactionId: { type: String },
  stripePaymentIntentId: { type: String },
  rejectionReason: { type: String },
  isDisputed: { type: Boolean, default: false },
  dispute: {
    reason: { type: String },
    status: { type: String, enum: ['Open', 'Resolved', 'Closed'], default: 'Open' },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    adminVerdict: { type: String },
    createdAt: { type: Date }
  }
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
