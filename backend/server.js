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

// Connect to database
await connectDB();


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

      // 2. Create Notification for the other participant
      const session = await Conversation.findById(conversationId);
      if (session) {
        const recipientId = session.participants.find(p => p.toString() !== senderId.toString());
        if (recipientId) {
          await Notification.create({
            recipient: recipientId,
            sender: senderId,
            type: 'message',
            title: `New message from ${data.senderName || 'Participant'}`,
            message: content,
            isRead: false
          });
          
          // Optionally emit notification count update via socket to recipient if online
          // io.to(recipientId.toString()).emit('newNotification', { type: 'message' });
        }
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
