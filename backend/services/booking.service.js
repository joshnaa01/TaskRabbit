import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';

export const createBookingService = async (userId, userName, body) => {
    const { serviceId, scheduleDate, timeSlot, address, requirements, price } = body;
    const service = await Service.findById(serviceId);
    if (!service) throw new Error('Service not found');

    const unpaid = await Booking.findOne({
      clientId: userId,
      status: 'Completed',
      paid: false
    });
    
    if (unpaid) {
      throw new Error('Platform Policy: You have outstanding unpaid completed bookings. Please finalize payment for your previous tasks before initiating a new one to maintain trust in the marketplace.');
    }

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
        throw new Error(`This time slot (${timeSlot.start} – ${timeSlot.end}) is already booked. Please choose another slot.`);
      }
    }

    const booking = await Booking.create({
      serviceId,
      clientId: userId,
      providerId: service.providerId,
      scheduleDate,
      timeSlot,
      address,
      requirements,
      price,
      basePrice: service.price,
      status: 'Pending'
    });

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, service.providerId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, service.providerId],
        lastMessage: `A new booking has been initiated for "${service.title}"`
      });
    }

    await Notification.create({
      recipient: service.providerId,
      sender: userId,
      type: 'booking_request',
      title: 'New Service Booking',
      message: `User ${userName} has requested a booking for your service: ${service.title}`,
      bookingId: booking._id,
      conversationId: conversation._id
    });

    return { booking, conversationId: conversation._id };
};

export const submitDeliverablesService = async (bookingId, userId, body) => {
    const { files, message } = body;
    const booking = await Booking.findById(bookingId);

    if (!booking) throw new Error('Booking not found');
    if (booking.providerId.toString() !== userId) throw new Error('Not authorized');

    booking.deliverables = { files, message, submittedAt: Date.now() };
    booking.status = 'Completed';
    await booking.save();

    const conversation = await Conversation.findOne({ participants: { $all: [booking.clientId, booking.providerId] } });
    await Notification.create({
      recipient: booking.clientId,
      sender: userId,
      type: 'work_submitted',
      title: 'Work Submitted',
      message: `Your Tasker has submitted deliverables for your booking.`,
      bookingId: booking._id,
      conversationId: conversation?._id
    });

    return booking;
};

export const requestRevisionService = async (bookingId, userId, body) => {
    const { feedback } = body;
    const booking = await Booking.findById(bookingId);

    if (!booking) throw new Error('Booking not found');
    if (booking.clientId.toString() !== userId) throw new Error('Not authorized');

    booking.status = 'Accepted';
    booking.revisions.push({ feedback });
    await booking.save();

    const conversation = await Conversation.findOne({ participants: { $all: [booking.clientId, booking.providerId] } });
    await Notification.create({
      recipient: booking.providerId,
      sender: userId,
      type: 'revision_requested',
      title: 'Revision Requested',
      message: `The client has requested a revision for your submitted work.`,
      bookingId: booking._id,
      conversationId: conversation?._id
    });

    return booking;
};

export const raiseDisputeService = async (bookingId, userId, body) => {
    const { reason } = body;
    const booking = await Booking.findById(bookingId);

    if (!booking) throw new Error('Booking not found');
    if (booking.clientId.toString() !== userId && booking.providerId.toString() !== userId) {
       throw new Error('Not authorized');
    }

    booking.isDisputed = true;
    booking.status = 'Disputed';
    booking.dispute = {
      reason,
      status: 'Open',
      raisedBy: userId,
      createdAt: Date.now()
    };
    await booking.save();

    const recipient = userId === booking.clientId.toString() ? booking.providerId : booking.clientId;
    const conversation = await Conversation.findOne({ participants: { $all: [booking.clientId, booking.providerId] } });
    
    await Notification.create({
      recipient,
      sender: userId,
      type: 'booking_update',
      title: 'Dispute Raised',
      message: `A dispute has been raised for your booking. Reason: ${reason}. Admin will review shortly.`,
      bookingId: booking._id,
      conversationId: conversation?._id
    });

    return booking;
};

