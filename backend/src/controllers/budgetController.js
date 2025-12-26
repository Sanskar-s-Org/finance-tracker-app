import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import logger from '../config/logger.js';

// @desc    Get all budgets for logged-in user
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const filter = { user: req.user._id };

    if (year) filter.year = parseInt(year);
    if (month) filter.month = parseInt(month);

    const budgets = await Budget.find(filter).populate(
      'category',
      'name icon color'
    );

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    logger.error(`Get budgets error: ${error.message}`);
    next(error);
  }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
export const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('category', 'name icon color');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    logger.error(`Get budget error: ${error.message}`);
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
export const createBudget = async (req, res, next) => {
  try {
    req.body.user = req.user._id;

    // Calculate initial spending
    const { category, month, year } = req.body;

    const totalSpent = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          category,
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

    req.body.spent = totalSpent.length > 0 ? totalSpent[0].total : 0;

    const budget = await Budget.create(req.body);

    const populatedBudget = await Budget.findById(budget._id).populate(
      'category',
      'name icon color'
    );

    logger.info(`Budget created: ${budget._id}`);

    res.status(201).json({
      success: true,
      data: populatedBudget,
    });
  } catch (error) {
    logger.error(`Create budget error: ${error.message}`);
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = async (req, res, next) => {
  try {
    let budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name icon color');

    logger.info(`Budget updated: ${budget._id}`);

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    logger.error(`Update budget error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    await budget.deleteOne();

    logger.info(`Budget deleted: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete budget error: ${error.message}`);
    next(error);
  }
};

// @desc    Get budget alerts
// @route   GET /api/budgets/alerts
// @access  Private
export const getBudgetAlerts = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const budgets = await Budget.find({
      user: req.user._id,
      month: currentMonth,
      year: currentYear,
    }).populate('category', 'name icon color');

    const alerts = budgets
      .filter(budget => budget.isOverBudget || budget.isNearLimit)
      .map(budget => ({
        budget,
        type: budget.isOverBudget ? 'over' : 'warning',
        message: budget.isOverBudget
          ? `You've exceeded your budget for ${budget.category.name}`
          : `You've used ${budget.percentageUsed}% of your budget for ${budget.category.name}`,
      }));

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    logger.error(`Get budget alerts error: ${error.message}`);
    next(error);
  }
};
