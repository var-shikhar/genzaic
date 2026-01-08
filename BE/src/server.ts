/**
 * Server Entry Point
 * Initializes and starts the Express server
 */

import { createApp } from './app';
import { env } from './config/environment';
import { prisma } from './config/database';
import { EmailService } from './services/email.service';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    logger.info('🚀 Starting GenZaic Creator Hub API...');

    // ============================================================================
    // INITIALIZE SERVICES
    // ============================================================================

    // Initialize email service (non-blocking)
    logger.info('📧 Initializing email service...');
    EmailService.initialize().catch((error) => {
      logger.warn('⚠️  Email service initialization failed (non-critical):', error.message);
      logger.info('📧 Server will continue without email service');
    });

    // Test database connection
    logger.info('🗄️  Connecting to database...');
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database connected successfully');

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

    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      logger.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.error('💥 Unhandled Promise Rejection:', reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
