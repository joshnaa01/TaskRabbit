import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  serviceType: { type: String, enum: ['onsite', 'remote'], required: true },
  pricingType: { type: String, enum: ['fixed', 'hourly'], required: true },
  price: { type: Number, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
    address: { type: String }
  },
  images: { type: [String], default: [] },
  isActive: { type: Boolean, default: true } // Soft delete
}, { timestamps: true });

export default mongoose.model('Service', ServiceSchema);
