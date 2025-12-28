import { expect } from 'chai';
import request from 'supertest';
import '../setup.js';
import app from '../../app.js';
import User from '../../models/User.js';

describe('Auth API Integration Tests', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'John Doe',
          email: 'john@test.com',
          password: 'password123',
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.token).to.exist;
      expect(res.body.user).to.exist;
      expect(res.body.user.email).to.equal('john@test.com');
    });

    it('should return error for duplicate email', async () => {
      await User.create({
        name: 'Existing User',
        email: 'duplicate@test.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'New User',
          email: 'duplicate@test.com',
          password: 'password456',
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
    });

    it('should return error for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'login@test.com',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123',
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.token).to.exist;
    });

    it('should return error for invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword',
        });

      expect(res.status).to.equal(401);
      expect(res.body.success).to.be.false;
    });

    it('should return error for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(res.status).to.equal(401);
      expect(res.body.success).to.be.false;
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'me@test.com',
          password: 'password123',
        });
      token = res.body.token;
    });

    it('should get user data with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.user).to.exist;
      expect(res.body.user.email).to.equal('me@test.com');
    });

    it('should return error without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).to.equal(401);
      expect(res.body.success).to.be.false;
    });

    it('should return error with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).to.equal(401);
      expect(res.body.success).to.be.false;
    });
  });
});
