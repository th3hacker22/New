/**
 * Firebase adapter — deep module with a small eager surface.
 *
 * Auth is needed on every screen (AuthGuard), so it stays eagerly imported.
 * Firestore and Storage are heavy (~500kb combined) and only needed by
 * cloud sync, the social feed, and avatar upload — so they're exposed as
 * lazy getters that dynamically import their sub-packages. This keeps them
 * out of the initial bundle (bundle-defer-third-party).
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// `getApps` guards against duplicate init in tests / HMR.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/** Lazily resolves the Firestore instance. */
export async function getDb() {
  const { getFirestore } = await import('firebase/firestore');
  return getFirestore(app);
}

/** Lazily resolves the Storage instance. */
export async function getStorageInstance() {
  const { getStorage } = await import('firebase/storage');
  return getStorage(app);
}
