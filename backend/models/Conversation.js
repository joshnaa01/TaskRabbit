import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String },
  lastMessage: { type: String },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Conversation', ConversationSchema);