export const getBookingsService = async (user) => {
    let query = {};
    if (user.role === 'client') query.clientId = user.id;
    else if (user.role === 'provider') query.providerId = user.id;

    const bookings = await Booking.find(query)
      .populate('serviceId')
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .sort({ createdAt: -1 });

    const sorted = [...bookings].sort((a, b) => {
      if (a.status === 'Cancelled' && b.status !== 'Cancelled') return 1;
      if (a.status !== 'Cancelled' && b.status === 'Cancelled') return -1;
      return 0;
    });

    return sorted;
};

export const updateBookingStatusService = async (bookingId, user, body) => {
    const { status, finalPrice, duration, rejectionReason } = body;
    let booking = await Booking.findById(bookingId).populate('serviceId');
    
    if (!booking) throw new Error('Booking not found');

    if (user.role === 'provider' && booking.providerId.toString() !== user.id) {
       throw new Error('Not authorized');
    }
    if (user.role === 'client') {
      if (booking.clientId.toString() !== user.id) throw new Error('Not authorized');
      if (status !== 'Cancelled') throw new Error('Clients can only cancel bookings');
      if (['Completed', 'Cancelled'].includes(booking.status)) throw new Error('Cannot cancel an already finalized booking');
    }

    booking.status = status || booking.status;
    if (finalPrice !== undefined) booking.finalPrice = finalPrice;
    if (duration) booking.duration = duration;
    if (rejectionReason) booking.rejectionReason = rejectionReason;

    await booking.save();

    const recipient = user.role === 'provider' ? booking.clientId : booking.providerId;
    let notificationMessage = `Your booking for "${booking.serviceId?.title || 'service'}" has been updated to: ${booking.status}`;
    
    let notificationType = 'booking_update';
    if (status === 'Accepted') notificationType = 'booking_accepted';
    if (status === 'Completed') notificationType = 'booking_completed';
    if (status === 'Cancelled') notificationType = 'booking_cancelled';

    if (status === 'Rejected' && rejectionReason) {
      notificationMessage += `. Reason: ${rejectionReason}`;
    }

    const conversation = await Conversation.findOne({ participants: { $all: [booking.clientId, booking.providerId] } });
    await Notification.create({
      recipient,
      sender: user.id,
      type: notificationType,
      title: 'Booking Status Updated',
      message: notificationMessage,
      bookingId: booking._id,
      conversationId: conversation?._id
    });

    return booking;
};

export const completeBookingService = async (bookingId, userId, body) => {
    const { files, message } = body;
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    
    if (booking.providerId.toString() !== userId) {
       throw new Error('Only providers can complete bookings');
    }

    booking.status = 'Completed';
    
    if (files || message) {
      booking.deliverables = {
        files: files || [],
        message: message || '',
        submittedAt: Date.now()
      };
    }
    await booking.save();

    const conversation = await Conversation.findOne({ participants: { $all: [booking.clientId, booking.providerId] } });
    await Notification.create({
      recipient: booking.clientId,
      sender: userId,
      type: 'booking_completed',
      title: 'Booking Completed',
      message: `Your booking has been marked as completed by your Tasker.`,
      bookingId: booking._id,
      conversationId: conversation?._id
    });

    return booking;
};

export const payBookingService = async (bookingId, userId, transactionId) => {
    const booking = await Booking.findById(bookingId);

    if (!booking) throw new Error('Booking not found');
    if (booking.clientId.toString() !== userId) throw new Error('Not authorized to pay');
    if (booking.status !== 'Completed') throw new Error('Booking must be completed before payment');
    if (booking.paid) throw new Error('Booking already paid');

    const isSuccess = true;
    if (!isSuccess) throw new Error('Payment verification failed');

    booking.paid = true;
    booking.khaltiTransactionId = transactionId;
    await booking.save();

    const conversation = await Conversation.findOne({ participants: { $all: [booking.providerId, booking.clientId] } });
    await Notification.create({
      recipient: booking.providerId,
      sender: userId,
      type: 'payment_received',
      title: 'Payment Received',
      message: `You have received payment for the completed booking.`,
      bookingId: booking._id,
      conversationId: conversation?._id
    });

    return booking;
};
