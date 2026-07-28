import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const showToast = useCallback((message, type = 'info', title = 'Chrona Vault') => {
    const id = 'toast-' + Date.now() + '-' + Math.random();
    const newToast = { id, message, type, title, timestamp: new Date() };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Limit active toasts on screen

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      removeToast,
      isDrawerOpen,
      setIsDrawerOpen,
      unreadCount,
      setUnreadCount,
    }),
    [toasts, showToast, removeToast, isDrawerOpen, unreadCount]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl glass-panel border border-white/20 shadow-glass-lg animate-fadeIn text-white backdrop-blur-md"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                toast.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : toast.type === 'error'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : '✦'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs text-white">{toast.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
