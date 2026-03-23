import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

export const createReview = async (req, res) => {
  try {
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (booking.clientId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'You can only review your own bookings' });
    }

    const review = await Review.create({
      ...req.body,
      clientId: req.user.id,
      providerId: booking.providerId
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
