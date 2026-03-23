import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: String },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Conversation', ConversationSchema);
