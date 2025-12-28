import '../../setup.js';
import Category from '../../../models/Category.js';
import User from '../../../models/User.js';

describe('Category Model', () => {
    let user;

    beforeEach(async () => {
        user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        });
    });

    describe('Category Creation', () => {
        it('should create a category with valid data', async () => {
            const categoryData = {
                name: 'Food',
                type: 'expense',
                icon: '🍔',
                color: '#ff6b6b',
                user: user._id,
            };

            const category = await Category.create(categoryData);

            expect(category.name).toBe('Food');
            expect(category.type).toBe('expense');
            expect(category.icon).toBe('🍔');
            expect(category.color).toBe('#ff6b6b');
            expect(category.user.toString()).toBe(user._id.toString());
            expect(category.isDefault).toBe(false);
        });

        it('should fail to create category without required name', async () => {
            const categoryData = {
                type: 'expense',
                user: user._id,
            };

            await expect(Category.create(categoryData)).rejects.toThrow();
        });

        it('should fail to create category without required type', async () => {
            const categoryData = {
                name: 'Food',
                user: user._id,
            };

            await expect(Category.create(categoryData)).rejects.toThrow();
        });

        it('should apply default icon', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            expect(category.icon).toBe('📊');
        });

        it('should apply default color', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            expect(category.color).toBe('#6366f1');
        });

        it('should default isDefault to false', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            expect(category.isDefault).toBe(false);
        });
    });

    describe('Type Validation', () => {
        it('should accept income type', async () => {
            const category = await Category.create({
                name: 'Salary',
                type: 'income',
                user: user._id,
            });

            expect(category.type).toBe('income');
        });

        it('should accept expense type', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            expect(category.type).toBe('expense');
        });

        it('should fail with invalid type', async () => {
            const categoryData = {
                name: 'Food',
                type: 'invalid',
                user: user._id,
            };

            await expect(Category.create(categoryData)).rejects.toThrow();
        });
    });

    describe('Name Validation', () => {
        it('should trim category name', async () => {
            const category = await Category.create({
                name: '  Food  ',
                type: 'expense',
                user: user._id,
            });

            expect(category.name).toBe('Food');
        });

        it('should enforce maxlength of 30 characters', async () => {
            const longName = 'a'.repeat(31);
            const categoryData = {
                name: longName,
                type: 'expense',
                user: user._id,
            };

            await expect(Category.create(categoryData)).rejects.toThrow();
        });

        it('should accept name with exactly 30 characters', async () => {
            const exactName = 'a'.repeat(30);
            const category = await Category.create({
                name: exactName,
                type: 'expense',
                user: user._id,
            });

            expect(category.name).toBe(exactName);
        });
    });

    describe('User Field Validation', () => {
        it('should require user for non-default categories', async () => {
            const categoryData = {
                name: 'Food',
                type: 'expense',
                isDefault: false,
            };

            await expect(Category.create(categoryData)).rejects.toThrow();
        });

        it('should not require user for default categories', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                isDefault: true,
            });

            expect(category.isDefault).toBe(true);
            expect(category.user).toBeUndefined();
        });

        it('should allow user field for default categories', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                isDefault: true,
                user: user._id,
            });

            expect(category.isDefault).toBe(true);
            expect(category.user.toString()).toBe(user._id.toString());
        });
    });

    describe('Unique Constraint', () => {
        it('should prevent duplicate categories for same user/name/type', async () => {
            const categoryData = {
                name: 'Food',
                type: 'expense',
                user: user._id,
            };

            await Category.create(categoryData);

            // Try to create duplicate
            await expect(Category.create(categoryData)).rejects.toThrow();
        });

        it('should allow same category name for different users', async () => {
            const user2 = await User.create({
                name: 'Another User',
                email: 'another@example.com',
                password: 'password123',
            });

            await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            const category2 = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user2._id,
            });

            expect(category2.name).toBe('Food');
            expect(category2.user.toString()).toBe(user2._id.toString());
        });

        it('should allow same category name for different types', async () => {
            await Category.create({
                name: 'Business',
                type: 'expense',
                user: user._id,
            });

            const category2 = await Category.create({
                name: 'Business',
                type: 'income',
                user: user._id,
            });

            expect(category2.name).toBe('Business');
            expect(category2.type).toBe('income');
        });

        it('should allow different category names for same user', async () => {
            await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            const category2 = await Category.create({
                name: 'Transport',
                type: 'expense',
                user: user._id,
            });

            expect(category2.name).toBe('Transport');
        });
    });

    describe('Custom Fields', () => {
        it('should allow custom icon', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                icon: '🍕',
                user: user._id,
            });

            expect(category.icon).toBe('🍕');
        });

        it('should allow custom color', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                color: '#ff0000',
                user: user._id,
            });

            expect(category.color).toBe('#ff0000');
        });
    });

    describe('Timestamps', () => {
        it('should have createdAt timestamp', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            expect(category.createdAt).toBeDefined();
            expect(category.createdAt).toBeInstanceOf(Date);
        });

        it('should have updatedAt timestamp', async () => {
            const category = await Category.create({
                name: 'Food',
                type: 'expense',
                user: user._id,
            });

            expect(category.updatedAt).toBeDefined();
            expect(category.updatedAt).toBeInstanceOf(Date);
        });
    });
});
