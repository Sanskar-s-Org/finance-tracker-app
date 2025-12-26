import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import logger from '../config/logger.js';

// @desc    Get all transactions for logged-in user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, search, sort } = req.query;

    const filter = { user: req.user._id };

    // Apply filters
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Sort (default: newest first)
    const sortOption = sort === 'oldest' ? { date: 1 } : { date: -1 };

    const transactions = await Transaction.find(filter)
      .populate('category', 'name icon color')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transactions,
    });
  } catch (error) {
    logger.error(`Get transactions error: ${error.message}`);
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('category', 'name icon color');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    logger.error(`Get transaction error: ${error.message}`);
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    req.body.user = req.user._id;

    const transaction = await Transaction.create(req.body);

    // Update budget if transaction is an expense
    if (transaction.type === 'expense') {
      await updateBudgetSpending(
        req.user._id,
        transaction.category,
        transaction.date
      );
    }

    const populatedTransaction = await Transaction.findById(
      transaction._id
    ).populate('category', 'name icon color');

    logger.info(`Transaction created: ${transaction._id}`);

    res.status(201).json({
      success: true,
      data: populatedTransaction,
    });
  } catch (error) {
    logger.error(`Create transaction error: ${error.message}`);
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    const oldCategory = transaction.category;
    const oldAmount = transaction.amount;
    const oldDate = transaction.date;

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name icon color');

    // Update budgets if needed
    if (transaction.type === 'expense') {
      // Recalculate old budget
      await updateBudgetSpending(req.user._id, oldCategory, oldDate);
      // Recalculate new budget
      await updateBudgetSpending(
        req.user._id,
        transaction.category,
        transaction.date
      );
    }

    logger.info(`Transaction updated: ${transaction._id}`);

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    logger.error(`Update transaction error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    const category = transaction.category;
    const date = transaction.date;

    await transaction.deleteOne();

    // Update budget if it was an expense
    if (transaction.type === 'expense') {
      await updateBudgetSpending(req.user._id, category, date);
    }

    logger.info(`Transaction deleted: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete transaction error: ${error.message}`);
    next(error);
  }
};

// Helper function to update budget spending
async function updateBudgetSpending(userId, categoryId, date) {
  const transactionDate = new Date(date);
  const month = transactionDate.getMonth() + 1;
  const year = transactionDate.getFullYear();

  // Find the budget for this category and period
  const budget = await Budget.findOne({
    user: userId,
    category: categoryId,
    period: 'monthly',
    month,
    year,
  });

  if (budget) {
    // Calculate total spent in this category for the period
    const totalSpent = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          category: categoryId,
          type: 'expense',
          date: {
            $gte: new Date(year, month - 1, 1),
            $lt: new Date(year, month, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    budget.spent = totalSpent.length > 0 ? totalSpent[0].total : 0;
    await budget.save();
  }
}
