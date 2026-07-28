import express from 'express';
import {
  getAnalyticsDashboard,
  getStorageMetrics,
  getActivityMetrics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAnalyticsDashboard);
router.get('/dashboard', getAnalyticsDashboard);
router.get('/storage', getStorageMetrics);
router.get('/activity', getActivityMetrics);

export default router;
