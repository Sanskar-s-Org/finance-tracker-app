import { expect } from 'chai';
import request from 'supertest';
import '../setup.js';
import app from '../../app.js';
import User from '../../models/User.js';
import Category from '../../models/Category.js';
import Transaction from '../../models/Transaction.js';

describe('Transaction API Integration Tests', () => {
  let token, user, category;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Test User',
        email: 'transaction@test.com',
        password: 'password123',
      });

    token = res.body.token;
    user = res.body.user;

    category = await Category.create({
      name: 'Food',
      type: 'expense',
      user: user._id,
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'expense',
          amount: 50,
          category: category._id.toString(),
          description: 'Lunch',
        });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.exist;
      expect(res.body.data.amount).to.equal(50);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({
          type: 'expense',
          amount: 50,
          category: category._id.toString(),
        });

      expect(res.status).to.equal(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'expense',
        });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
    });
  });

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      await Transaction.create({
        user: user._id,
        type: 'expense',
        amount: 100,
        category: category._id,
      });
    });

    it('should get user transactions', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.greaterThan(0);
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/transactions?type=expense')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/transactions?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an('array');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    let transaction;

    beforeEach(async () => {
      transaction = await Transaction.create({
        user: user._id,
        type: 'expense',
        amount: 100,
        category: category._id,
      });
    });

    it('should update transaction', async () => {
      const res = await request(app)
        .put(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 150,
        });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.amount).to.equal(150);
    });

    it('should not allow updating other users transactions', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@test.com',
        password: 'password123',
      });

      const otherTransaction = await Transaction.create({
        user: otherUser._id,
        type: 'expense',
        amount: 100,
        category: category._id,
      });

      const res = await request(app)
        .put(`/api/transactions/${otherTransaction._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 150,
        });

      expect(res.status).to.equal(404);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    let transaction;

    beforeEach(async () => {
      transaction = await Transaction.create({
        user: user._id,
        type: 'expense',
        amount: 100,
        category: category._id,
      });
    });

    it('should delete transaction', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;

      const deleted = await Transaction.findById(transaction._id);
      expect(deleted).to.be.null;
    });
  });
});
