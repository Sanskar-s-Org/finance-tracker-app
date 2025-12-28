import {
    formatCurrency,
    formatDate,
    getMonthName,
    getCurrentMonthRange,
    calculatePercentage,
} from '../../../utils/helpers.js';

describe('Helper Utilities', () => {
    describe('formatCurrency', () => {
        it('should format USD correctly', () => {
            const result = formatCurrency(1234.56, 'USD');
            expect(result).toBe('$1,234.56');
        });

        it('should default to USD if no currency provided', () => {
            const result = formatCurrency(1234.56);
            expect(result).toBe('$1,234.56');
        });

        it('should format EUR correctly', () => {
            const result = formatCurrency(1234.56, 'EUR');
            expect(result).toBe('€1,234.56');
        });

        it('should format GBP correctly', () => {
            const result = formatCurrency(1234.56, 'GBP');
            expect(result).toBe('£1,234.56');
        });

        it('should handle zero values', () => {
            const result = formatCurrency(0, 'USD');
            expect(result).toBe('$0.00');
        });

        it('should handle large numbers', () => {
            const result = formatCurrency(1234567.89, 'USD');
            expect(result).toBe('$1,234,567.89');
        });

        it('should handle negative numbers', () => {
            const result = formatCurrency(-1234.56, 'USD');
            expect(result).toBe('-$1,234.56');
        });

        it('should round to 2 decimal places', () => {
            const result = formatCurrency(10.999, 'USD');
            expect(result).toBe('$11.00');
        });
    });

    describe('formatDate', () => {
        it('should format Date object correctly', () => {
            const date = new Date('2024-12-15');
            const result = formatDate(date);
            expect(result).toMatch(/Dec 1[45], 2024/); // Account for timezone differences
        });

        it('should format date string correctly', () => {
            const date = '2024-06-01';
            const result = formatDate(date);
            expect(result).toMatch(/Jun 1, 2024/);
        });

        it('should handle current date', () => {
            const now = new Date();
            const result = formatDate(now);
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
        });

        it('should format month name as short form', () => {
            const date = new Date('2024-01-15');
            const result = formatDate(date);
            expect(result).toContain('Jan');
        });
    });

    describe('getMonthName', () => {
        it('should return January for month 1', () => {
            expect(getMonthName(1)).toBe('January');
        });

        it('should return December for month 12', () => {
            expect(getMonthName(12)).toBe('December');
        });

        it('should return June for month 6', () => {
            expect(getMonthName(6)).toBe('June');
        });

        it('should return empty string for invalid month 0', () => {
            expect(getMonthName(0)).toBe('');
        });

        it('should return empty string for invalid month 13', () => {
            expect(getMonthName(13)).toBe('');
        });

        it('should return empty string for negative month', () => {
            expect(getMonthName(-1)).toBe('');
        });

        it('should handle all 12 months correctly', () => {
            const expectedMonths = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ];

            for (let i = 1; i <= 12; i++) {
                expect(getMonthName(i)).toBe(expectedMonths[i - 1]);
            }
        });
    });

    describe('getCurrentMonthRange', () => {
        it('should return start of current month', () => {
            const { start } = getCurrentMonthRange();
            expect(start).toBeInstanceOf(Date);
            expect(start.getDate()).toBe(1);
            expect(start.getHours()).toBe(0);
            expect(start.getMinutes()).toBe(0);
            expect(start.getSeconds()).toBe(0);
        });

        it('should return end of current month', () => {
            const { end } = getCurrentMonthRange();
            expect(end).toBeInstanceOf(Date);
            expect(end.getHours()).toBe(23);
            expect(end.getMinutes()).toBe(59);
            expect(end.getSeconds()).toBe(59);
        });

        it('should return same month for start and end', () => {
            const { start, end } = getCurrentMonthRange();
            expect(start.getMonth()).toBe(end.getMonth());
        });

        it('should return correct last day for different month lengths', () => {
            const { start, end } = getCurrentMonthRange();
            const month = start.getMonth();
            const year = start.getFullYear();

            // Get the last day of the month
            const lastDay = new Date(year, month + 1, 0).getDate();
            expect(end.getDate()).toBe(lastDay);
        });

        it('should return dates in the current year', () => {
            const currentYear = new Date().getFullYear();
            const { start, end } = getCurrentMonthRange();
            expect(start.getFullYear()).toBe(currentYear);
            expect(end.getFullYear()).toBe(currentYear);
        });

        it('should handle January correctly', () => {
            // Mock current date to January
            const originalDate = Date;
            global.Date = class extends originalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super(2024, 0, 15); // January 15, 2024
                    } else {
                        super(...args);
                    }
                }
            };

            const { start, end } = getCurrentMonthRange();
            expect(start.getDate()).toBe(1);
            expect(end.getDate()).toBe(31);

            global.Date = originalDate;
        });

        it('should handle February in leap year correctly', () => {
            // Mock current date to February 2024 (leap year)
            const originalDate = Date;
            global.Date = class extends originalDate {
                constructor(...args) {
                    if (args.length === 0) {
                        super(2024, 1, 15); // February 15, 2024
                    } else {
                        super(...args);
                    }
                }
            };

            const { start, end } = getCurrentMonthRange();
            expect(start.getDate()).toBe(1);
            expect(end.getDate()).toBe(29); // Leap year

            global.Date = originalDate;
        });
    });

    describe('calculatePercentage', () => {
        it('should calculate percentage correctly', () => {
            expect(calculatePercentage(25, 100)).toBe(25);
        });

        it('should calculate 50% correctly', () => {
            expect(calculatePercentage(50, 100)).toBe(50);
        });

        it('should calculate 100% correctly', () => {
            expect(calculatePercentage(100, 100)).toBe(100);
        });

        it('should return 0 when total is 0', () => {
            expect(calculatePercentage(50, 0)).toBe(0);
        });

        it('should return 0 when value is 0', () => {
            expect(calculatePercentage(0, 100)).toBe(0);
        });

        it('should round to nearest integer', () => {
            expect(calculatePercentage(33, 100)).toBe(33);
            expect(calculatePercentage(1, 3)).toBe(33); // 33.33... rounds to 33
        });

        it('should handle decimals correctly', () => {
            expect(calculatePercentage(12.5, 50)).toBe(25);
        });

        it('should handle percentages over 100', () => {
            expect(calculatePercentage(150, 100)).toBe(150);
        });

        it('should handle small numbers', () => {
            expect(calculatePercentage(1, 1000)).toBe(0); // 0.1% rounds to 0
        });

        it('should handle large numbers', () => {
            expect(calculatePercentage(5000, 10000)).toBe(50);
        });
    });
});
