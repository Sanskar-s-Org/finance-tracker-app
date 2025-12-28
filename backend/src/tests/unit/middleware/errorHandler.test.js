import errorHandler from '../../../middleware/errorHandler.js';

// Mock response helper for ESM compatibility
const createMockResponse = () => {
    const calls = { status: [], json: [] };

    return {
        status(code) {
            calls.status.push(code);
            return this;
        },
        json(data) {
            calls.json.push(data);
            return this;
        },
        _calls: calls
    };
};

const createMockNext = () => {
    const calls = [];
    const fn = (...args) => calls.push(args);
    fn.calls = calls;
    return fn;
};

describe('Error Handler Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = createMockResponse();
        next = createMockNext();
        process.env.NODE_ENV = 'test';
    });

    describe('Mongoose CastError', () => {
        it('should handle CastError with 404 status', () => {
            const error = { name: 'CastError', message: 'Cast to ObjectId failed' };
            errorHandler(error, req, res, next);

            expect(res._calls.status[0]).toBe(404);
            expect(res._calls.json[0].success).toBe(false);
            expect(res._calls.json[0].message).toBe('Resource not found');
        });
    });

    describe('MongoDB Duplicate Key Error', () => {
        it('should handle duplicate key error (E11000)', () => {
            const error = { code: 11000, keyValue: { email: 'test@example.com' }, message: 'Duplicate key error' };
            errorHandler(error, req, res, next);

            expect(res._calls.status[0]).toBe(400);
            expect(res._calls.json[0].success).toBe(false);
            expect(res._calls.json[0].message).toBe('email already exists');
        });

        it('should handle duplicate key with different field', () => {
            const error = { code: 11000, keyValue: { username: 'testuser' }, message: 'Duplicate key error' };
            errorHandler(error, req, res, next);

            expect(res._calls.json[0].message).toBe('username already exists');
        });
    });

    describe('Mongoose ValidationError', () => {
        it('should handle validation error', () => {
            const error = {
                name: 'ValidationError',
                errors: {
                    name: { message: 'Name is required' },
                    email: { message: 'Email is required' },
                },
                message: 'Validation failed',
            };
            errorHandler(error, req, res, next);

            expect(res._calls.status[0]).toBe(400);
            expect(res._calls.json[0].success).toBe(false);
            expect(res._calls.json[0].message).toContain('Name is required');
        });

        it('should combine multiple validation errors', () => {
            const error = {
                name: 'ValidationError',
                errors: {
                    field1: { message: 'Error 1' },
                    field2: { message: 'Error 2' },
                },
                message: 'Validation failed',
            };
            errorHandler(error, req, res, next);

            expect(res._calls.json[0].message).toContain('Error 1');
            expect(res._calls.json[0].message).toContain('Error 2');
        });
    });

    describe('JWT Errors', () => {
        it('should handle JsonWebTokenError', () => {
            const error = { name: 'JsonWebTokenError', message: 'jwt malformed' };
            errorHandler(error, req, res, next);

            expect(res._calls.status[0]).toBe(401);
            expect(res._calls.json[0].success).toBe(false);
            expect(res._calls.json[0].message).toBe('Invalid token');
        });

        it('should handle TokenExpiredError', () => {
            const error = { name: 'TokenExpiredError', message: 'jwt expired' };
            errorHandler(error, req, res, next);

            expect(res._calls.status[0]).toBe(401);
            expect(res._calls.json[0].success).toBe(false);
            expect(res._calls.json[0].message).toBe('Token expired');
        });
    });

    describe('Generic Errors', () => {
        it('should handle generic error with 500 status', () => {
            const error = { message: 'Something went wrong' };
            errorHandler(error, req, res, next);

            expect(res._calls.status[0]).toBe(500);
            expect(res._calls.json[0].success).toBe(false);
            expect(res._calls.json[0].message).toBe('Something went wrong');
        });

        it('should use default message if no message provided', () => {
            const error = {};
            errorHandler(error, req, res, next);

            expect(res._calls.json[0].message).toBe('Server Error');
        });

        it('should use custom status code if provided', () => {
            const error = { message: 'Custom error', statusCode: 403 };
            errorHandler(error, req, res, next);

            expect(res._calls.status[0]).toBe(403);
        });
    });

    describe('Development vs Production', () => {
        it('should include stack trace in development', () => {
            process.env.NODE_ENV = 'development';
            const error = { message: 'Test error', stack: 'Error stack trace...' };
            errorHandler(error, req, res, next);

            expect(res._calls.json[0].stack).toBeDefined();
        });

        it('should not include stack trace in production', () => {
            process.env.NODE_ENV = 'production';
            const error = { message: 'Test error', stack: 'Error stack trace...' };
            errorHandler(error, req, res, next);

            expect(res._calls.json[0].stack).toBeUndefined();
        });
    });

    describe('Response Format', () => {
        it('should always include success: false', () => {
            const error = { message: 'Test error' };
            errorHandler(error, req, res, next);

            expect(res._calls.json[0].success).toBe(false);
        });

        it('should always include message', () => {
            const error = { message: 'Test error' };
            errorHandler(error, req, res, next);

            expect(res._calls.json[0].message).toBeDefined();
        });
    });
});
