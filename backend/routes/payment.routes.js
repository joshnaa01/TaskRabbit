import express from 'express';
import { verifyKhaltiPayment, getMyPayments } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/verify', protect, verifyKhaltiPayment);
router.get('/my', protect, getMyPayments);

export default router;
