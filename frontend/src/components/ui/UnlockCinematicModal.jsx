import React, { useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Unlock, Sun, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';

export const UnlockCinematicModal = memo(({ memory, onClose }) => {
  useEffect(() => {
    if (!memory) return;

    // Play golden unlock sound
    try {
      soundEngine.playSealSuccess();
    } catch (e) {}

    // Trigger golden light particle burst
    const end = Date.now() + 3500;
    const colors = ['#F59E0B', '#FBBF24', '#38BDF8', '#818CF8', '#FFFFFF'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [memory]);

  if (!memory) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden"
        style={{
          background: 'radial-gradient(circle at center, rgba(30, 27, 75, 0.92) 0%, rgba(5, 8, 16, 0.98) 100%)',
          backdropFilter: 'blur(25px)',
        }}
        onClick={onClose}
      >
        {/* Pulsing Golden Sun Halo */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1.2, 1.5, 1.3],
            opacity: [0.3, 0.7, 0.5, 0.8, 0.4],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-indigo-500/30 blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 50, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-lg w-full text-center p-8 sm:p-10 rounded-[32px] glass-panel border border-amber-400/40 shadow-neon-amber z-10 bg-slate-950/80"
        >
          {/* Animated Gold Crown Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-0.5 shadow-neon-amber flex items-center justify-center"
          >
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
              <Unlock className="w-10 h-10 text-amber-400 animate-pulse" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 mb-3 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Capsule Unlocked!
            </span>

            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-2 leading-tight">
              {memory.title || 'A Preserved Moment Awakens'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-light mb-6">
              The wait is over. Your time capsule sealed for future reflection is now officially unlocked and revealed.
            </p>
          </motion.div>

          {/* Photo Preview Frame */}
          {memory.image && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative rounded-2xl overflow-hidden mb-6 border-2 border-amber-400/50 shadow-2xl max-h-52 bg-slate-900"
            >
              <img
                src={memory.image}
                alt={memory.title}
                className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-extrabold text-sm shadow-neon-amber hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <Sun className="w-4 h-4 text-slate-950" />
            Open Memory Reveal Screen
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

UnlockCinematicModal.displayName = 'UnlockCinematicModal';
