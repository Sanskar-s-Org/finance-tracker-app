import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    updateProfile,
    updatePassword,
    updatePreferences,
    deleteAccount,
} from '../controllers/settingsController.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/preferences', protect, updatePreferences);
router.delete('/account', protect, deleteAccount);

export default router;
