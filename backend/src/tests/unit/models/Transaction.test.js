import '../../setup.js';
import Transaction from '../../../models/Transaction.js';
import User from '../../../models/User.js';
import Category from '../../../models/Category.js';

describe('Transaction Model', () => {
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
      user: user._id,
    });
  });

  describe('Transaction Creation', () => {
    it('should create a transaction with valid data', async () => {
      const transactionData = {
        user: user._id,
        type: 'expense',
        amount: 50.0,
        category: category._id,
        description: 'Lunch',
        date: new Date(),
      };

      const transaction = await Transaction.create(transactionData);

      expect(transaction.user.toString()).toBe(user._id.toString());
      expect(transaction.type).toBe('expense');
      expect(transaction.amount).toBe(50.0);
      expect(transaction.paymentMethod).toBe('cash'); // Default value
    });

    it('should fail to create transaction without required fields', async () => {
      const transactionData = {
        user: user._id,
        type: 'expense',
      };

      await expect(Transaction.create(transactionData)).rejects.toThrow();
    });

    it('should fail with invalid type', async () => {
      const transactionData = {
        user: user._id,
        type: 'invalid',
        amount: 50.0,
        category: category._id,
      };

      await expect(Transaction.create(transactionData)).rejects.toThrow();
    });

    it('should fail with negative amount', async () => {
      const transactionData = {
        user: user._id,
        type: 'expense',
        amount: -50.0,
        category: category._id,
      };

      await expect(Transaction.create(transactionData)).rejects.toThrow();
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

        expect(transaction.paymentMethod).toBe(method);
      }
    });

    it('should reject invalid payment method', async () => {
      const transactionData = {
        user: user._id,
        type: 'expense',
        amount: 100,
        category: category._id,
        paymentMethod: 'invalid',
      };

      await expect(Transaction.create(transactionData)).rejects.toThrow();
    });

    it('should trim and limit description', async () => {
      const longDescription = 'a'.repeat(250);

      const transactionData = {
        user: user._id,
        type: 'expense',
        amount: 100,
        category: category._id,
        description: longDescription,
      };

      await expect(Transaction.create(transactionData)).rejects.toThrow();
    });
  });
});
