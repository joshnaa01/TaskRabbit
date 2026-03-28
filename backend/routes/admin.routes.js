import express from 'express';
import { 
  getAdminStats, 
  getUsers, 
  updateUserStatus, 
  deleteUser, 
  resolveDispute, 
  sendEmail,
  getPendingReviews,
  approveCompletion,
  rejectCompletion
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUserStatus);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.post('/disputes/:id/resolve', protect, authorize('admin'), resolveDispute);
router.post('/email', protect, authorize('admin'), sendEmail);

// Work Completion Review Routes
router.get('/completion-reviews', protect, authorize('admin'), getPendingReviews);
router.post('/completion-reviews/:id/approve', protect, authorize('admin'), approveCompletion);
router.post('/completion-reviews/:id/reject', protect, authorize('admin'), rejectCompletion);

export default router;
