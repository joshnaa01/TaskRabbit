import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';

export const createBookingRequest = async (req, res) => {
  try {
    const { serviceId, scheduleDate, timeSlot, address, requirements, price } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    // Check for unpaid completed bookings to prevent building up debt
    const unpaid = await Booking.findOne({
      clientId: req.user.id,
      status: 'Completed',
      paid: false
    });
    if (unpaid) {
      return res.status(403).json({
        success: false,
        message: 'Platform Policy: You have outstanding unpaid completed bookings. Please finalize payment for your previous tasks before initiating a new one to maintain trust in the marketplace.'
      });
    }

    // Validate time slot availability (prevent double booking)
    if (timeSlot?.start && timeSlot?.end) {
      const startOfDay = new Date(scheduleDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(scheduleDate);
      endOfDay.setHours(23, 59, 59, 999);

      const conflicting = await Booking.findOne({
        providerId: service.providerId,
        scheduleDate: { $gte: startOfDay, $lte: endOfDay },
        'timeSlot.start': timeSlot.start,
        'timeSlot.end': timeSlot.end,
        status: { $nin: ['Cancelled', 'Rejected'] },
      });

      if (conflicting) {
        return res.status(409).json({
          success: false,
          message: `This time slot (${timeSlot.start} – ${timeSlot.end}) is already booked. Please choose another slot.`
        });
      }
    }

    const booking = await Booking.create({
      serviceId,
      clientId: req.user.id,
      providerId: service.providerId,
      scheduleDate,
      timeSlot,
      address,
      requirements,
      price,
      basePrice: service.price,
      status: 'Pending'
    });

    // 1. Create/Find Conversation between client and provider
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, service.providerId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, service.providerId],
        lastMessage: `A new booking has been initiated for "${service.title}"`
      });
    }

    // 2. Create Notification for Provider
    await Notification.create({
      recipient: service.providerId,
      sender: req.user.id,
      type: 'booking_request',
      title: 'New Service Booking',
      message: `User ${req.user.name} has requested a booking for your service: ${service.title}`,
      bookingId: booking._id
    });

    res.status(201).json({ success: true, data: booking, conversationId: conversation._id });
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

    // Notify the client about deliverables
    await Notification.create({
      recipient: booking.clientId,
      sender: req.user.id,
      type: 'work_submitted',
      title: 'Work Submitted',
      message: `Your Tasker has submitted deliverables for your booking.`,
      bookingId: booking._id
    });

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

    // Notify the provider about revision request
    await Notification.create({
      recipient: booking.providerId,
      sender: req.user.id,
      type: 'revision_requested',
      title: 'Revision Requested',
      message: `The client has requested a revision for your submitted work.`,
      bookingId: booking._id
    });

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
      .populate('providerId', 'name')
      .sort({ createdAt: -1 }); // Default newest first

    // Advanced push: Move cancelled ones to the very bottom
    const sorted = [...bookings].sort((a, b) => {
      if (a.status === 'Cancelled' && b.status !== 'Cancelled') return 1;
      if (a.status !== 'Cancelled' && b.status === 'Cancelled') return -1;
      return 0; // maintain newest-first within status groups
    });

    res.status(200).json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, finalPrice, duration, rejectionReason } = req.body;
    let booking = await Booking.findById(req.params.id).populate('serviceId');
    
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role === 'provider' && booking.providerId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'client') {
      if (booking.clientId.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Not authorized' });
      if (status !== 'Cancelled') return res.status(400).json({ success: false, message: 'Clients can only cancel bookings' });
      if (['Completed', 'Cancelled'].includes(booking.status)) return res.status(400).json({ success: false, message: 'Cannot cancel an already finalized booking' });
    }

    booking.status = status || booking.status;
    if (finalPrice) booking.finalPrice = finalPrice;
    if (duration) booking.duration = duration;
    if (rejectionReason) booking.rejectionReason = rejectionReason;

    await booking.save();

    // Notify the other party about status update
    const recipient = req.user.role === 'provider' ? booking.clientId : booking.providerId;
    let notificationMessage = `Your booking for "${booking.serviceId?.title || 'service'}" has been updated to: ${booking.status}`;
    
    let notificationType = 'booking_update';
    if (status === 'Accepted') notificationType = 'booking_accepted';
    if (status === 'Completed') notificationType = 'booking_completed';
    if (status === 'Cancelled') notificationType = 'booking_cancelled';

    if (status === 'Rejected' && rejectionReason) {
      notificationMessage += `. Reason: ${rejectionReason}`;
    }

    await Notification.create({
      recipient,
      sender: req.user.id,
      type: notificationType,
      title: 'Booking Status Updated',
      message: notificationMessage,
      bookingId: booking._id
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Provider marks as completed
export const completeBooking = async (req, res) => {
  try {
    const { files, message } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    // Only provider can complete
    if (booking.providerId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Only providers can complete bookings' });
    }

    booking.status = 'Completed';
    
    // Save evidence if provided
    if (files || message) {
      booking.deliverables = {
        files: files || [],
        message: message || '',
        submittedAt: Date.now()
      };
    }
    
    await booking.save();

    // Notify the client that booking is completed
    await Notification.create({
      recipient: booking.clientId,
      sender: req.user.id,
      type: 'booking_completed',
      title: 'Booking Completed',
      message: `Your booking has been marked as completed by your Tasker.`,
      bookingId: booking._id
    });

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

    // Notify the provider that payment was received
    await Notification.create({
      recipient: booking.providerId,
      sender: req.user.id,
      type: 'payment_received',
      title: 'Payment Received',
      message: `You have received payment for the completed booking.`,
      bookingId: booking._id
    });

    res.status(200).json({ success: true, message: 'Payment successful', data: booking });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
