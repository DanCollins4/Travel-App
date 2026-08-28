import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'

/** Uploads a journal photo to /users/{uid}/journal/{entryId}/{filename} and returns its download URL. */
export async function uploadJournalPhoto(uid: string, entryId: string, file: File): Promise<string> {
  if (!storage) throw new Error('Storage is not configured')
  const path = `users/${uid}/journal/${entryId}/${Date.now()}-${file.name}`
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}

/** Best-effort delete — ignores errors so a broken/missing file never blocks removing a journal entry. */
export async function deletePhotoByUrl(url: string) {
  if (!storage) return
  try {
    await deleteObject(ref(storage, url))
  } catch {
    // already gone, or URL wasn't ours — nothing to do
  }
}
