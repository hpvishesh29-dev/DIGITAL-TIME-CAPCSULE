import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { api } from '../services/api';

const AuthContext = createContext();

const STORAGE_KEY = 'chrona_user';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistUser = (u) => {
  try {
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage may be unavailable (private mode, quota, etc). Non-fatal.
  }
};

const mapFirebaseUser = (firebaseUser) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Time Keeper',
  photoURL: firebaseUser.photoURL,
  provider: 'firebase'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);

  const sessionProviderRef = useRef(null);

  const createDemoUser = () => ({
    uid: 'demo-' + Date.now(),
    email: 'demo@chrona.app',
    displayName: 'Time Keeper',
    photoURL: null,
    provider: 'demo'
  });

  useEffect(() => {
    let cancelled = false;

    if (!auth) {
      const stored = readStoredUser() || createDemoUser();
      if (!cancelled) {
        sessionProviderRef.current = stored.provider;
        setUser(stored);
        persistUser(stored);
        setLoading(false);
      }
      return () => {
        cancelled = true;
      };
    }

    const unsub = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (cancelled) return;

        if (firebaseUser) {
          const u = mapFirebaseUser(firebaseUser);
          sessionProviderRef.current = 'firebase';
          setUser(u);
          persistUser(u);
        } else {
          const stored = readStoredUser();

          if (stored) {
            sessionProviderRef.current = stored.provider;
            setUser(stored);
          } else {
            sessionProviderRef.current = null;
            setUser(null);
          }
        }
        setLoading(false);
      },
      (err) => {
        if (cancelled) return;
        console.error('Auth state listener error:', err);
        const demo = createDemoUser();
        sessionProviderRef.current = 'demo';
        setUser(demo);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const setLocalSession = useCallback((u) => {
    sessionProviderRef.current = u.provider;
    setUser(u);
    persistUser(u);
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      if (auth) {
        await signInWithEmailAndPassword(auth, email, password);
        api.pushEmailToUser({ email, subject: '✨ Chrona Vault Login Alert', message: 'You have logged into your Chrona Spatial Vault session.' }).catch(() => {});
        return;
      }

      if (email && password && password.length >= 6) {
        setLocalSession({
          uid: 'local-' + Date.now(),
          email,
          displayName: email.split('@')[0],
          photoURL: null,
          provider: 'local'
        });
        api.pushEmailToUser({ email, subject: '✨ Chrona Vault Login Alert', message: 'You have logged into your Chrona Spatial Vault session.' }).catch(() => {});
        return;
      }

      throw new Error('Enter a valid email and a password of at least 6 characters.');
    } catch (e) {
      setAuthError(mapAuthError(e));
      throw e;
    } finally {
      setIsAuthenticating(false);
    }
  }, [setLocalSession]);

  const signupWithEmail = useCallback(async (email, password, name) => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      if (auth) {
        await createUserWithEmailAndPassword(auth, email, password);
        api.pushEmailToUser({ email, userName: name, subject: '🎉 Welcome to Chrona Time Capsule', message: 'Your account has been created and your 3D spatial vault is active.' }).catch(() => {});
        return;
      }

      if (email && password && password.length >= 6) {
        setLocalSession({
          uid: 'local-' + Date.now(),
          email,
          displayName: name || email.split('@')[0],
          photoURL: null,
          provider: 'local'
        });
        api.pushEmailToUser({ email, userName: name, subject: '🎉 Welcome to Chrona Time Capsule', message: 'Your account has been created and your 3D spatial vault is active.' }).catch(() => {});
        return;
      }

      throw new Error('Signup failed — password must be 6+ characters.');
    } catch (e) {
      setAuthError(mapAuthError(e));
      throw e;
    } finally {
      setIsAuthenticating(false);
    }
  }, [setLocalSession]);

  const loginWithGoogle = useCallback(async () => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      if (!auth) {
        throw new Error('Google sign-in requires Firebase setup. Use Demo Mode instead.');
      }
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res?.user?.email) {
        api.pushEmailToUser({ email: res.user.email, userName: res.user.displayName, subject: '✨ Google Login Alert', message: 'Signed in via Google OAuth to Chrona Vault.' }).catch(() => {});
      }
    } catch (e) {
      setAuthError(mapAuthError(e, 'Google sign-in requires Firebase setup. Use Demo Mode instead.'));
      throw e;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);


  const continueAsDemo = useCallback(() => {
    setAuthError(null);
    setLocalSession(createDemoUser());
  }, [setLocalSession]);

  const logout = useCallback(async () => {
    setAuthError(null);

    try {
      if (auth && sessionProviderRef.current === 'firebase') {
        await signOut(auth);
      }
    } catch (e) {
      console.error("Sign out failed:", e);
    } finally {
      sessionProviderRef.current = null;
      persistUser(null);
      setUser(null);
    }
  }, []);
  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticating,
    authError,
    setAuthError,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    continueAsDemo,
    logout
  }), [
    user,
    loading,
    isAuthenticating,
    authError,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    continueAsDemo,
    logout
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

function mapAuthError(e, fallback) {
  const code = e?.code;
  const messages = {
    'auth/invalid-email': 'That email address looks invalid.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/email-already-in-use': 'An account with that email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.'
  };
  if (code && messages[code]) return messages[code];
  return e?.message || fallback || 'Something went wrong. Please try again.';
}

export const useAuth = () => useContext(AuthContext);