import express from 'express';
import { getConversations, getMessages, getOrCreateConversation, createGroupConversation } from '../controllers/chat.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/conversations/:otherUserId', protect, getOrCreateConversation);
router.post('/groups', protect, authorize('admin'), createGroupConversation);
router.get('/messages/:conversationId', protect, getMessages);

export default router;
