/**
 * Cloudinary Configuration
 * Handles file uploads to Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/environment';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
