import { validate, schemas } from '../../../middleware/validation.js';

// Mock response helper for ESM compatibility
const createMockResponse = () => {
    const calls = { status: [], json: [] };

    return {
        status(code) {
            calls.status.push(code);
            return this;
        },
        json(data) {
            calls.json.push(data);
            return this;
        },
        _calls: calls
    };
};

const createMockNext = () => {
    const calls = [];
    const fn = (...args) => calls.push(args);
    fn.calls = calls;
    return fn;
};

describe('Validation Middleware', () => {
    describe('validate middleware function', () => {
        it('should pass valid data through', () => {
            const validData = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
            const req = { body: validData };
            const res = createMockResponse();
            const next = createMockNext();

            validate(schemas.signup)(req, res, next);

            expect(next.calls.length).toBe(1);
            expect(res._calls.status.length).toBe(0);
        });

        it('should return 400 for invalid data', () => {
            const invalidData = { name: 'J', email: 'invalid-email', password: '123' };
            const req = { body: invalidData };
            const res = createMockResponse();
            const next = createMockNext();

            validate(schemas.signup)(req, res, next);

            expect(res._calls.status[0]).toBe(400);
            expect(res._calls.json[0].success).toBe(false);
            expect(res._calls.json[0].message).toBe('Validation failed');
            expect(Array.isArray(res._calls.json[0].errors)).toBe(true);
            expect(next.calls.length).toBe(0);
        });

        it('should return all validation errors', () => {
            const invalidData = { name: 'J', email: 'invalid' };
            const req = { body: invalidData };
            const res = createMockResponse();
            const next = createMockNext();

            validate(schemas.signup)(req, res, next);

            expect(res._calls.json[0].errors.length).toBeGreaterThan(1);
        });
    });

    describe('signup schema', () => {
        it('should validate correct signup data', () => {
            const data = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
            const { error } = schemas.signup.validate(data);
            expect(error).toBeUndefined();
        });

        it('should require name field', () => {
            const data = { email: 'john@example.com', password: 'password123' };
            const { error } = schemas.signup.validate(data);
            expect(error).toBeDefined();
            expect(error.message).toContain('name');
        });

        it('should enforce name min length', () => {
            const data = { name: 'J', email: 'john@example.com', password: 'password123' };
            const { error } = schemas.signup.validate(data);
            expect(error).toBeDefined();
        });

        it('should require valid email format', () => {
            const data = { name: 'John Doe', email: 'invalid-email', password: 'password123' };
            const { error } = schemas.signup.validate(data);
            expect(error).toBeDefined();
            expect(error.message).toContain('email');
        });

        it('should enforce password min length', () => {
            const data = { name: 'John Doe', email: 'john@example.com', password: '123' };
            const { error } = schemas.signup.validate(data);
            expect(error).toBeDefined();
        });

        it('should allow optional currency field', () => {
            const data = { name: 'John Doe', email: 'john@example.com', password: 'password123', currency: 'USD' };
            const { error } = schemas.signup.validate(data);
            expect(error).toBeUndefined();
        });

        it('should validate currency values', () => {
            const data = { name: 'John Doe', email: 'john@example.com', password: 'password123', currency: 'INVALID' };
            const { error } = schemas.signup.validate(data);
            expect(error).toBeDefined();
        });
    });

    describe('login schema', () => {
        it('should validate correct login data', () => {
            const data = { email: 'john@example.com', password: 'password123' };
            const { error } = schemas.login.validate(data);
            expect(error).toBeUndefined();
        });

        it('should require email', () => {
            const data = { password: 'password123' };
            const { error } = schemas.login.validate(data);
            expect(error).toBeDefined();
        });

        it('should require password', () => {
            const data = { email: 'john@example.com' };
            const { error } = schemas.login.validate(data);
            expect(error).toBeDefined();
        });
    });

    describe('createTransaction schema', () => {
        it('should validate correct transaction data', () => {
            const data = { type: 'expense', amount: 100, category: '507f1f77bcf86cd799439011' };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).toBeUndefined();
        });

        it('should require type field', () => {
            const data = { amount: 100, category: '507f1f77bcf86cd799439011' };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).toBeDefined();
        });

        it('should validate type enum', () => {
            const data = { type: 'invalid', amount: 100, category: '507f1f77bcf86cd799439011' };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).toBeDefined();
        });

        it('should require positive amount', () => {
            const data = { type: 'expense', amount: -100, category: '507f1f77bcf86cd799439011' };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).toBeDefined();
        });

        it('should enforce description max length', () => {
            const data = { type: 'expense', amount: 100, category: '507f1f77bcf86cd799439011', description: 'a'.repeat(201) };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).toBeDefined();
        });

        it('should validate paymentMethod enum', () => {
            const data = { type: 'expense', amount: 100, category: '507f1f77bcf86cd799439011', paymentMethod: 'invalid' };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).toBeDefined();
        });
    });

    describe('createBudget schema', () => {
        it('should validate correct budget data', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 500, period: 'monthly', month: 6, year: 2024 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).toBeUndefined();
        });

        it('should require month for monthly period', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 500, period: 'monthly', year: 2024 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).toBeDefined();
        });

        it('should not require month for yearly period', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 6000, period: 'yearly', year: 2024 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).toBeUndefined();
        });

        it('should validate month range 1-12', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 500, period: 'monthly', month: 13, year: 2024 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).toBeDefined();
        });

        it('should validate year range', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 500, period: 'monthly', month: 6, year: 1999 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).toBeDefined();
        });

        it('should validate alertThreshold range', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 500, period: 'monthly', month: 6, year: 2024, alertThreshold: 150 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).toBeDefined();
        });
    });

    describe('createCategory schema', () => {
        it('should validate correct category data', () => {
            const data = { name: 'Food', type: 'expense' };
            const { error } = schemas.createCategory.validate(data);
            expect(error).toBeUndefined();
        });

        it('should enforce name max length', () => {
            const data = { name: 'a'.repeat(31), type: 'expense' };
            const { error } = schemas.createCategory.validate(data);
            expect(error).toBeDefined();
        });

        it('should validate color hex pattern', () => {
            const validData = { name: 'Food', type: 'expense', color: '#ff6b6b' };
            const { error } = schemas.createCategory.validate(validData);
            expect(error).toBeUndefined();
        });

        it('should reject invalid color format', () => {
            const invalidData = { name: 'Food', type: 'expense', color: 'red' };
            const { error } = schemas.createCategory.validate(invalidData);
            expect(error).toBeDefined();
        });
    });
});
