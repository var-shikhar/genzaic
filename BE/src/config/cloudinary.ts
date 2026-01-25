/**
 * Cloudinary Configuration
 * Handles file uploads to Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/environment';
import { logger } from '@/utils/logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Validate Cloudinary connection at startup
 */
export async function validateCloudinaryConnection(): Promise<void> {
  try {
    // Test connection by pinging Cloudinary API
    await cloudinary.api.ping();
    logger.info('✅ Cloudinary connection validated');
  } catch (error: any) {
    logger.error('❌ Cloudinary connection failed:', {
      message: error.message,
      error: error.error?.message || error.message,
    });
    throw new Error(`Cloudinary configuration is invalid: ${error.message}`);
  }
}

export { cloudinary };
