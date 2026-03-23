import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Models for Socket.io
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route files
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import reviewRoutes from './routes/review.routes.js';
import chatRoutes from './routes/chat.routes.js';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);

// Base route
app.get('/', (req, res) => res.send('TaskRabbit Clone API is running...'));

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  // Join a specific conversation room
  socket.on('joinChat', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
  });

  // Handle sending message
  socket.on('sendMessage', async (data) => {
    try {
      const { conversationId, senderId, content, fileUrl } = data;

      // 1. Save to DB
      const message = await Message.create({ conversationId, senderId, content, fileUrl });
      
      // Update Conversation's lastMessage
      let updatedLastMsg = fileUrl ? 'Sent a file' : content;
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: updatedLastMsg,
        updatedAt: Date.now()
      });

      // 2. Emit to room
      io.to(conversationId).emit('newMessage', message);
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server & Socket running on port ${PORT}`);
});
