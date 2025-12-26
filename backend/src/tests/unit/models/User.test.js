import '../../setup.js';
import User from '../../../models/User.js';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);

      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.currency).toBe('USD'); // Default value
    });

    it('should fail to create user without required fields', async () => {
      const userData = {
        name: 'Test User',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail to create user with duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      const savedUser = await User.findById(user._id).select('+password');

      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toHaveLength(60); // bcrypt hash length
    });

    it('should not rehash password if not modified', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const originalPassword = (
        await User.findById(user._id).select('+password')
      ).password;

      user.name = 'Updated Name';
      await user.save();

      const updatedPassword = (
        await User.findById(user._id).select('+password')
      ).password;

      expect(originalPassword).toBe(updatedPassword);
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare valid password', async () => {
      const password = 'password123';
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password,
      });

      const userWithPassword = await User.findById(user._id).select(
        '+password'
      );
      const isMatch = await userWithPassword.comparePassword(password);

      expect(isMatch).toBe(true);
    });

    it('should correctly compare invalid password', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const userWithPassword = await User.findById(user._id).select(
        '+password'
      );
      const isMatch = await userWithPassword.comparePassword('wrongpassword');

      expect(isMatch).toBe(false);
    });
  });

  describe('JSON Serialization', () => {
    it('should exclude password from JSON response', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const userJSON = user.toJSON();

      expect(userJSON.password).toBeUndefined();
      expect(userJSON.name).toBe('Test User');
      expect(userJSON.email).toBe('test@example.com');
    });
  });
});
