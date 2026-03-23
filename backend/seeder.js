import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Service from './models/Service.js';

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connection successful');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Category.deleteMany();
        await Service.deleteMany();

        // 1. Create initial categories
        const catData = [
            { name: 'Cleaning', description: 'Home and office cleaning services', icon: 'cleaning-icon' },
            { name: 'Plumbing', description: 'Pipe and water related repairs', icon: 'plumbing-icon' },
            { name: 'Electrical', description: 'Electrical installations and repairs', icon: 'electrical-icon' },
            { name: 'Gardening', description: 'Lawn and garden maintenance', icon: 'gardening-icon' },
            { name: 'Moving', description: 'Furniture and goods transport', icon: 'moving-icon' },
            { name: 'Painting', description: 'Wall painting and decoration', icon: 'painting-icon' },
        ];
        const categories = await Category.insertMany(catData);
        console.log('Categories imported!');

        // 2. Create Providers with Locations
        const providers = [
            {
                name: 'Ram Shrestha',
                email: 'ram@provider.com',
                password: 'password123',
                role: 'provider',
                isVerified: true,
                location: { type: 'Point', coordinates: [85.324, 27.717] } // Kathmandu Center
            },
            {
                name: 'Sita Thapa',
                email: 'sita@provider.com',
                password: 'password123',
                role: 'provider',
                isVerified: true,
                location: { type: 'Point', coordinates: [85.312, 27.676] } // Lalitpur
            },
            {
                name: 'Hari Mani',
                email: 'hari@provider.com',
                password: 'password123',
                role: 'provider',
                isVerified: true,
                location: { type: 'Point', coordinates: [85.346, 27.701] } // Baneshwor
            }
        ];

        const createdProviders = await User.create(providers);
        console.log('Providers created!');

        // 3. Create Services linked to Providers
        const services = [
            {
                providerId: createdProviders[0]._id,
                categoryId: categories[0]._id,
                title: 'Home Deep Cleaning',
                description: 'Professional cleaning for all rooms and kitchen.',
                serviceType: 'onsite',
                pricingType: 'fixed',
                price: 2500,
                location: createdProviders[0].location,
                isActive: true
            },
            {
                providerId: createdProviders[1]._id,
                categoryId: categories[1]._id,
                title: 'Emergency Plumbing',
                description: 'Available 24/7 for leak repairs and pipe fixing.',
                serviceType: 'onsite',
                pricingType: 'hourly',
                price: 800,
                location: createdProviders[1].location,
                isActive: true
            },
            {
                providerId: createdProviders[2]._id,
                categoryId: categories[2]._id,
                title: 'Remote IT Support',
                description: 'Solve your software problems from anywhere.',
                serviceType: 'remote',
                pricingType: 'fixed',
                price: 1500,
                location: createdProviders[2].location,
                isActive: true
            }
        ];

        await Service.create(services);
        console.log('Services created!');

        // 4. Create Admin
        await User.create({
            name: 'Admin User',
            email: 'admin@taskrabbit.com',
            password: 'password123',
            role: 'admin',
            isVerified: true
        });
        console.log('Admin User created!');

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error with data import:', error.message);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await User.deleteMany();
        await Category.deleteMany();
        await Service.deleteMany();
        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error('Error with data destruction:', error.message);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
