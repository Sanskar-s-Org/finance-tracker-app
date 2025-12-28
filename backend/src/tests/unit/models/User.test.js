import { expect } from 'chai';
import '../../setup.js';
import User from '../../../models/User.js';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(user).to.exist;
      expect(user.name).to.equal('John Doe');
      expect(user.email).to.equal('john@example.com');
    });

    it('should fail to create user without required fields', async () => {
      try {
        await User.create({});
        throw new Error('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
      }
    });

    it('should fail to create user with invalid email', async () => {
      try {
        await User.create({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        });
        throw new Error('Should have thrown validation error');
      } catch (error) {
        expect(error.name).to.equal('ValidationError');
      }
    });

    it('should fail to create user with duplicate email', async () => {
      await User.create({
        name: 'John Doe',
        email: 'duplicate@example.com',
        password: 'password123',
      });

      try {
        await User.create({
          name: 'Jane Doe',
          email: 'duplicate@example.com',
          password: 'password456',
        });
        throw new Error('Should have thrown duplicate error');
      } catch (error) {
        expect(error.code).to.equal(11000);
      }
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const password = 'password123';
      const user = await User.create({
        name: 'John Doe',
        email: 'hash@example.com',
        password,
      });

      expect(user.password).to.not.equal(password);
      expect(user.password).to.have.lengthOf.at.least(50);
    });

    it('should not hash already hashed password on update', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'nohash@example.com',
        password: 'password123',
      });

      const hashedPassword = user.password;
      user.name = 'Jane Doe';
      await user.save();

      expect(user.password).to.equal(hashedPassword);
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare valid password', async () => {
      const password = 'password123';
      const user = await User.create({
        name: 'John Doe',
        email: 'compare@example.com',
        password,
      });

      const isMatch = await user.comparePassword(password);
      expect(isMatch).to.be.true;
    });

    it('should correctly reject invalid password', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'reject@example.com',
        password: 'password123',
      });

      const isMatch = await user.comparePassword('wrongpassword');
      expect(isMatch).to.be.false;
    });

    it('should handle empty password comparison', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'empty@example.com',
        password: 'password123',
      });

      const isMatch = await user.comparePassword('');
      expect(isMatch).to.be.false;
    });
  });

  describe('JSON Serialization', () => {
    it('should not include password in JSON output', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'json@example.com',
        password: 'password123',
      });

      const userJSON = user.toJSON();
      expect(userJSON).to.not.have.property('password');
    });

    it('should include other fields in JSON output', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'fields@example.com',
        password: 'password123',
      });

      const userJSON = user.toJSON();
      expect(userJSON).to.have.property('name');
      expect(userJSON).to.have.property('email');
      expect(userJSON).to.have.property('_id');
    });
  });
});
