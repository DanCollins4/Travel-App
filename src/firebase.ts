import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
// ignoreUndefinedProperties: forms save plenty of optional fields (cost, link,
// a failed geocode result) as `undefined` — without this, Firestore throws.
export const db = app ? initializeFirestore(app, { ignoreUndefinedProperties: true }) : null
export const storage = app ? getStorage(app) : null

const googleProvider = new GoogleAuthProvider()

export async function signIn() {
  if (!auth) return
  try {
    await signInWithPopup(auth, googleProvider)
  } catch (err) {
    const code = (err as { code?: string }).code
    // Popups are frequently blocked on mobile/PWA contexts — fall back to redirect.
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment' ||
      code === 'auth/cancelled-popup-request'
    ) {
      await signInWithRedirect(auth, googleProvider)
    } else {
      throw err
    }
  }
}

export async function signOutUser() {
  if (!auth) return
  await firebaseSignOut(auth)
}
