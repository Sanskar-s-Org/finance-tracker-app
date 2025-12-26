import express from 'express';
import {
  getDashboardSummary,
  getSpendingTrends,
  getInsights,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/trends', getSpendingTrends);
router.get('/insights', getInsights);

export default router;
