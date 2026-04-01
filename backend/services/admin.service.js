import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';

export const getAdminStatsService = async () => {
    const totalUsers = await User.countDocuments();
    const providers = await User.countDocuments({ role: 'provider' });
    const clientsCount = await User.countDocuments({ role: 'client' });

    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $in: ['Pending', 'Accepted', 'In Progress'] } });
    
    // Financial Intelligence Split (70/30) - Tracks all verified (Completed) work for both Admin and Provider
    const verifiedBookings = await Booking.find({ status: 'Completed' });
    const totalVolume = verifiedBookings.reduce((acc, b) => acc + (b.finalPrice || 0), 0);
    const platformEarnings = verifiedBookings.reduce((acc, b) => acc + (b.commissionAdmin || 0), 0);
    const providerPayouts = verifiedBookings.reduce((acc, b) => acc + (b.commissionProvider || 0), 0);

    // Periodized Stats
    const getCountForRange = async (days) => {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        return await Booking.countDocuments({ createdAt: { $gte: dateLimit } });
    };

    const periodicStats = {
        last7Days: await getCountForRange(7),
        lastMonth: await getCountForRange(30),
        lastYear: await getCountForRange(365)
    };

    // Top Performers Aggregations
    const topClients = await Booking.aggregate([
        { $group: { _id: '$clientId', count: { $sum: 1 }, totalSpend: { $sum: '$finalPrice' } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', count: 1, totalSpend: 1 } }
    ]);

    const topProvidersByBookings = await Booking.aggregate([
        { $group: { _id: '$providerId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', count: 1 } }
    ]);

    const topProvidersByEarnings = await Booking.aggregate([
        { $group: { _id: '$providerId', totalEarnings: { $sum: '$commissionProvider' } } },
        { $sort: { totalEarnings: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', totalEarnings: 1 } }
    ]);

    // Trend Graphs
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthData = await Booking.find({ status: 'Completed', updatedAt: { $gte: start, $lte: end } });
        const adminShare = monthData.reduce((acc, curr) => acc + (curr.commissionAdmin || 0), 0);
        monthlyRevenue.push({ name: monthName, platformRevenue: Math.round(adminShare) });
    }

    return {
        users: { total: totalUsers, providers, clients: clientsCount },
        bookings: { total: totalBookings, active: activeBookings, periodicStats },
        revenue: { totalVolume, platformEarnings, providerPayouts, monthlyTrends: monthlyRevenue },
        performance: { topClients, topProvidersByBookings, topProvidersByEarnings }
    };
};

export const getUsersService = async (role) => {
    let query = {};
    if (role) query.role = role;
    return await User.find(query).select('-password').sort({ createdAt: -1 });
};

import { sendEmail } from './email.service.js';

export const updateUserStatusService = async (id, updateBody) => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    if (updateBody.isVerified !== undefined) user.isVerified = updateBody.isVerified;
    if (updateBody.role) user.role = updateBody.role;
    if (updateBody.status !== undefined) user.status = updateBody.status;
    if (updateBody.isSuspicious !== undefined) user.isSuspicious = updateBody.isSuspicious;
    
    if (updateBody.isApproved !== undefined) {
      const previouslyApproved = user.isApproved;
      user.isApproved = updateBody.isApproved;
      
      if (!previouslyApproved && user.isApproved && user.role === 'provider') {
        // Send approval email
        try {
          await sendEmail({
             to: user.email,
             subject: 'Account Approved - TaskRabbit',
             html: `<h3>Hello ${user.name},</h3><p>Your provider account has been approved by the admin. You can now log in to the portal and start accepting bookings.</p>`
          });
        } catch (error) {
          console.error("Failed to send approval email:", error);
        }
      }
    }

    await user.save();
    return user;
};

export const deleteUserService = async (id) => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    await user.deleteOne();
    
    // Cleanup related documents
    await Booking.deleteMany({ $or: [{ clientId: id }, { providerId: id }] });
    await Service.deleteMany({ providerId: id });
};

