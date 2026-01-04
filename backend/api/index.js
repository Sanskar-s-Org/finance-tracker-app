import dotenv from 'dotenv';
import app from '../src/app.js';
import connectDB from '../src/config/database.js';

dotenv.config();

// Connect to database once
let dbConnected = false;

const connectWithRetry = async () => {
    if (!dbConnected) {
        try {
            await connectDB();
            dbConnected = true;
        } catch (error) {
            console.error('Database connection failed:', error);
        }
    }
};

// Export the Express app as a serverless function
export default async function handler(req, res) {
    await connectWithRetry();
    return app(req, res);
}
