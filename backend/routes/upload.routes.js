import express from 'express';
import upload from '../middleware/upload.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// General image upload (single)
router.post('/image', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  res.status(200).json({
    success: true,
    url: req.file.path, // Cloudinary URL
    public_id: req.file.filename
  });
});

// Bulk gallery upload
router.post('/gallery', protect, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const urls = req.files.map(f => ({ url: f.path, public_id: f.filename }));
  res.status(200).json({
    success: true,
    data: urls
  });
});

export default router;
