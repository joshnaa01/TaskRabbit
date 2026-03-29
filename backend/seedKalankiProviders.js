import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Service from './models/Service.js';
import Category from './models/Category.js';

dotenv.config();

const providers = [
  {
    name: 'Hari Plumber (Kalanki)',
    email: 'hari.plumber@example.com',
    password: 'password123',
    role: 'provider',
    isApproved: true,
    isVerified: true,
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [85.281, 27.698], // [lng, lat] for Kalanki
      address: 'Kalanki Chowk, Kathmandu'
    },
    serviceTitle: 'Expert Plumbing & Pipe Repair',
    categoryName: 'Plumbing',
    price: 500
  },
  {
    name: 'Sita Electrician',
    email: 'sita.electric@example.com',
    password: 'password123',
    role: 'provider',
    isApproved: true,
    isVerified: true,
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [85.279, 27.696], // Near Kalanki
      address: 'Syuchatar Road, Kalanki'
    },
    serviceTitle: 'Home Wiring & Electrical Fixes',
    categoryName: 'Electrical',
    price: 600
  },
  {
    name: 'Ramesh Carpenter',
    email: 'ramesh.wood@example.com',
    password: 'password123',
    role: 'provider',
    isApproved: true,
    isVerified: true,
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [85.283, 27.700], // Near Kalanki/Ravibhawan
      address: 'Ravibhawan, Kathmandu'
    },
    serviceTitle: 'Furniture Repair & Custom Woodwork',
    categoryName: 'Carpentry',
    price: 800
  }
];

const seedProviders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    for (const p of providers) {
      // 1. Create or find category
      let category = await Category.findOne({ name: p.categoryName });
      if (!category) {
        category = await Category.create({ 
           name: p.categoryName, 
           slug: p.categoryName.toLowerCase(), 
           icon: 'Wrench', 
           description: `Professional ${p.categoryName} services` 
        });
      }

      // 2. Create User
      const userExists = await User.findOne({ email: p.email });
      let userId;
      if (!userExists) {
        const user = await User.create({
          name: p.name,
          email: p.email,
          password: p.password,
          role: p.role,
          isApproved: p.isApproved,
          isVerified: p.isVerified,
          status: p.status,
          location: p.location,
          profilePicture: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&h=150&fit=crop'
        });
        userId = user._id;
        console.log(`Created User: ${p.name}`);
      } else {
        userId = userExists._id;
        console.log(`User already exists: ${p.name}`);
      }

      // 3. Create Service
      const serviceExists = await Service.findOne({ providerId: userId });
      if (!serviceExists) {
        await Service.create({
          providerId: userId,
          categoryId: category._id,
          title: p.serviceTitle,
          description: `I provide top-notch ${p.serviceTitle} near ${p.location.address}. Call me for reliable service.`,
          serviceType: 'onsite',
          pricingType: 'fixed',
          price: p.price,
          location: p.location
        });
        console.log(`Created Service for: ${p.name}`);
      }
    }

    console.log('Kalanki Providers Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProviders();
