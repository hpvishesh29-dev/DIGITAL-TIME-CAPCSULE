import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'chrona_fallback_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

export const generateToken = (userPayload) => {
  return jwt.sign(
    {
      uid: userPayload.uid,
      email: userPayload.email,
      displayName: userPayload.displayName || '',
      role: userPayload.role || 'user',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
