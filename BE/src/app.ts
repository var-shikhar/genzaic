/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */

import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/environment';
import { apiLimiter, errorHandler, notFoundHandler } from './middleware';
import authRoutes from './routes/auth.routes';
import onboardingRoutes from './routes/onboarding.routes';
import productRoutes from './routes/product.routes';
import storefrontRoutes from './routes/storefront.routes';
import userRoutes from './routes/user.routes';
import kycRoutes from './routes/kyc.routes';
import payoutRoutes from './routes/payout.routes';
import salesRoutes from './routes/sales.routes';
import checkoutRoutes from './routes/checkout.routes';
import buyerRoutes from './routes/buyer.routes';
import healthRoutes from './routes/health.routes';
import { logger } from './utils/logger';

export const createApp = (): Application => {
  const app = express();

  // ============================================================================
  // SECURITY MIDDLEWARE
  // ============================================================================

  // Helmet - Security headers
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS - Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: env.CORS_CREDENTIALS, // Allow cookies
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ============================================================================
  // BODY PARSING MIDDLEWARE
  // ============================================================================

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // ============================================================================
  // REQUEST LOGGING
  // ============================================================================

  app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
      });
    });

    next();
  });

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  // Use comprehensive health check routes
  app.use('/', healthRoutes);

  app.get('/', (_, res) => {
    res.status(200).json({
      success: true,
      message: 'GenZaic Creator Hub API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        onboarding: '/api/onboarding',
        products: '/api/products',
        storefront: '/api/storefront',
        user: '/api/user',
        kyc: '/api/kyc',
        payouts: '/api/payouts',
        sales: '/api/sales',
        checkout: '/api/checkout',
        buyer: '/api/buyer',
      },
    });
  });

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  app.use('/api', apiLimiter);

  // ============================================================================
  // API ROUTES
  // ============================================================================

  app.use('/api/auth', authRoutes);
  app.use('/api/onboarding', onboardingRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/storefront', storefrontRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/kyc', kycRoutes);
  app.use('/api/payouts', payoutRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/buyer', buyerRoutes);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  // 404 Handler
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export default createApp;
