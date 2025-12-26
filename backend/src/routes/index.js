import express from 'express';
import authRoutes from './auth.routes.js';
import transactionRoutes from './transaction.routes.js';
import categoryRoutes from './category.routes.js';
import budgetRoutes from './budget.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import exportRoutes from './exportRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/export', exportRoutes);
router.use('/settings', settingsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
