import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  try {
    const mongoUser = process.env.MONGODB_USER;
    const mongoPass = process.env.MONGODB_PASS;
    const mongoCluster = process.env.MONGODB_ATLAS_CLUSTER;
    const mongoAppName = process.env.MONGODB_APP_NAME;

    // Construct MongoDB Atlas URI
    const uri = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoCluster}/?retryWrites=true&w=majority&appName=${mongoAppName}`;

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', err => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
