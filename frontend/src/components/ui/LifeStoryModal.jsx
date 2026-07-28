import React, { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, BookOpen, Download, Share2, Compass } from 'lucide-react';
import { useMemory } from '../../context/MemoryContext';
import { api } from '../../services/api';

export const LifeStoryModal = memo(({ isOpen, onClose }) => {
  const { memories } = useMemory();
  const [storyText, setStoryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStory = async () => {
      setIsLoading(true);
      try {
        const res = await api.aiGenerateStory(memories);
        if (res?.story) {
          setStoryText(res.story);
        }
      } catch (err) {
        console.warn('AI Story fallback:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStory();
  }, [isOpen, memories]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        style={{
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(20px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl rounded-[28px] glass-panel border border-indigo-500/30 shadow-glass-glow bg-slate-950/90 max-h-[85vh] flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-vibrant text-white shadow-neon-indigo">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-extrabold text-white flex items-center gap-2">
                  AI Life Story Narrative
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                </h2>
                <p className="text-xs text-slate-400">Synthesizing your preserved memories into a seamless timeline narrative</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-slate-200 leading-relaxed font-light text-sm space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-slate-300 animate-pulse">
                  Chrona AI is weaving your memories into a story...
                </p>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none space-y-4">
                {storyText.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('#')) {
                    return (
                      <h3 key={idx} className="text-lg font-bold text-cyan-300 mt-4 mb-2 border-b border-white/10 pb-1">
                        {paragraph.replace(/^#+\s*/, '')}
                      </h3>
                    );
                  }
                  return (
                    <p key={idx} className="text-slate-300 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Generated from {memories.length} preserved time capsules
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(storyText);
                  alert('Story copied to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-500/30 transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Copy Story
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

LifeStoryModal.displayName = 'LifeStoryModal';
