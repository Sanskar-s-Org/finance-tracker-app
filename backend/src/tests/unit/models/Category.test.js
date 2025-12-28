import { expect } from 'chai';
import '../../setup.js';
import Category from '../../../models/Category.js';
import User from '../../../models/User.js';

describe('Category Model', () => {
    let user;

    beforeEach(async () => {
        user = await User.create({
            name: 'Test User',
            email: 'category@test.com',
            password: 'password123',
        });
    });

    describe('Category Creation', () => {
        it('should create a category with valid data', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            expect(category).to.exist;
            expect(category.name).to.equal('Food');
            expect(category.type).to.equal('expense');
        });

        it('should fail without required fields', async () => {
            try {
                await Category.create({});
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should fail without name', async () => {
            try {
                await Category.create({ type: 'expense', user: user._id });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should fail without type', async () => {
            try {
                await Category.create({ name: 'Food', user: user._id });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should fail without user', async () => {
            try {
                await Category.create({ name: 'Food', type: 'expense' });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });
    });

    describe('Type Validation', () => {
        it('should accept expense type', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });
            expect(category.type).to.equal('expense');
        });

        it('should accept income type', async () => {
            const category = await Category.create({
                name: 'Salary',
                type: 'income',
                user: user._id,
            });
            expect(category.type).to.equal('income');
        });

        it('should reject invalid type', async () => {
            try {
                await Category.create({
                    name: 'Food',
                    type: 'invalid',
                    user: user._id,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });
    });

    describe('Name Validation', () => {
        it('should trim whitespace', async () => {
            const category = await Category.create({
                name: '  Food  ',
                type: 'expense',
                user: user._id,
            });
            expect(category.name).to.equal('Food');
        });

        it('should reject empty name after trim', async () => {
            try {
                await Category.create({
                    name: '   ',
                    type: 'expense',
                    user: user._id,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should accept name with max length', async () => {
            const longName = 'A'.repeat(30);
            const category = await Category.create({
                name: longName,
                type: 'expense',
                user: user._id,
            });
            expect(category.name).to.equal(longName);
        });

        it('should reject name exceeding max length', async () => {
            try {
                const longName = 'A'.repeat(31);
                await Category.create({
                    name: longName,
                    type: 'expense',
                    user: user._id,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });
    });

    describe('User Field', () => {
        it('should require user reference', async () => {
            try {
                await Category.create({ name: 'Food', type: 'expense' });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should reference valid user', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });
            expect(category.user.toString()).to.equal(user._id.toString());
        });
    });

    describe('Unique Constraints', () => {
        it('should prevent duplicate category names per user', async () => {
            await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            try {
                await Category.create({
                    name: 'Food',
                    type: 'expense',
                    user: user._id,
                });
                throw new Error('Should have thrown duplicate error');
            } catch (error) {
                expect(error.code).to.equal(11000);
            }
        });

        it('should allow same name for different users', async () => {
            const user2 = await User.create({
                name: 'User 2',
                email: 'user2@test.com',
                password: 'password123',
            });

            const cat1 = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            const cat2 = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user2._id,
            });

            expect(cat1).to.exist;
            expect(cat2).to.exist;
        });
    });

    describe('Optional Fields', () => {
        it('should accept icon field', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
                icon: 'shopping-cart',
            });
            expect(category.icon).to.equal('shopping-cart');
        });

        it('should accept color field', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
                color: '#ff6b6b',
            });
            expect(category.color).to.equal('#ff6b6b');
        });

        it('should default isDefault to false', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });
            expect(category.isDefault).to.be.false;
        });

        it('should allow isDefault to be set to true', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
                isDefault: true,
            });
            expect(category.isDefault).to.be.true;
        });
    });

    describe('Timestamps', () => {
        it('should have createdAt timestamp', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });
            expect(category.createdAt).to.exist;
            expect(category.createdAt).to.be.instanceOf(Date);
        });

        it('should have updatedAt timestamp', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });
            expect(category.updatedAt).to.exist;
            expect(category.updatedAt).to.be.instanceOf(Date);
        });
    });
});
