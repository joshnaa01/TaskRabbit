import {
  createBookingService,
  submitDeliverablesService,
  requestRevisionService,
  raiseDisputeService,
  getBookingsService,
  updateBookingStatusService,
  completeBookingService,
  payBookingService,
  complainService
} from '../services/booking.service.js';

export const createBookingRequest = async (req, res) => {
  try {
    const data = await createBookingService(req.user.id, req.user.name, req.body);
    res.status(201).json({ success: true, data: data.booking, conversationId: data.conversationId });
  } catch (error) {
    if (error.message.includes('Platform Policy')) return res.status(403).json({ success: false, message: error.message });
    if (error.message.includes('time slot')) return res.status(409).json({ success: false, message: error.message });
    res.status(400).json({ success: false, message: error.message });
  }
};

export const submitDeliverables = async (req, res) => {
  try {
    const booking = await submitDeliverablesService(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Work submitted successfully', data: booking });
  } catch (error) {
    res.status(error.message === 'Not authorized' ? 403 : 500).json({ success: false, message: error.message });
  }
};

export const requestRevision = async (req, res) => {
  try {
    const booking = await requestRevisionService(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Revision requested', data: booking });
  } catch (error) {
    res.status(error.message === 'Not authorized' ? 403 : 500).json({ success: false, message: error.message });
  }
};

export const raiseDispute = async (req, res) => {
  try {
    const booking = await raiseDisputeService(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Dispute raised successfully', data: booking });
  } catch (error) {
    res.status(error.message === 'Not authorized' ? 403 : 500).json({ success: false, message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await getBookingsService(req.user);
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await updateBookingStatusService(req.params.id, req.user, req.body);
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(error.message.includes('Not authorized') ? 403 : 400).json({ success: false, message: error.message });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const booking = await completeBookingService(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Booking completed', data: booking });
  } catch (error) {
    res.status(error.message.includes('providers can complete') ? 403 : 500).json({ success: false, message: error.message });
  }
};

export const payBooking = async (req, res) => {
  try {
    const booking = await payBookingService(req.params.id, req.user.id, req.body.transactionId);
    res.status(200).json({ success: true, message: 'Payment successful', data: booking });
  } catch (error) {
    res.status(error.message.includes('Not authorized') ? 403 : 400).json({ success: false, message: error.message });
  }
};

export const submitComplaint = async (req, res) => {
  try {
    const result = await complainService(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.message.includes('Only clients') ? 403 : 500).json({ success: false, message: error.message });
  }
};
