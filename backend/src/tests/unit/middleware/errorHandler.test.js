import { expect } from 'chai';
import sinon from 'sinon';
import errorHandler from '../../../middleware/errorHandler.js';

describe('Error Handler Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        next = sinon.stub();
        process.env.NODE_ENV = 'test';
    });

    describe('Mongoose CastError', () => {
        it('should handle CastError with 404 status', () => {
            const error = { name: 'CastError', message: 'Cast to ObjectId failed' };
            errorHandler(error, req, res, next);

            expect(res.status.calledWith(404)).to.be.true;
            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.success).to.be.false;
            expect(jsonArg.message).to.equal('Resource not found');
        });
    });

    describe('MongoDB Duplicate Key Error', () => {
        it('should handle duplicate key error (E11000)', () => {
            const error = { code: 11000, keyValue: { email: 'test@example.com' }, message: 'Duplicate key error' };
            errorHandler(error, req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.success).to.be.false;
            expect(jsonArg.message).to.equal('email already exists');
        });

        it('should handle duplicate key with different field', () => {
            const error = { code: 11000, keyValue: { username: 'testuser' }, message: 'Duplicate key error' };
            errorHandler(error, req, res, next);

            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.message).to.equal('username already exists');
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

            expect(res.status.calledWith(400)).to.be.true;
            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.success).to.be.false;
            expect(jsonArg.message).to.include('Name is required');
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

            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.message).to.include('Error 1');
            expect(jsonArg.message).to.include('Error 2');
        });
    });

    describe('JWT Errors', () => {
        it('should handle JsonWebTokenError', () => {
            const error = { name: 'JsonWebTokenError', message: 'jwt malformed' };
            errorHandler(error, req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.success).to.be.false;
            expect(jsonArg.message).to.equal('Invalid token');
        });

        it('should handle TokenExpiredError', () => {
            const error = { name: 'TokenExpiredError', message: 'jwt expired' };
            errorHandler(error, req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.success).to.be.false;
            expect(jsonArg.message).to.equal('Token expired');
        });
    });

    describe('Generic Errors', () => {
        it('should handle generic error with 500 status', () => {
            const error = { message: 'Something went wrong' };
            errorHandler(error, req, res, next);

            expect(res.status.calledWith(500)).to.be.true;
            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.success).to.be.false;
            expect(jsonArg.message).to.equal('Something went wrong');
        });

        it('should use default message if no message provided', () => {
            const error = {};
            errorHandler(error, req, res, next);

            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.message).to.equal('Server Error');
        });

        it('should use custom status code if provided', () => {
            const error = { message: 'Custom error', statusCode: 403 };
            errorHandler(error, req, res, next);

            expect(res.status.calledWith(403)).to.be.true;
        });
    });

    describe('Development vs Production', () => {
        it('should include stack trace in development', () => {
            process.env.NODE_ENV = 'development';
            const error = { message: 'Test error', stack: 'Error stack trace...' };
            errorHandler(error, req, res, next);

            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.stack).to.exist;
        });

        it('should not include stack trace in production', () => {
            process.env.NODE_ENV = 'production';
            const error = { message: 'Test error', stack: 'Error stack trace...' };
            errorHandler(error, req, res, next);

            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.stack).to.be.undefined;
        });
    });

    describe('Response Format', () => {
        it('should always include success: false', () => {
            const error = { message: 'Test error' };
            errorHandler(error, req, res, next);

            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.success).to.be.false;
        });

        it('should always include message', () => {
            const error = { message: 'Test error' };
            errorHandler(error, req, res, next);

            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.message).to.exist;
        });
    });
});
