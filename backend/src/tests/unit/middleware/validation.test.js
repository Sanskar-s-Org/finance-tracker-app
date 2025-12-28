import { expect } from 'chai';
import sinon from 'sinon';
import { validate, schemas } from '../../../middleware/validation.js';

describe('Validation Middleware', () => {
    describe('validate middleware function', () => {
        it('should pass valid data through', () => {
            const validData = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
            const req = { body: validData };
            const res = {};
            const next = sinon.stub();

            validate(schemas.signup)(req, res, next);

            expect(next.calledOnce).to.be.true;
        });

        it('should return 400 for invalid data', () => {
            const invalidData = { name: 'J', email: 'invalid-email', password: '123' };
            const req = { body: invalidData };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const next = sinon.stub();

            validate(schemas.signup)(req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.success).to.be.false;
            expect(jsonArg.message).to.equal('Validation failed');
            expect(jsonArg.errors).to.be.an('array');
            expect(next.called).to.be.false;
        });

        it('should return all validation errors', () => {
            const invalidData = { name: 'J', email: 'invalid' };
            const req = { body: invalidData };
            const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            const next = sinon.stub();

            validate(schemas.signup)(req, res, next);

            const jsonArg = res.json.firstCall.args[0];
            expect(jsonArg.errors.length).to.be.greaterThan(1);
        });
    });

    describe('signup schema', () => {
        it('should validate correct signup data', () => {
            const data = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
            const { error } = schemas.signup.validate(data);
            expect(error).to.be.undefined;
        });

        it('should require name field', () => {
            const data = { email: 'john@example.com', password: 'password123' };
            const { error } = schemas.signup.validate(data);
            expect(error).to.exist;
            expect(error.message).to.include('name');
        });

        it('should enforce name min length', () => {
            const data = { name: 'J', email: 'john@example.com', password: 'password123' };
            const { error } = schemas.signup.validate(data);
            expect(error).to.exist;
        });

        it('should require valid email format', () => {
            const data = { name: 'John Doe', email: 'invalid-email', password: 'password123' };
            const { error } = schemas.signup.validate(data);
            expect(error).to.exist;
            expect(error.message).to.include('email');
        });

        it('should enforce password min length', () => {
            const data = { name: 'John Doe', email: 'john@example.com', password: '123' };
            const { error } = schemas.signup.validate(data);
            expect(error).to.exist;
        });

        it('should allow optional currency field', () => {
            const data = { name: 'John Doe', email: 'john@example.com', password: 'password123', currency: 'USD' };
            const { error } = schemas.signup.validate(data);
            expect(error).to.be.undefined;
        });

        it('should validate currency values', () => {
            const data = { name: 'John Doe', email: 'john@example.com', password: 'password123', currency: 'INVALID' };
            const { error } = schemas.signup.validate(data);
            expect(error).to.exist;
        });
    });

    describe('login schema', () => {
        it('should validate correct login data', () => {
            const data = { email: 'john@example.com', password: 'password123' };
            const { error } = schemas.login.validate(data);
            expect(error).to.be.undefined;
        });

        it('should require email', () => {
            const data = { password: 'password123' };
            const { error } = schemas.login.validate(data);
            expect(error).to.exist;
        });

        it('should require password', () => {
            const data = { email: 'john@example.com' };
            const { error } = schemas.login.validate(data);
            expect(error).to.exist;
        });
    });

    describe('createTransaction schema', () => {
        it('should validate correct transaction data', () => {
            const data = { type: 'expense', amount: 100, category: '507f1f77bcf86cd799439011' };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).to.be.undefined;
        });

        it('should require type field', () => {
            const data = { amount: 100, category: '507f1f77bcf86cd799439011' };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).to.exist;
        });

        it('should validate type enum', () => {
            const data = { type: 'invalid', amount: 100, category: '507f1f77bcf86cd799439011' };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).to.exist;
        });

        it('should require positive amount', () => {
            const data = { type: 'expense', amount: -100, category: '507f1f77bcf86cd799439011' };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).to.exist;
        });

        it('should enforce description max length', () => {
            const data = { type: 'expense', amount: 100, category: '507f1f77bcf86cd799439011', description: 'a'.repeat(201) };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).to.exist;
        });

        it('should validate paymentMethod enum', () => {
            const data = { type: 'expense', amount: 100, category: '507f1f77bcf86cd799439011', paymentMethod: 'invalid' };
            const { error } = schemas.createTransaction.validate(data);
            expect(error).to.exist;
        });
    });

    describe('createBudget schema', () => {
        it('should validate correct budget data', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 500, period: 'monthly', month: 6, year: 2024 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).to.be.undefined;
        });

        it('should require month for monthly period', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 500, period: 'monthly', year: 2024 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).to.exist;
        });

        it('should not require month for yearly period', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 6000, period: 'yearly', year: 2024 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).to.be.undefined;
        });

        it('should validate month range 1-12', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 500, period: 'monthly', month: 13, year: 2024 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).to.exist;
        });

        it('should validate year range', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 500, period: 'monthly', month: 6, year: 1999 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).to.exist;
        });

        it('should validate alertThreshold range', () => {
            const data = { category: '507f1f77bcf86cd799439011', amount: 500, period: 'monthly', month: 6, year: 2024, alertThreshold: 150 };
            const { error } = schemas.createBudget.validate(data);
            expect(error).to.exist;
        });
    });

    describe('createCategory schema', () => {
        it('should validate correct category data', () => {
            const data = { name: 'Food', type: 'expense' };
            const { error } = schemas.createCategory.validate(data);
            expect(error).to.be.undefined;
        });

        it('should enforce name max length', () => {
            const data = { name: 'a'.repeat(31), type: 'expense' };
            const { error } = schemas.createCategory.validate(data);
            expect(error).to.exist;
        });

        it('should validate color hex pattern', () => {
            const validData = { name: 'Food', type: 'expense', color: '#ff6b6b' };
            const { error } = schemas.createCategory.validate(validData);
            expect(error).to.be.undefined;
        });

        it('should reject invalid color format', () => {
            const invalidData = { name: 'Food', type: 'expense', color: 'red' };
            const { error } = schemas.createCategory.validate(invalidData);
            expect(error).to.exist;
        });
    });
});
