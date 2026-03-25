import express from 'express';
import { getMyNotifications, markAsRead, markSingleAsRead } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/my', protect, getMyNotifications);
router.put('/mark-read', protect, markAsRead);
router.put('/:id/mark-read', protect, markSingleAsRead);

export default router;
