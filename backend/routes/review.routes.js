import express from 'express';
import { createReview, getProviderReviews, getServiceReviews } from '../controllers/review.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createReview); // Client only (logic in ctrl)
router.get('/provider/:providerId', getProviderReviews);
router.get('/service/:serviceId', getServiceReviews);

export default router;
