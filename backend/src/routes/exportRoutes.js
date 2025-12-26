import express from 'express';
import { protect } from '../middleware/auth.js';
import { exportTransactionsCSV, exportReportPDF } from '../controllers/exportController.js';

const router = express.Router();

router.get('/transactions/csv', protect, exportTransactionsCSV);
router.get('/report/pdf', protect, exportReportPDF);

export default router;
