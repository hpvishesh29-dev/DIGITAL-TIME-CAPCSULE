import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { api } from "./api";

// Firebase Configuration template
const firebaseConfig = {
 apiKey: "AIzaSyAyy7Bny9eScH-IkFx1dzcWI9C9fX_23eo",
  authDomain: "chrona-digital-time-capsule.firebaseapp.com",
  projectId: "chrona-digital-time-capsule",
  storageBucket: "chrona-digital-time-capsule.firebasestorage.app",
  messagingSenderId: "31819802638",
  appId: "1:31819802638:web:a0089e974f19546537345f",
  measurementId: "G-N96C5F05J4"
};

const isDemoMode = () => !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("DEMO_KEY");

let app, db, storage, auth;

try {
  // Only initialize once — reuse the existing app instance across hot reloads
  // or multiple imports instead of calling initializeApp() again.
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase initialized in fallback mode:", e);
}


export const uploadImageToStorage = async (file, userId = 'user') => {
  try {
    if (!storage) throw new Error("Storage not initialized");
    const filename = `images/${userId}/${Date.now()}_${file.name || 'photo.jpg'}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.warn("Firebase Storage image upload notice:", err.message);
    return null;
  }
};

export { app, db, storage, auth };


// ──────────────────────────────────────────────────────────────────────────────
// Firestore Memory sync helpers
// ──────────────────────────────────────────────────────────────────────────────

export const saveMemoryToCloud = async (memoryData) => {
  try {
    if (!db || isDemoMode()) {
      console.log("Mock cloud sync (Add VITE_FIREBASE_API_KEY for live Firestore):", memoryData);
      return { id: "cloud-" + Date.now(), ...memoryData };
    }
    const docRef = await addDoc(collection(db, "memories"), {
      ...memoryData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...memoryData };
  } catch (error) {
    console.error("Firestore sync error (saveMemoryToCloud):", error);
    return memoryData;
  }
};

export const fetchMemoriesFromCloud = async () => {
  try {
    if (!db || isDemoMode()) {
      console.log("Mock cloud fetch (Add VITE_FIREBASE_API_KEY for live Firestore): returning empty list");
      return [];
    }
    const memoriesQuery = query(collection(db, "memories"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(memoriesQuery);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("Firestore sync error (fetchMemoriesFromCloud):", error);
    return [];
  }
};

export const updateMemory = async (memoryId, updates) => {
  try {
    if (!memoryId) {
      throw new Error("updateMemory requires a memoryId");
    }
    if (!db || isDemoMode()) {
      console.log(`Mock cloud update for ${memoryId} (Add VITE_FIREBASE_API_KEY for live Firestore):`, updates);
      return { id: memoryId, ...updates };
    }
    const memoryRef = doc(db, "memories", memoryId);
    await updateDoc(memoryRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    const updatedSnap = await getDoc(memoryRef);
    return updatedSnap.exists() ? { id: updatedSnap.id, ...updatedSnap.data() } : { id: memoryId, ...updates };
  } catch (error) {
    console.error("Firestore sync error (updateMemory):", error);
    return null;
  }
};

export const deleteMemory = async (memoryId) => {
  try {
    if (!memoryId) {
      throw new Error("deleteMemory requires a memoryId");
    }
    if (!db || isDemoMode()) {
      console.log(`Mock cloud delete for ${memoryId} (Add VITE_FIREBASE_API_KEY for live Firestore)`);
      return { id: memoryId, deleted: true };
    }
    const memoryRef = doc(db, "memories", memoryId);
    await deleteDoc(memoryRef);
    return { id: memoryId, deleted: true };
  } catch (error) {
    console.error("Firestore sync error (deleteMemory):", error);
    return { id: memoryId, deleted: false, error: error.message || "Unknown error" };
  }
};