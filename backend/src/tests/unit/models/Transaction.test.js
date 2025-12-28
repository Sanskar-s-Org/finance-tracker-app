import { expect } from 'chai';
import '../../setup.js';
import Transaction from '../../../models/Transaction.js';
import User from '../../../models/User.js';
import Category from '../../../models/Category.js';

describe('Transaction Model', () => {
  let user, category;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    category = await Category.create({
      name: 'Food',
      type: 'expense',
      user: user._id,
    });
  });

  describe('Transaction Creation', () => {
    it('should create a transaction with valid data', async () => {
      const transaction = await Transaction.create({
        user: user._id,
        type: 'expense',
        amount: 100,
        category: category._id,
      });

      expect(transaction).to.exist;
      expect(transaction.amount).to.equal(100);
      expect(transaction.type).to.equal('expense');
    });

    it('should fail to create transaction without required fields', async () => {
      try {
        await Transaction.create({});
        throw new Error('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
      }
    });

    it('should fail with invalid type', async () => {
      try {
        await Transaction.create({
          user: user._id,
          type: 'invalid',
          amount: 100,
          category: category._id,
        });
        throw new Error('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
      }
    });

    it('should fail with negative amount', async () => {
      try {
        await Transaction.create({
          user: user._id,
          type: 'expense',
          amount: -50,
          category: category._id,
        });
        throw new Error('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
      }
    });
  });

  describe('Transaction Validation', () => {
    it('should accept valid payment methods', async () => {
      const methods = ['cash', 'card', 'bank_transfer', 'other'];

      for (const method of methods) {
        const transaction = await Transaction.create({
          user: user._id,
          type: 'expense',
          amount: 100,
          category: category._id,
          paymentMethod: method,
        });
        expect(transaction.paymentMethod).to.equal(method);
      }
    });

    it('should reject invalid payment method', async () => {
      try {
        await Transaction.create({
          user: user._id,
          type: 'expense',
          amount: 100,
          category: category._id,
          paymentMethod: 'invalid',
        });
        throw new Error('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
      }
    });

    it('should reject description over 200 chars', async () => {
      try {
        await Transaction.create({
          user: user._id,
          type: 'expense',
          amount: 100,
          category: category._id,
          description: 'x'.repeat(250),
        });
        throw new Error('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
      }
    });
  });
});
