import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

export const getAdminStats = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, providers, clients },
        bookings: { total: totalBookings, active: activeBookings },
        services: { total: totalServices },
        revenue: { total: totalRevenue, platformEarnings },
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Users
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Verify or Update User limits
export const updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.body.isVerified !== undefined) user.isVerified = req.body.isVerified;
    if (req.body.role) user.role = req.body.role;

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.deleteOne();
    
    // Cleanup related documents
    await Booking.deleteMany({ $or: [{ clientId: req.params.id }, { providerId: req.params.id }] });
    await Service.deleteMany({ providerId: req.params.id });

    res.status(200).json({ success: true, message: 'User and all related data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
