import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './models/User.js';
import connectDB from './config/db.js';

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'joshna.admin@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists!');
      existingAdmin.role = 'admin';
      existingAdmin.password = 'joshna@123';
      await existingAdmin.save();
      console.log('Admin updated!');
    } else {
      const admin = new User({
        name: 'Joshna Admin',
        email: adminEmail,
        password: 'joshna@123',
        role: 'admin',
        isVerified: true
      });
      await admin.save();
      console.log('Admin seeded successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
