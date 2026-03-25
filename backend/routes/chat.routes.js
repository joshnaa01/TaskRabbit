import express from 'express';
import { getConversations, getMessages, getOrCreateConversation } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/conversations/:otherUserId', protect, getOrCreateConversation);
router.get('/messages/:conversationId', protect, getMessages);

export default router;
