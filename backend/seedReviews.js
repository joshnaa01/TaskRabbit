import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './models/User.js';
import Service from './models/Service.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';
import connectDB from './config/db.js';

const seedReviews = async () => {
  try {
    await connectDB();
    
    // Find all services
    const services = await Service.find();
    if (services.length === 0) {
      console.log('No services found. Exiting...');
      process.exit(0);
    }

    // Get a client (or create one)
    let client = await User.findOne({ role: 'client' });
    if (!client) {
      client = await User.create({
        name: 'Review Client',
        email: 'review.client@example.com',
        password: 'password123',
        role: 'client',
        isVerified: true
      });
    }

    let totalReviewsSeeded = 0;

    for (let service of services) {
      // Check if service already has reviews
      const existingReviews = await Review.find({ serviceId: service._id });
      if (existingReviews.length > 0) continue;

      // Seed 2-4 reviews per service
      const numReviews = Math.floor(Math.random() * 3) + 2; 

      for (let i = 0; i < numReviews; i++) {
        // Create a dummy booking for the review
        const booking = await Booking.create({
          serviceId: service._id,
          clientId: client._id,
          providerId: service.providerId,
          scheduleDate: new Date(),
          address: 'Kathmandu',
          requirements: 'Great job required.',
          price: service.price,
          basePrice: service.price,
          status: 'Completed',
          paid: true
        });

        const ratingNum = Math.floor(Math.random() * 2) + 4; // 4 or 5
        const comments = ['Excellent work!', 'Very satisfied with the service!', 'Highly recommended.', 'Professional and on time.', 'Will definitely hire again!'];
        
        await Review.create({
          bookingId: booking._id,
          serviceId: service._id,
          clientId: client._id,
          providerId: service.providerId,
          rating: ratingNum,
          comment: comments[Math.floor(Math.random() * comments.length)]
        });

        totalReviewsSeeded++;
      }
    }

    console.log(`Seeded ${totalReviewsSeeded} reviews successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding reviews:', err);
    process.exit(1);
  }
};

seedReviews();
