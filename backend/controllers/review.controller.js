import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

export const createReview = async (req, res) => {
  try {
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.clientId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Authorization error' });
    }

    if (booking.status !== 'Completed') {
        return res.status(400).json({ success: false, message: 'Only completed bookings can be reviewed' });
    }

    // Check if review already exists
    const existing = await Review.findOne({ bookingId: req.body.bookingId });
    if (existing) return res.status(400).json({ success: false, message: 'Booking already reviewed' });

    const review = await Review.create({
      ...req.body,
      clientId: req.user.id,
      providerId: booking.providerId,
      serviceId: booking.serviceId
    });

    // Notify provider
    await Notification.create({
      recipient: booking.providerId,
      sender: req.user.id,
      type: 'booking_update',
      title: 'New Service Impression',
      message: `User ${req.user.name} left a ${req.body.rating}-star review for your service.`
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getServiceReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId })
      .populate('clientId', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ providerId: req.params.providerId })
      .populate('clientId', 'name profilePicture');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
