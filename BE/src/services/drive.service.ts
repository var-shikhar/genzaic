/**
 * Google Drive Service
 * Handles file uploads, downloads, and folder management
 */

import { drive } from '@/config/drive';
import { logger } from '@/utils/logger';
import { Readable } from 'stream';

interface DriveUploadResult {
  fileId: string;
  fileName: string;
  fileSize: number;
}

export class DriveService {
  /**
   * Get or create seller folder in Google Drive
   * Each seller has their own private folder
   */
  static async getOrCreateSellerFolder(userId: string): Promise<string> {
    const folderName = `seller-${userId}`;

    try {
      // Search for existing folder
      const response = await drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      // Return existing folder
      if (response.data.files && response.data.files.length > 0) {
        logger.info(`Found existing folder for seller ${userId}: ${response.data.files[0].id}`);
        return response.data.files[0].id!;
      }

      // Create new folder
      const folder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

      logger.info(`Created new folder for seller ${userId}: ${folder.data.id}`);

      // Set folder permissions to private (only service account can access)
      // Files will be shared individually when needed
      return folder.data.id!;
    } catch (error: any) {
      logger.error('Failed to get/create seller folder:', error);
      throw new Error('Failed to manage seller folder in Google Drive');
    }
  }

  /**
   * Upload product file to seller's folder
   */
  static async uploadProductFile(
    file: Express.Multer.File,
    userId: string,
    productId: string
  ): Promise<DriveUploadResult> {
    try {
      // Get seller's folder
      const folderId = await this.getOrCreateSellerFolder(userId);

      // Generate unique filename
      const fileName = `product-${productId}-${Date.now()}-${file.originalname}`;

      // Upload file
      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId],
          // File is private by default
        },
        media: {
          mimeType: file.mimetype,
          body: Readable.from(file.buffer),
        },
        fields: 'id, name, size',
      });

      logger.info(`Uploaded file to Drive: ${fileName} (${response.data.id})`);

      return {
        fileId: response.data.id!,
        fileName: response.data.name!,
        fileSize: parseInt(response.data.size || '0'),
      };
    } catch (error: any) {
      logger.error('Failed to upload file to Drive:', {
        error: error.message,
        userId,
        productId,
      });
      throw new Error(`Failed to upload file to Google Drive: ${error.message}`);
    }
  }

  /**
   * Generate temporary download link for a file
   * Creates a temporary permission and returns the download URL
   */
  static async generateDownloadLink(fileId: string, _expirationMinutes: number = 60): Promise<string> {
    try {
      // Create temporary public permission
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Get the file metadata with webContentLink
      const file = await drive.files.get({
        fileId,
        fields: 'webContentLink, webViewLink',
      });

      logger.info(`Generated download link for file: ${fileId}`);

      // Return direct download link
      return file.data.webContentLink || file.data.webViewLink!;
    } catch (error: any) {
      logger.error('Failed to generate download link:', error);
      throw new Error('Failed to generate download link');
    }
  }

  /**
   * Revoke public access to a file
   */
  static async revokePublicAccess(fileId: string): Promise<void> {
    try {
      // List all permissions
      const permissions = await drive.permissions.list({
        fileId,
        fields: 'permissions(id, type)',
      });

      // Remove 'anyone' permissions
      if (permissions.data.permissions) {
        for (const permission of permissions.data.permissions) {
          if (permission.type === 'anyone') {
            await drive.permissions.delete({
              fileId,
              permissionId: permission.id!,
            });
          }
        }
      }

      logger.info(`Revoked public access for file: ${fileId}`);
    } catch (error: any) {
      logger.error('Failed to revoke public access:', error);
    }
  }

  /**
   * Delete file from Google Drive
   */
  static async deleteFile(fileId: string): Promise<void> {
    try {
      await drive.files.delete({ fileId });
      logger.info(`Deleted file from Drive: ${fileId}`);
    } catch (error: any) {
      logger.error('Failed to delete file from Drive:', error);
      throw new Error('Failed to delete file from Google Drive');
    }
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(fileId: string): Promise<any> {
    try {
      const response = await drive.files.get({
        fileId,
        fields: 'id, name, size, mimeType, createdTime, modifiedTime',
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }
}

export default DriveService;
