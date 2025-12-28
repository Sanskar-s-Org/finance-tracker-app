import { expect } from 'chai';
import '../../setup.js';
import Budget from '../../../models/Budget.js';
import User from '../../../models/User.js';
import Category from '../../../models/Category.js';

describe('Budget Model', () => {
    let user, category;

    beforeEach(async () => {
        user = await User.create({
            name: 'Test User',
            email: 'budget@test.com',
            password: 'password123',
        });

        category = await Category.create({
            name: 'Groceries',
            type: 'expense',
            user: user._id,
        });
    });

    describe('Budget Creation', () => {
        it('should create a budget with valid data', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget).to.exist;
            expect(budget.amount).to.equal(500);
            expect(budget.period).to.equal('monthly');
        });

        it('should fail without required fields', async () => {
            try {
                await Budget.create({});
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should fail without user', async () => {
            try {
                await Budget.create({
                    category: category._id,
                    amount: 500,
                    period: 'monthly',
                    month: 6,
                    year: 2024,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should fail without category', async () => {
            try {
                await Budget.create({
                    user: user._id,
                    amount: 500,
                    period: 'monthly',
                    month: 6,
                    year: 2024,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should fail without amount', async () => {
            try {
                await Budget.create({
                    user: user._id,
                    category: category._id,
                    period: 'monthly',
                    month: 6,
                    year: 2024,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should set spent to 0 by default', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.spent).to.equal(0);
        });
    });

    describe('Budget Period Validation', () => {
        it('should accept monthly period', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.period).to.equal('monthly');
        });

        it('should accept yearly period', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 6000,
                period: 'yearly',
                year: 2024,
            });

            expect(budget.period).to.equal('yearly');
        });

        it('should reject invalid period', async () => {
            try {
                await Budget.create({
                    user: user._id,
                    category: category._id,
                    amount: 500,
                    period: 'weekly',
                    month: 6,
                    year: 2024,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should require month for monthly period', async () => {
            try {
                await Budget.create({
                    user: user._id,
                    category: category._id,
                    amount: 500,
                    period: 'monthly',
                    year: 2024,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });
    });

    describe('Month Validation', () => {
        it('should accept valid months (1-12)', async () => {
            for (let month = 1; month <= 12; month++) {
                const budget = await Budget.create({
                    user: user._id,
                    category: category._id,
                    amount: 500,
                    period: 'monthly',
                    month,
                    year: 2024,
                });
                expect(budget.month).to.equal(month);
            }
        });

        it('should reject month less than 1', async () => {
            try {
                await Budget.create({
                    user: user._id,
                    category: category._id,
                    amount: 500,
                    period: 'monthly',
                    month: 0,
                    year: 2024,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should reject month greater than 12', async () => {
            try {
                await Budget.create({
                    user: user._id,
                    category: category._id,
                    amount: 500,
                    period: 'monthly',
                    month: 13,
                    year: 2024,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });
    });

    describe('Amount Validation', () => {
        it('should reject negative amounts', async () => {
            try {
                await Budget.create({
                    user: user._id,
                    category: category._id,
                    amount: -100,
                    period: 'monthly',
                    month: 6,
                    year: 2024,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should allow zero amount', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 0,
                period: 'monthly',
                month: 6,
                year: 2024,
            });
            expect(budget.amount).to.equal(0);
        });
    });

    describe('Year Validation', () => {
        it('should accept year 2000 or later', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2000,
            });

            expect(budget.year).to.equal(2000);
        });

        it('should accept year 2100 or earlier', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2100,
            });

            expect(budget.year).to.equal(2100);
        });

        it('should reject year before 2000', async () => {
            try {
                await Budget.create({
                    user: user._id,
                    category: category._id,
                    amount: 500,
                    period: 'monthly',
                    month: 6,
                    year: 1999,
                });
                throw new Error('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });
    });

    describe('Virtual Properties', () => {
        it('should calculate remaining amount', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 300,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.remaining).to.equal(200);
        });

        it('should calculate percentageUsed', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 250,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.percentageUsed).to.equal(50);
        });

        it('should identify over budget', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 600,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.isOverBudget).to.be.true;
        });

        it('should identify not over budget', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 300,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.isOverBudget).to.be.false;
        });

        it('should identify near limit with default threshold', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 450,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.isNearLimit).to.be.true;
        });

        it('should identify not near limit', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 200,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.isNearLimit).to.be.false;
        });

        it('should respect custom alert threshold', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 400,
                period: 'monthly',
                month: 6,
                year: 2024,
                alertThreshold: 70,
            });

            expect(budget.isNearLimit).to.be.true;
        });
    });

    describe('Alert Threshold', () => {
        it('should default alert threshold to 80', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            expect(budget.alertThreshold).to.equal(80);
        });

        it('should accept custom alert threshold', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
                alertThreshold: 75,
            });

            expect(budget.alertThreshold).to.equal(75);
        });
    });

    describe('Unique Constraints', () => {
        it('should prevent duplicate budgets for same period', async () => {
            await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            try {
                await Budget.create({
                    user: user._id,
                    category: category._id,
                    amount: 600,
                    period: 'monthly',
                    month: 6,
                    year: 2024,
                });
                throw new Error('Should have thrown duplicate error');
            } catch (error) {
                expect(error.code).to.equal(11000);
            }
        });

        it('should allow different months', async () => {
            const budget1 = await Budget.create({
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

            expect(budget1).to.exist;
            expect(budget2).to.exist;
        });

        it('should allow different years', async () => {
            const budget1 = await Budget.create({
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

            expect(budget1).to.exist;
            expect(budget2).to.exist;
        });
    });

    describe('JSON Serialization', () => {
        it('should include virtual properties in JSON', async () => {
            const budget = await Budget.create({
                user: user._id,
                category: category._id,
                amount: 500,
                spent: 300,
                period: 'monthly',
                month: 6,
                year: 2024,
            });

            const json = budget.toJSON();
            expect(json).to.have.property('remaining');
            expect(json).to.have.property('percentageUsed');
            expect(json).to.have.property('isOverBudget');
            expect(json).to.have.property('isNearLimit');
        });
    });
});
