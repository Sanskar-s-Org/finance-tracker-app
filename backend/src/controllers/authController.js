import User from '../models/User.js';
import Category from '../models/Category.js';
import { sendTokenResponse } from '../middleware/auth.js';
import logger from '../config/logger.js';

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, currency } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      currency,
    });

    // Create default categories for the user
    const defaultCategories = [
      // Expense categories
      {
        name: 'Food & Dining',
        type: 'expense',
        icon: '🍔',
        color: '#ef4444',
        isDefault: false,
        user: user._id,
      },
      {
        name: 'Transportation',
        type: 'expense',
        icon: '🚗',
        color: '#f97316',
        isDefault: false,
        user: user._id,
      },
      {
        name: 'Shopping',
        type: 'expense',
        icon: '🛍️',
        color: '#ec4899',
        isDefault: false,
        user: user._id,
      },
      {
        name: 'Entertainment',
        type: 'expense',
        icon: '🎬',
        color: '#8b5cf6',
        isDefault: false,
        user: user._id,
      },
      {
        name: 'Bills & Utilities',
        type: 'expense',
        icon: '📱',
        color: '#6366f1',
        isDefault: false,
        user: user._id,
      },
      {
        name: 'Healthcare',
        type: 'expense',
        icon: '🏥',
        color: '#10b981',
        isDefault: false,
        user: user._id,
      },
      {
        name: 'Education',
        type: 'expense',
        icon: '📚',
        color: '#14b8a6',
        isDefault: false,
        user: user._id,
      },
      {
        name: 'Other',
        type: 'expense',
        icon: '📊',
        color: '#64748b',
        isDefault: false,
        user: user._id,
      },
      // Income categories
      {
        name: 'Salary',
        type: 'income',
        icon: '💰',
        color: '#22c55e',
        isDefault: false,
        user: user._id,
      },
      {
        name: 'Freelance',
        type: 'income',
        icon: '💼',
        color: '#3b82f6',
        isDefault: false,
        user: user._id,
      },
      {
        name: 'Investment',
        type: 'income',
        icon: '📈',
        color: '#06b6d4',
        isDefault: false,
        user: user._id,
      },
      {
        name: 'Other Income',
        type: 'income',
        icon: '💵',
        color: '#84cc16',
        isDefault: false,
        user: user._id,
      },
    ];

    await Category.insertMany(defaultCategories);

    logger.info(`New user registered: ${email}`);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    logger.info(`User logged in: ${email}`);

    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
