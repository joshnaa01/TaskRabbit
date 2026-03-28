import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const getConversations = async (req, res) => {
  try {
    const sessions = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name profilePicture role')
      .sort({ updatedAt: -1 });
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
      isGroup: false,
      participants: { $all: [req.user.id, otherUserId] }
    }).populate('participants', 'name profilePicture role');
    
    if (!session) {
      session = await Conversation.create({
        participants: [req.user.id, otherUserId],
        lastMessage: 'Digital session initiated.'
      });
      session = await session.populate('participants', 'name profilePicture role');
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGroupConversation = async (req, res) => {
    try {
        const { participantIds, groupName } = req.body;
        if (!participantIds || participantIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Participants required' });
        }

        // Add admin to participants
        const participants = [...new Set([...participantIds, req.user.id])];

        const session = await Conversation.create({
            participants,
            isGroup: true,
            groupName: groupName || `Group Chat ${new Date().toLocaleDateString()}`,
            lastMessage: 'Group communication established.'
        });

        const populated = await session.populate('participants', 'name profilePicture role');
        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
