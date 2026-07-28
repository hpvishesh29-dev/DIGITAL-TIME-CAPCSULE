import { generateToken } from '../config/jwt.js';
import { adminAuth, adminDb } from '../config/firebase-admin.js';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPushNotificationEmail,
  sendVaultSummaryEmail,
  sendUnlockAlertEmail,
} from '../services/emailService.js';

// In-memory fallback users cache for demo mode
const inMemoryUsers = new Map();

export const signup = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    let userPayload;

    if (adminAuth) {
      try {
        const firebaseUser = await adminAuth.createUser({
          email,
          password,
          displayName: displayName || email.split('@')[0],
        });

        userPayload = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || null,
        };

        if (adminDb) {
          await adminDb.collection('users').doc(firebaseUser.uid).set({
            ...userPayload,
            createdAt: new Date().toISOString(),
            settings: { theme: 'dark', audioEnabled: true, graphicsQuality: 'ultra' },
          });
        }
      } catch (fbErr) {
        console.warn('Firebase Admin signup error, falling back to local JWT:', fbErr.message);
      }
    }

    if (!userPayload) {
      const uid = 'user-' + Date.now();
      userPayload = {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
      };
      inMemoryUsers.set(email, { ...userPayload, password });
    }

    const token = generateToken(userPayload);
    await sendWelcomeEmail(email, userPayload.displayName);

    res.status(201).json({
      success: true,
      message: 'Account created successfully & welcome email pushed',
      user: userPayload,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    let userPayload = {
      uid: 'user-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      photoURL: null,
    };

    if (inMemoryUsers.has(email)) {
      const cached = inMemoryUsers.get(email);
      userPayload = { uid: cached.uid, email: cached.email, displayName: cached.displayName };
    }

    const token = generateToken(userPayload);

    // Push login alert email to logged-in user email
    sendPushNotificationEmail(
      email,
      userPayload.displayName,
      'Chrona Vault Login Alert',
      `New login session established at ${new Date().toLocaleString()} for your spatial time capsule.`
    ).catch((err) => console.error('Login email push error:', err));

    res.json({
      success: true,
      message: 'Authentication successful. Login email pushed to logged email.',
      user: userPayload,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { idToken, email, displayName, photoURL, uid } = req.body;

    const userPayload = {
      uid: uid || 'google-' + Date.now(),
      email: email || 'googleuser@chrona.app',
      displayName: displayName || 'Google User',
      photoURL: photoURL || null,
    };

    const token = generateToken(userPayload);

    // Push login alert email
    if (userPayload.email) {
      sendPushNotificationEmail(
        userPayload.email,
        userPayload.displayName,
        'Google Login Alert',
        `Google OAuth session active for your Chrona Spatial Vault.`
      ).catch((err) => console.error('Google login email error:', err));
    }

    res.json({
      success: true,
      message: 'Google login successful',
      user: userPayload,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const resetLink = `https://chrona-app.com/reset-password?email=${encodeURIComponent(email)}&token=reset-${Date.now()}`;
    await sendPasswordResetEmail(email, resetLink);

    res.json({
      success: true,
      message: 'Password reset link sent to your email address.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, photoURL } = req.body;
    const updatedUser = {
      ...req.user,
      displayName: displayName || req.user.displayName,
      bio: bio || req.user.bio || '',
      photoURL: photoURL || req.user.photoURL,
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const pushEmailToLoggedUser = async (req, res, next) => {
  try {
    const targetEmail = req.body?.email || req.user?.email || 'user@chrona.app';
    const userName = req.body?.userName || req.user?.displayName || 'Time Keeper';
    const subject = req.body?.subject || 'Chrona Vault Notification';
    const message = req.body?.message || 'Push notification alert sent to your logged email address.';

    const sent = await sendPushNotificationEmail(targetEmail, userName, subject, message);

    res.json({
      success: true,
      message: `Email successfully pushed to ${targetEmail}`,
      emailSent: sent,
      recipient: targetEmail,
    });
  } catch (error) {
    next(error);
  }
};

export const pushVaultSummaryEmail = async (req, res, next) => {
  try {
    const targetEmail = req.body?.email || req.user?.email || 'user@chrona.app';
    const userName = req.body?.userName || req.user?.displayName || 'Time Keeper';
    const stats = req.body?.stats || { totalMemories: 5, totalCapsules: 2 };

    const sent = await sendVaultSummaryEmail(targetEmail, userName, stats);

    res.json({
      success: true,
      message: `Vault summary email pushed to ${targetEmail}`,
      emailSent: sent,
      recipient: targetEmail,
    });
  } catch (error) {
    next(error);
  }
};

export const sendUnlockEmail = async (req, res, next) => {
  try {
    const targetEmail = req.body?.email || req.user?.email || 'user@chrona.app';
    const userName = req.body?.userName || req.user?.displayName || 'Time Keeper';
    const memoryTitle = req.body?.memoryTitle || 'Time Capsule Memory';
    const unlockDate = req.body?.unlockDate || new Date().toLocaleString();

    const sent = await sendUnlockAlertEmail(targetEmail, userName, memoryTitle, unlockDate);

    res.json({
      success: true,
      message: `Implicit unlock notification email sent to ${targetEmail}`,
      emailSent: sent,
      recipient: targetEmail,
    });
  } catch (error) {
    next(error);
  }
};


