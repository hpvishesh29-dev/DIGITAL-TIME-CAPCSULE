import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Trash2, ImagePlus, Sparkles, Lock, Calendar, Video, Film, Eye, Tag } from 'lucide-react';
import { useMemory } from '../../context/MemoryContext';
import { CATEGORIES } from '../../utils/sampleData';
import { api } from '../../services/api';

const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const CreateMemoryModal = memo(() => {
  const { isCreateModalOpen, setIsCreateModalOpen, addMemory } = useMemory();
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Personal');
  const [unlockDate, setUnlockDate] = useState('');

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');

  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const runVisionAnalysis = async (imgDataUrl) => {
    if (!imgDataUrl) return;
    setIsAnalyzing(true);
    try {
      const res = await api.aiAnalyzeImage(imgDataUrl, title || 'Memory');
      if (res?.analysis) {
        setAiAnalysis(res.analysis);
        if (res.analysis.title && (!title || title.startsWith('IMG_'))) {
          setTitle(res.analysis.title);
        }
        if (res.analysis.description && !caption) {
          setCaption(res.analysis.description);
        }
        if (res.analysis.category && res.analysis.category !== 'General') {
          setCategory(res.analysis.category);
        }
      }
    } catch (err) {
      console.warn('Vision analysis fallback notice:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMediaSelect = useCallback(async (file) => {
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setImage(null);
      setPreview('');
      setVideoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      setVideoFile(null);
      setVideoUrl('');

      try {
        const compressedDataUrl = await compressImage(file);
        setImage(file);
        setPreview(compressedDataUrl);
        runVisionAnalysis(compressedDataUrl);
      } catch (err) {
        console.error('Image compression failed, using fallback:', err);
        const reader = new FileReader();
        reader.onload = (evt) => {
          const resUrl = evt.target?.result;
          setImage(file);
          setPreview(resUrl);
          runVisionAnalysis(resUrl);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [title]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleMediaSelect(file);
  }, [handleMediaSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleMediaSelect(file);
  }, [handleMediaSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const clearSelectedMedia = useCallback(() => {
    setImage(null);
    setPreview('');
    setVideoFile(null);
    setVideoUrl('');
    setAiAnalysis(null);
  }, []);

  const handleGenerateTitle = async () => {
    if (!preview && !caption) {
      alert('Please upload an image or enter a description first.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await api.aiAnalyzeImage(preview || null, caption || 'Milestone photo');
      if (res?.analysis?.title) {
        setTitle(res.analysis.title);
      }
    } catch (e) {
      setTitle('Sunset & Milestone Reflections');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateCaption = async () => {
    if (!title && !preview) {
      alert('Please enter a title or upload an image first.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await api.aiAnalyzeImage(preview || null, title || 'Memory caption');
      if (res?.analysis?.description) {
        setCaption(res.analysis.description);
      }
    } catch (e) {
      setCaption('Looking back at this moment captures a timeless chapter in your personal journey.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (!title || (!preview && !image && !videoUrl)) {
      alert('Please add a title and photo or video.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageDataUrl = preview;
      if (!finalImageDataUrl && image) {
        finalImageDataUrl = await compressImage(image);
      }

      if (!finalImageDataUrl && videoUrl) {
        finalImageDataUrl = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80';
      }

      const isLocked = unlockDate && new Date(unlockDate) > new Date();

      await addMemory({
        title,
        caption,
        category,
        unlockDate: unlockDate || null,
        isUnlocked: !isLocked,
        status: isLocked ? 'locked' : 'unlocked',
        image: finalImageDataUrl,
        videoUrl: videoUrl || null,
        objects: aiAnalysis?.objects || ['Photo artifact'],
        people: aiAnalysis?.people || ['Memory subject'],
        scenery: aiAnalysis?.scenery || 'Personal space',
        ocrText: aiAnalysis?.extractedText || '',
        tags: aiAnalysis?.tags || [`#${category}`, '#ChronaVault'],
        mood: aiAnalysis?.mood || '😌 Peaceful',
        confidence: aiAnalysis?.confidence || 0.95,
        aiReflection: aiAnalysis?.aiReflection || {
          emotionalSummary: 'Filled with nostalgia, clarity, and gratitude.',
          nostalgicReflection: 'A moment frozen in time, preserved for future rediscovery.',
          importantObjects: ['Memory artifact'],
          peopleDetected: ['Preserved milestone subject'],
          memorableMoments: ['Sealed into 3D spatial orbit.']
        },
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        timestamp: new Date().toISOString(),
      });

      setTitle('');
      setCaption('');
      setCategory('Personal');
      setUnlockDate('');
      clearSelectedMedia();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save memory.');
    } finally {
      setIsSaving(false);
    }
  }, [title, caption, category, unlockDate, image, preview, videoUrl, aiAnalysis, addMemory, setIsCreateModalOpen, clearSelectedMedia]);

  const handleClose = useCallback(() => {
    setIsCreateModalOpen(false);
  }, [setIsCreateModalOpen]);

  if (!isCreateModalOpen) return null;


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
          initial={{ opacity: 0, scale: 0.88, rotateX: 12, y: 35 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, rotateX: 12, y: 35 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl rounded-[28px] overflow-hidden glass-panel border border-white/20 shadow-glass-glow max-h-[90vh] overflow-y-auto bg-slate-900/90 preserve-3d"
        >
          <button
            onClick={handleClose}
            className="sticky top-4 float-right mr-4 z-30 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors border border-white/10 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 depth-layer-2">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-6">
              Seal New Time Capsule Memory
            </h1>

            {/* Split Side-by-Side Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Media Upload / Preview */}
              <div className="md:col-span-5 flex flex-col h-full">
                <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-cyan-400" />
                  Media Preview (Photo / Video)
                </p>

                {videoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden group shadow-lg flex-1 min-h-[260px] max-h-[360px] bg-black flex items-center justify-center border border-white/10">
                    <video
                      src={videoUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain min-h-[260px] max-h-[360px]"
                    />
                    <button
                      type="button"
                      onClick={clearSelectedMedia}
                      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/80 text-red-400 hover:bg-slate-900 transition-colors shadow-sm border border-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : preview ? (
                  <div className="relative rounded-2xl overflow-hidden group shadow-lg flex-1 min-h-[260px] max-h-[360px] border border-white/10">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover min-h-[260px]" />
                    <button
                      type="button"
                      onClick={clearSelectedMedia}
                      className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-red-400 hover:bg-slate-900 transition-colors shadow-sm border border-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full min-h-[260px] p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      isDragOver
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-white/15 hover:border-indigo-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex gap-2">
                      <ImagePlus className={`w-8 h-8 ${isDragOver ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <Video className={`w-8 h-8 ${isDragOver ? 'text-cyan-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="text-center">
                      <span className={`text-sm font-bold block ${isDragOver ? 'text-indigo-300' : 'text-slate-300'}`}>
                        {isDragOver ? 'Drop photo or video here' : 'Click or drag photo / video here'}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP, MP4, WebM, MOV</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>

              {/* Right Column: Title, Description, Category, Unlock Date & Voice Note */}
              <div className="md:col-span-7 flex flex-col gap-4">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Title</label>
                    <button
                      type="button"
                      onClick={handleGenerateTitle}
                      disabled={isAnalyzing}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                      {isAnalyzing ? 'Analyzing...' : '✨ AI Title'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your memory a title..."
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-slate-950/80 text-white placeholder-slate-500 transition-all text-sm font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300">Description</label>
                    <button
                      type="button"
                      onClick={handleGenerateCaption}
                      disabled={isAnalyzing}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                      {isAnalyzing ? 'Analyzing...' : '✨ AI Caption'}
                    </button>
                  </div>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="What's the story behind this moment?..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-slate-950/80 text-white placeholder-slate-500 transition-all text-sm font-medium resize-none"
                  />
                </div>

                {/* Real Gemini Vision Analysis Preview Badge */}
                {aiAnalysis && (
                  <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-cyan-300">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        Gemini Vision Analysis
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {Math.round((aiAnalysis.confidence || 0.95) * 100)}% Confidence
                      </span>
                    </div>
                    {aiAnalysis.objects?.length > 0 && (
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-slate-200">Objects:</strong> {aiAnalysis.objects.join(', ')}
                      </p>
                    )}
                    {aiAnalysis.people?.length > 0 && (
                      <p className="text-[11px] text-slate-300">
                        <strong className="text-slate-200">People:</strong> {aiAnalysis.people.join(', ')}
                      </p>
                    )}
                    {aiAnalysis.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {aiAnalysis.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Category & Time Capsule Unlock Date Setting */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Category</label>
                    <div className="flex flex-wrap gap-1">
                      {['Personal', ...CATEGORIES].slice(0, 4).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            category === cat
                              ? 'bg-gradient-vibrant text-white shadow-neon-indigo'
                              : 'bg-slate-950/60 text-slate-400 hover:text-white border border-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-cyan-300 mb-1.5 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      Capsule Unlock Date
                    </label>
                    <input
                      type="datetime-local"
                      value={unlockDate}
                      onChange={(e) => setUnlockDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-cyan-500/30 focus:border-cyan-400 bg-slate-950/80 text-white text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving || !title || (!preview && !image && !videoUrl)}
                  whileHover={{ scale: 1.015, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-vibrant text-white font-bold text-sm shadow-neon-indigo hover:shadow-neon-cyan transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                >
                  {isSaving ? 'Sealing Capsule...' : '🔮 Seal Time Capsule'}
                </motion.button>

              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

CreateMemoryModal.displayName = 'CreateMemoryModal';
