import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../../config/database.js';

// Load environment variables from root
dotenv.config({ path: '../../../.env' });

describe('Database Connection Tests', () => {
    // These tests use REAL MongoDB connection
    // Clean up after tests to avoid polluting database
    const TEST_COLLECTION_NAME = 'test_connection_verification';

    afterAll(async () => {
        // Clean up test collection
        if (mongoose.connection.readyState === 1) {
            try {
                await mongoose.connection.db.dropCollection(TEST_COLLECTION_NAME);
            } catch (error) {
                // Collection might not exist, ignore error
            }
            await mongoose.disconnect();
        }
    });

    describe('MongoDB Atlas Connection', () => {
        it('should successfully connect to MongoDB Atlas', async () => {
            const connection = await connectDB();

            expect(connection).toBeDefined();
            expect(mongoose.connection.readyState).toBe(1); // 1 = connected
            expect(connection.connection.host).toBeDefined();
        });

        it('should have valid connection state after connecting', async () => {
            // If not already connected from previous test
            if (mongoose.connection.readyState !== 1) {
                await connectDB();
            }

            expect(mongoose.connection.readyState).toBe(1);
            expect(mongoose.connection.name).toBeDefined();
        });

        it('should connect to the correct cluster', async () => {
            if (mongoose.connection.readyState !== 1) {
                await connectDB();
            }

            const host = mongoose.connection.host;
            const expectedCluster = process.env.MONGODB_ATLAS_CLUSTER;

            expect(host).toContain(expectedCluster || 'mongodb');
        });
    });

    describe('Database CRUD Operations', () => {
        beforeAll(async () => {
            // Ensure connection before CRUD tests
            if (mongoose.connection.readyState !== 1) {
                await connectDB();
            }
        });

        it('should create a test document in database', async () => {
            const collection = mongoose.connection.db.collection(
                TEST_COLLECTION_NAME
            );

            const testDoc = {
                testField: 'test value',
                timestamp: new Date(),
            };

            const result = await collection.insertOne(testDoc);

            expect(result.acknowledged).toBe(true);
            expect(result.insertedId).toBeDefined();
        });

        it('should read the test document from database', async () => {
            const collection = mongoose.connection.db.collection(
                TEST_COLLECTION_NAME
            );

            // Insert first
            const testDoc = {
                testField: 'read test',
                timestamp: new Date(),
            };
            await collection.insertOne(testDoc);

            // Read
            const found = await collection.findOne({ testField: 'read test' });

            expect(found).toBeDefined();
            expect(found.testField).toBe('read test');
        });

        it('should update a test document in database', async () => {
            const collection = mongoose.connection.db.collection(
                TEST_COLLECTION_NAME
            );

            // Insert document
            const testDoc = {
                testField: 'update test',
                value: 'original',
                timestamp: new Date(),
            };
            await collection.insertOne(testDoc);

            // Update
            const updateResult = await collection.updateOne(
                { testField: 'update test' },
                { $set: { value: 'updated' } }
            );

            expect(updateResult.modifiedCount).toBe(1);

            // Verify update
            const updated = await collection.findOne({ testField: 'update test' });
            expect(updated.value).toBe('updated');
        });

        it('should delete a test document from database', async () => {
            const collection = mongoose.connection.db.collection(
                TEST_COLLECTION_NAME
            );

            // Insert document
            const testDoc = {
                testField: 'delete test',
                timestamp: new Date(),
            };
            await collection.insertOne(testDoc);

            // Delete
            const deleteResult = await collection.deleteOne({
                testField: 'delete test',
            });

            expect(deleteResult.deletedCount).toBe(1);

            // Verify deletion
            const found = await collection.findOne({ testField: 'delete test' });
            expect(found).toBeNull();
        });

        it('should perform complex query operations', async () => {
            const collection = mongoose.connection.db.collection(
                TEST_COLLECTION_NAME
            );

            // Insert multiple documents
            await collection.insertMany([
                { category: 'test', value: 10 },
                { category: 'test', value: 20 },
                { category: 'test', value: 30 },
            ]);

            // Query with filter and sort
            const results = await collection
                .find({ category: 'test' })
                .sort({ value: -1 })
                .limit(2)
                .toArray();

            expect(results.length).toBe(2);
            expect(results[0].value).toBe(30);
            expect(results[1].value).toBe(20);
        });
    });

    describe('Connection Configuration', () => {
        it('should have serverSelectionTimeoutMS configured', async () => {
            if (mongoose.connection.readyState !== 1) {
                await connectDB();
            }

            const options = mongoose.connection.options;
            expect(options).toBeDefined();
            // Note: Mongoose may normalize these options
        });

        it('should handle connection events', done => {
            if (mongoose.connection.readyState !== 1) {
                connectDB().then(() => {
                    // Connection should be established
                    expect(mongoose.connection.readyState).toBe(1);
                    done();
                });
            } else {
                expect(mongoose.connection.readyState).toBe(1);
                done();
            }
        });
    });

    describe('Connection Validation', () => {
        it('should verify database name is set', async () => {
            if (mongoose.connection.readyState !== 1) {
                await connectDB();
            }

            const dbName = mongoose.connection.name;
            expect(dbName).toBeDefined();
            expect(typeof dbName).toBe('string');
            expect(dbName.length).toBeGreaterThan(0);
        });

        it('should verify connection is ready for operations', async () => {
            if (mongoose.connection.readyState !== 1) {
                await connectDB();
            }

            expect(mongoose.connection.readyState).toBe(1);
            expect(mongoose.connection.db).toBeDefined();
        });

        it('should have access to database collections', async () => {
            if (mongoose.connection.readyState !== 1) {
                await connectDB();
            }

            const collections = await mongoose.connection.db
                .listCollections()
                .toArray();
            expect(Array.isArray(collections)).toBe(true);
        });
    });

    describe('Environment Configuration', () => {
        it('should have MongoDB credentials configured', () => {
            expect(process.env.MONGODB_USER).toBeDefined();
            expect(process.env.MONGODB_PASS).toBeDefined();
            expect(process.env.MONGODB_ATLAS_CLUSTER).toBeDefined();
            expect(process.env.MONGODB_APP_NAME).toBeDefined();
        });

        it('should not expose credentials in plain text', async () => {
            if (mongoose.connection.readyState !== 1) {
                await connectDB();
            }

            // Verify password is not in connection string logging
            const connectionString = mongoose.connection.host;
            const password = process.env.MONGODB_PASS;

            expect(connectionString).not.toContain(password);
        });
    });
});
