import '../../setup.js';
import Budget from '../../../models/Budget.js';
import User from '../../../models/User.js';
import Category from '../../../models/Category.js';

describe('Budget Model', () => {
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

    describe('Budget Creation', () => {
        it('should create a budget with valid data', async () => {
            const budgetData = {
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 12,
                year: 2024,
            };

            const budget = await Budget.create(budgetData);

            expect(budget.user.toString()).toBe(user._id.toString());
            expect(budget.category.toString()).toBe(category._id.toString());
            expect(budget.amount).toBe(500);
            expect(budget.period).toBe('monthly');
            expect(budget.month).toBe(12);
            expect(budget.year).toBe(2024);
            expect(budget.spent).toBe(0); // Default value
            expect(budget.alertThreshold).toBe(80); // Default value
        });

        it('should fail to create budget without required fields', async () => {
            const budgetData = {
                user: user._id,
                period: 'monthly',
            };

            await expect(Budget.create(budgetData)).rejects.toThrow();
        });

        it('should fail without user field', async () => {
            const budgetData = {
                category: category._id,
                amount: 500,
                year: 2024,
            };

            await expect(Budget.create(budgetData)).rejects.toThrow();
        });

        it('should fail without category field', async () => {
            const budgetData = {
                user: user._id,
                amount: 500,
                year: 2024,
            };

            await expect(Budget.create(budgetData)).rejects.toThrow();
        });

        it('should fail without amount field', async () => {
            const budgetData = {
                user: user._id,
                category: category._id,
                year: 2024,
            };

            await expect(Budget.create(budgetData)).rejects.toThrow();
        });

        it('should fail without year field', async () => {
            const budgetData = {
                user: user._id,
                category: category._id,
                amount: 500,
            };

            await expect(Budget.create(budgetData)).rejects.toThrow();
        });
    });

    describe('Period Validation', () => {
        it('should accept monthly period', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.period).toBe('monthly');
        });

        it('should accept yearly period', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 6000,
                period: 'yearly',
                year: 2024,
            });

            expect(budget.period).toBe('yearly');
        });

        it('should default to monthly period', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                month: 6,
                year: 2024,
            });

            expect(budget.period).toBe('monthly');
        });

        it('should fail with invalid period', async () => {
            const budgetData = {
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'weekly',
                year: 2024,
            };

            await expect(Budget.create(budgetData)).rejects.toThrow();
        });
    });

    describe('Month Field Validation', () => {
        it('should require month for monthly period', async () => {
            const budgetData = {
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                year: 2024,
            };

            await expect(Budget.create(budgetData)).rejects.toThrow();
        });

        it('should not require month for yearly period', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 6000,
                period: 'yearly',
                year: 2024,
            });

            expect(budget.month).toBeUndefined();
        });

        it('should validate month range (1-12)', async () => {
            const invalidMonthData = {
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 13,
                year: 2024,
            };

            await expect(Budget.create(invalidMonthData)).rejects.toThrow();
        });

        it('should reject month less than 1', async () => {
            const invalidMonthData = {
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 0,
                year: 2024,
            };

            await expect(Budget.create(invalidMonthData)).rejects.toThrow();
        });
    });

    describe('Amount Validation', () => {
        it('should reject negative amount', async () => {
            const budgetData = {
                user: user._id,
                category: category._id,
                amount: -100,
                period: 'monthly',
                month: 6,
                year: 2024,
            };

            await expect(Budget.create(budgetData)).rejects.toThrow();
        });

        it('should accept zero amount', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 0,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.amount).toBe(0);
        });
    });

    describe('Year Validation', () => {
        it('should accept valid year', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.year).toBe(2024);
        });

        it('should reject year below 2000', async () => {
            const budgetData = {
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 1999,
            };

            await expect(Budget.create(budgetData)).rejects.toThrow();
        });

        it('should reject year above 2100', async () => {
            const budgetData = {
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2101,
            };

            await expect(Budget.create(budgetData)).rejects.toThrow();
        });
    });

    describe('Virtual Properties', () => {
        it('should calculate remaining amount correctly', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 200,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.remaining).toBe(300);
        });

        it('should return 0 for remaining if overspent', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 600,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.remaining).toBe(0);
        });

        it('should calculate percentageUsed correctly', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 250,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.percentageUsed).toBe(50);
        });

        it('should return 0 for percentageUsed if amount is 0', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 0,
                spent: 0,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.percentageUsed).toBe(0);
        });

        it('should correctly identify when budget is over', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 600,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.isOverBudget).toBe(true);
        });

        it('should correctly identify when budget is not over', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 400,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.isOverBudget).toBe(false);
        });

        it('should correctly identify when near limit', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 450, // 90% used, over 80% threshold
                period: 'monthly',
                month: 6,
                year: 2024,
                alertThreshold: 80,
            });

            expect(budget.isNearLimit).toBe(true);
        });

        it('should not be near limit if under threshold', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 300, // 60% used, under 80% threshold
                period: 'monthly',
                month: 6,
                year: 2024,
                alertThreshold: 80,
            });

            expect(budget.isNearLimit).toBe(false);
        });

        it('should not be near limit if over budget', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 600, // Over budget
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.isNearLimit).toBe(false);
        });
    });

    describe('Alert Threshold', () => {
        it('should default alertThreshold to 80', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.alertThreshold).toBe(80);
        });

        it('should accept custom alertThreshold', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
                alertThreshold: 90,
            });

            expect(budget.alertThreshold).toBe(90);
        });

        it('should validate alertThreshold range (0-100)', async () => {
            const invalidData = {
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
                alertThreshold: 150,
            };

            await expect(Budget.create(invalidData)).rejects.toThrow();
        });
    });

    describe('Unique Constraint', () => {
        it('should prevent duplicate budgets for same user/category/period/month/year', async () => {
            const budgetData = {
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            };

            await Budget.create(budgetData);

            // Try to create duplicate
            await expect(Budget.create(budgetData)).rejects.toThrow();
        });

        it('should allow budgets for different months', async () => {
            await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            const budget2 = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 600,
                period: 'monthly',
                month: 7,
                year: 2024,
            });

            expect(budget2.month).toBe(7);
        });

        it('should allow budgets for different years', async () => {
            await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            const budget2 = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 600,
                period: 'monthly',
                month: 6,
                year: 2025,
            });

            expect(budget2.year).toBe(2025);
        });
    });

    describe('JSON Serialization', () => {
        it('should include virtuals in JSON output', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 250,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            const budgetJSON = budget.toJSON();

            expect(budgetJSON.remaining).toBeDefined();
            expect(budgetJSON.percentageUsed).toBeDefined();
            expect(budgetJSON.isOverBudget).toBeDefined();
            expect(budgetJSON.isNearLimit).toBeDefined();
        });
    });
});
