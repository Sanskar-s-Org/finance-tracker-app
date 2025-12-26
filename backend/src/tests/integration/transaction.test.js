import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-jwt-secret';

import '../setup.js';
import request from 'supertest';
import app from '../../app.js';
import User from '../../models/User.js';
import Category from '../../models/Category.js';

describe('Transaction Integration Tests', () => {
  let token;
  let user;
  let category;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    category = await Category.create({
      name: 'Food',
      type: 'expense',
      icon: '🍔',
      user: user._id,
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    token = loginRes.body.token;
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        type: 'expense',
        amount: 50.0,
        category: category._id,
        description: 'Lunch',
        date: new Date(),
      };

      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send(transactionData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(50.0);
      expect(res.body.data.type).toBe('expense');
      expect(res.body.data.category.name).toBe('Food');
    });

    it('should fail without authentication', async () => {
      const transactionData = {
        type: 'expense',
        amount: 50.0,
        category: category._id,
      };

      const res = await request(app)
        .post('/api/transactions')
        .send(transactionData)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const transactionData = {
        type: 'invalid',
        amount: -50.0,
      };

      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send(transactionData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/transactions', () => {
    beforeEach(async () => {
      const transactions = [
        {
          user: user._id,
          type: 'expense',
          amount: 50,
          category: category._id,
          description: 'Lunch',
          date: new Date(),
        },
        {
          user: user._id,
          type: 'income',
          amount: 1000,
          category: category._id,
          description: 'Salary',
          date: new Date(),
        },
      ];

      const Transaction = (await import('../../models/Transaction.js')).default;
      await Transaction.insertMany(transactions);
    });

    it('should get all user transactions', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data.length).toBe(2);
    });

    it('should filter transactions by type', async () => {
      const res = await request(app)
        .get('/api/transactions?type=expense')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].type).toBe('expense');
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/transactions?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.pages).toBe(2);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update a transaction', async () => {
      const Transaction = (await import('../../models/Transaction.js')).default;
      const transaction = await Transaction.create({
        user: user._id,
        type: 'expense',
        amount: 50,
        category: category._id,
        description: 'Lunch',
      });

      const res = await request(app)
        .put(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 75, description: 'Dinner' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(75);
      expect(res.body.data.description).toBe('Dinner');
    });

    it("should not update another user's transaction", async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
      });

      const Transaction = (await import('../../models/Transaction.js')).default;
      const transaction = await Transaction.create({
        user: otherUser._id,
        type: 'expense',
        amount: 50,
        category: category._id,
      });

      const res = await request(app)
        .put(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 75 })
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete a transaction', async () => {
      const Transaction = (await import('../../models/Transaction.js')).default;
      const transaction = await Transaction.create({
        user: user._id,
        type: 'expense',
        amount: 50,
        category: category._id,
      });

      const res = await request(app)
        .delete(`/api/transactions/${transaction._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const deleted = await Transaction.findById(transaction._id);
      expect(deleted).toBeNull();
    });
  });
});
