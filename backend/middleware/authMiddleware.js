import { verifyToken } from '../config/jwt.js';
import { adminAuth } from '../config/firebase-admin.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'null' || token === 'undefined') {
    // For demo/development ease when testing endpoints directly
    req.user = { uid: 'demo-user-123', email: 'demo@chrona.app', displayName: 'Time Keeper' };
    return next();
  }

  try {
    // 1. Try Firebase Admin ID Token verification first
    if (adminAuth) {
      try {
        const decodedFirebaseUser = await adminAuth.verifyIdToken(token);
        req.user = {
          uid: decodedFirebaseUser.uid,
          email: decodedFirebaseUser.email,
          displayName: decodedFirebaseUser.name || decodedFirebaseUser.email?.split('@')[0],
          photoURL: decodedFirebaseUser.picture,
        };
        return next();
      } catch (err) {
        // Fall back to custom JWT check below
      }
    }

    // 2. Try JWT token verification
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }

    // Fallback demo user token handling
    if (token.startsWith('demo-token-') || token === 'demo') {
      req.user = { uid: 'demo-user-123', email: 'demo@chrona.app', displayName: 'Time Keeper' };
      return next();
    }

    return res.status(401).json({ success: false, message: 'Invalid or expired authorization token' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};
