import { expect } from 'chai';
import {
    formatCurrency,
    formatDate,
    getMonthName,
    getCurrentMonthRange,
    calculatePercentage,
} from '../../../utils/helpers.js';

describe('Helper Functions', () => {
    describe('formatCurrency', () => {
        it('should format USD currency correctly', () => {
            expect(formatCurrency(1000, 'USD')).to.equal('$1,000.00');
        });

        it('should format EUR currency correctly', () => {
            expect(formatCurrency(1000, 'EUR')).to.equal('€1,000.00');
        });

        it('should format GBP currency correctly', () => {
            expect(formatCurrency(1000, 'GBP')).to.equal('£1,000.00');
        });

        it('should handle zero amount', () => {
            expect(formatCurrency(0, 'USD')).to.equal('$0.00');
        });

        it('should handle negative amounts', () => {
            expect(formatCurrency(-500, 'USD')).to.equal('-$500.00');
        });

        it('should handle decimal values', () => {
            expect(formatCurrency(99.99, 'USD')).to.equal('$99.99');
        });

        it('should handle large numbers', () => {
            expect(formatCurrency(1000000, 'USD')).to.equal('$1,000,000.00');
        });

        it('should default to USD if currency not provided', () => {
            expect(formatCurrency(100)).to.equal('$100.00');
        });
    });

    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = new Date('2024-01-15');
            const formatted = formatDate(date);
            expect(formatted).to.include('Jan');
            expect(formatted).to.include('15');
            expect(formatted).to.include('2024');
        });

        it('should accept date string', () => {
            const formatted = formatDate('2024-01-15');
            expect(formatted).to.be.a('string');
        });

        it('should handle current date', () => {
            const formatted = formatDate(new Date());
            expect(formatted).to.be.a('string');
            expect(formatted.length).to.be.greaterThan(0);
        });

        it('should handle different months', () => {
            const date = new Date('2024-12-25');
            const formatted = formatDate(date);
            expect(formatted).to.include('Dec');
        });
    });

    describe('getMonthName', () => {
        it('should return correct month names', () => {
            expect(getMonthName(1)).to.equal('January');
            expect(getMonthName(2)).to.equal('February');
            expect(getMonthName(3)).to.equal('March');
            expect(getMonthName(4)).to.equal('April');
            expect(getMonthName(5)).to.equal('May');
            expect(getMonthName(6)).to.equal('June');
            expect(getMonthName(7)).to.equal('July');
            expect(getMonthName(8)).to.equal('August');
            expect(getMonthName(9)).to.equal('September');
            expect(getMonthName(10)).to.equal('October');
            expect(getMonthName(11)).to.equal('November');
            expect(getMonthName(12)).to.equal('December');
        });

        it('should handle invalid month index', () => {
            expect(getMonthName(0)).to.equal('');
            expect(getMonthName(13)).to.equal('');
            expect(getMonthName(100)).to.equal('');
        });
    });

    describe('getCurrentMonthRange', () => {
        it('should return start and end dates', () => {
            const range = getCurrentMonthRange();

            expect(range).to.have.property('start');
            expect(range).to.have.property('end');
        });

        it('should have start date at beginning of month', () => {
            const range = getCurrentMonthRange();
            const start = new Date(range.start);

            expect(start.getDate()).to.equal(1);
            expect(start.getHours()).to.equal(0);
            expect(start.getMinutes()).to.equal(0);
        });

        it('should have end date at end of month', () => {
            const range = getCurrentMonthRange();
            const end = new Date(range.end);

            expect(end.getHours()).to.equal(23);
            expect(end.getMinutes()).to.equal(59);
        });

        it('should cover full month', () => {
            const range = getCurrentMonthRange();
            const start = new Date(range.start);
            const end = new Date(range.end);

            expect(start.getMonth()).to.equal(end.getMonth());
        });

        it('should handle different months correctly', () => {
            const range = getCurrentMonthRange();
            expect(range.start).to.exist;
            expect(range.end).to.exist;
            expect(new Date(range.end)).to.be.greaterThan(new Date(range.start));
        });
    });

    describe('calculatePercentage', () => {
        it('should calculate percentage correctly', () => {
            expect(calculatePercentage(50, 100)).to.equal(50);
        });

        it('should handle zero total', () => {
            expect(calculatePercentage(50, 0)).to.equal(0);
        });

        it('should handle zero part', () => {
            expect(calculatePercentage(0, 100)).to.equal(0);
        });

        it('should handle percentages greater than 100', () => {
            expect(calculatePercentage(150, 100)).to.equal(150);
        });

        it('should handle decimal values', () => {
            const result = calculatePercentage(33.33, 100);
            expect(result).to.equal(33);
        });

        it('should round to nearest integer', () => {
            const result = calculatePercentage(1, 3);
            expect(result).to.equal(33);
        });

        it('should handle negative values', () => {
            expect(calculatePercentage(-50, 100)).to.equal(-50);
        });

        it('should handle both negative values', () => {
            expect(calculatePercentage(-50, -100)).to.equal(50);
        });

        it('should handle small percentages', () => {
            const result = calculatePercentage(1, 1000);
            expect(result).to.equal(0);
        });

        it('should handle large numbers', () => {
            expect(calculatePercentage(1000000, 10000000)).to.equal(10);
        });
    });
});
