import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Service from './models/Service.js';
import Category from './models/Category.js';
import Review from './models/Review.js';

dotenv.config();

const providersData = [
  {
    name: 'Prabin Shrestha',
    email: 'prabin.shrestha@gmail.com',
    password: 'password123',
    location: { type: 'Point', coordinates: [85.312, 27.711], address: 'Thamel, Kathmandu' },
    services: [
      { title: 'Deep House Cleaning & Sanitization', categoryName: 'Cleaning', price: 1500, description: 'Complete deep cleaning of your house.' },
      { title: 'Office Space Cleaning', categoryName: 'Cleaning', price: 2000, description: 'Evening and weekend cleaning for corporate offices.' }
    ],
    reviews: [
      { rating: 5, comment: 'Prabin was exactly on time and cleaned perfectly!' },
      { rating: 4, comment: 'Good service, very polite.' },
      { rating: 5, comment: 'Excellent attention to detail. Will hire again.' }
    ]
  },
  {
    name: 'Sushma Maharjan',
    email: 'sushma.maharjan@gmail.com',
    password: 'password123',
    location: { type: 'Point', coordinates: [85.320, 27.689], address: 'Patan, Lalitpur' },
    services: [
      { title: 'Organic Pest Control', categoryName: 'Pest Control', price: 1200, description: 'Safe and organic pest eradication for homes.' }
    ],
    reviews: [
      { rating: 5, comment: 'No more cockroaches! Thank you Sushma.' },
      { rating: 5, comment: 'Highly recommended for pest control.' },
      { rating: 4, comment: 'A bit expensive but gets the job done.' }
    ]
  },
  {
    name: 'Bikash Thapa',
    email: 'bikash.thapa@gmail.com',
    password: 'password123',
    location: { type: 'Point', coordinates: [85.340, 27.705], address: 'Baneshwor, Kathmandu' },
    services: [
      { title: 'Computer & Laptop Repair', categoryName: 'IT Support', price: 800, description: 'Hardware repair and software installation.' },
      { title: 'Home Wi-Fi Setup', categoryName: 'IT Support', price: 500, description: 'Wi-Fi router configuration and troubleshooting.' }
    ],
    reviews: [
      { rating: 3, comment: 'Fixed my laptop but took two days.' },
      { rating: 5, comment: 'Best IT guy in Baneshwor.' }
    ]
  },
  {
    name: 'Gita Gurung',
    email: 'gita.gurung@gmail.com',
    password: 'password123',
    location: { type: 'Point', coordinates: [85.335, 27.715], address: 'Gairidhara, Kathmandu' },
    services: [
      { title: 'Professional Gardening & Landscaping', categoryName: 'Gardening', price: 1000, description: 'Lawn mowing, planting, and basic landscaping.' },
      { title: 'Indoor Plant Care', categoryName: 'Gardening', price: 600, description: 'Pest control and nutrition for your indoor plants.' }
    ],
    reviews: [
      { rating: 4, comment: 'Beautiful garden work. Highly skilled.' },
      { rating: 5, comment: 'My indoor plants look so much healthier now!' }
    ]
  },
  {
    name: 'Ramesh Karki',
    email: 'ramesh.karki@gmail.com',
    password: 'password123',
    location: { type: 'Point', coordinates: [85.305, 27.693], address: 'Kalimati, Kathmandu' },
    services: [
      { title: 'Home Security Camera Installation', categoryName: 'Electrical', price: 2500, description: 'Complete installation of CCTV systems for homes and offices.' }
    ],
    reviews: [
      { rating: 5, comment: 'Very professional CCTV installation.' }
    ]
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Dummy client for reviews
    let clientUser = await User.findOne({ email: 'dummy.client@gmail.com' });
    if (!clientUser) {
      clientUser = await User.create({
        name: 'Sanjeev Sharma',
        email: 'dummy.client@gmail.com',
        password: 'password123',
        role: 'client',
        isApproved: true,
        isVerified: true,
        status: 'active'
      });
      console.log('Created dummy client for reviews.');
    }

    for (const p of providersData) {
      // 1. Create User
      const userExists = await User.findOne({ email: p.email });
      let userId;
      if (!userExists) {
        const user = await User.create({
          name: p.name,
          email: p.email,
          password: p.password,
          role: 'provider',
          isApproved: true,
          isVerified: true,
          status: 'active',
          location: p.location,
          profilePicture: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&h=150&fit=crop'
        });
        userId = user._id;
        console.log(`Created Provider: ${p.name}`);
      } else {
        userId = userExists._id;
        console.log(`Provider already exists: ${p.name}`);
      }

      // 2. Create Services
      for (const s of p.services) {
        let category = await Category.findOne({ name: s.categoryName });
        if (!category) {
          category = await Category.create({ 
             name: s.categoryName, 
             slug: s.categoryName.toLowerCase().replace(' ', '-'), 
             icon: 'Briefcase', 
             description: `Professional ${s.categoryName} services` 
          });
        }

        const serviceExists = await Service.findOne({ providerId: userId, title: s.title });
        let serviceId;
        if (!serviceExists) {
          const newService = await Service.create({
            providerId: userId,
            categoryId: category._id,
            title: s.title,
            description: s.description,
            serviceType: 'onsite',
            pricingType: 'fixed',
            price: s.price,
            location: p.location,
            isActive: true
          });
          serviceId = newService._id;
          console.log(` Created Service: ${s.title}`);
        } else {
          serviceId = serviceExists._id;
        }

        // 3. Create Reviews for the Service
        // Assign all pending reviews to the first registered service
        for (const r of p.reviews) {
            const reviewExists = await Review.findOne({ providerId: userId, comment: r.comment });
            if (!reviewExists) {
                await Review.create({
                    bookingId: new mongoose.Types.ObjectId(), // Dummy booking
                    serviceId: serviceId,
                    clientId: clientUser._id,
                    providerId: userId,
                    rating: r.rating,
                    comment: r.comment
                });
                console.log(`   Added Review: ${r.rating} Stars`);
            }
        }
        // Clears the reviews so they only attach to the provider's first service instead of duplicating
        p.reviews = []; 
      }
    }

    console.log('Seed completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
