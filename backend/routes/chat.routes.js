import express from 'express';
import { getConversations, getMessages } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);

export default router;
