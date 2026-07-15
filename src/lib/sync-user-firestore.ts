import type { User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export async function syncUserToFirestore(user: User): Promise<void> {
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);

  const data: Record<string, unknown> = {
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? '',
    lastLogin: serverTimestamp(),
  };

  if (!existing.exists()) {
    data.createdAt = serverTimestamp();
  }

  await setDoc(userRef, data, { merge: true });
}
