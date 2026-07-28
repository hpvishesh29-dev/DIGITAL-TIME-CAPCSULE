import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let adminDb = null;
let adminAuth = null;
let adminStorage = null;
let isFirebaseAdminInitialized = false;

try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      });
      isFirebaseAdminInitialized = true;
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.warn(
        'Firebase Admin SDK credentials missing in .env — Server operating with fallback memory store.'
      );
    }
  } else {
    isFirebaseAdminInitialized = true;
  }

  if (isFirebaseAdminInitialized) {
    adminDb = admin.firestore();
    adminAuth = admin.auth();
    adminStorage = admin.storage();
  }
} catch (error) {
  console.warn('Firebase Admin SDK initialization skipped:', error.message);
}

export { admin, adminDb, adminAuth, adminStorage, isFirebaseAdminInitialized };
