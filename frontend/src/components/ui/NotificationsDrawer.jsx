import React, { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const NotificationsDrawer = () => {
  const { isDrawerOpen, setIsDrawerOpen, setUnreadCount } = useNotification();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: '✨ Spatial Vault Sync Active',
      message: 'Your 3D spatial time capsule vault is synchronized across devices.',
      time: '10m ago',
      type: 'system',
      read: false,
    },
    {
      id: 'n2',
      title: '🔮 Time Capsule Unlock Alert',
      message: 'Capsule "First AI Vision" is approaching its scheduled unlock threshold.',
      time: '1h ago',
      type: 'unlock',
      read: false,
    },
    {
      id: 'n3',
      title: '🤖 Weekly AI Life Recap',
      message: 'Your AI Life Recap for this week is ready to explore.',
      time: '1d ago',
      type: 'ai',
      read: true,
    },
  ]);

  if (!isDrawerOpen) return null;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };


  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm h-full glass-panel border-l border-white/20 p-6 flex flex-col text-white shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <h3 className="font-bold text-base font-display">Notifications</h3>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Automatic Email Notification Info Badge */}
        <div className="mb-4 p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-cyan-300">📧 Email Notifications Active</span>
            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{user?.email}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-light leading-relaxed">
            Time capsule unlock alerts are automatically emailed to your inbox when capsules reach their unlock date.
          </p>
        </div>


        <div className="flex justify-between items-center text-xs mb-4">
          <span className="text-slate-400">Recent Alerts</span>
          <button onClick={markAllRead} className="text-cyan-400 hover:underline">
            Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                n.read
                  ? 'bg-white/5 border-white/5 text-slate-400'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs text-cyan-300">{n.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

