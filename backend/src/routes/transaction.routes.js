import express from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getTransactions)
  .post(validate(schemas.createTransaction), createTransaction);

router
  .route('/:id')
  .get(getTransaction)
  .put(validate(schemas.updateTransaction), updateTransaction)
  .delete(deleteTransaction);

export default router;
