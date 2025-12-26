import express from 'express';
import { signup, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', authLimiter, validate(schemas.signup), signup);
router.post('/login', authLimiter, validate(schemas.login), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
