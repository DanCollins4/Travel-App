import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import type { PublicShare } from '../types'

/**
 * Every user gets one stable share link. The id is generated once and
 * stashed in their own private doc so re-sharing later reuses the same URL.
 */
export async function getOrCreateShareId(uid: string): Promise<string> {
  if (!db) throw new Error('Firestore is not configured')
  const ref = doc(db, 'users', uid, 'settings', 'share')
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data().shareId as string
  const shareId = crypto.randomUUID()
  await setDoc(ref, { shareId })
  return shareId
}

export async function publishShare(shareId: string, data: Omit<PublicShare, 'updatedAt'>) {
  if (!db) return
  await setDoc(doc(db, 'publicShares', shareId), { ...data, updatedAt: Date.now() })
}

export async function unpublishShare(shareId: string) {
  if (!db) return
  await deleteDoc(doc(db, 'publicShares', shareId))
}

export async function readPublicShare(shareId: string): Promise<PublicShare | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'publicShares', shareId))
  return snap.exists() ? (snap.data() as PublicShare) : null
}
