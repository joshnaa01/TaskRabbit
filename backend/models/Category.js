import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
  isActive: { type: Boolean, default: true } // Soft delete
}, { timestamps: true });

export default mongoose.model('Category', CategorySchema);
