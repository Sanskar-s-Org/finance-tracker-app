import Joi from 'joi';

// Validation schemas
export const schemas = {
  // User schemas
  signup: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    currency: Joi.string()
      .valid('USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD')
      .optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Transaction schemas
  createTransaction: Joi.object({
    type: Joi.string().valid('income', 'expense').required(),
    amount: Joi.number().positive().required(),
    category: Joi.string().required(),
    description: Joi.string().max(200).optional(),
    date: Joi.date().optional(),
    paymentMethod: Joi.string()
      .valid('cash', 'card', 'bank_transfer', 'other')
      .optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),

  updateTransaction: Joi.object({
    type: Joi.string().valid('income', 'expense').optional(),
    amount: Joi.number().positive().optional(),
    category: Joi.string().optional(),
    description: Joi.string().max(200).optional(),
    date: Joi.date().optional(),
    paymentMethod: Joi.string()
      .valid('cash', 'card', 'bank_transfer', 'other')
      .optional(),
    tags: Joi.array().items(Joi.string()).optional(),
  }),

  // Category schemas
  createCategory: Joi.object({
    name: Joi.string().max(30).required(),
    type: Joi.string().valid('income', 'expense').required(),
    icon: Joi.string().optional(),
    color: Joi.string()
      .pattern(/^#[0-9A-F]{6}$/i)
      .optional(),
  }),

  // Budget schemas
  createBudget: Joi.object({
    category: Joi.string().required(),
    amount: Joi.number().min(0).required(),
    period: Joi.string().valid('monthly', 'yearly').default('monthly'),
    month: Joi.number().min(1).max(12).when('period', {
      is: 'monthly',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    year: Joi.number().min(2000).max(2100).required(),
    alertThreshold: Joi.number().min(0).max(100).default(80),
  }),

  updateBudget: Joi.object({
    amount: Joi.number().min(0).optional(),
    alertThreshold: Joi.number().min(0).max(100).optional(),
  }),
};

// Validation middleware
export const validate = schema => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
};
