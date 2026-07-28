import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, SkipBack, Music, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useMemory } from '../../context/MemoryContext';
import { soundEngine } from '../../utils/audio';

export const ReplaySlideshowModal = memo(({ isOpen, onClose }) => {
  const { filteredMemories } = useMemory();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef(null);

  const activeMemory = filteredMemories?.[currentIndex];

  useEffect(() => {
    if (!isOpen || !isPlaying || !filteredMemories?.length) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredMemories.length);
    }, 5000);

    return () => clearInterval(timerRef.current);
  }, [isOpen, isPlaying, filteredMemories?.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Space') setIsPlaying((p) => !p);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredMemories?.length]);

  if (!isOpen || !filteredMemories?.length) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredMemories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredMemories.length) % filteredMemories.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col justify-between bg-black text-white p-6 overflow-hidden select-none"
      >
        {/* Background Ambient Blur Image */}
        {activeMemory?.image && (
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 transform scale-110 transition-all duration-1000"
            style={{ backgroundImage: `url(${activeMemory.image})` }}
          />
        )}

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 shadow-neon-indigo">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Replay Mode
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentIndex + 1} / {filteredMemories.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Slideshow Image & Caption */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMemory?.id || currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8 }}
              className="relative max-w-4xl max-h-[65vh] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-slate-950 flex items-center justify-center"
            >
              <img
                src={activeMemory?.image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'}
                alt={activeMemory?.title}
                className="w-full h-full object-contain max-h-[65vh]"
              />
            </motion.div>
          </AnimatePresence>

          <motion.div
            key={`caption-${currentIndex}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center max-w-xl"
          >
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white mb-1">
              {activeMemory?.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light line-clamp-2">
              {activeMemory?.caption || activeMemory?.description}
            </p>
          </motion.div>
        </div>

        {/* Controls Bar */}
        <div className="relative z-10 flex items-center justify-between max-w-md mx-auto w-full p-3 rounded-2xl glass-panel border border-white/15 bg-slate-900/80 shadow-2xl">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-gradient-vibrant text-white shadow-neon-indigo hover:scale-105 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-400 px-2">
            {activeMemory?.category || 'Memory'}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

ReplaySlideshowModal.displayName = 'ReplaySlideshowModal';
