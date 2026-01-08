/**
 * Email Service Configuration
 * Supports Ethereal (dev), SendGrid, and SMTP
 */

import { env } from './environment';

export interface EmailConfig {
  service: 'ethereal' | 'sendgrid' | 'smtp';
  from: {
    email: string;
    name: string;
  };
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
}

export const emailConfig: EmailConfig = {
  service: env.EMAIL_SERVICE,
  from: {
    email: env.SENDGRID_FROM_EMAIL || 'noreply@genzaic.com',
    name: env.SENDGRID_FROM_NAME || env.PLATFORM_NAME,
  },
  smtp:
    env.EMAIL_SERVICE === 'smtp' && env.SMTP_HOST
      ? {
          host: env.SMTP_HOST,
          port: env.SMTP_PORT || 587,
          secure: env.SMTP_SECURE || false,
          auth: {
            user: env.SMTP_USER || '',
            pass: env.SMTP_PASS || '',
          },
        }
      : undefined,
  sendgrid:
    env.EMAIL_SERVICE === 'sendgrid' && env.SENDGRID_API_KEY
      ? {
          apiKey: env.SENDGRID_API_KEY,
        }
      : undefined,
};

export default emailConfig;
