import { expect } from 'chai';
import sinon from 'sinon';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-jwt-secret';

import '../../setup.js';
import { protect, generateToken, sendTokenResponse } from '../../../middleware/auth.js';
import User from '../../../models/User.js';
import jwt from 'jsonwebtoken';

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
            const res = {};
            const next = sinon.stub();

            await protect(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(req.user).to.exist;
            expect(req.user._id.toString()).to.equal(user._id.toString());
        });

        it('should authenticate with valid token in cookies', async () => {
            const token = generateToken(user._id);
            const req = { headers: {}, cookies: { token } };
            const res = {};
            const next = sinon.stub();

            await protect(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(req.user).to.exist;
            expect(req.user._id.toString()).to.equal(user._id.toString());
        });

        it('should reject request without token', async () => {
            const req = { headers: {}, cookies: {} };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const next = sinon.stub();

            await protect(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should reject malformed token (not Bearer format)', async () => {
            const req = { headers: { authorization: 'InvalidFormat token123' }, cookies: {} };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const next = sinon.stub();

            await protect(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should reject invalid JWT token', async () => {
            const req = { headers: { authorization: 'Bearer invalid-token-string' }, cookies: {} };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const next = sinon.stub();

            await protect(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should reject expired JWT token', async () => {
            const expiredToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '0s' });
            await new Promise(resolve => setTimeout(resolve, 100));

            const req = { headers: { authorization: `Bearer ${expiredToken}` }, cookies: {} };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const next = sinon.stub();

            await protect(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should reject if user no longer exists', async () => {
            const deletedUserId = '507f1f77bcf86cd799439011';
            const token = jwt.sign({ id: deletedUserId }, process.env.JWT_SECRET);

            const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const next = sinon.stub();

            await protect(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should attach user object to req.user', async () => {
            const token = generateToken(user._id);
            const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
            const res = {};
            const next = sinon.stub();

            await protect(req, res, next);

            expect(req.user).to.exist;
            expect(req.user.email).to.equal(user.email);
            expect(req.user.name).to.equal(user.name);
        });
    });

    describe('generateToken function', () => {
        it('should generate a valid JWT token', () => {
            const token = generateToken(user._id);

            expect(token).to.exist;
            expect(token).to.be.a('string');

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            expect(decoded.id).to.equal(user._id.toString());
        });

        it('should include expiration in token', () => {
            const token = generateToken(user._id);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            expect(decoded.exp).to.exist;
            expect(decoded.iat).to.exist;
            expect(decoded.exp).to.be.greaterThan(decoded.iat);
        });
    });

    describe('sendTokenResponse function', () => {
        it('should send token in response', () => {
            const res = {
                status: sinon.stub().returnsThis(),
                cookie: sinon.stub().returnsThis(),
                json: sinon.stub()
            };

            sendTokenResponse(user, 200, res);

            expect(res.status.calledWith(200)).to.be.true;
            expect(res.cookie.calledOnce).to.be.true;
            expect(res.json.calledOnce).to.be.true;

            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.success).to.be.true;
            expect(jsonArg.token).to.exist;
            expect(jsonArg.user).to.exist;
        });

        it('should set httpOnly cookie', () => {
            const res = {
                status: sinon.stub().returnsThis(),
                cookie: sinon.stub().returnsThis(),
                json: sinon.stub()
            };

            sendTokenResponse(user, 200, res);

            const cookieArgs = res.cookie.firstCall.args;
            expect(cookieArgs[0]).to.equal('token');
            expect(cookieArgs[2].httpOnly).to.be.true;
            expect(cookieArgs[2].sameSite).to.equal('strict');
        });

        it('should use correct status code', () => {
            const res = {
                status: sinon.stub().returnsThis(),
                cookie: sinon.stub().returnsThis(),
                json: sinon.stub()
            };

            sendTokenResponse(user, 201, res);

            expect(res.status.calledWith(201)).to.be.true;
        });
    });
});
