import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  LogOut,
  Home,
  FolderHeart,
  Sparkles,
  Menu,
  X,
  Bell,
  User,
  BarChart2
} from 'lucide-react';
import { useMemory } from '../../context/MemoryContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const Navbar = memo(({ onOpenProfile, onOpenAnalytics }) => {
  const { viewMode, setViewMode, setIsCreateModalOpen, setIsAIAssistantOpen } = useMemory();
  const { user, logout } = useAuth();
  const { setIsDrawerOpen, unreadCount } = useNotification();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);

  const handleCreateClick = useCallback(() => {
    setIsCreateModalOpen(true);
    setShowMobileMenu(false);
  }, [setIsCreateModalOpen]);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    setShowMobileMenu(false);
  }, [setViewMode]);

  const handleAIClick = useCallback(() => {
    setIsAIAssistantOpen(true);
    setShowMobileMenu(false);
  }, [setIsAIAssistantOpen]);

  const handleLogout = useCallback(() => {
    setShowUserMenu(false);
    logout();
  }, [logout]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const navItems = [
    { label: 'Home', icon: Home, mode: '3d', active: viewMode === '3d' },
    { label: 'Vault', icon: FolderHeart, mode: 'gallery', active: viewMode === 'gallery' },
  ];

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-6xl">
      <nav className="glass-panel rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-glass-dark">

        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => handleViewModeChange('3d')}
        >
          <div className="w-8 h-8 flex-shrink-0 bg-gradient-vibrant rounded-xl flex items-center justify-center shadow-neon-indigo group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-sm font-display">C</span>
          </div>
          <div className="hidden sm:block">
            <div className="font-display font-bold text-white text-sm tracking-tight group-hover:text-indigo-400 transition-colors">
              Chrona
            </div>
            <p className="text-[10px] text-cyan-400 font-semibold leading-none">Spatial Capsule</p>
          </div>
        </div>

        {/* Center Nav — Desktop */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-900/60 rounded-xl border border-white/10">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleViewModeChange(item.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                item.active
                  ? 'bg-gradient-vibrant text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}

          {/* AI Assistant Button */}
          <button
            onClick={handleAIClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-cyan-300 transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            AI Assistant
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Analytics Icon */}
          <button
            onClick={onOpenAnalytics}
            title="Life Analytics"
            className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center hover:bg-slate-700 transition-colors border border-white/15 text-slate-300 hover:text-white"
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            title="Notifications"
            className="relative w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center hover:bg-slate-700 transition-colors border border-white/15 text-slate-300 hover:text-white"
          >
            <Bell className="w-4 h-4 text-indigo-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-bold text-[9px] flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Create Button */}
          <motion.button
            onClick={handleCreateClick}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-vibrant text-white text-xs font-bold shadow-neon-indigo hover:shadow-neon-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Memory</span>
          </motion.button>

          {/* User Avatar */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center hover:bg-slate-700 transition-colors border border-white/15 shadow-sm overflow-hidden"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-full h-full rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                style={{ display: user?.photoURL ? 'none' : 'flex' }}
                className="w-full h-full items-center justify-center text-sm font-bold text-indigo-400"
              >
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl py-2 shadow-glass-dark border border-white/15 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-bold text-white truncate">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onOpenProfile) onOpenProfile();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                    >
                      <User className="w-4 h-4 text-cyan-400" />
                      Profile & Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-300"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 glass-panel rounded-2xl p-3 space-y-1 shadow-glass-dark"
          >
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleViewModeChange(item.mode)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  item.active
                    ? 'bg-gradient-vibrant text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4 text-cyan-400" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleAIClick}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              AI Assistant
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

Navbar.displayName = 'Navbar';
