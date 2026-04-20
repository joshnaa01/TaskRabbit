import User from '../models/User.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, role, lat, lng, profilePicture, citizenshipDocument, workDocument } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Role override for security
    const finalRole = (role === 'admin') ? 'client' : (role || 'client');

    // Geo-validation for providers
    let location = undefined;
    if (finalRole === 'provider' && lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
        location = {
          type: 'Point',
          coordinates: [longitude, latitude] // [lng, lat] is standard for MongoDB
        };
      }
    }

    user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      location,
      profilePicture,
      citizenshipDocument,
      workDocument,
      isApproved: finalRole === 'provider' ? false : true
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role === 'provider' && !user.isApproved) {
      return res.status(401).json({ success: false, message: 'Your account is pending admin approval' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Google OAuth Login
export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: 'Google credential is required' });
  }

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Link Google ID if user exists by email but not yet linked
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture && user.profilePicture === 'default.jpg') {
          user.profilePicture = picture;
        }
        await user.save();
      }

      // Check provider approval
      if (user.role === 'provider' && !user.isApproved) {
        return res.status(401).json({ success: false, message: 'Your account is pending admin approval' });
      }
    } else {
      // Create new user with Google info
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture || 'default.jpg',
        role: 'client',
        isApproved: true,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(401).json({ success: false, message: 'Invalid Google credentials' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateProfile = async (req, res) => {
  const { name, bio, profilePicture, lat, lng } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;

    if (user.role === 'provider' && lat && lng) {
      const newLoc = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };

      user.location = newLoc;

      // Sync to all of provider's services automatically so everything reflects
      try {
        const Service = (await import('../models/Service.js')).default;
        await Service.updateMany(
          { providerId: user._id },
          { $set: { location: newLoc } }
        );
      } catch (e) {
        console.error("Failed to sync service locations", e);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
