import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-jwt-secret';

import '../setup.js';
import request from 'supertest';
import app from '../../app.js';
import User from '../../models/User.js';
import Category from '../../models/Category.js';

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(userData.email);
      expect(res.body.user.password).toBeUndefined();

      // Check if default categories were created
      const categories = await Category.find({ user: res.body.user._id });
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app).post('/api/auth/signup').send(userData).expect(201);

      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const userData = {
        name: 'T',
        email: 'invalid-email',
        password: '123',
      };

      const res = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(credentials.email);
    });

    it('should fail with wrong password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(user.email);
    });

    it('should fail without token', async () => {
      const res = await request(app).get('/api/auth/me').expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});
