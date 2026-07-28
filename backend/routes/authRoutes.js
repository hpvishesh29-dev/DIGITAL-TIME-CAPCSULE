import express from 'express';
import {
  signup,
  login,
  googleAuth,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  pushEmailToLoggedUser,
  pushVaultSummaryEmail,
  sendUnlockEmail,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/push-email', protect, pushEmailToLoggedUser);
router.post('/push-summary', protect, pushVaultSummaryEmail);
router.post('/send-unlock-email', protect, sendUnlockEmail);

export default router;


