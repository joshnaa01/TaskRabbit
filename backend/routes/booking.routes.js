import express from 'express';
import {
  createBookingRequest,
  getBookings,
  updateBookingStatus,
  completeBooking,
  payBooking,
  submitDeliverables,
  requestRevision
} from '../controllers/booking.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, authorize('client'), createBookingRequest);

router.get('/my', protect, getBookings);
router.route('/:id/status').put(protect, authorize('provider', 'admin', 'client'), updateBookingStatus);
router.patch('/:id/complete', protect, authorize('provider'), completeBooking);
router.post('/:id/pay', protect, authorize('client'), payBooking);
router.patch('/:id/deliverables', protect, authorize('provider'), submitDeliverables);
router.post('/:id/revision', protect, authorize('client'), requestRevision);

export default router;
