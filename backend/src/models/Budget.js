import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0, 'Budget amount cannot be negative'],
    },
    period: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      required: function () {
        return this.period === 'monthly';
      },
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate budgets
budgetSchema.index(
  { user: 1, category: 1, period: 1, month: 1, year: 1 },
  { unique: true }
);

// Virtual for budget remaining
budgetSchema.virtual('remaining').get(function () {
  return Math.max(0, this.amount - this.spent);
});

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function () {
  return this.amount > 0 ? Math.round((this.spent / this.amount) * 100) : 0;
});

// Virtual for alert status
budgetSchema.virtual('isOverBudget').get(function () {
  return this.spent > this.amount;
});

budgetSchema.virtual('isNearLimit').get(function () {
  return this.percentageUsed >= this.alertThreshold && !this.isOverBudget;
});

// Include virtuals in JSON
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
