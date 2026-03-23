import express from 'express';
import { createReview, getProviderReviews } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/provider/:providerId', getProviderReviews);

export default router;
