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
    } catch (error) {
      logger.error('Image upload failed:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload product file (ZIP, PDF, etc.) to Cloudinary
   * Supports: PDF, ZIP, RAR, 7Z, and other documents
   */
  static async uploadProductFile(
    file: Express.Multer.File,
    folder: string = 'products/files'
  ): Promise<UploadResult> {
    try {
      const uploadPromise = new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'raw', // For non-image files
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
    } catch (error) {
      logger.error('Product file upload failed:', error);
      throw new Error('Failed to upload product file');
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
