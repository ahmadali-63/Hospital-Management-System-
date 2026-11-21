import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hms';
  try {
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`MongoDB connection error: ${error.message}`);
    } else {
      logger.error(`Unknown Error occurred during MongoDB connection`);
    }
    logger.warn('Please ensure MongoDB is running at: ' + uri);
  }
};

export default connectDB;
