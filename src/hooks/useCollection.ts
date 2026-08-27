import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

/**
 * Subscribes to /users/{uid}/{collectionName}, ordered by createdAt.
 * Returns live data plus add/update/remove helpers scoped to the signed-in user.
 */
export function useCollection<T extends { id: string; createdAt: number }>(collectionName: string) {
  const { user } = useAuth()
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !user) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const ref = collection(db, 'users', user.uid, collectionName)
    const q = query(ref, orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T))
        setLoading(false)
      },
      () => setLoading(false),
    )
    return unsub
  }, [user, collectionName])

  async function add(data: Omit<T, 'id' | 'createdAt'>) {
    if (!db || !user) return undefined
    const ref = collection(db, 'users', user.uid, collectionName)
    const docRef = await addDoc(ref, { ...data, createdAt: Date.now() })
    return docRef.id
  }

  async function update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>) {
    if (!db || !user) return
    await updateDoc(doc(db, 'users', user.uid, collectionName, id), data)
  }

  async function remove(id: string) {
    if (!db || !user) return
    await deleteDoc(doc(db, 'users', user.uid, collectionName, id))
  }

  return { items, loading, add, update, remove }
}
