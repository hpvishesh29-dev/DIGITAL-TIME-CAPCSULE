import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Download, Trash2, Tag, Sparkles, FileText, Lock, Unlock, Film, Video } from 'lucide-react';
import { useMemory } from '../../context/MemoryContext';
import { api } from '../../services/api';

export const MemoryModal = memo(() => {
  const { selectedMemory, setSelectedMemory, deleteMemory } = useMemory();
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (!selectedMemory) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemory]);

  const handleClose = useCallback(() => {
    setSelectedMemory(null);
  }, [setSelectedMemory]);

  const handleDelete = useCallback(async () => {
    if (!selectedMemory?.id) return;
    if (!window.confirm('Are you sure you want to delete this memory?')) return;

    try {
      await deleteMemory(selectedMemory.id);
      handleClose();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete memory.');
    }
  }, [selectedMemory, deleteMemory, handleClose]);

  const handleDownloadImage = useCallback(() => {
    if (!selectedMemory?.image && !selectedMemory?.videoUrl) return;
    const link = document.createElement('a');
    link.href = selectedMemory?.videoUrl || selectedMemory?.image || '';
    link.download = `${selectedMemory?.title || 'memory'}.${selectedMemory?.videoUrl ? 'mp4' : 'jpg'}`;
    link.click();
  }, [selectedMemory]);

  const handleExportFormat = async (format) => {
    if (!selectedMemory?.id) return;
    setShowExportMenu(false);
    setIsExporting(true);
    try {
      const blob = await api.downloadExport(format, [selectedMemory.id]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Chrona_Memory_${selectedMemory.id}.${format === 'markdown' ? 'md' : format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Backend export fallback:', err);
      handleDownloadImage();
    } finally {
      setIsExporting(false);
    }
  };


  if (!selectedMemory) return null;

  const memoryDate = selectedMemory?.date ||
    (selectedMemory?.createdAt ? new Date(selectedMemory.createdAt).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    }) : '');

  const unlockFormatted = selectedMemory?.unlockDate
    ? new Date(selectedMemory.unlockDate).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const isLocked = Boolean(unlockFormatted && selectedMemory?.unlockDate && new Date(selectedMemory.unlockDate) > new Date());
  const videoMedia = selectedMemory?.videoUrl || selectedMemory?.video;
  const photoSrc = selectedMemory?.image || (typeof selectedMemory?.photo === 'string' ? selectedMemory.photo : selectedMemory?.photo?.url);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 perspective-1000"
        style={{
          background: 'rgba(5, 8, 16, 0.78)',
          backdropFilter: 'blur(20px)',
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, rotateX: 10, y: 30 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, rotateX: 10, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl rounded-[28px] overflow-hidden glass-panel border border-white/20 shadow-glass-glow preserve-3d"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-white/10 shadow-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row max-h-[85vh]">
            {/* Media Column (Photo or Video) */}
            <div className="md:w-3/5 bg-slate-950/90 overflow-hidden relative flex items-center justify-center depth-layer-2 min-h-[260px]">
              {videoMedia ? (
                <video
                  src={videoMedia}
                  controls
                  playsInline
                  className="w-full h-full object-contain max-h-[80vh] shadow-2xl"
                />
              ) : (
                <img
                  src={photoSrc || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80'}
                  alt={selectedMemory?.title || 'Memory'}
                  className="w-full h-full object-cover min-h-[240px] md:min-h-0 shadow-2xl"
                  loading="lazy"
                />
              )}
            </div>

            {/* Info Column */}
            <div className="md:w-2/5 p-6 sm:p-8 overflow-y-auto flex flex-col bg-slate-900/90 depth-layer-3">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white mb-2 leading-tight">
                  {selectedMemory?.title || 'Untitled Memory'}
                </h1>

                {memoryDate && (
                  <p className="text-xs text-slate-400 flex items-center gap-2 mb-3 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Created: {memoryDate}
                  </p>
                )}

                {/* Time Capsule Lock Status */}
                {unlockFormatted && (
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold mb-4 ${
                      isLocked
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isLocked ? `Locked until ${unlockFormatted}` : `Unlocked on ${unlockFormatted}`}</span>
                  </div>
                )}

                {selectedMemory?.caption && (
                  <p className="text-sm text-slate-300 leading-relaxed mb-5 font-light">
                    {selectedMemory.caption}
                  </p>
                )}

                {selectedMemory?.category && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-5 shadow-neon-indigo">
                    <Tag className="w-3 h-3 text-cyan-400" />
                    {selectedMemory.category}
                  </div>
                )}

                {/* Item 2: AI Reflection Glassmorphism Card */}
                <div className="mb-5 p-4 rounded-2xl glass-panel bg-gradient-to-br from-indigo-950/60 via-slate-950/80 to-purple-950/50 border border-indigo-500/30 shadow-glass-glow">
                  <p className="text-xs font-bold text-cyan-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                      AI Reflection
                    </span>
                    <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                      Confidence: {Math.round((selectedMemory?.confidence || 0.95) * 100)}%
                    </span>
                  </p>
                  
                  <div className="space-y-2 text-xs text-slate-300 font-light">
                    <p>
                      <strong className="text-indigo-300 font-medium">Emotional Tone:</strong>{' '}
                      {selectedMemory?.aiReflection?.emotionalSummary || selectedMemory?.mood || '😌 Peaceful, inspiring, and reflective.'}
                    </p>
                    <p>
                      <strong className="text-cyan-300 font-medium">Nostalgic Reflection:</strong>{' '}
                      {selectedMemory?.aiReflection?.nostalgicReflection || selectedMemory?.aiSummary || 'Looking back at this moment captures a timeless chapter in your journey.'}
                    </p>
                    {selectedMemory?.objects && selectedMemory.objects.length > 0 && (
                      <p>
                        <strong className="text-slate-200 font-medium">Key Objects:</strong>{' '}
                        {Array.isArray(selectedMemory.objects) ? selectedMemory.objects.join(', ') : selectedMemory.objects}
                      </p>
                    )}
                    {selectedMemory?.people && selectedMemory.people.length > 0 && (
                      <p>
                        <strong className="text-slate-200 font-medium">People Detected:</strong>{' '}
                        {Array.isArray(selectedMemory.people) ? selectedMemory.people.join(', ') : selectedMemory.people}
                      </p>
                    )}
                  </div>
                </div>

                {/* Item 11: AI Time Letter (if unlocked) */}
                {!isLocked && (
                  <div className="mb-5 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 shadow-md">
                    <p className="text-xs font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      AI Time Letter from the Past
                    </p>
                    <p className="text-xs text-amber-100/90 italic leading-relaxed font-serif">
                      "Dear Future Me... Two years ago when this moment was recorded, life was moving forward with purpose. Today, as you unlock this time capsule, remember the clarity, hope, and determination that built this memory."
                    </p>
                  </div>
                )}

                {/* Item 9: Memory Timeline */}
                <div className="mb-5 p-3 rounded-2xl bg-slate-950/60 border border-white/10">
                  <p className="text-xs font-bold text-slate-300 mb-2">Memory Timeline</p>
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span className="text-indigo-400">Created</span>
                    <span>↓</span>
                    <span className={isLocked ? 'text-amber-400' : 'text-slate-500'}>Locked</span>
                    <span>↓</span>
                    <span className={!isLocked ? 'text-emerald-400 font-bold' : 'text-slate-500'}>Unlocked</span>
                    <span>↓</span>
                    <span className="text-cyan-400">Today</span>
                  </div>
                </div>

                {/* Item 18: Memory Statistics */}
                <div className="mb-5 p-3 rounded-2xl bg-slate-950/60 border border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">AI Confidence</span>
                    <span className="font-bold text-cyan-400">{Math.round((selectedMemory?.confidence || 0.95) * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <span className={`font-bold ${isLocked ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {isLocked ? '🔒 Locked' : '✨ Unlocked'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Objects Count</span>
                    <span className="font-bold text-white">
                      {Array.isArray(selectedMemory?.objects) ? selectedMemory.objects.length : 2} items
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Multi-format Export Dropdown */}
              <div className="flex gap-2.5 pt-4 border-t border-white/10 mt-auto relative">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert('Memory link copied to clipboard!');
                  }}
                  className="px-3 py-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors text-xs font-bold border border-indigo-500/30 shadow-sm"
                  title="Copy Link"
                >
                  🔗 Share
                </button>

                <div className="flex-1 relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={isExporting}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 border border-white/10 shadow-sm"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    {isExporting ? 'Exporting...' : 'Export'}
                  </button>

                  {showExportMenu && (
                    <div className="absolute bottom-12 left-0 w-full glass-panel rounded-2xl p-1.5 shadow-glass-dark border border-white/20 z-50 space-y-1 bg-slate-900/95">
                      <button
                        onClick={() => handleExportFormat('pdf')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-400" /> PDF Document
                      </button>
                      <button
                        onClick={() => handleExportFormat('zip')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" /> ZIP Archive
                      </button>
                      <button
                        onClick={() => handleExportFormat('markdown')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Tag className="w-3.5 h-3.5 text-indigo-400" /> Markdown (.md)
                      </button>
                      <button
                        onClick={() => handleExportFormat('json')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> JSON Manifest
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors text-xs font-bold flex items-center justify-center gap-2 border border-red-500/30 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

MemoryModal.displayName = 'MemoryModal';
