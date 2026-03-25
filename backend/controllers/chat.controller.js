import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const getConversations = async (req, res) => {
  try {
    const sessions = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name profilePicture');
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    let session = await Conversation.findOne({
      participants: { $all: [req.user.id, otherUserId] }
    }).populate('participants', 'name profilePicture');
    
    if (!session) {
      session = await Conversation.create({
        participants: [req.user.id, otherUserId],
        lastMessage: 'Digital session initiated.'
      });
      session = await session.populate('participants', 'name profilePicture');
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
