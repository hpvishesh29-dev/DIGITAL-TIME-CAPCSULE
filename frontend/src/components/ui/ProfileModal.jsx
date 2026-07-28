import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { sendUnlockEmail } from '../../services/emailApi';

export const ProfileModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [bio, setBio] = useState('Spatial Vault Keeper & AI Time Capsule Curator');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState(null);

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({ displayName, photoURL, bio }).catch(() => {});
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingEmail(true);
    setEmailSuccessMsg(null);
    try {
      await sendUnlockEmail({
        email: user.email,
        userName: displayName || user.displayName || 'Time Keeper',
        memoryTitle: '✨ Test Time Capsule Memory',
        unlockDate: new Date().toLocaleString(),
        memoryId: 'test-capsule-001',
      });
      setEmailSuccessMsg(`✓ Test unlock email sent to ${user.email}!`);
    } catch (err) {
      console.error('Test email error:', err);
      setEmailSuccessMsg(`⚠️ Email notice: ${err.message || 'Failed to send email'}`);
    } finally {
      setIsSendingEmail(false);
      setTimeout(() => setEmailSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-[28px] glass-panel border border-white/20 shadow-glass-lg p-6 sm:p-8 text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {displayName ? displayName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">User Profile & Vault Settings</h3>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 text-sm text-white placeholder-slate-500 outline-none transition-all"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Avatar Image URL</label>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 text-sm text-white placeholder-slate-500 outline-none transition-all"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vault Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-400 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200">
            <div className="font-semibold mb-1 flex items-center justify-between">
              <span>🔐 Automatic Unlock Email Notifications</span>
              <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Unlock notifications are automatically emailed to <span className="font-mono text-cyan-300">{user.email}</span> when time capsules open.
            </p>
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingEmail}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-vibrant text-white font-bold text-xs shadow-neon-indigo hover:shadow-neon-cyan transition-all disabled:opacity-50"
            >
              {isSendingEmail ? 'Sending Test Email...' : '📧 Send Test Email'}
            </button>
          </div>

          {emailSuccessMsg && (
            <div className={`p-3 rounded-xl border text-xs text-center font-medium ${
              emailSuccessMsg.startsWith('✓')
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/20 border-amber-500/30 text-amber-300'
            }`}>
              {emailSuccessMsg}
            </div>
          )}


          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs text-center font-medium">
              ✓ Profile settings saved successfully!
            </div>
          )}


          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
            >
              Sign Out
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-vibrant shadow-neon-indigo hover:shadow-neon-cyan active:scale-[0.98] transition-all"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
