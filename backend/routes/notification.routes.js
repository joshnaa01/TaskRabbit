import express from 'express';
import { getMyNotifications, markAsRead, markSingleAsRead, deleteNotification } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/my', protect, getMyNotifications);
router.put('/mark-read', protect, markAsRead);
router.put('/:id/mark-read', protect, markSingleAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
