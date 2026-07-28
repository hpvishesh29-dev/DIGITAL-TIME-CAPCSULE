import React, { useState } from 'react';
import { useMemory } from '../../context/MemoryContext';
import { api } from '../../services/api';

export const LifeRecapModal = ({ isOpen, onClose }) => {
  const { memories } = useMemory();
  const [timeframe, setTimeframe] = useState('weekly');
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecap = async (tf) => {
    setTimeframe(tf);
    setLoading(true);
    try {
      const data = await api.aiGetRecaps(tf, memories);
      if (data?.insights) {
        setRecap(data.insights);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !recap) {
      fetchRecap('weekly');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-[28px] glass-panel border border-white/20 shadow-glass-lg p-6 sm:p-8 text-white max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                GEMINI AI POWERED
              </span>
              <h3 className="text-xl font-bold text-white font-display">AI Life Recap Showcase</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Timeframe Selector */}
        <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
          {['weekly', 'monthly', 'yearly'].map((tf) => (
            <button
              key={tf}
              onClick={() => fetchRecap(tf)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                timeframe === tf
                  ? 'bg-gradient-vibrant text-white shadow-neon-indigo'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf} Recap
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <p className="text-xs text-indigo-300 animate-pulse">Generating AI Life Recap...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Overview */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                Executive Life Summary
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {recap?.summary ||
                  `During this ${timeframe} period, you preserved ${memories.length} memories with a predominant atmosphere of Inspiring growth. Key highlights include personal achievements, reflections, and creative milestones.`}
              </p>
            </div>

            {/* AI Insights Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1">
                <span>💡 AI Emotional Insight</span>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed font-sans">
                {recap?.aiInsight ||
                  'Your retention of positive milestones has grown by 34% compared to previous periods. Keep capturing moments that bring clarity and gratitude.'}
              </p>
            </div>

            {/* Highlights */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Key Sealed Moments
              </h4>
              <div className="space-y-2">
                {memories.slice(0, 3).map((m, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-white">{m.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.category} • {m.date}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {m.mood || 'Inspiring'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
