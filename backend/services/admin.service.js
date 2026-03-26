import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

export const getAdminStatsService = async () => {
    const totalUsers = await User.countDocuments();
    const providers = await User.countDocuments({ role: 'provider' });
    const clients = await User.countDocuments({ role: 'client' });

    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: { $in: ['Pending', 'Accepted'] } });
    
    const totalServices = await Service.countDocuments();

    // Calculate approx revenue
    const paidBookings = await Booking.find({ paid: true });
    const totalRevenue = paidBookings.reduce((acc, curr) => acc + (curr.finalPrice || curr.basePrice || 0), 0);
    // Platform fee (e.g. 10%)
    const platformEarnings = totalRevenue * 0.10;

    // Recent Activity
    const recentBookings = await Booking.find()
      .populate('serviceId', 'title')
      .populate('clientId', 'name')
      .populate('providerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return {
        users: { total: totalUsers, providers, clients },
        bookings: { total: totalBookings, active: activeBookings },
        services: { total: totalServices },
        revenue: { total: totalRevenue, platformEarnings },
        recentBookings
    };
};

export const getUsersService = async (role) => {
    let query = {};
    if (role) query.role = role;
    return await User.find(query).select('-password').sort({ createdAt: -1 });
};

export const updateUserStatusService = async (id, updateBody) => {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');

    if (updateBody.isVerified !== undefined) user.isVerified = updateBody.isVerified;
    if (updateBody.role) user.role = updateBody.role;
    if (updateBody.status !== undefined) user.status = updateBody.status;
    if (updateBody.isSuspicious !== undefined) user.isSuspicious = updateBody.isSuspicious;

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

export const resolveDisputeService = async (id, updateBody) => {
    const { status, finalPrice, adminVerdict } = updateBody;
    const booking = await Booking.findById(id);

    if (!booking) throw new Error('Booking not found');
    if (!booking.isDisputed) throw new Error('Booking is not disputed');

    if (status) booking.status = status;
    booking.dispute.status = 'Resolved';
    booking.dispute.adminVerdict = adminVerdict;
    if (finalPrice !== undefined) booking.finalPrice = finalPrice;
    booking.isDisputed = false;

    await booking.save();
    return booking;
};
