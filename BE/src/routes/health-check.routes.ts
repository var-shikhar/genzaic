/**
 * Health Check Routes
 * Provides endpoints for monitoring server and service health
 */

import { Router, Request, Response } from 'express';
import { prisma } from '@/config/database';
import { cloudinary } from '@/config/cloudinary';
import { env } from '@/config/environment';

const router = Router();

/**
 * GET /health
 * Basic health check endpoint
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };

    // Return the Health Response 
    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/detailed
 * Detailed health check with service status
 */
router.get('/health/detailed', async (_req: Request, res: Response) => {
  const services: any = {
    database: { status: 'unknown' },
    cloudinary: { status: 'unknown' },
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    services.database = { status: 'ok', message: 'Connected' };
  } catch (error: any) {
    services.database = { status: 'error', message: error.message };
  }

  // Check Cloudinary
  try {
    await cloudinary.api.ping();
    services.cloudinary = { status: 'ok', message: 'Connected' };
  } catch (error: any) {
    services.cloudinary = { status: 'error', message: error.message };
  }

  const allHealthy = Object.values(services).every(
    (service: any) => service.status === 'ok'
  );

  const health = {
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    services,
  };

  res.status(allHealthy ? 200 : 503).json(health);
});

export default router;
