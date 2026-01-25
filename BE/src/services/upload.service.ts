/**
 * Upload Service
 * Handles file uploads to Cloudinary
 */

import { cloudinary } from '@/config/cloudinary';
import { Readable } from 'stream';
import { logger } from '@/utils/logger';

interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  bytes: number;
}

export class UploadService {
  /**
   * Upload image to Cloudinary
   * Supports: JPG, PNG, GIF, WebP, SVG
   */
  static async uploadImage(
    file: Express.Multer.File,
    folder: string = 'products/images'
  ): Promise<UploadResult> {
    try {
      // Create a promise-based upload
      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            transformation: [
              { width: 2000, height: 2000, crop: 'limit' }, // Max dimensions
              { quality: 'auto' }, // Auto quality
              { fetch_format: 'auto' }, // Auto format
            ],
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error);
              reject(error);
            } else if (result) {
              resolve({
                url: result.url,
                publicId: result.public_id,
                secureUrl: result.secure_url,
                format: result.format,
                resourceType: result.resource_type,
                bytes: result.bytes,
              });
            }
          }
        );

        // Convert buffer to stream and pipe to cloudinary
        const bufferStream = Readable.from(file.buffer);
        bufferStream.pipe(uploadStream);
      });

      return await uploadPromise;
    } catch (error: any) {
      logger.error('Image upload failed:', {
        message: error.message,
        http_code: error.http_code,
        name: error.name,
      });

      // Provide specific error messages based on Cloudinary error
      if (error.http_code === 400) {
        if (error.message?.includes('File size too large')) {
          const match = error.message.match(/Got (\d+)\. Maximum is (\d+)/);
          if (match) {
            const gotMB = (parseInt(match[1]) / 1024 / 1024).toFixed(2);
            const maxMB = (parseInt(match[2]) / 1024 / 1024).toFixed(2);
            throw new Error(`File is too large (${gotMB}MB). Maximum size is ${maxMB}MB.`);
          }
          throw new Error('File is too large. Maximum size is 10MB.');
        }
        if (error.message?.includes('Invalid image file')) {
          throw new Error('Invalid image file format.');
        }
        throw new Error(error.message || 'Invalid file format or size');
      }

      throw new Error('Failed to upload image. Please try again.');
    }
  }

  /**
   * Upload product file (ZIP, PDF, etc.) to Google Drive or Cloudinary
   * Supports: PDF, ZIP, RAR, 7Z, and other documents
   * Files are stored in seller-specific folders (Drive) or Cloudinary
   */
  static async uploadProductFile(
    file: Express.Multer.File,
    userId: string,
    productId: string
  ): Promise<UploadResult> {
    const { env } = await import('@/config/environment');
    
    // Check if Google Drive is enabled
    if (env.USE_GOOGLE_DRIVE) {
      try {
        // Import DriveService dynamically to avoid circular dependency
        const { DriveService } = await import('./drive.service');
        
        // Upload to Google Drive
        const result = await DriveService.uploadProductFile(file, userId, productId);
        
        return {
          url: '', // URL will be generated on download
          publicId: result.fileId, // Store Drive file ID
          secureUrl: '',
          format: file.mimetype,
          resourceType: 'raw',
          bytes: result.fileSize,
        };
      } catch (error: any) {
        logger.error('Google Drive upload failed, falling back to Cloudinary:', error.message);
        // Fall through to Cloudinary upload
      }
    }
    
    // Use Cloudinary (default or fallback)
    try {
      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'products/files',
            resource_type: 'raw',
            allowed_formats: ['pdf', 'zip', 'rar', '7z', 'tar', 'gz'],
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error);
              reject(error);
            } else if (result) {
              resolve({
                url: result.url,
                publicId: result.public_id,
                secureUrl: result.secure_url,
                format: result.format,
                resourceType: result.resource_type,
                bytes: result.bytes,
              });
            }
          }
        );

        const bufferStream = Readable.from(file.buffer);
        bufferStream.pipe(uploadStream);
      });

      return await uploadPromise;
    } catch (error: any) {
      logger.error('Product file upload failed:', {
        message: error.message,
        http_code: error.http_code,
        name: error.name,
      });

      // Provide specific error messages
      if (error.message?.includes('quota')) {
        throw new Error('Storage quota exceeded. Please contact support.');
      }
      
      if (error.http_code === 400 && error.message?.includes('File size too large')) {
        throw new Error('File is too large. Maximum size is 10MB for Cloudinary.');
      }
      
      throw new Error('Failed to upload product file. Please try again.');
    }
  }

  /**
   * Upload cover image for storefront
   */
  static async uploadCoverImage(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadImage(file, 'storefronts/covers');
  }

  /**
   * Upload profile/logo image for storefront
   */
  static async uploadProfileImage(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadImage(file, 'storefronts/profiles');
  }

  /**
   * Upload product thumbnail
   */
  static async uploadProductThumbnail(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadImage(file, 'products/thumbnails');
  }

  /**
   * Delete file from Cloudinary
   */
  static async deleteFile(publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      logger.info(`Deleted file from Cloudinary: ${publicId}`);
    } catch (error) {
      logger.error('Failed to delete file from Cloudinary:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Delete multiple files from Cloudinary
   */
  static async deleteFiles(publicIds: string[], resourceType: 'image' | 'raw' = 'image'): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds, { resource_type: resourceType });
      logger.info(`Deleted ${publicIds.length} files from Cloudinary`);
    } catch (error) {
      logger.error('Failed to delete files from Cloudinary:', error);
      throw new Error('Failed to delete files');
    }
  }
}

export default UploadService;
