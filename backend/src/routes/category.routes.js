import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCategories)
  .post(validate(schemas.createCategory), createCategory);

router.route('/:id').put(updateCategory).delete(deleteCategory);

export default router;
