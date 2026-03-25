# 🛠️ Service Provider Marketplace Platform

A scalable, modular, and cleanly structured full-stack MERN application that connects clients with verified service providers.

## 🌟 Key Features
- **Role-Based Architecture:** Clients, Service Providers, and Super Admins.
- **Custom Escrow Payment System:** Integrated with Khalti Payment Gateway.
- **Real-Time Communication:** Real-time chat using Socket.io (to be implemented).
- **Cloud Storage:** Images and portfolio items are stored in Cloudinary.
- **Comprehensive Dashboards:** Tailored experiences for each role.

## 🏗️ Tech Stack
- **Frontend:** React.js, Tailwind CSS, React Router v6
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Validation:** express-validator
- **Integrations:** Khalti (Payments), Cloudinary (File Uploads)

## 🗄️ Database Schema Overview
1. **User Schema:** Manages all three roles (`client`, `provider`, `admin`).
2. **Category Schema:** Pre-defined by Admin.
3. **Service Schema:** Created by providers under categories, supports fixed or hourly pricing.
4. **Booking Schema:** Tracks appointments, requirements, and statuses (`Pending`, `Accepted`, `In Progress`, `Completed`, `Cancelled`, `Disputed`).
5. **Payment Schema:** Logical escrow system. Statuses: `HELD`, `RELEASED`, `REFUNDED`. Calculates 10% platform commission.
6. **Chat (Conversation & Message):** Supports pre-booking inquiries and post-booking coordination.
7. **Review Schema:** Ratings and comments from clients.

## 📁 Project Structure (Current)
```text
project-root/
│
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB Connection Configuration
│   │
│   ├── controllers/
│   │   └── auth.controller.js  # Registration and Login Logic
│   │
│   ├── middleware/
│   │   └── auth.middleware.js  # JWT Verification and Role Protection
│   │
│   ├── models/
│   │   └── User.js             # Mongoose Schema for Users
│   │
│   ├── routes/
│   │   └── auth.routes.js      # Express Routes for Auth
│   │
│   ├── .env                    # Environment Variables
│   ├── package.json            # Node.js dependencies
│   └── server.js               # Express Server Entry Point
```

## 🚀 Progress Tracking
- [x] Gather Requirements (Recursive Questioning)
- [x] Design Database Schema
- [x] Setup Backend Structure & MongoDB Connection
- [x] Implement User Authentication (Register, Login, Middleware)
- [x] Build Core Models (Category, Service, Booking, Payment, Review)
- [x] Implement Booking System (Option B Flow)
- [x] Integrate Khalti Payment (Simulated verification with Escrow schema)
- [x] Add Cloudinary File Uploads
- [x] Implement Socket.io Chat (Conversations + Real-time messages)
- [x] Scaffold React Frontend UI (Vite, Context API, React Router, Tailwind)
- [x] Build Public & Auth Pages (Home, Login, Register)
- [x] Build User & Admin Dashboards (Dynamic Sidenav + TanStack Tables)
- [x] Implement Booking & Chat Interfaces (Multi-step Wizard + Split-screen Websocket)
