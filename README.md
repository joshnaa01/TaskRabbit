# TaskRabbit Marketplace Platform

A professional service marketplace platform designed to connect clients with verified service providers. Built with the MERN stack (MongoDB, Express, React, Node.js), the platform features a robust escrow payment system, real-time communication, and automated booking management.

## Core Features

### Role-Based Architecture
The system implements a strictly enforced three-tier role system:
- **Clients**: Discover services via map search, book technicians, manage active jobs, and process secure payments.
- **Providers**: List services within predefined categories, manage incoming leads, and track earnings after task verification.
- **Administrators**: Complete platform oversight including user verification, category management, dispute resolution, and mass communication.

### Automated Booking Lifecycle
- **Auto-Expiry Monitor**: A centralized background task monitors pending bookings. Requests not accepted by providers within 30 minutes are automatically marked as Expired, with immediate notifications sent to both parties to maintain platform efficiency.
- **Status Workflow**: Secure state transitions from Pending to Completed, including In-Progress and Pending-Review phases to support work verification.

### Professional Communication Tools
- **Real-Time Messaging**: Integrated Socket.io infrastructure enables instant chat between clients and providers for job coordination.
- **Admin Broadcast System**: A template-driven mass emailing module allows administrators to send targeted announcements to all users, specific roles, or custom-selected groups.

### Financial and Operational Security
- **Escrow Payment Logic**: Secure transaction handling where funds are verified before work begins and released upon client satisfaction or admin verdict.
- **Identity Verification**: Providers must submit citizenship and professional documentation during onboarding, subject to administrative review.
- **Geospatial Discovery**: Location-aware search capabilities allowing clients to find the nearest technicians based on real-time coordinates.

## Technical Infrastructure

### Frontend Architecture
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6 (Role-protected)
- **Icons**: Lucide React

### Backend Architecture
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Authentication**: Stateless JWT (JSON Web Tokens)
- **Encryption**: bcryptjs
- **Validation**: express-validator

### Database and Storage
- **Primary Database**: MongoDB (Mongoose ODM)
- **File Storage**: Cloudinary (Profiles, work evidence, and identity documents)

## Directory Structure

```text
TaskRabbit/
├── frontend/                # React Vite Application
│   ├── src/
│   │   ├── components/      # Reusable UI modules and Layouts
│   │   ├── context/         # Auth and Location providers
│   │   ├── pages/           # Public and Dashboard views
│   │   └── services/        # API and Socket clients
│   └── public/              # Static assets
│
└── backend/                 # Node.js Express API
    ├── config/              # Database and Service configurations
    ├── controllers/         # Business logic handlers
    ├── models/              # Mongoose schemas
    ├── routes/              # API endpoint definitions
    └── services/            # Background tasks and Third-party integrations
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local instance
- Cloudinary account for media uploads
- Stripe account (Optional - for payment processing)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/joshnaa01/TaskRabbit.git
   cd TaskRabbit
   ```

2. **Backend Configuration**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   STRIPE_SECRET_KEY=your_stripe_key
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Frontend Configuration**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

## Development Progress
- [x] Core Authentication and Role Protection
- [x] Provider Service Management and Geospatial Search
- [x] Multi-step Booking and Review Workflow
- [x] Real-time Communication Infrastructure
- [x] Administrative Dashboard with Mass Communication Tools
- [x] Automated Booking Expiry Monitor
- [x] Stripe Payment Intent Integration
