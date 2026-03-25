import mongoose from 'mongoose';
import dns from 'dns';

// Fallback to Google DNS if local DNS fails to resolve SRV records
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000, // Increase timeout to 20s
      socketTimeoutMS: 45000,         // Close sockets after 45 seconds of inactivity
      family: 4,                      // Use IPv4, skip IPv6 (helps on some macOS/ISP setups)
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Only exit in production if you want it to restart, but nodemon handles it in dev
    process.exit(1);
  }
};

export default connectDB;
