import Category from '../models/Category.js';
import logger from '../config/logger.js';

// @desc    Get all categories for logged-in user
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user._id };

    if (type) {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    logger.error(`Get categories error: ${error.message}`);
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req, res, next) => {
  try {
    req.body.user = req.user._id;

    const category = await Category.create(req.body);

    logger.info(`Category created: ${category._id}`);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error(`Create category error: ${error.message}`);
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info(`Category updated: ${category._id}`);

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error(`Update category error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await category.deleteOne();

    logger.info(`Category deleted: ${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete category error: ${error.message}`);
    next(error);
  }
};
