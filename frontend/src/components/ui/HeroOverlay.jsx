import React, { useMemo, useCallback, memo, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, FolderHeart, ArrowRight, Globe, Eye, EyeOff } from 'lucide-react';
import { useMemory } from '../../context/MemoryContext';

const BackgroundParticles = memo(() => {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        size: 3 + Math.random() * 6,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 14 + Math.random() * 12,
        delay: Math.random() * 4,
        color: ['rgba(99, 102, 241, 0.3)', 'rgba(168, 85, 247, 0.28)', 'rgba(6, 182, 212, 0.28)'][i % 3],
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: p.color,
            boxShadow: `0 0 16px ${p.color}`,
            filter: 'blur(2px)',
          }}
          animate={{
            y: [0, -45, 0],
            x: [0, 18, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
});

BackgroundParticles.displayName = 'BackgroundParticles';

export const HeroOverlay = memo(() => {
  const { memories, setIsCreateModalOpen, setSelectedMemory, setViewMode } = useMemory();
  const [isUIMinimized, setIsUIMinimized] = useState(false);

  // Mouse 3D Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-300, 300], [8, -8]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-10, 10]), { stiffness: 120, damping: 18 });

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const handleCreateMemory = useCallback(() => {
    setIsCreateModalOpen(true);
  }, [setIsCreateModalOpen]);

  const recentMemory = useMemo(
    () => (memories.length > 0 ? memories[0] : null),
    [memories]
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-10 pointer-events-none w-full h-full flex flex-col justify-center items-start p-4 sm:p-8 md:p-12 lg:pl-16 xl:pl-24 overflow-hidden perspective-1000"
    >
      <BackgroundParticles />

      {/* Floating Toggle Full Globe Button */}
      <motion.button
        onClick={() => setIsUIMinimized(!isUIMinimized)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 z-40 pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel border border-cyan-500/40 text-xs font-bold text-cyan-300 shadow-neon-cyan hover:border-cyan-400 transition-all"
      >
        {isUIMinimized ? (
          <>
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Show Overlay</span>
          </>
        ) : (
          <>
            <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Full 3D Globe Mode</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {!isUIMinimized && (
          <motion.div
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            initial={{ opacity: 0, x: -50, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.92 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-left max-w-lg w-full pointer-events-auto relative z-20 glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-glass-lg ui-depth-card backdrop-blur-2xl"
          >
            {/* Glow Tag Pill */}
            <div className="flex items-center justify-between gap-3 mb-5 depth-layer-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/40 text-xs font-semibold text-indigo-300 shadow-neon-indigo">
                <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Photorealistic Spatial Vault</span>
              </div>
              <button
                onClick={() => setIsUIMinimized(true)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Hide UI card to view globe"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>

            {/* Hero Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white mb-4 leading-[1.1] depth-layer-3">
              Preserve Life's <br />
              <span className="text-gradient-vibrant">Precious Moments</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 mb-8 font-light leading-relaxed depth-layer-2">
              Explore your personal 3D Earth memory sphere. Store photos, audio notes, and stories in a luminous spatial vault.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 depth-layer-3">
              <motion.button
                onClick={handleCreateMemory}
                whileHover={{ scale: 1.05, y: -2, z: 15 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white bg-gradient-vibrant shadow-neon-indigo hover:shadow-neon-cyan transition-all text-xs sm:text-sm"
              >
                <Plus className="w-4.5 h-4.5" />
                Create Memory
              </motion.button>

              <motion.button
                onClick={() => setViewMode('gallery')}
                whileHover={{ scale: 1.05, y: -2, z: 15 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-slate-200 glass-panel hover:bg-slate-800/90 hover:text-white hover:border-indigo-400/60 transition-all text-xs sm:text-sm"
              >
                <FolderHeart className="w-4 h-4 text-cyan-400" />
                Open Vault
              </motion.button>
            </div>

            {/* Recent Memory Floating Card */}
            {recentMemory && (recentMemory.image || recentMemory.photo) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                onClick={() => setSelectedMemory(recentMemory)}
                className="mt-8 pointer-events-auto cursor-pointer group block depth-layer-3"
              >
                <div className="flex items-center gap-3 p-2 pr-5 rounded-2xl glass-card border border-white/20 hover:border-indigo-500/60 hover:shadow-glass-glow transition-all duration-300">
                  <img
                    src={recentMemory.image || (typeof recentMemory.photo === 'string' ? recentMemory.photo : recentMemory.photo?.url)}
                    alt={recentMemory.title}
                    className="w-11 h-11 rounded-xl object-cover group-hover:scale-110 transition-transform duration-300 shadow-md"
                    loading="lazy"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Recent Moment</span>
                    <p className="font-bold text-xs text-white truncate">{recentMemory.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1.5 transition-all ml-1" />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

HeroOverlay.displayName = 'HeroOverlay';