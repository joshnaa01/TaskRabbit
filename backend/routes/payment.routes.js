import express from 'express';
import { createPaymentIntent, confirmPayment, getStripeKey, getMyPayments } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stripe-key', protect, getStripeKey);
router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);
router.get('/my', protect, getMyPayments);

export default router;
