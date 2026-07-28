import React, { Suspense, lazy, useState, useEffect, useMemo, memo } from 'react';
import { MemoryProvider, useMemory } from './context/MemoryContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/ui/Navbar';
import { LoginPage } from './components/ui/LoginPage';
import { ProfileModal } from './components/ui/ProfileModal';
import { AnalyticsModal } from './components/ui/AnalyticsModal';
import { NotificationsDrawer } from './components/ui/NotificationsDrawer';
import { LifeRecapModal } from './components/ui/LifeRecapModal';
import { UnlockCinematicModal } from './components/ui/UnlockCinematicModal';
import { LifeStoryModal } from './components/ui/LifeStoryModal';
import { ReplaySlideshowModal } from './components/ui/ReplaySlideshowModal';
import { initSocket, disconnectSocket } from './services/socketService';

// ──────────────────────────────────────────────────────────────────────────────
// Lazy-loaded heavy components
// ──────────────────────────────────────────────────────────────────────────────

const Scene = lazy(() =>
  import('./components/3d/Scene').then((m) => ({ default: m.Scene }))
);
const HeroOverlay = lazy(() =>
  import('./components/ui/HeroOverlay').then((m) => ({ default: m.HeroOverlay }))
);
const VaultView = lazy(() =>
  import('./components/ui/VaultView').then((m) => ({ default: m.VaultView }))
);
const MemoryModal = lazy(() =>
  import('./components/ui/MemoryModal').then((m) => ({ default: m.MemoryModal }))
);
const CreateMemoryModal = lazy(() =>
  import('./components/ui/CreateMemoryModal').then((m) => ({ default: m.CreateMemoryModal }))
);
const AIAssistantDrawer = lazy(() =>
  import('./components/ui/AIAssistantDrawer').then((m) => ({ default: m.AIAssistantDrawer }))
);

// ──────────────────────────────────────────────────────────────────────────────
// Global Error Boundary
// ──────────────────────────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chrona App crashed:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#070B14] p-4 sm:p-6 animate-fadeIn">
          <div className="relative w-full max-w-sm sm:max-w-md rounded-[28px] overflow-hidden p-6 sm:p-8 text-center glass-panel border border-white/20 shadow-glass-lg">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-500/20 border border-red-500/30">
              <span className="text-xl sm:text-2xl text-red-400">⚠</span>
            </div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed break-words">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-vibrant shadow-neon-indigo hover:shadow-neon-cyan active:scale-[0.98] transition-all"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Premium Dark Loading Screen
// ──────────────────────────────────────────────────────────────────────────────

const LoadingScreen = memo(function LoadingScreen({ label = 'Loading Chrona...' }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#070B14] transition-opacity duration-500 ease-out animate-fadeIn px-4 z-50">
      <div className="relative flex flex-col items-center gap-4 sm:gap-5 px-6 sm:px-8 py-8 sm:py-10 rounded-[28px] glass-panel border border-white/20 shadow-glass-lg">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30" />
          <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin" />
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <p className="text-xs text-indigo-200 tracking-wide font-medium animate-pulse text-center">
          {label}
        </p>
      </div>
    </div>
  );
});

const InlineFallback = memo(function InlineFallback() {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full glass-panel border border-white/20 shadow-glass animate-fadeIn">
      <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      <span className="text-[10px] font-bold text-cyan-300">Loading…</span>
    </div>
  );
});

// ──────────────────────────────────────────────────────────────────────────────
// App Content
// ──────────────────────────────────────────────────────────────────────────────

const AppContent = () => {
  const { viewMode, cinematicUnlockedMemory, setCinematicUnlockedMemory } = useMemory();
  const { user, loading } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [isReplayOpen, setIsReplayOpen] = useState(false);

  useEffect(() => {
    if (user) {
      initSocket(user);
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [user]);

  const activeOverlay = useMemo(() => {
    if (viewMode === '3d') {
      return (
        <Suspense fallback={<InlineFallback />}>
          <HeroOverlay />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<InlineFallback />}>
        <VaultView />
      </Suspense>
    );
  }, [viewMode]);

  if (loading) {
    return <LoadingScreen label="Launching Spatial Vault..." />;
  }

  if (!user) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#070B14]">
        <Suspense fallback={<LoadingScreen label="Rendering 3D Spatial Globe..." />}>
          <Scene />
        </Suspense>
        <LoginPage />
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full font-sans select-none opacity-100 transition-opacity duration-500">
      <Navbar
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenRecap={() => setIsRecapOpen(true)}
        onOpenStory={() => setIsStoryOpen(true)}
        onOpenReplay={() => setIsReplayOpen(true)}
      />

      <div className="fixed inset-0 z-0 pointer-events-auto">
        <Suspense fallback={<LoadingScreen label="Rendering 3D Spatial Globe..." />}>
          <Scene />
        </Suspense>
      </div>

      <div className="relative z-10">
        {activeOverlay}
      </div>

      <Suspense fallback={<InlineFallback />}>
        <MemoryModal />
      </Suspense>
      <Suspense fallback={<InlineFallback />}>
        <CreateMemoryModal />
      </Suspense>
      <Suspense fallback={<InlineFallback />}>
        <AIAssistantDrawer />
      </Suspense>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <AnalyticsModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
      <NotificationsDrawer />
      <LifeRecapModal isOpen={isRecapOpen} onClose={() => setIsRecapOpen(false)} />

      {/* New AI & Cinematic Feature Modals */}
      <UnlockCinematicModal
        memory={cinematicUnlockedMemory}
        onClose={() => setCinematicUnlockedMemory(null)}
      />
      <LifeStoryModal isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
      <ReplaySlideshowModal isOpen={isReplayOpen} onClose={() => setIsReplayOpen(false)} />
    </main>
  );
};

const MemoizedAppContent = memo(AppContent);

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <MemoryProvider>
            <MemoizedAppContent />
          </MemoryProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}