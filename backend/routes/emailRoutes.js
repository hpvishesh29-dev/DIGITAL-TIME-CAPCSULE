import express from 'express';
import { sendUnlockEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * @route   POST /api/email/send-unlock
 * @desc    Sends unlock email for a time capsule memory
 * @access  Public / Application
 *
 * Payload: { email, userName, memoryTitle, unlockDate }
 * Returns 200 { success: true } or 500 { success: false, error: "..." }
 */
router.post('/send-unlock', async (req, res) => {
  try {
    const { email, userName, memoryTitle, unlockDate } = req.body || {};

    const result = await sendUnlockEmail({
      email,
      userName,
      memoryTitle,
      unlockDate,
    });

    if (result && result.success) {
      return res.status(200).json({
        success: true,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result?.error || 'Failed to send unlock email.',
      });
    }
  } catch (error) {
    console.error('SendMail Failed');
    console.error(error.stack || error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during email dispatch.',
    });
  }
});

export default router;
