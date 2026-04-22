import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Service from '../models/Service.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client',
      isApproved: role === 'provider' ? false : true,
    });

    const token = generateToken(user._id);

    res.status(201).json({
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
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'suspended' || user.status === 'deactivated') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked/suspended by an admin. You cannot log in right now.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ... other existing handlers (keeping it clean)

export const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    let user = await User.findOne({ 
      $or: [
        { googleId: googleId },
        { email: email }
      ]
    });

    if (user) {
      if (user.status === 'suspended' || user.status === 'deactivated') {
        return res.status(403).json({ success: false, message: 'Your account has been blocked/suspended by an admin. You cannot log in right now.' });
      }
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
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
  try {
    const { name, bio, profilePicture, lat, lng, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;

    if (lat && lng) {
      const newLoc = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address: address || user.location?.address
      };

      user.location = newLoc;

      // Sync to all of provider's services (provider only)
      if (user.role === 'provider') {
        try {
          await Service.updateMany(
            { providerId: user._id },
            { $set: { location: newLoc } }
          );
        } catch (e) {
          console.error("Service location sync failed:", e);
        }
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
