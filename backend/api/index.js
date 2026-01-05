import mongoose from 'mongoose';
import app from '../src/app.js';

let isConnected = false;

// Database connection for serverless
async function connectDatabase() {
    if (isConnected) {
        return;
    }

    try {
        const mongoUser = process.env.MONGODB_USER;
        const mongoPass = process.env.MONGODB_PASS;
        const mongoCluster = process.env.MONGODB_ATLAS_CLUSTER;
        const mongoAppName = process.env.MONGODB_APP_NAME;

        if (!mongoUser || !mongoPass || !mongoCluster) {
            throw new Error('MongoDB environment variables are missing');
        }

        const uri = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoCluster}/?retryWrites=true&w=majority&appName=${mongoAppName}`;

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 10000,
        });

        isConnected = true;
        console.log('MongoDB Connected for serverless function');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        // Don't throw - let the app handle requests even if DB fails initially
    }
}

// Serverless function handler
export default async function handler(req, res) {
    // Connect to database before handling request
    await connectDatabase();

    // Pass request to Express app
    return app(req, res);
}
