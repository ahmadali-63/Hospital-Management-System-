import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import app from './app';
import connectDB from './config/db';
import logger from './utils/logger';
import { getJwtSecret } from './config/auth';
import { initSuperAdmin } from './config/initSuperAdmin';

getJwtSecret();

const PORT = process.env.PORT || 5000;

// Connect to database and ensure Super Admin is ready
connectDB().then(() => {
  initSuperAdmin();
});

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections without crashing the server
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});
