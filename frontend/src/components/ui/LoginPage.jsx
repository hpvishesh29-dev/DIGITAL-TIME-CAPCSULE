import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ──────────────────────────────────────────────────────────────────────────────
// Reduced-motion preference
// ──────────────────────────────────────────────────────────────────────────────

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);
  return reduced;
};

// ──────────────────────────────────────────────────────────────────────────────
// Ambient floating particles
// ──────────────────────────────────────────────────────────────────────────────

const useParticles = (count) =>
  useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.2,
        duration: 6 + Math.random() * 9,
        delay: Math.random() * 6,
        drift: (Math.random() - 0.5) * 50,
      })),
    [count]
  );

// ──────────────────────────────────────────────────────────────────────────────
// Animated CHRONA logo
// ──────────────────────────────────────────────────────────────────────────────

const ChronaLogo = ({ reduced }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.75 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="inline-flex items-center justify-center mb-4 relative"
  >
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: 'radial-gradient(circle, rgba(199,125,255,0.35), transparent 70%)',
        filter: 'blur(14px)',
        animation: reduced ? 'none' : 'chronaCoreGlow 3.2s ease-in-out infinite',
      }}
    />
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 relative drop-shadow-[0_0_20px_rgba(199,125,255,0.6)]"
      role="img"
      aria-label="Chrona logo"
    >
      <circle
        cx="28"
        cy="28"
        r="25"
        stroke="url(#loginRingGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 3"
        style={{
          transformOrigin: '28px 28px',
          animation: reduced ? 'none' : 'chronaLogoSpin 14s linear infinite',
        }}
      />
      <circle
        cx="28"
        cy="28"
        r="16"
        stroke="url(#loginRingGrad2)"
        strokeWidth="1"
        opacity="0.5"
        style={{
          transformOrigin: '28px 28px',
          animation: reduced ? 'none' : 'chronaLogoSpin 9s linear infinite reverse',
        }}
      />
      <circle cx="28" cy="28" r="6" fill="url(#loginCoreGrad)" />
      <line x1="28" y1="3" x2="28" y2="9" stroke="#c77dff" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="47" x2="28" y2="53" stroke="#c77dff" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="3" y1="28" x2="9" y2="28" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="47" y1="28" x2="53" y2="28" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="28" x2="28" y2="16" stroke="#e0aaff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="28" y1="28" x2="36" y2="28" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <defs>
        <linearGradient id="loginRingGrad" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c77dff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="loginRingGrad2" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9d4edd" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="loginCoreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0d0ff" />
          <stop offset="100%" stopColor="#9d4edd" />
        </radialGradient>
      </defs>
    </svg>
  </motion.div>
);

// ──────────────────────────────────────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────────────────────────────────────

