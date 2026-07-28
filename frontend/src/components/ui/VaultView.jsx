import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SortAsc, SortDesc, Grid3X3, Sparkles, Video, Filter, Folder, Lock, Unlock, MapPin, Tag, Calendar } from 'lucide-react';
import { useMemory } from '../../context/MemoryContext';

const MemoryCard = memo(({ memory, onOpen, index }) => {
  const hasVideo = Boolean(memory.videoUrl || memory.video);
  const isLocked = memory.unlockDate && new Date(memory.unlockDate) > new Date() && !memory.isUnlocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.025 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpen(memory)}
      className={`group relative rounded-2xl overflow-hidden glass-card cursor-pointer p-2.5 border transition-all duration-300 ui-depth-card preserve-3d ${
        isLocked
          ? 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-neon-cyan'
          : 'border-amber-400/40 hover:border-amber-400 hover:shadow-neon-amber'
      }`}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-xl relative depth-layer-2 shadow-md">
        <img
          src={memory.image || (typeof memory.photo === 'string' ? memory.photo : memory.photo?.url)}
          alt={memory.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Media & Lock Badges */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {isLocked ? (
            <span className="p-1.5 rounded-lg bg-amber-500/80 text-slate-950 border border-amber-400 backdrop-blur-md shadow-md" title="Locked Time Capsule">
              <Lock className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span className="p-1.5 rounded-lg bg-emerald-500/80 text-slate-950 border border-emerald-400 backdrop-blur-md shadow-md" title="Unlocked Memory">
              <Unlock className="w-3.5 h-3.5" />
            </span>
          )}
          {hasVideo && (
            <span className="p-1.5 rounded-lg bg-slate-900/80 text-cyan-400 border border-white/10 backdrop-blur-md shadow-md" title="Has Video">
              <Video className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3.5">
          <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-light">{memory.caption || memory.description}</p>
        </div>
      </div>

      <div className="p-3 depth-layer-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
            {memory.title}
          </h3>
          {memory.category && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/25 text-[10px] font-bold text-indigo-300 border border-indigo-500/40 flex-shrink-0 shadow-sm">
              {memory.category}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>{memory.date || memory.createdDate || 'Saved Memory'}</span>
          {memory.location && (
            <span className="flex items-center gap-1 text-[10px] text-cyan-400">
              <MapPin className="w-3 h-3" /> {typeof memory.location === 'object' ? (memory.location.name || memory.location.city || '') : memory.location}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

MemoryCard.displayName = 'MemoryCard';

export const VaultView = memo(() => {
  const { memories, setSelectedMemory } = useMemory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAlbum, setSelectedAlbum] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [sortOrder, setSortOrder] = useState('newest');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  const collections = ['All', 'Travel', 'College', 'Family', 'Friends', 'Work'];

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(memories.map(m => m.category || 'Personal'))];
    return cats;
  }, [memories]);

  const filteredMemories = useMemo(() => {
    let result = memories.filter(m => {
      const q = searchTerm.toLowerCase();
      const locStr = typeof m.location === 'object' ? (m.location?.name || m.location?.city || '') : (m.location || '');

      // Universal AI Search across all fields (Item 8)
      const matchesSearch = !searchTerm ||
        (m.title || '').toLowerCase().includes(q) ||
        (m.caption || '').toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q) ||
        (m.ocrText || '').toLowerCase().includes(q) ||
        locStr.toLowerCase().includes(q) ||
        (m.mood || '').toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q) ||
        (m.tags ? m.tags.some(t => t.toLowerCase().includes(q)) : false);

      const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
      const matchesAlbum = selectedAlbum === 'All' || m.category === selectedAlbum;

      const isLocked = m.unlockDate && new Date(m.unlockDate) > new Date() && !m.isUnlocked;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'locked' && isLocked) ||
        (statusFilter === 'unlocked' && !isLocked);

      return matchesSearch && matchesCategory && matchesAlbum && matchesStatus;
    });

    if (sortOrder === 'oldest') {
      result = [...result].reverse();
    } else if (sortOrder === 'alpha') {
      result = [...result].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [memories, searchTerm, selectedCategory, selectedAlbum, statusFilter, sortOrder]);

  const handleMemoryOpen = useCallback((memory) => {
    setSelectedMemory(memory);
  }, [setSelectedMemory]);

  const toggleSort = useCallback(() => {
    setSortOrder(prev => {
      if (prev === 'newest') return 'oldest';
      if (prev === 'oldest') return 'alpha';
      return 'newest';
    });
  }, []);

  const sortLabel = sortOrder === 'newest' ? 'Newest' : sortOrder === 'oldest' ? 'Oldest' : 'A-Z';

  return (
    <div className="relative z-10 w-full min-h-screen pt-28 pb-16 perspective-1000">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-3 shadow-neon-indigo">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Spatial Collection & Vault</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Memory Vault
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Showing <span className="font-bold text-white">{filteredMemories.length}</span> preserved {filteredMemories.length === 1 ? 'moment' : 'moments'}
          </p>
        </motion.div>

        {/* Collections / Albums Bar (Item 25) */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5 text-amber-400" /> Memory Collections & Albums
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {collections.map(album => (
              <button
                key={album}
                onClick={() => setSelectedAlbum(album)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedAlbum === album
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-neon-amber'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                <Folder className="w-3 h-3" /> {album}
              </button>
            ))}
          </div>
        </div>

        {/* Universal AI Search & Filter Controls (Item 8 & 26) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6 flex flex-col sm:flex-row gap-3"
        >
          {/* Universal AI Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-pulse" />
            <input
              type="text"
              placeholder="AI Search across titles, captions, voice transcripts, OCR text, tags, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/15 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none bg-slate-900/80 backdrop-blur-xl text-white placeholder-slate-500 transition-all text-sm font-medium shadow-glass-dark"
            />
          </div>

          {/* Status Filter Buttons (Item 26) */}
          <div className="flex rounded-2xl bg-slate-900/80 p-1 border border-white/10">
            {['all', 'unlocked', 'locked'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-gradient-vibrant text-white shadow-neon-indigo'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort Button */}
          <button
            onClick={toggleSort}
            className="px-4 py-3 rounded-2xl border border-white/15 bg-slate-900/80 backdrop-blur-xl hover:border-indigo-400 hover:bg-slate-800 transition-all text-slate-300 hover:text-white flex items-center justify-center gap-2 text-xs font-bold shadow-glass-dark"
          >
            {sortOrder === 'newest' ? <SortDesc className="w-4 h-4 text-cyan-400" /> : <SortAsc className="w-4 h-4 text-cyan-400" />}
            Sort: {sortLabel}
          </button>
        </motion.div>

        {/* Gallery Grid */}
        {filteredMemories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center glass-panel rounded-3xl p-8 border border-white/15"
          >
            <Grid3X3 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="font-display font-bold text-white text-lg mb-1">No memories found</h3>
            <p className="text-xs text-slate-400">Try adjusting your search query, collections, or status filter.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredMemories.map((memory, idx) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onOpen={handleMemoryOpen}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

VaultView.displayName = 'VaultView';

