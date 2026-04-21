import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Models for Socket.io
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import Notification from './models/Notification.js';
import { startBookingExpiryJob } from './services/job.service.js';

// Connect to database
await connectDB();

// Start Background Jobs
startBookingExpiryJob();


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
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import slotRoutes from './routes/slot.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Base route
app.get('/', (req, res) => res.send('TaskRabbit Clone API is running...'));

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  // Join a specific conversation room
  socket.on('joinChat', (conversationId) => {
    // Leave all rooms (except the default one which is the socket ID)
    const currentRooms = Array.from(socket.rooms);
    currentRooms.forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    
    socket.join(conversationId);
    console.log(`User ${socket.id} switched to room: ${conversationId}`);
  });

  // Handle sending message
  // Handle sending message
  socket.on('sendMessage', async (data) => {
    try {
      const { conversationId, senderId, content, fileUrl, type } = data;

      // 0. Check conversation status
      const session = await Conversation.findById(conversationId);
      if (!session || session.status === 'closed') {
        console.warn(`Blocked message to ${session?.status || 'unknown'} conversation: ${conversationId}`);
        return;
      }

      // 1. Save to DB
      const message = await Message.create({ conversationId, senderId, content, fileUrl, type: type || 'text' });

      // Update Conversation's lastMessage
      let updatedLastMsg = content;
      if (type === 'voice') updatedLastMsg = 'Sent a voice message';
      else if (type === 'image') updatedLastMsg = 'Sent an image';
      else if (fileUrl && !content) updatedLastMsg = 'Sent a file';
      
      session.lastMessage = updatedLastMsg;
      session.updatedAt = Date.now();
      await session.save();

      // 2. Create Notification for the other participant
      const recipientId = session.participants.find(p => p.toString() !== senderId.toString());
      if (recipientId) {
        await Notification.create({
          recipient: recipientId,
          sender: senderId,
          type: 'message',
          title: `New message from ${data.senderName || 'Participant'}`,
          message: content,
          conversationId: conversationId,
          isRead: false
        });
      }

      // 3. Emit to room
      io.to(conversationId).emit('newMessage', message);
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server & Socket running on port ${PORT}`);
});
