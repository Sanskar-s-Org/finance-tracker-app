import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-jwt-secret';

import '../../setup.js';
import { protect, generateToken, sendTokenResponse } from '../../../middleware/auth.js';
import User from '../../../models/User.js';
import jwt from 'jsonwebtoken';

// Mock response helper for ESM compatibility with proper chaining
const createMockResponse = () => {
    const calls = { status: [], json: [], cookie: [] };

    return {
        status(code) {
            calls.status.push(code);
            return this;
        },
        json(data) {
            calls.json.push(data);
            return this;
        },
        cookie(name, value, options) {
            calls.cookie.push([name, value, options]);
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

describe('Auth Middleware', () => {
    let user;

    beforeEach(async () => {
        user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        });
    });

    describe('protect middleware', () => {
        it('should authenticate with valid token in Authorization header', async () => {
            const token = generateToken(user._id);
            const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
            const res = createMockResponse();
            const next = createMockNext();

            await protect(req, res, next);

            expect(next.calls.length).toBe(1);
            expect(req.user).toBeDefined();
            expect(req.user._id.toString()).toBe(user._id.toString());
        });

        it('should authenticate with valid token in cookies', async () => {
            const token = generateToken(user._id);
            const req = { headers: {}, cookies: { token } };
            const res = createMockResponse();
            const next = createMockNext();

            await protect(req, res, next);

            expect(next.calls.length).toBe(1);
            expect(req.user).toBeDefined();
            expect(req.user._id.toString()).toBe(user._id.toString());
        });

        it('should reject request without token', async () => {
            const req = { headers: {}, cookies: {} };
            const res = createMockResponse();
            const next = createMockNext();

            await protect(req, res, next);

            expect(res._calls.status[0]).toBe(401);
            expect(res._calls.json[0]).toEqual({
                success: false,
                message: 'Not authorized to access this route',
            });
            expect(next.calls.length).toBe(0);
        });

        it('should reject malformed token (not Bearer format)', async () => {
            const req = { headers: { authorization: 'InvalidFormat token123' }, cookies: {} };
            const res = createMockResponse();
            const next = createMockNext();

            await protect(req, res, next);

            expect(res._calls.status[0]).toBe(401);
            expect(next.calls.length).toBe(0);
        });

        it('should reject invalid JWT token', async () => {
            const req = { headers: { authorization: 'Bearer invalid-token-string' }, cookies: {} };
            const res = createMockResponse();
            const next = createMockNext();

            await protect(req, res, next);

            expect(res._calls.status[0]).toBe(401);
            expect(res._calls.json[0]).toEqual({
                success: false,
                message: 'Invalid or expired token',
            });
            expect(next.calls.length).toBe(0);
        });

        it('should reject expired JWT token', async () => {
            const expiredToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '0s' });
            await new Promise(resolve => setTimeout(resolve, 100));

            const req = { headers: { authorization: `Bearer ${expiredToken}` }, cookies: {} };
            const res = createMockResponse();
            const next = createMockNext();

            await protect(req, res, next);

            expect(res._calls.status[0]).toBe(401);
            expect(res._calls.json[0]).toEqual({
                success: false,
                message: 'Invalid or expired token',
            });
            expect(next.calls.length).toBe(0);
        });

        it('should reject if user no longer exists', async () => {
            const deletedUserId = '507f1f77bcf86cd799439011';
            const token = jwt.sign({ id: deletedUserId }, process.env.JWT_SECRET);

            const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
            const res = createMockResponse();
            const next = createMockNext();

            await protect(req, res, next);

            expect(res._calls.status[0]).toBe(401);
            expect(res._calls.json[0]).toEqual({
                success: false,
                message: 'User no longer exists',
            });
            expect(next.calls.length).toBe(0);
        });

        it('should attach user object to req.user', async () => {
            const token = generateToken(user._id);
            const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
            const res = createMockResponse();
            const next = createMockNext();

            await protect(req, res, next);

            expect(req.user).toBeDefined();
            expect(req.user.email).toBe(user.email);
            expect(req.user.name).toBe(user.name);
        });
    });

    describe('generateToken function', () => {
        it('should generate a valid JWT token', () => {
            const token = generateToken(user._id);

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded.id).toBe(user._id.toString());
        });

        it('should include expiration in token', () => {
            const token = generateToken(user._id);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            expect(decoded.exp).toBeDefined();
            expect(decoded.iat).toBeDefined();
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
        });
    });

    describe('sendTokenResponse function', () => {
        it('should send token in response', () => {
            const res = createMockResponse();

            sendTokenResponse(user, 200, res);

            expect(res._calls.status[0]).toBe(200);
            expect(res._calls.cookie.length).toBe(1);
            expect(res._calls.json[0].success).toBe(true);
            expect(res._calls.json[0].token).toBeDefined();
            expect(res._calls.json[0].user).toBeDefined();
        });

        it('should set httpOnly cookie', () => {
            const res = createMockResponse();

            sendTokenResponse(user, 200, res);

            const cookieCall = res._calls.cookie[0];
            expect(cookieCall[0]).toBe('token');
            expect(cookieCall[2].httpOnly).toBe(true);
            expect(cookieCall[2].sameSite).toBe('strict');
        });

        it('should use correct status code', () => {
            const res = createMockResponse();

            sendTokenResponse(user, 201, res);

            expect(res._calls.status[0]).toBe(201);
        });
    });
});
