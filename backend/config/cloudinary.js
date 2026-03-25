import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

console.log('CLOUDINARY_DEBUG_START:', {
  envPath,
  exists: fs.existsSync(envPath),
  readable: fs.existsSync(envPath) ? fs.accessSync(envPath, fs.constants.R_OK) === undefined : false
});

dotenv.config({ path: envPath });

import { v2 as cloudinary } from 'cloudinary';




console.log('CLOUDINARY_CONFIG_INIT:', {
  hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
  hasApiKey: !!process.env.CLOUDINARY_API_KEY,
  hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


export default cloudinary;
