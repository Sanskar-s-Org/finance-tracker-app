import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import logger from '../config/logger.js';

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
export const getDashboardSummary = async (req, res, next) => {
  try {
    const { period = 'thisMonth' } = req.query;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate date range based on period
    let startDate, endDate;

    switch (period) {
      case 'lastMonth': {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        startDate = new Date(lastMonthYear, lastMonth, 1);
        endDate = new Date(lastMonthYear, lastMonth + 1, 0, 23, 59, 59);
        break;
      }
      case 'last3Months': {
        startDate = new Date(currentYear, currentMonth - 3, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
        break;
      }
      case 'thisYear':
        startDate = new Date(currentYear, 0, 1);
        endDate = new Date(currentYear, 11, 31, 23, 59, 59);
        break;
      case 'allTime':
        startDate = null;
        endDate = null;
        break;
      case 'thisMonth':
      default:
        startDate = new Date(currentYear, currentMonth, 1);
        endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
        break;
    }

    // Build query filter
    const filter = { user: req.user._id };
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Get transactions based on period
    const transactions = await Transaction.find(filter);

    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    // Use the same date range for category breakdown as the main summary
    // This ensures consistency across all dashboard data
    const categoryFilter = {
      user: req.user._id,
      type: 'expense',
    };

    // Apply date filter if we have a specific period
    if (startDate && endDate) {
      categoryFilter.date = { $gte: startDate, $lte: endDate };
    }

    // Get category breakdown using the same period as summary
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: categoryFilter,
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $project: {
          category: {
            _id: '$category._id',
            name: '$category.name',
            icon: '$category.icon',
            color: '$category.color',
          },
          total: 1,
          count: 1,
          percentage: {
            $cond: [
              { $eq: [expense, 0] },
              0,
              { $multiply: [{ $divide: ['$total', expense] }, 100] },
            ],
          },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find({
      user: req.user._id,
    })
      .populate('category', 'name icon color')
      .sort({ date: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          income,
          expense,
          balance,
          transactionCount: transactions.length,
        },
        categoryBreakdown,
        recentTransactions,
        period: {
          selected: period,
          month: currentMonth + 1,
          year: currentYear,
        },
      },
    });
  } catch (error) {
    logger.error(`Get dashboard summary error: ${error.message}`);
    next(error);
  }
};

// @desc    Get spending trends
// @route   GET /api/dashboard/trends
// @access  Private
export const getSpendingTrends = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    const currentDate = new Date();

    const trends = [];

    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const monthlyData = await Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ]);

      const income = monthlyData.find(d => d._id === 'income')?.total || 0;
      const expense = monthlyData.find(d => d._id === 'expense')?.total || 0;

      trends.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        monthName: date.toLocaleString('default', { month: 'short' }),
        income,
        expense,
        balance: income - expense,
      });
    }

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    logger.error(`Get spending trends error: ${error.message}`);
    next(error);
  }
};

// @desc    Get financial insights
// @route   GET /api/dashboard/insights
// @access  Private
export const getInsights = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Current month data
    const thisMonthStart = new Date(currentYear, currentMonth, 1);
    const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // Last month data
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const thisMonthExpense = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: thisMonthStart, $lte: thisMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const lastMonthExpense = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const thisMonth = thisMonthExpense[0]?.total || 0;
    const lastMonth = lastMonthExpense[0]?.total || 0;

    const changePercentage =
      lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    // Get top spending category
    const topCategory = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: thisMonthStart, $lte: thisMonthEnd },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { total: -1 },
      },
      { $limit: 1 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
    ]);

    const insights = [];

    if (changePercentage > 10) {
      insights.push({
        type: 'warning',
        message: `Your spending increased by ${changePercentage.toFixed(1)}% compared to last month`,
      });
    } else if (changePercentage < -10) {
      insights.push({
        type: 'success',
        message: `Great job! Your spending decreased by ${Math.abs(changePercentage).toFixed(1)}% compared to last month`,
      });
    }

    if (topCategory.length > 0) {
      insights.push({
        type: 'info',
        message: `Your highest spending category this month is ${topCategory[0].category.name}`,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        thisMonthExpense: thisMonth,
        lastMonthExpense: lastMonth,
        changePercentage: parseFloat(changePercentage.toFixed(2)),
        topCategory: topCategory[0] || null,
        insights,
      },
    });
  } catch (error) {
    logger.error(`Get insights error: ${error.message}`);
    next(error);
  }
};
