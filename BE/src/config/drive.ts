/**
 * Google Drive Configuration
 * Handles file storage using Google Drive API
 */

import { google } from 'googleapis';
import { env } from '@/config/environment';
import { logger } from '@/utils/logger';

// Initialize Google Drive client with service account
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: env.GOOGLE_DRIVE_CLIENT_EMAIL,
    private_key: env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

export const drive = google.drive({ version: 'v3', auth });

/**
 * Validate Google Drive connection at startup
 */
export async function validateDriveConnection(): Promise<void> {
  try {
    const response = await drive.about.get({ fields: 'user' });
    logger.info('✅ Google Drive connection validated');
    logger.info(`   Service Account: ${response.data.user?.emailAddress || 'Unknown'}`);
  } catch (error: any) {
    logger.error('❌ Google Drive connection failed:', {
      message: error.message,
      code: error.code,
    });
    throw new Error(`Google Drive is not properly configured: ${error.message}`);
  }
}

export default drive;
