/**
 * Server Entry Point
 * Initializes and starts the Express server
 */

import { createApp } from './app';
import { env } from './config/environment';
import { prisma } from './config/database';
import { validateCloudinaryConnection } from './config/cloudinary';
import { validateDriveConnection } from './config/drive';
import { EmailService } from './services/email.service';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    logger.info('🚀 Starting GenZaic Creator Hub API...');
    logger.info('');

    // ============================================================================
    // VALIDATE CONFIGURATION
    // ============================================================================

    logger.info('📋 Validating environment configuration...');
    logger.info(`   Environment: ${env.NODE_ENV}`);
    logger.info(`   Port: ${env.PORT}`);
    logger.info(`   API URL: ${env.API_BASE_URL}`);
    logger.info(`   Frontend URL: ${env.FRONTEND_URL}`);
    logger.info('✅ Environment configuration validated');
    logger.info('');

    // ============================================================================
    // INITIALIZE & VALIDATE SERVICES
    // ============================================================================

    // 1. Test database connection with retry logic
    logger.info('🗄️  Validating database connection...');
    let dbConnected = false;
    let retries = 3;
    
    while (!dbConnected && retries > 0) {
      try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        const userCount = await prisma.user.count();
        logger.info(`✅ Database connected successfully (${userCount} users)`);
        dbConnected = true;
      } catch (error: any) {
        retries--;
        if (retries > 0) {
          logger.warn(`⚠️  Database connection failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        } else {
          logger.error('❌ Database connection failed:', error.message);
          throw new Error('Database is not accessible. Please check DATABASE_URL.');
        }
      }
    }
    logger.info('');

    // 2. Validate Cloudinary connection
    logger.info('☁️  Validating Cloudinary connection...');
    try {
      await validateCloudinaryConnection();
    } catch (error: any) {
      logger.error('❌ Cloudinary validation failed:', error.message);
      throw new Error('Cloudinary is not properly configured.');
    }
    logger.info('');

    // 3. Validate Google Drive connection
    logger.info('📁 Validating Google Drive connection...');
    try {
      await validateDriveConnection();
    } catch (error: any) {
      logger.error('❌ Google Drive validation failed:', error.message);
      throw new Error('Google Drive is not properly configured.');
    }
    logger.info('');

    // 4. Initialize email service
    logger.info('📧 Initializing email service...');
    try {
      await EmailService.initialize();
      logger.info('✅ Email service initialized successfully');
    } catch (error: any) {
      logger.warn('⚠️  Email service initialization failed (non-critical):', error.message);
      logger.info('📧 Server will continue without email service');
    }
    logger.info('');

    // ============================================================================
    // START SERVER
    // ============================================================================

    const app = createApp();
    const PORT = env.PORT;

    const server = app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`📍 API Base URL: ${env.API_BASE_URL}`);
      logger.info(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
      logger.info(`📧 Email Service: ${env.EMAIL_SERVICE}`);
      logger.info('='.repeat(50));
      logger.info('');
      logger.info('Available endpoints:');
      logger.info(`  - GET  ${env.API_BASE_URL}/../health`);
      logger.info(`  - POST ${env.API_BASE_URL}/auth/signup`);
      logger.info(`  - POST ${env.API_BASE_URL}/auth/verify-email`);
      logger.info(`  - POST ${env.API_BASE_URL}/auth/login`);
      logger.info(`  - POST ${env.API_BASE_URL}/auth/logout`);
      logger.info(`  - GET  ${env.API_BASE_URL}/auth/me`);
      logger.info(`  - POST ${env.API_BASE_URL}/auth/forgot-password`);
      logger.info(`  - POST ${env.API_BASE_URL}/auth/reset-password`);
      logger.info(`  - POST ${env.API_BASE_URL}/auth/refresh`);
      logger.info(`  - POST ${env.API_BASE_URL}/auth/resend-otp`);
      logger.info(`  - GET  ${env.API_BASE_URL}/user/profile`);
      logger.info(`  - PUT  ${env.API_BASE_URL}/user/profile`);
      logger.info(`  - PUT  ${env.API_BASE_URL}/user/password`);
      logger.info(`  - GET  ${env.API_BASE_URL}/storefront`);
      logger.info(`  - PUT  ${env.API_BASE_URL}/storefront`);
      logger.info(`  - GET  ${env.API_BASE_URL}/storefront/public/:slug`);
      logger.info('');
      logger.info('🎉 Server ready to accept requests!');
      logger.info('='.repeat(50));
    });

    // ============================================================================
    // GRACEFUL SHUTDOWN
    // ============================================================================

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received, shutting down gracefully...`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('✅ HTTP server closed');

        // Close database connection
        await prisma.$disconnect();
        logger.info('✅ Database connection closed');

        logger.info('👋 Server shut down complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors - LOG BUT DON'T CRASH
    process.on('uncaughtException', (error: Error) => {
      logger.error('💥 Uncaught Exception:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      // Don't crash the server - log and continue
      // In production, consider alerting monitoring service (e.g., Sentry)
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('💥 Unhandled Promise Rejection:', {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: String(promise),
      });
      // Don't crash the server - log and continue
      // The error is already logged for debugging
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