export const resolveDisputeService = async (id, updateBody, adminId) => {
    const { status, finalPrice, adminVerdict } = updateBody;
    const booking = await Booking.findById(id).populate('clientId providerId serviceId');

    if (!booking) throw new Error('Booking not found');
    
    // Guard: Flexible check for dispute state to avoid 500 on valid edge scenarios
    const isInDispute = booking.isDisputed || booking.status === 'Disputed' || (booking.dispute && booking.dispute.status === 'Open');
    if (!isInDispute) throw new Error('Booking is not in an active dispute state');

    if (status) booking.status = status;
    
    // Guard: Ensure dispute object exists before assigning properties
    if (!booking.dispute) {
        booking.dispute = { 
            reason: 'Administrative Resolution', 
            status: 'Open',
            createdAt: new Date()
        };
    }

    booking.dispute.status = 'Resolved';
    booking.dispute.adminVerdict = adminVerdict;
    if (finalPrice !== undefined) booking.finalPrice = finalPrice;
    booking.isDisputed = false;

    await booking.save();

    // Trigger Platform Notifications for both parties
    const conversation = await Conversation.findOne({ participants: { $all: [booking.clientId._id, booking.providerId._id] } });
    
    const notificationData = {
        sender: adminId,
        type: 'booking_update',
        title: 'Dispute Resolved',
        message: `Admin has resolved the dispute for "${booking.serviceId?.title || 'service'}". Verdict: ${adminVerdict}`,
        bookingId: booking._id,
        conversationId: conversation?._id
    };

    await Notification.create({ ...notificationData, recipient: booking.clientId._id });
    await Notification.create({ ...notificationData, recipient: booking.providerId._id });

    return booking;
};

export const sendEmailService = async (body) => {
    const { to, role, subject, message } = body;
    
    // Find recipients
    let recipients = [];
    if (to && to !== 'all') {
      recipients.push(to);
    } else if (role) {
      let query = {};
      if (role !== 'all') query.role = role;
      const users = await User.find(query).select('email');
      recipients = users.map(u => u.email);
    } else {
      throw new Error('Please specify recipient or role');
    }

    if (recipients.length === 0) {
      throw new Error('No recipients found');
    }

    const info = await sendEmail({
      to: recipients,
      subject: subject || 'Notification from TaskRabbit',
      html: `<div>${message?.replace(/\n/g, '<br>')}</div>`
    });

    return info;
};

export const getPendingReviewBookingsService = async () => {
    return await Booking.find({ status: 'Pending Review' })
      .populate('serviceId', 'title serviceType')
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .sort({ updatedAt: -1 });
};

export const approveCompletionService = async (bookingId, adminId) => {
    const booking = await Booking.findById(bookingId).populate('serviceId', 'title');
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'Pending Review') throw new Error('Booking is not pending review');

    booking.status = 'Completed';
    await booking.save();

    const conversation = await Conversation.findOne({ participants: { $all: [booking.clientId, booking.providerId] } });

    // Notify the client that work is completed and ready for payment
    await Notification.create({
        recipient: booking.clientId,
        sender: adminId,
        type: 'booking_completed',
        title: 'Booking Completed',
        message: `Your booking for "${booking.serviceId?.title || 'service'}" has been verified and marked as completed. Please proceed with payment.`,
        bookingId: booking._id,
        conversationId: conversation?._id
    });

    // Notify the provider that their work was approved
    await Notification.create({
        recipient: booking.providerId,
        sender: adminId,
        type: 'booking_completed',
        title: 'Work Approved',
        message: `Your submitted work for booking #${booking._id.toString().slice(-6)} has been approved by admin. Awaiting client payment.`,
        bookingId: booking._id,
        conversationId: conversation?._id
    });

    return booking;
};

export const rejectCompletionService = async (bookingId, adminId, feedback) => {
    const booking = await Booking.findById(bookingId).populate('serviceId', 'title');
    if (!booking) throw new Error('Booking not found');
    if (booking.status !== 'Pending Review') throw new Error('Booking is not pending review');

    // Revert status back to Accepted so provider can re-submit
    booking.status = 'Accepted';
    booking.revisions.push({ feedback: `[Admin Review] ${feedback}`, createdAt: Date.now() });
    await booking.save();

    const conversation = await Conversation.findOne({ participants: { $all: [booking.clientId, booking.providerId] } });

    // Notify the provider that their submission was rejected
    await Notification.create({
        recipient: booking.providerId,
        sender: adminId,
        type: 'revision_requested',
        title: 'Completion Rejected by Admin',
        message: `Your submitted work for booking #${booking._id.toString().slice(-6)} was not approved. Feedback: "${feedback}". Please revise and re-submit.`,
        bookingId: booking._id,
        conversationId: conversation?._id
    });

    return booking;
};

export const getAdminProvidersMapService = async () => {
    // We aggregate all users with role 'provider', pulling their services and categories
    const providers = await User.aggregate([
        { $match: { role: 'provider' } },
        {
            $lookup: {
                from: 'services',
                localField: '_id',
                foreignField: 'providerId',
                as: 'services'
            }
        },
        // We can just populate service category locally using $lookup
        {
            $lookup: {
                from: 'categories',
                localField: 'services.categoryId',
                foreignField: '_id',
                as: 'serviceCategories'
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                profilePicture: 1,
                status: 1,
                isVerified: 1,
                isApproved: 1,
                availability: 1,
                workingHours: 1,
                location: 1,
                createdAt: 1,
                categories: '$serviceCategories.name',
                serviceTypes: '$services.serviceType'
            }
        }
    ]);
    
    return providers;
};
