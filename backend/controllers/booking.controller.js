import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

export const createBookingRequest = async (req, res) => {
  try {
    const { serviceId, scheduleDate, startTime, address, requirements, price } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    const booking = await Booking.create({
      serviceId,
      clientId: req.user.id,
      providerId: service.providerId,
      scheduleDate,
      startTime,
      address,
      requirements,
      price,
      basePrice: service.price,
      status: 'Pending'
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Provider submits work for remote delivery
export const submitDeliverables = async (req, res) => {
  try {
    const { files, message } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.providerId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.deliverables = {
      files,
      message,
      submittedAt: Date.now()
    };
    booking.status = 'Completed'; // Marking as completed upon submission for remote
    
    await booking.save();
    res.status(200).json({ success: true, message: 'Work submitted successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Client requests revision
export const requestRevision = async (req, res) => {
  try {
    const { feedback } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.clientId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = 'Accepted'; // Reverting back to progress/accepted for revision
    booking.revisions.push({ feedback });

    await booking.save();
    res.status(200).json({ success: true, message: 'Revision requested', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'client') query.clientId = req.user.id;
    else if (req.user.role === 'provider') query.providerId = req.user.id;
    // admin gets all

    const bookings = await Booking.find(query)
      .populate('serviceId')
      .populate('clientId', 'name')
      .populate('providerId', 'name');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, finalPrice, duration } = req.body;
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role === 'provider' && booking.providerId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'client' && booking.clientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = status || booking.status;
    if (finalPrice) booking.finalPrice = finalPrice;
    if (duration) booking.duration = duration;

    await booking.save();
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Provider marks as completed
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    // Only provider can complete
    if (booking.providerId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Only providers can complete bookings' });
    }

    booking.status = 'Completed';
    await booking.save();
    res.status(200).json({ success: true, message: 'Booking completed', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Client pays after completion
export const payBooking = async (req, res) => {
  try {
    const { transactionId } = req.body; // from Khalti
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.clientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay' });
    }
    if (booking.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Booking must be completed before payment' });
    }
    if (booking.paid) return res.status(400).json({ success: false, message: 'Booking already paid' });

    // Simulate Khalti Verification (In production use axios.post to khalti.com)
    // const verify = await axios.post(...)
    const isSuccess = true; // simulation

    if (!isSuccess) return res.status(400).json({ success: false, message: 'Payment verification failed' });

    booking.paid = true;
    booking.khaltiTransactionId = transactionId;
    await booking.save();

    res.status(200).json({ success: true, message: 'Payment successful', data: booking });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
