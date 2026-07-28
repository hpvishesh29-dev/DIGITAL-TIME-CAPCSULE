import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';
import {
  Globe,
  Sparkles,
  Plus,
  ArrowRight,
  ShieldCheck,
  Brain,
  Mic,
  FileText,
  Lock,
  Search,
  Layers,
  RefreshCw,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  Key,
  Users,
  Heart,
  ChevronDown,
  Github,
  FileCode,
  Mail,
  Shield,
  Award,
  Maximize2,
  Play,
  Pause,
  Upload,
  ImagePlus,
  Eye,
  Film
} from 'lucide-react';

import { useMemory } from '../../context/MemoryContext';
import { scrollState } from '../../utils/scrollState';
import { CATEGORIES } from '../../utils/sampleData';
import { soundEngine } from '../../utils/audio';
import { api } from '../../services/api';

gsap.registerPlugin(ScrollTrigger);

// ──────────────────────────────────────────────────────────────────────────────
// Section 1: Hero Section Component
// ──────────────────────────────────────────────────────────────────────────────
const HeroSection = () => {
  const { memories, setIsCreateModalOpen, setSelectedMemory, setViewMode, setIsAIAssistantOpen } = useMemory();

  const recentMemory = useMemo(() => (memories.length > 0 ? memories[0] : null), [memories]);

  return (
    <section className="scroll-section relative w-full h-screen flex flex-col justify-center items-start px-6 sm:px-12 md:px-16 lg:px-24 z-10 pointer-events-none">
      <div className="max-w-xl w-full pointer-events-auto glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-glass-lg backdrop-blur-2xl ui-depth-card">
        {/* Feature Spotlight Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/40 text-xs font-semibold text-indigo-300 shadow-neon-indigo">
            <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Feature 1 of 8 — Digital Time Vault</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white mb-4 leading-[1.1]">
          Preserve Life's <br />
          <span className="text-gradient-vibrant">Precious Moments</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-300 mb-6 font-light leading-relaxed">
          Explore your personal 3D Earth memory sphere. Store photos, voice notes, and stories sealed in an immutable digital vault.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-white bg-gradient-vibrant shadow-neon-indigo text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Memory
          </motion.button>

          <motion.button
            onClick={() => setViewMode('gallery')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-slate-200 glass-panel hover:border-indigo-400 text-xs sm:text-sm"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            Grid Vault
          </motion.button>

          <motion.button
            onClick={() => setIsAIAssistantOpen(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-cyan-300 glass-panel border border-cyan-500/30 text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            AI Assistant
          </motion.button>
        </div>

        {/* Recent Memory Highlight */}
        {recentMemory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedMemory(recentMemory)}
            className="mt-6 cursor-pointer group block"
          >
            <div className="flex items-center gap-3 p-2 pr-4 rounded-2xl glass-card border border-white/20 hover:border-indigo-500/60 transition-all">
              <img
                src={recentMemory.image || (typeof recentMemory.photo === 'string' ? recentMemory.photo : recentMemory.photo?.url)}
                alt={recentMemory.title}
                className="w-10 h-10 rounded-xl object-cover group-hover:scale-105 transition-transform"
              />
              <div className="text-left flex-1 min-w-0">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Latest Time Capsule</span>
                <p className="font-bold text-xs text-white truncate">{recentMemory.title}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-slate-400 text-xs gap-1 font-semibold animate-bounce pointer-events-auto">
        <span>Scroll to Discover Each Feature</span>
        <ChevronDown className="w-4 h-4 text-cyan-400" />
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Section 2: About Chrona Component
// ──────────────────────────────────────────────────────────────────────────────
const AboutSection = () => {
  const TIMELINE_STEPS = [
    { title: 'Capture Moment', desc: 'Photos, video notes, and voice reflections.', icon: Film },
    { title: 'AI Intelligence', desc: 'Gemini vision & OCR automatic enrichment.', icon: Brain },
    { title: 'Time Lock Vault', desc: 'Encrypted until your designated future date.', icon: Lock },
    { title: 'Legacy Inheritance', desc: 'Passed down securely to family descendants.', icon: Key },
  ];

  return (
    <section className="scroll-section relative w-full h-screen flex flex-col justify-center items-start px-6 sm:px-12 md:px-16 lg:px-24 z-10 pointer-events-none">
      <div className="max-w-xl w-full pointer-events-auto glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-glass-lg backdrop-blur-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Feature 2 of 8 — Intelligent Memory Preservation</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white mb-3 leading-tight">
          Why Digital Memories <br />
          <span className="text-gradient-vibrant">Matter For Eternity</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          Physical photos fade and hard drives degrade. Chrona creates a spatial 3D time vault where memories are enriched with AI perception, locked in time, and preserved for future generations.
        </p>

        {/* Animated Process Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {TIMELINE_STEPS.map((step, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <step.icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{step.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Glass Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10 text-center">
          <div>
            <span className="text-base sm:text-lg font-bold text-cyan-300 font-mono">100%</span>
            <p className="text-[10px] text-slate-400">Encrypted Vault</p>
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-indigo-300 font-mono">AI-Powered</span>
            <p className="text-[10px] text-slate-400">Gemini 1.5 Vision</p>
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-purple-300 font-mono">Eternity</span>
            <p className="text-[10px] text-slate-400">Multi-Generational</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Section 3: Features Component
// ──────────────────────────────────────────────────────────────────────────────
const FeaturesSection = () => {
  const FEATURES = [
    { title: 'AI Memory Analysis', desc: 'Gemini 1.5 detects objects, people, mood & tags.', icon: Brain, color: '#818CF8' },
    { title: 'Voice Memories', desc: 'Record audio reflections with auto AI transcription.', icon: Mic, color: '#38BDF8' },
    { title: 'Smart OCR', desc: 'Extract handwritten letters & document text.', icon: FileText, color: '#C084FC' },
    { title: 'Time Capsules', desc: 'Lock capsules until future milestone dates.', icon: Lock, color: '#F472B6' },
    { title: 'Blockchain Seal', desc: 'Cryptographic hash proof for authenticity.', icon: ShieldCheck, color: '#10B981' },
    { title: 'Instant Search', desc: 'Filter memories across dates & categories.', icon: Search, color: '#F59E0B' },
    { title: 'Spatial Categories', desc: 'Orbiting 3D sphere sorted by life themes.', icon: Layers, color: '#06B6D4' },
    { title: 'Firebase Sync', desc: 'Multi-device cloud synchronization in real-time.', icon: RefreshCw, color: '#6366F1' },
  ];

  return (
    <section className="scroll-section relative w-full h-screen flex flex-col justify-center items-start px-6 sm:px-12 md:px-16 lg:px-24 z-10 pointer-events-none">
      <div className="max-w-2xl w-full pointer-events-auto glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-glass-lg backdrop-blur-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300 mb-3">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Feature 3 of 8 — 8 Core Spatial Vault Capabilities</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-4 leading-tight">
          Next-Gen Technology Built For <br />
          <span className="text-gradient-vibrant">Spatial Memory Preservation</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {FEATURES.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="p-3 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-indigo-400/50 transition-all group cursor-default"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-2 shadow-sm"
                style={{ background: `${feat.color}20`, color: feat.color }}
              >
                <feat.icon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                {feat.title}
              </h4>
              <p className="text-[10px] text-slate-400 leading-tight mt-1">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Section 4: Globe Showcase Component
// ──────────────────────────────────────────────────────────────────────────────
const GlobeShowcaseSection = () => {
  const { memories, activeCategory, setActiveCategory } = useMemory();

  return (
    <section className="scroll-section relative w-full h-screen flex flex-col justify-between items-center p-6 sm:p-12 z-10 pointer-events-none">
      {/* Top Banner Header */}
      <div className="pointer-events-auto glass-panel rounded-full px-6 py-2.5 border border-white/20 shadow-glass-glow flex items-center gap-3">
        <Globe className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
        <span className="text-xs font-bold text-white tracking-wide">Feature 4 of 8 — 3D Interactive Memory Globe</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
          {memories.length} Capsules Orbiting
        </span>
      </div>

      {/* Bottom Category Filter Bar */}
      <div className="pointer-events-auto glass-panel rounded-2xl p-3 border border-white/20 shadow-glass-lg max-w-xl w-full flex flex-wrap items-center justify-center gap-2 mb-6">
        <span className="text-xs font-bold text-slate-300 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" /> Filter:
        </span>
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-gradient-vibrant text-white shadow-neon-indigo'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Section 5: Create Capsule Form Component (with Live 3D Globe Sync!)
// ──────────────────────────────────────────────────────────────────────────────
const CreateCapsuleSection = () => {
  const { addMemory } = useMemory();
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Personal');
  const [unlockDate, setUnlockDate] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scrollState.setPreview({
      title: title || 'New Memory Title',
      category,
      image: previewImage,
      unlockDate,
    });
  }, [title, category, previewImage, unlockDate]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPreviewImage(evt.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;

    setIsSaving(true);
    try {
      const isLocked = unlockDate && new Date(unlockDate) > new Date();

      await addMemory({
        title,
        caption: caption || 'Sealed from storytelling scroll section.',
        category,
        unlockDate: unlockDate || null,
        isUnlocked: !isLocked,
        status: isLocked ? 'locked' : 'unlocked',
        image: previewImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString(),
      });

      soundEngine.playSealSuccess();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);

      setTitle('');
      setCaption('');
      setPreviewImage(null);
      setUnlockDate('');
    } catch (err) {
      console.error('Failed to seal capsule:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="scroll-section relative w-full h-screen flex flex-col justify-center items-start px-6 sm:px-12 md:px-16 lg:px-24 z-10 pointer-events-none">
      <div className="max-w-lg w-full pointer-events-auto glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-glass-lg backdrop-blur-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-3">
          <Plus className="w-3.5 h-3.5 text-cyan-400" />
          <span>Feature 5 of 8 — Live 3D Globe Sync</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-2 leading-tight">
          Create & Live Preview <br />
          <span className="text-gradient-vibrant">On The 3D Globe</span>
        </h2>
        <p className="text-xs text-slate-300 mb-4">
          Type your memory title & category below — watch the 3D globe sync in real time.
        </p>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Time Capsule Sealed!</h4>
            <p className="text-xs text-emerald-300">Your memory is now orbiting on the 3D Earth sphere.</p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Sunset in Santorini"
                className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-slate-950/80 text-white placeholder-slate-500 text-xs font-medium focus:border-cyan-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">Description</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Describe your milestone or memory story..."
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-slate-950/80 text-white placeholder-slate-500 text-xs font-medium focus:border-cyan-400 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-slate-950/80 text-white text-xs font-medium focus:border-cyan-400 outline-none"
                >
                  {['Personal', ...CATEGORIES].map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-cyan-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-cyan-400" /> Unlock Date
                </label>
                <input
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-slate-950/80 text-white text-xs font-mono outline-none"
                />
              </div>
            </div>

            {/* Media Upload Trigger */}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-2.5 rounded-xl border border-dashed border-white/20 bg-slate-950/60 hover:bg-slate-800 text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition-all"
              >
                <ImagePlus className="w-4 h-4 text-cyan-400" />
                {previewImage ? 'Photo Attached (Change)' : 'Attach Photo / Memory Image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSaving || !title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 rounded-xl bg-gradient-vibrant text-white font-bold text-xs shadow-neon-indigo disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? 'Sealing Capsule...' : '🔮 Seal Time Capsule'}
            </motion.button>
          </form>
        )}
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Section 6: AI Assistant Showcase Component
// ──────────────────────────────────────────────────────────────────────────────
const AIAssistantSection = () => {
  const { memories } = useMemory();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hello! I am Chrona Gemini AI. I have reviewed your ${memories.length} preserved time capsules. How can I help you reflect on your memories today?` },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text || !text.trim()) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setIsGenerating(true);

    try {
      const data = await api.aiChat(text, messages, memories);
      const aiReply = data?.response || `I have analyzed your spatial vault. Your memories span ${memories.length} preserved time capsules with vivid emotional depth.`;
      setMessages((prev) => [...prev, { role: 'assistant', text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Chrona AI Insight: Preserving ${memories.length} spatial memories creates an enduring personal legacy across generations.` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="scroll-section relative w-full h-screen flex flex-col justify-center items-end px-6 sm:px-12 md:px-16 lg:px-24 z-10 pointer-events-none">
      <div className="max-w-lg w-full pointer-events-auto glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-glass-lg backdrop-blur-2xl flex flex-col h-[65vh]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-vibrant flex items-center justify-center shadow-neon-indigo">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Feature 6 of 8 — Gemini AI Assistant</h3>
              <p className="text-[10px] text-cyan-400 font-mono">Spatial Vault Active</p>
            </div>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-vibrant text-white rounded-br-md shadow-neon-indigo'
                    : 'bg-slate-950/80 text-slate-200 border border-white/10 rounded-bl-md'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-slate-950/80 text-cyan-300 px-3.5 py-2 rounded-2xl border border-white/10 text-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>Analyzing spatial memories...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your spatial memories..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-white/15 bg-slate-950/90 text-white placeholder-slate-400 text-xs font-medium focus:border-cyan-400 outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={isGenerating || !input.trim()}
              className="px-3.5 py-2 rounded-xl bg-gradient-vibrant text-white hover:shadow-neon-cyan transition-all disabled:opacity-50 flex items-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {['🔮 Summarize vault', '✨ Analyze mood', '🌌 Life recap'].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-white/10 text-[10px] text-slate-300 hover:text-white hover:border-cyan-400 shrink-0 font-medium"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Section 7: Unlock Timeline Component
// ──────────────────────────────────────────────────────────────────────────────
const UnlockTimelineSection = () => {
  const { memories, setCinematicUnlockedMemory } = useMemory();

  const lockedMemories = useMemo(() => {
    return memories.filter((m) => m.unlockDate && new Date(m.unlockDate) > new Date());
  }, [memories]);

  const handleSimulateUnlock = (memory) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    soundEngine.playSealSuccess();
    setCinematicUnlockedMemory(memory);
  };

  return (
    <section className="scroll-section relative w-full h-screen flex flex-col justify-center items-start px-6 sm:px-12 md:px-16 lg:px-24 z-10 pointer-events-none">
      <div className="max-w-xl w-full pointer-events-auto glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-glass-lg backdrop-blur-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300 mb-3">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Feature 7 of 8 — Time-Lock Vault</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-2 leading-tight">
          Milestone Time Locking <br />
          <span className="text-gradient-vibrant">& Golden Particle Unlock</span>
        </h2>
        <p className="text-xs text-slate-300 mb-4">
          Capsules remain securely encrypted until target unlock dates. Experience the golden aura unlock sequence.
        </p>

        {/* Locked Capsules List */}
        <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1 mb-4">
          {lockedMemories.length > 0 ? (
            lockedMemories.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{m.title}</h4>
                    <p className="text-[10px] text-cyan-300 font-mono mt-0.5">
                      Unlocks: {new Date(m.unlockDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSimulateUnlock(m)}
                  className="px-3 py-1.5 rounded-xl bg-gradient-vibrant text-white text-[11px] font-bold shadow-neon-indigo shrink-0"
                >
                  ✨ Test Unlock
                </motion.button>
              </div>
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 text-center space-y-2">
              <Clock className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
              <p className="text-xs font-bold text-white">All Capsules Currently Unlocked</p>
              <p className="text-[11px] text-slate-400">Set a future unlock date when creating a memory to test time-locking.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Section 8: Digital Legacy Component
// ──────────────────────────────────────────────────────────────────────────────
const DigitalLegacySection = () => {
  const LEGACY_NODES = [
    { title: 'Passkey Vault', desc: 'Encrypted master key inheritance.', icon: Key, color: '#38BDF8' },
    { title: 'Descendant Access', desc: 'Secure family tree memory transfer.', icon: Users, color: '#C084FC' },
    { title: 'Generational Archive', desc: 'Decades of personal life stories.', icon: Heart, color: '#F472B6' },
  ];

  return (
    <section className="scroll-section relative w-full h-screen flex flex-col justify-center items-start px-6 sm:px-12 md:px-16 lg:px-24 z-10 pointer-events-none">
      <div className="max-w-xl w-full pointer-events-auto glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-glass-lg backdrop-blur-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Feature 8 of 8 — Multi-Generational Legacy</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white mb-3 leading-tight">
          Your Digital Legacy <br />
          <span className="text-gradient-vibrant">For Future Descendants</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          Ensure your life stories, audio voices, and milestone wisdom live on. Grant key inheritance access to children, family, and future generations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LEGACY_NODES.map((node) => (
            <div key={node.title} className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 text-center space-y-2">
              <div
                className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center shadow-md"
                style={{ background: `${node.color}20`, color: node.color }}
              >
                <node.icon className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-white">{node.title}</h4>
              <p className="text-[10px] text-slate-400 leading-snug">{node.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Section 9: Footer Component
// ──────────────────────────────────────────────────────────────────────────────
const FooterSection = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="scroll-section relative w-full h-screen flex flex-col justify-between items-center p-6 sm:p-12 z-10 pointer-events-none">
      <div className="w-full max-w-4xl pointer-events-auto glass-panel rounded-3xl p-6 sm:p-10 border border-white/20 shadow-glass-lg backdrop-blur-2xl my-auto text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-vibrant mx-auto flex items-center justify-center shadow-neon-indigo">
          <span className="text-white font-extrabold text-xl font-display">C</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
          Chrona <span className="text-gradient-vibrant">Digital Time Capsule</span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          The future of spatial memory preservation. Built with React, Three.js, GSAP ScrollTrigger, and Gemini AI.
        </p>

        {/* Footer Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-300 pt-2 border-t border-white/10">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
          <a
            href="#docs"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
          >
            <FileCode className="w-4 h-4" /> Documentation
          </a>
          <a
            href="#contact"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
          >
            <Mail className="w-4 h-4" /> Contact Support
          </a>
          <a
            href="#privacy"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
          >
            <Shield className="w-4 h-4" /> Privacy & Encryption
          </a>
        </div>

        {/* Back To Top Button */}
        <motion.button
          onClick={scrollToTop}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-vibrant text-white font-bold text-xs shadow-neon-indigo hover:shadow-neon-cyan transition-all"
        >
          <span>Return To Beginning</span>
          <ChevronDown className="w-4 h-4 rotate-180" />
        </motion.button>

        <p className="text-[10px] text-slate-500 font-mono pt-2">
          © {new Date().getFullYear()} Chrona Spatial AI. All rights reserved.
        </p>
      </div>
    </section>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Main Container & GSAP ScrollTrigger Controller
// ──────────────────────────────────────────────────────────────────────────────
export const ScrollExperience = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const sections = gsap.utils.toArray('.scroll-section');

    const ctx = gsap.context(() => {
      sections.forEach((section, index) => {
        const targetY = (index * Math.PI) / 3; // 0, 60deg, 120deg, 180deg, 240deg, 300deg, 360deg, 420deg, 480deg

        // Moderated camera zoom distance & globe scale for detailed, crisp presentation
        let camZ = 9.2;
        let camX = 0;
        let camY = 0;
        let scale = 0.85;

        if (index === 0) { camZ = 9.2; camX = 0; scale = 0.85; }
        else if (index === 1) { camZ = 9.0; camX = 0.4; scale = 0.86; }
        else if (index === 2) { camZ = 9.2; camX = -0.4; scale = 0.85; }
        else if (index === 3) { camZ = 7.8; camX = 0; scale = 1.05; } // Globe Showcase - tasteful zoom
        else if (index === 4) { camZ = 8.8; camX = -1.2; scale = 0.88; } // Create Capsule - Earth shifts right
        else if (index === 5) { camZ = 8.8; camX = 1.0; scale = 0.88; }  // AI Assistant - Earth shifts left
        else if (index === 6) { camZ = 8.8; camX = -0.5; scale = 0.88; } // Unlock Timeline
        else if (index === 7) { camZ = 8.8; camX = 0.4; scale = 0.88; }  // Digital Legacy
        else if (index === 8) { camZ = 9.2; camX = 0; scale = 0.85; }   // Footer

        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          scrub: 0.8,
          onEnter: () => {
            scrollState.setActiveSection(index);
            gsap.to(scrollState, {
              rotationY: targetY,
              cameraZ: camZ,
              cameraX: camX,
              cameraY: camY,
              earthScale: scale,
              duration: 1.2,
              ease: 'power2.out',
            });
          },
          onEnterBack: () => {
            scrollState.setActiveSection(index);
            gsap.to(scrollState, {
              rotationY: targetY,
              cameraZ: camZ,
              cameraX: camX,
              cameraY: camY,
              earthScale: scale,
              duration: 1.2,
              ease: 'power2.out',
            });
          },
        });
      });

      // GSAP Snap across sections
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        snap: {
          snapTo: 1 / (sections.length - 1),
          duration: { min: 0.4, max: 0.8 },
          delay: 0.1,
          ease: 'power2.inOut',
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <GlobeShowcaseSection />
      <CreateCapsuleSection />
      <AIAssistantSection />
      <UnlockTimelineSection />
      <DigitalLegacySection />
      <FooterSection />
    </div>
  );
};
