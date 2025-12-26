import express from 'express';
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetAlerts,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router.get('/alerts', getBudgetAlerts);

router
  .route('/')
  .get(getBudgets)
  .post(validate(schemas.createBudget), createBudget);

router
  .route('/:id')
  .get(getBudget)
  .put(validate(schemas.updateBudget), updateBudget)
  .delete(deleteBudget);

export default router;
