import serverless from 'serverless-http';
import createApp from '../app';
import { env } from '../config/environment';

// Initialize the app
const app = createApp();

// Export the handler for Netlify Functions
export const handler = serverless(app);
