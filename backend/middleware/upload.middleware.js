import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'taskrabbit_mern',
    allowedFormats: ['jpg', 'png', 'jpeg', 'pdf', 'mp3', 'wav', 'm4a', 'webm'],
  },
});

const upload = multer({ storage: storage });
export default upload;
