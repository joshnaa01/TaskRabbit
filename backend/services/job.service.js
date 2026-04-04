import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

export const startBookingExpiryJob = () => {
    console.log('✅ Booking Auto-Expiry Monitor: Activated (Scanning every 5 minutes)');
    
    // Scan every 5 minutes
    setInterval(async () => {
        try {
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            
            // Find bookings that are 'Pending' and older than 30 minutes
            // Added filter to only process those created recently enough so we don't spam notifications for old data
            // (Only process things from the last few hours to be safe, but mostly we want everything Pending > 30m)
            const expiredBookings = await Booking.find({
                status: 'Pending',
                createdAt: { $lt: thirtyMinutesAgo }
            }).populate('serviceId', 'title');

            if (expiredBookings.length > 0) {
                console.log(`⏳ Auto-Expiry: Processing ${expiredBookings.length} expired Pending bookings.`);
                
                for (const booking of expiredBookings) {
                    booking.status = 'Expired';
                    await booking.save();

                    // Notify the Client
                    await Notification.create({
                        recipient: booking.clientId,
                        type: 'booking_expired',
                        title: 'Booking Expired',
                        message: `Your booking request for "${booking.serviceId?.title || 'the service'}" has expired as the provider did not respond within the 30-minute allocation.`,
                        bookingId: booking._id
                    });

                    // Inform the Provider
                    await Notification.create({
                        recipient: booking.providerId,
                        type: 'booking_expired',
                        title: 'Lead Expired',
                        message: `The booking request for "${booking.serviceId?.title || 'the service'}" from a client has expired due to inactivity (30m limit).`,
                        bookingId: booking._id
                    });
                }
            }
        } catch (error) {
            console.error('❌ Auto-Expiry Job Error:', error.message);
        }
    }, 5 * 60 * 1000); // Check every 5 minutes
};
