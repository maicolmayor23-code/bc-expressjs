import mongoose from 'mongoose';
import { logger } from '../config/logger.js';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/dj_sound_lights_dev';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('🍃 Connected to MongoDB successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB', { error });
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('🍃 Disconnected from MongoDB');
}
