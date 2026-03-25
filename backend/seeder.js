import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';
import Category from './models/Category.js';
import Service from './models/Service.js';

// Load environment variables
dotenv.config();

// Help with local DNS issues
dns.setServers(['8.8.8.8', '1.1.1.1']);

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
      family: 4,
    });
    console.log(`✅ MongoDB Connected for Seeding: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // 1. Clear existing data
    console.log('🗑️ Clearing existing data...');
    await User.deleteMany();
    await Category.deleteMany();
    await Service.deleteMany();

    // 2. Comprehensive Categories
    const categoriesData = [
      { name: 'Cleaning', description: 'Professional home and office cleaning.', icon: 'cleaning-icon' },
      { name: 'Plumbing', description: 'Leak repairs, pipe installations, and more.', icon: 'plumbing-icon' },
      { name: 'Electrical', description: 'Safe electrical repairs and installations.', icon: 'electrical-icon' },
      { name: 'Gardening', description: 'Lawn care and landscape design.', icon: 'gardening-icon' },
      { name: 'Carpentry', description: 'Furniture repair and custom woodworking.', icon: 'carpentry-icon' },
      { name: 'AC & Cooling', description: 'Air conditioning repair and maintenance.', icon: 'ac-icon' },
      { name: 'Beauty & Salon', description: 'Salon services at your doorstep.', icon: 'beauty-icon' },
      { name: 'Tutoring', description: 'Private academic support for all levels.', icon: 'tutor-icon' },
      { name: 'Web Development', description: 'Remote programming and design.', icon: 'web-icon' },
      { name: 'Moving & Delivery', description: 'Safe transport of your goods.', icon: 'moving-icon' },
    ];
    const categories = await Category.insertMany(categoriesData);
    console.log('✅ Categories imported!');

    const getCatId = (name) => categories.find(c => c.name === name)._id;

    // 3. Create Diverse Providers (Kathmandu Valley)
    const providersData = [
      {
        name: 'Ram Shrestha', email: 'ram@provider.com', password: 'password123',
        role: 'provider', isVerified: true, profilePicture: 'https://res.cloudinary.com/dc1nyrurx/image/upload/v1711200000/avatar1.png',
        location: { type: 'Point', coordinates: [85.324, 27.717], address: 'Kathmandu Center' }
      },
      {
        name: 'Sita Thapa', email: 'sita@provider.com', password: 'password123',
        role: 'provider', isVerified: true, profilePicture: 'https://res.cloudinary.com/dc1nyrurx/image/upload/v1711200000/avatar2.png',
        location: { type: 'Point', coordinates: [85.312, 27.676], address: 'Lalitpur' }
      },
      {
        name: 'Hari Mani', email: 'hari@provider.com', password: 'password123',
        role: 'provider', isVerified: true, profilePicture: 'https://res.cloudinary.com/dc1nyrurx/image/upload/v1711200000/avatar3.png',
        location: { type: 'Point', coordinates: [85.346, 27.701], address: 'Baneshwor' }
      },
      {
        name: 'Gopal Sapkota', email: 'gopal@provider.com', password: 'password123',
        role: 'provider', isVerified: true,
        location: { type: 'Point', coordinates: [85.320, 27.710], address: 'Thamel' }
      },
      {
        name: 'Nabina KC', email: 'nabina@provider.com', password: 'password123',
        role: 'provider', isVerified: true,
        location: { type: 'Point', coordinates: [85.289, 27.705], address: 'Kalanki' }
      },
      {
        name: 'Anish Giri', email: 'anish@provider.com', password: 'password123',
        role: 'provider', isVerified: true,
        location: { type: 'Point', coordinates: [85.358, 27.688], address: 'Koteshwor' }
      },
    ];

    // Using .create() so password encryption hooks run
    const providers = await User.create(providersData);
    console.log('✅ Providers created!');

    // 4. Large Variety of Services
    const servicesData = [
      // Ram's Services
      {
        providerId: providers[0]._id, categoryId: getCatId('Cleaning'), title: 'Deep Home Cleaning',
        description: 'Includes kitchen degreasing, bathroom sanitization, and floor polishing.',
        serviceType: 'onsite', pricingType: 'fixed', price: 3000, 
        location: providers[0].location, isActive: true
      },
      {
        providerId: providers[0]._id, categoryId: getCatId('Cleaning'), title: 'Sofa & Carpet Shampooing',
        description: 'Professional grade shampoo and stain removal for sofas and rugs.',
        serviceType: 'onsite', pricingType: 'fixed', price: 1500,
        location: providers[0].location, isActive: true
      },
      {
        providerId: providers[0]._id, categoryId: getCatId('Plumbing'), title: 'Pipe Leakage Fix',
        description: 'Quick and reliable repair of leaking pipes, taps, and sinks.',
        serviceType: 'onsite', pricingType: 'fixed', price: 1000,
        location: providers[0].location, isActive: true
      },
      {
        providerId: providers[0]._id, categoryId: getCatId('Electrical'), title: 'Electrical Wiring Repair',
        description: 'Troubleshooting and fixing faulty wiring, switches, and panels.',
        serviceType: 'onsite', pricingType: 'hourly', price: 800,
        location: providers[0].location, isActive: true
      },
      {
        providerId: providers[0]._id, categoryId: getCatId('Carpentry'), title: 'Furniture Assembly & Repair',
        description: 'Expert assembly of new furniture and repair of existing wooden items.',
        serviceType: 'onsite', pricingType: 'fixed', price: 1200,
        location: providers[0].location, isActive: true
      },
      {
        providerId: providers[0]._id, categoryId: getCatId('AC & Cooling'), title: 'AC Maintenance & Servicing',
        description: 'Comprehensive cleaning, gas check, and servicing for your AC unit.',
        serviceType: 'onsite', pricingType: 'fixed', price: 2500,
        location: providers[0].location, isActive: true
      },
      {
        providerId: providers[0]._id, categoryId: getCatId('Moving & Delivery'), title: 'Mini Truck Transport',
        description: 'Safe transport of goods and small furniture across the city.',
        serviceType: 'onsite', pricingType: 'hourly', price: 1500,
        location: providers[0].location, isActive: true
      },

    ];

    await Service.insertMany(servicesData);
    console.log('✅ Sample Services imported!');

    // 5. Normal Clients
    const clientsData = [
      { name: 'John Doe', email: 'john@gmail.com', password: 'password123', role: 'client', isVerified: true },
      { name: 'Joshna Giri', email: 'joshna@gmail.com', password: 'password123', role: 'client', isVerified: true },
    ];
    await User.create(clientsData);
    console.log('✅ Sample Clients created!');

    // 6. Admin
    await User.create({
      name: 'Admin User',
      email: 'admin@taskrabbit.com',
      password: 'password123',
      role: 'admin',
      isVerified: true
    });
    console.log('✅ Admin User created!');

    console.log('✨ ALL SEED DATA IMPORTED SUCCESSFULLY! ✨');
    process.exit();
  } catch (error) {
    console.error('❌ Error with data import:', error.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Category.deleteMany();
    await Service.deleteMany();
    console.log('🔥 Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error('❌ Error with data destruction:', error.message);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
