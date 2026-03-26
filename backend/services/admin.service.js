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

import nodemailer from 'nodemailer';

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
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER || 'placeholder@gmail.com',
              pass: process.env.EMAIL_PASS || 'placeholder_pass'
            }
          });
          
          await transporter.sendMail({
            from: process.env.EMAIL_USER || 'placeholder@gmail.com',
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

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'placeholder@gmail.com',
        pass: process.env.EMAIL_PASS || 'placeholder_pass'
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || 'placeholder@gmail.com',
      to: recipients,
      subject: subject || 'Notification from TaskRabbit',
      html: `<div>${message?.replace(/\n/g, '<br>')}</div>`
    });

    return info;
};
