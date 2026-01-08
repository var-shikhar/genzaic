/**
 * Express Type Extensions
 * Adds custom properties to Express Request object
 */

import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};
