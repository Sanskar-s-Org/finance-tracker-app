import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Load environment variables from root .env
dotenv.config({ path: '../../.env' });

// Set test JWT secret if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
}

let mongoServer;

// Connect to in-memory database before all tests
before(async function () {
  this.timeout(60000); // 60 second timeout for MongoDB setup

  try {
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: null, // Auto-select available port
        ip: '127.0.0.1', // Use localhost
        storageEngine: 'wiredTiger',
      },
    });
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('MongoDB setup error:', error);
    throw error;
  }
});

// Clear database after each test
afterEach(async function () {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
});

// Disconnect and stop database after all tests
after(async function () {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