export const LoginPage = () => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, continueAsDemo, authError, setAuthError } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState('');
  const [errorKey, setErrorKey] = useState(0);

  const prefersReducedMotion = usePrefersReducedMotion();
  const particles = useParticles(prefersReducedMotion ? 0 : 20);
  const cardControls = useAnimation();
  const prevErrorRef = useRef('');

  const displayError = localError || authError;

  useEffect(() => {
    if (displayError && displayError !== prevErrorRef.current) {
      setErrorKey((k) => k + 1);
      if (!prefersReducedMotion) {
        cardControls.start({
          x: [0, -8, 8, -6, 6, -3, 3, 0],
          transition: { duration: 0.5, ease: 'easeInOut' },
        });
      }
    }
    prevErrorRef.current = displayError;
  }, [displayError, cardControls, prefersReducedMotion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setAuthError(null);
    setSuccess(false);
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, name);
      }
      setSuccess(true);
    } catch (err) {
      setLocalError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLocalError('');
    setAuthError(null);
    setSuccess(false);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      setSuccess(true);
    } catch (err) {
      setLocalError(authError || err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const busy = loading || googleLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-start md:pl-16 lg:pl-24 overflow-y-auto overflow-x-hidden bg-slate-950/60 backdrop-blur-xl text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none opacity-60 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />
      </div>
      <style>{`
        @keyframes chronaLogoSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes chronaCoreGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes chronaStarPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.6; }
        }
        @keyframes chronaSuccessRing {
          0% { box-shadow: 0 0 0 0 rgba(74,222,128,0.5); }
          100% { box-shadow: 0 0 0 18px rgba(74,222,128,0); }
        }
      `}</style>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              background: 'radial-gradient(circle, rgba(224,170,255,0.9), rgba(56,189,248,0.2))',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0], y: [0, -34, 0], x: [0, p.drift, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md mx-4 pointer-events-auto z-40"
      >
        {/* CHRONA Logo Header */}
        <div className="text-left mb-6">
          <ChronaLogo reduced={prefersReducedMotion} />
          <h1
            className="font-display font-black text-3xl sm:text-4xl tracking-wider mb-1 bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #f0d0ff 0%, #c77dff 45%, #38bdf8 100%)',
              filter: 'drop-shadow(0 0 18px rgba(199,125,255,0.45))',
            }}
          >
            CHRONA
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-light tracking-wide">
            Preserve Today.{' '}
            <span className="text-purple-300">Rediscover Tomorrow.</span>
          </p>
        </div>

        {/* Auth Card */}
        <motion.div
          animate={cardControls}
          className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 relative overflow-hidden backdrop-blur-2xl shadow-glass-lg"
          style={{
            boxShadow: success ? undefined : '0 20px 60px -20px rgba(124,45,255,0.35)',
            animation: success && !prefersReducedMotion ? 'chronaSuccessRing 1s ease-out' : 'none',
          }}
        >
          {/* Mode Toggle */}
          <div
            role="tablist"
            aria-label="Choose authentication mode"
            className="flex bg-black/40 p-1 rounded-2xl border border-white/10 mb-6"
          >
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => {
                  setMode(m);
                  setLocalError('');
                  setAuthError(null);
                  setSuccess(false);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-300 capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 ${
                  mode === m
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" aria-busy={busy}>
            {/* Name (signup only) */}
            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative overflow-hidden"
                >
                  <label htmlFor="chrona-name" className="sr-only">
                    Your name
                  </label>
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                  <input
                    id="chrona-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative">
              <label htmlFor="chrona-email" className="sr-only">
                Email address
              </label>
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
              <input
                id="chrona-email"
                name="email"
                type="email"
                required
                aria-required="true"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="chrona-password" className="sr-only">
                Password
              </label>
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
              <input
                id="chrona-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                aria-required="true"
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                aria-describedby={displayError ? 'chrona-auth-error' : undefined}
                placeholder="Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 rounded-md"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {displayError && (
                <motion.p
                  key={errorKey}
                  id="chrona-auth-error"
                  role="alert"
                  aria-live="assertive"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="text-xs text-red-400 bg-red-500/10 border border-red-500/25 px-3.5 py-2 rounded-xl font-mono flex items-center gap-2"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  {displayError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={busy}
              whileHover={!busy ? { scale: 1.01 } : {}}
              whileTap={!busy ? { scale: 0.99 } : {}}
              aria-live="polite"
              className="w-full py-3 rounded-2xl bg-gradient-vibrant text-white font-bold text-xs shadow-neon-indigo transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
            >
              <AnimatePresence mode="wait" initial={false}>
                {success ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                    <span>Access Granted</span>
                  </motion.span>
                ) : loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === 'login' ? 'Entering...' : 'Creating vault...'}</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>{mode === 'login' ? 'Enter the Vault' : 'Create My Vault'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-gray-400 font-mono">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Google Sign In */}
          <motion.button
            onClick={handleGoogle}
            disabled={busy}
            aria-label="Continue with Google"
            whileHover={!busy ? { scale: 1.015 } : {}}
            whileTap={!busy ? { scale: 0.985 } : {}}
            className="w-full glass-button py-2.5 rounded-2xl text-xs text-gray-300 hover:text-white flex items-center justify-center gap-2.5 mb-2.5 transition-colors relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed border border-white/10"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
          </motion.button>

          {/* Demo Mode */}
          <button
            type="button"
            onClick={continueAsDemo}
            aria-label="Explore Chrona as a demo, no account required"
            className="w-full py-2 rounded-2xl text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-colors group"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>Explore Spatial Vault (Demo Mode)</span>
          </button>
        </motion.div>

        {/* Footer */}
        <p className="text-left text-[10px] text-gray-400 mt-4 font-mono">
          Encrypted &amp; sealed with AES-256 • CHRONA v1.0
        </p>
      </motion.div>
    </div>
  );
};