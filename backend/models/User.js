import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['client', 'provider', 'admin'],
      default: 'client',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deactivated'],
      default: 'active',
    },
    isSuspicious: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: 'default.jpg',
    },
    bio: {
      type: String,
    },
    portfolio: {
      type: [String],
    },
    availability: {
      type: String,
    },
    workingHours: {
      days: {
        type: [String],
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        default: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      startTime: { type: String, default: '09:00' },  // HH:mm 24h
      endTime: { type: String, default: '17:00' },
      slotDuration: { type: Number, default: 120 },    // minutes per slot
      breakStart: { type: String, default: '13:00' },  // lunch break
      breakEnd: { type: String, default: '14:00' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [85.324, 27.717], // Defaults to Kathmandu
      },
      address: { type: String }
    },
  },
  { timestamps: true }
);

// Create 2dsphere index for geospatial queries
UserSchema.index({ location: '2dsphere' });

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
