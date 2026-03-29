import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Service from './models/Service.js';
import Category from './models/Category.js';

dotenv.config();

const providers = [
  {
    name: 'Baneshwor Electrical Experts',
    email: 'baneshwor.electric@example.com',
    password: 'password123',
    role: 'provider',
    isApproved: true,
    isVerified: true,
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [85.3333, 27.6933], // New Baneshwor
      address: 'New Baneshwor, Kathmandu'
    },
    serviceTitle: 'Advanced Electrical Diagnostics',
    categoryName: 'Electrical',
    price: 800
  },
  {
    name: 'Patan Plumbing Solutions',
    email: 'patan.plumb@example.com',
    password: 'password123',
    role: 'provider',
    isApproved: true,
    isVerified: true,
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [85.3175, 27.6766], // Patan Durbar Square area
      address: 'Patan Durbar Square, Lalitpur'
    },
    serviceTitle: 'Emergency Pipe & Leak Repair',
    categoryName: 'Plumbing',
    price: 650
  },
  {
    name: 'Thamel Tech Support',
    email: 'thamel.tech@example.com',
    password: 'password123',
    role: 'provider',
    isApproved: true,
    isVerified: true,
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [85.3100, 27.7150], // Thamel
      address: 'Thamel, Kathmandu'
    },
    serviceTitle: 'Laptop & Computer Repair',
    categoryName: 'IT Services',
    price: 1200
  },
  {
    name: 'Boudha Home Cleaning',
    email: 'boudha.clean@example.com',
    password: 'password123',
    role: 'provider',
    isApproved: true,
    isVerified: true,
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [85.3615, 27.7215], // Boudhanath Stupa
      address: 'Boudha, Kathmandu'
    },
    serviceTitle: 'Deep Carpet & House Cleaning',
    categoryName: 'Cleaning',
    price: 1500
  },
  {
    name: 'Kirtipur Woodworks',
    email: 'kirtipur.wood@example.com',
    password: 'password123',
    role: 'provider',
    isApproved: true,
    isVerified: true,
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [85.2764, 27.6780], // Kirtipur
      address: 'TU Road, Kirtipur'
    },
    serviceTitle: 'Custom Furniture & Repairs',
    categoryName: 'Carpentry',
    price: 2000
  },
  {
    name: 'Bhaktapur Auto Fix',
    email: 'bhaktapur.auto@example.com',
    password: 'password123',
    role: 'provider',
    isApproved: true,
    isVerified: true,
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [85.4282, 27.6710], // Bhaktapur
      address: 'Bhaktapur Durbar area'
    },
    serviceTitle: 'Two-Wheeler Mobile Servicing',
    categoryName: 'Mechanic',
    price: 900
  }
];

const seedProviders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskrabbit_db');
    console.log('MongoDB Connected for Seed...');

    for (const p of providers) {
      let category = await Category.findOne({ name: p.categoryName });
      if (!category) {
        category = await Category.create({ 
           name: p.categoryName, 
           slug: p.categoryName.toLowerCase().replace(' ', '-'), 
           icon: 'Briefcase', 
           description: `Professional ${p.categoryName} services` 
        });
      }

      const userExists = await User.findOne({ email: p.email });
      let userId;
      if (!userExists) {
        const user = await User.create({
          name: p.name,
          email: p.email,
          password: p.password, // Schema hook hashes this automatically
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

      const serviceExists = await Service.findOne({ providerId: userId });
      if (!serviceExists) {
        await Service.create({
          providerId: userId,
          categoryId: category._id,
          title: p.serviceTitle,
          description: `Top-rated professional ${p.serviceTitle} near ${p.location.address}. Always on time and highly reliable.`,
          serviceType: 'onsite',
          pricingType: 'fixed',
          price: p.price,
          location: p.location
        });
        console.log(`Created Service for: ${p.name}`);
      }
    }

    console.log('Kathmandu Valley Providers Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedProviders();
