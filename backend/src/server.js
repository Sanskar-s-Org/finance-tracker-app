import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/database.js';
import logger from './config/logger.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    // Connect to database first and wait for connection
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received');
      server.close(() => {
        logger.info('Process terminated');
      });
    });

    return server;
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();
