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
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getBookings)
  .post(protect, createBookingRequest);

router.get('/my', protect, getBookings);
router.route('/:id/status').put(protect, updateBookingStatus);
router.patch('/:id/complete', protect, completeBooking);
router.post('/:id/pay', protect, payBooking);
router.patch('/:id/deliverables', protect, submitDeliverables);
router.post('/:id/revision', protect, requestRevision);

export default router;
