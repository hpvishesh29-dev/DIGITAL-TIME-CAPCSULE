import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";
import { INITIAL_MEMORIES, SAMPLE_MEMORIES } from "../utils/sampleData";
import { soundEngine } from "../utils/audio";
import { sendUnlockEmail } from "../services/emailService";

const MemoryContext = createContext();

const MEMORIES_COLLECTION = 'memories';

// ──────────────────────────────────────────────────────────────────────────────
// localStorage helpers for UI preferences and per-user memory storage
// ──────────────────────────────────────────────────────────────────────────────

const getStorageKey = (u) => {
  if (!u) return 'chrona_memories_guest';
  if (u.uid) return `chrona_memories_${u.uid}`;
  if (u.email) return `chrona_memories_${u.email.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  return 'chrona_memories_user';
};

const readLocalPref = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalPref = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / privacy-mode errors
  }
};

export const MemoryProvider = ({ children }) => {
  const { user } = useAuth();

  // ── Memories now come from Firestore in real time, scoped to the logged-in user ──
  const [memories, setMemories] = useState(() => {
    const storageKey = getStorageKey(user);
    const cached = readLocalPref(storageKey, null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
    if (!user || user.provider === 'demo') {
      return SAMPLE_MEMORIES;
    }
    return cached || [];
  });
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  const [firestoreError, setFirestoreError] = useState(null);
  const hasReceivedSnapshot = useRef(false);

  const [selectedMemory, setSelectedMemoryState] = useState(null);

  // ── UI preferences, persisted to localStorage ───────────────────────────────
  const [activeCategory, setActiveCategoryState] = useState(() =>
    readLocalPref('chrona_active_category', 'All')
  );
  const [viewMode, setViewModeState] = useState(() =>
    readLocalPref('chrona_view_mode', '3d')
  );
  const [isAudioPlaying, setIsAudioPlayingState] = useState(() =>
    readLocalPref('chrona_audio_playing', false)
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [cinematicUnlockedMemory, setCinematicUnlockedMemory] = useState(null);

  const [qualityMode, setQualityMode] = useState('ultra'); // 'ultra', 'balanced', 'performance'
  const [cameraTarget, setCameraTarget] = useState(null); // [x, y, z] target for R3F camera animation

  // Track memory unlock modals and active email send operations
  const shownUnlockIdsRef = useRef(new Set());
  const processedEmailIdsRef = useRef(new Set());

  // ── Dispatch Unlock Email with Duplicate Protection and Exact Logging ─────────
  const dispatchUnlockEmail = useCallback(async (memory, currentUser) => {
    if (!memory || !currentUser || !currentUser.email) return false;

    // Duplicate Protection: Never send multiple emails for the same memory
    if (memory.emailSent === true) {
      return true;
    }
    if (processedEmailIdsRef.current.has(memory.id)) {
      return false;
    }

    processedEmailIdsRef.current.add(memory.id);

    console.log('[Unlock Email]');
    console.log('Checking memory...');
    console.log('Unlocked.');
    console.log('Sending email...');

    try {
      const res = await sendUnlockEmail({
        email: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0] || 'Time Keeper',
        memoryTitle: memory.title || 'Time Capsule Memory',
        unlockDate: memory.unlockDate || new Date().toLocaleString(),
        memoryId: memory.id || '',
      });

      if (res && (res.success || res === true)) {
        console.log('Email sent successfully.');
        console.log('Firestore updated.');

        // Update Firestore: emailSent = true, emailSentAt = serverTimestamp()
        if (db && memory.id && currentUser.provider === 'firebase') {
          try {
            const memoryRef = doc(db, MEMORIES_COLLECTION, memory.id);
            await updateDoc(memoryRef, {
              emailSent: true,
              emailSentAt: serverTimestamp(),
            });
          } catch (dbErr) {
            console.warn('[Unlock Email] Firestore update notice:', dbErr.message);
          }
        }

        setMemories((prev) =>
          prev.map((item) =>
            item.id === memory.id ? { ...item, emailSent: true, emailSentAt: new Date().toISOString() } : item
          )
        );
        return true;
      } else {
        processedEmailIdsRef.current.delete(memory.id);
        console.error('Email failed.');
        console.error('Will retry later.');
        return false;
      }
    } catch (err) {
      processedEmailIdsRef.current.delete(memory.id);
      console.error('Email failed.');
      console.error('Will retry later.');
      return false;
    }
  }, []);

  // ── Retry Logic: Scan unlocked memories on app startup ─────────────────────────
  useEffect(() => {
    if (!user || !user.email || !memories || memories.length === 0) return;

    const retryPendingEmails = async () => {
      for (const m of memories) {
        if (m.isUnlocked === true && !m.emailSent) {
          await dispatchUnlockEmail(m, user);
        }
      }
    };

    const timer = setTimeout(() => {
      retryPendingEmails().catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, memories.length, dispatchUnlockEmail]);

  // ── Automatic Unlock System Scheduler ──────────────────────────────────────────
  useEffect(() => {
    if (!memories || memories.length === 0) return;

    // Seed shownUnlockIdsRef with memories that were ALREADY past their unlock date on initial load
    const nowOnLoad = new Date();
    memories.forEach((m) => {
      if (m.unlockDate) {
        const unlockTime = new Date(m.unlockDate);
        if (nowOnLoad >= unlockTime && m.isUnlocked) {
          shownUnlockIdsRef.current.add(m.id);
        }
      }
    });

    const checkUnlocks = () => {
      const now = new Date();

      setMemories((prevMemories) => {
        let changed = false;
        const nextMemories = prevMemories.map((m) => {
          if (m.unlockDate && !m.isUnlocked) {
            const unlockTime = new Date(m.unlockDate);
            if (now >= unlockTime) {
              changed = true;
              const updated = {
                ...m,
                isUnlocked: true,
                status: 'unlocked',
                emailSent: m.emailSent ?? false,
              };

              // Trigger Cinematic Unlock Experience ONLY ONCE per memory per session
              if (m.id && !shownUnlockIdsRef.current.has(m.id)) {
                shownUnlockIdsRef.current.add(m.id);
                setCinematicUnlockedMemory(updated);

                // Trigger Browser Notification
                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                  try {
                    new Notification('🔮 Chrona Time Capsule Unlocked!', {
                      body: `Your memory capsule "${m.title || 'Capsule'}" is now unlocked!`,
                    });
                  } catch (e) {}
                }
              }

              // Dispatch unlock email automatically
              dispatchUnlockEmail(updated, user);

              // Update Firestore asynchronously
              if (user && db && m.id) {
                try {
                  const memoryRef = doc(db, MEMORIES_COLLECTION, m.id);
                  updateDoc(memoryRef, {
                    isUnlocked: true,
                    status: 'unlocked',
                    emailSent: m.emailSent ?? false,
                  }).catch((err) =>
                    console.warn('Firestore unlock update notice:', err.message)
                  );
                } catch (e) {}
              }

              return updated;
            }
          } else if (m.unlockDate && m.isUnlocked && m.id) {
            // Already unlocked, ensure it's in shownUnlockIdsRef so it never pops up again
            shownUnlockIdsRef.current.add(m.id);
          }
          return m;
        });

        if (changed) {
          const storageKey = getStorageKey(user);
          writeLocalPref(storageKey, nextMemories);
          return nextMemories;
        }
        return prevMemories;
      });
    };

    checkUnlocks();
    const interval = setInterval(checkUnlocks, 10000); // Check every 10s

    return () => clearInterval(interval);
  }, [user, dispatchUnlockEmail]); // Removed memories from dependency array to prevent re-trigger loop

  // Request Notification Permissions if available
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // ── Real-time Firestore subscription (per-user) ─────────────────────────────
  useEffect(() => {
    const storageKey = getStorageKey(user);
    const cached = readLocalPref(storageKey, null);

    if (!user || user.provider === 'demo') {
      const activeMemories = (cached && Array.isArray(cached) && cached.length > 0) ? cached : SAMPLE_MEMORIES;
      setMemories(activeMemories);
      writeLocalPref(storageKey, activeMemories);
      setIsLoadingMemories(false);
      if (!user) return () => {};
    } else {
      setMemories(cached || []);
    }

    let unsubscribe = () => {};

    if (db && user.uid && user.provider === 'firebase') {
      try {
        const memoriesQuery = query(
          collection(db, MEMORIES_COLLECTION),
          where('userId', '==', user.uid)
        );

        unsubscribe = onSnapshot(
          memoriesQuery,
          (snapshot) => {
            const liveMemories = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            }));

            liveMemories.sort((a, b) => {
              const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (typeof a.createdAt === 'number' ? a.createdAt : Date.parse(a.timestamp || 0) || 0);
              const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (typeof b.createdAt === 'number' ? b.createdAt : Date.parse(b.timestamp || 0) || 0);
              return timeB - timeA;
            });

            hasReceivedSnapshot.current = true;
            setFirestoreError(null);
            setIsLoadingMemories(false);

            setMemories(liveMemories);
            writeLocalPref(storageKey, liveMemories);
          },
          (error) => {
            console.warn('Firestore memories sync notice:', error?.message);
            setIsLoadingMemories(false);
          }
        );
      } catch (error) {
        console.warn('Firestore subscription setup notice:', error?.message);
        setIsLoadingMemories(false);
      }
    } else {
      setIsLoadingMemories(false);
    }

    return () => unsubscribe();
  }, [user]);

  // ── Persist UI preferences whenever they change ─────────────────────────────
  useEffect(() => {
    writeLocalPref('chrona_active_category', activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    writeLocalPref('chrona_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    writeLocalPref('chrona_audio_playing', isAudioPlaying);
  }, [isAudioPlaying]);


  // ── Stable callbacks ─────────────────────────────────────────────────────────

  const toggleAudio = useCallback(() => {
    setIsAudioPlayingState((prev) => {
      const next = !prev;
      soundEngine.toggleAmbient(next);
      return next;
    });
  }, []);

  const setActiveCategory = useCallback((category) => {
    setActiveCategoryState(category);
  }, []);

  const setViewMode = useCallback((mode) => {
    setViewModeState(mode);
  }, []);

  const selectMemoryCard = useCallback((memory) => {
    soundEngine.playCardClick();
    setSelectedMemoryState(memory);
    if (memory) {
      // Set camera target focus toward card position
      const angle = memory.initialAngle || 0;
      const radius = memory.orbitRadius || 3.5;
      const x = Math.cos(angle) * radius * 0.8;
      const y = (memory.yOffset || 0) * 0.8;
      const z = Math.sin(angle) * radius * 0.8;
      setCameraTarget([x, y, z]);
    } else {
      setCameraTarget([0, 0, 0]);
    }
  }, []);

  const addMemory = useCallback(async (newMemory) => {
    const memoryId = `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    // Set initialAngle in front of the globe (Math.PI * 0.35 -> z > 1.2 facing camera)
    const memoryItem = {
      id: memoryId,
      orbitRadius: 2.65 + Math.random() * 0.6,
      orbitSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.05 + Math.random() * 0.05),
      initialAngle: Math.PI * 0.35 + (Math.random() - 0.5) * 0.2,
      yOffset: (Math.random() - 0.5) * 1.2,
      lockHash: `0x${Math.random().toString(16).substring(2, 6)}...${Math.random().toString(16).substring(2, 6)}`,
      ...newMemory,
      userId: user?.uid || 'guest',
      userEmail: user?.email || 'guest@chrona.app',
      userName: user?.displayName || 'Time Keeper',
      createdAt: Date.now(),
    };

    // 1. Reset category to 'All' & view to '3d' so the new memory is never hidden by filters
    setActiveCategoryState('All');
    setViewModeState('3d');

    const storageKey = getStorageKey(user);

    // 2. Instantly update local React state so the floating card revolves immediately!
    setMemories((prev) => {
      const next = [memoryItem, ...prev];
      writeLocalPref(storageKey, next);
      return next;
    });

    // 3. Focus camera on the new memory card immediately
    selectMemoryCard(memoryItem);

    soundEngine.playSealSuccess();

    // 4. Persist to Firestore asynchronously if connected
    if (user && db) {
      try {
        const payloadForFirestore = {
          ...memoryItem,
          createdAt: serverTimestamp(),
        };
        delete payloadForFirestore.id;
        const docRef = await addDoc(collection(db, MEMORIES_COLLECTION), payloadForFirestore);
        if (docRef?.id) {
          setMemories((prev) => {
            const updated = prev.map((m) => (m.id === memoryId ? { ...m, id: docRef.id } : m));
            writeLocalPref(storageKey, updated);
            return updated;
          });
        }
      } catch (err) {
        console.warn('Firestore optional sync notice:', err?.message);
      }
    }
  }, [user, selectMemoryCard]);

  const deleteMemory = useCallback(async (memoryId) => {
    if (!memoryId) return;

    const storageKey = getStorageKey(user);

    // 1. Instantly remove memory from local React state and storage
    setMemories((prev) => {
      const next = prev.filter((m) => m.id !== memoryId);
      writeLocalPref(storageKey, next);
      return next;
    });

    if (selectedMemory?.id === memoryId) {
      setSelectedMemoryState(null);
    }

    // 2. Delete document from Firestore if user is connected
    if (user && db) {
      try {
        const memoryRef = doc(db, MEMORIES_COLLECTION, memoryId);
        await deleteDoc(memoryRef);
      } catch (err) {
        console.warn('Firestore delete notice:', err?.message);
      }
    }
  }, [user, selectedMemory]);

  // ── Derived state ────────────────────────────────────────────────────────────

  const filteredMemories = useMemo(() => {
    return activeCategory === 'All'
      ? memories
      : memories.filter((m) => m.category === activeCategory);
  }, [memories, activeCategory]);

  // ── Context value — memoized to prevent unnecessary consumer re-renders ─────

  const contextValue = useMemo(
    () => ({
      memories,
      filteredMemories,
      isLoadingMemories,
      firestoreError,

      selectedMemory,
      setSelectedMemory: selectMemoryCard,

      activeCategory,
      setActiveCategory,

      viewMode,
      setViewMode,

      isAudioPlaying,
      toggleAudio,

      isCreateModalOpen,
      setIsCreateModalOpen,

      isAIAssistantOpen,
      setIsAIAssistantOpen,

      cinematicUnlockedMemory,
      setCinematicUnlockedMemory,

      qualityMode,
      setQualityMode,

      cameraTarget,
      setCameraTarget,

      addMemory,
      deleteMemory,
    }),
    [
      memories,
      filteredMemories,
      isLoadingMemories,
      firestoreError,
      selectedMemory,
      selectMemoryCard,
      activeCategory,
      setActiveCategory,
      viewMode,
      setViewMode,
      isAudioPlaying,
      toggleAudio,
      isCreateModalOpen,
      isAIAssistantOpen,
      cinematicUnlockedMemory,
      setCinematicUnlockedMemory,
      qualityMode,
      cameraTarget,
      addMemory,
      deleteMemory,
    ]
  );


  return (
    <MemoryContext.Provider value={contextValue}>
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = () => useContext(MemoryContext);