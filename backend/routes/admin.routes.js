import express from 'express';
import { getAdminStats, getUsers, updateUserStatus, deleteUser, resolveDispute } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUserStatus);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.post('/disputes/:id/resolve', protect, authorize('admin'), resolveDispute);

export default router;
