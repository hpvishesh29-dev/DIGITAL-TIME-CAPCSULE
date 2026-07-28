import express from 'express';
import {
  getNotifications,
  createNotification,
  markAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/read', markAsRead);

export default router;
