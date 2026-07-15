import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { PurchaseRecord } from '../commerce/types';

export async function fetchUserPurchases(uid: string): Promise<PurchaseRecord[]> {
  const snap = await getDocs(query(collection(db, 'purchases'), where('uid', '==', uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PurchaseRecord));
}

export function subscribeUserPurchases(
  uid: string,
  onData: (purchases: PurchaseRecord[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'purchases'), where('uid', '==', uid)),
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PurchaseRecord)));
    },
    (err) => onError?.(err),
  );
}

export function subscribeCourseEntitlements(
  uid: string,
  onData: (courseIds: string[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'userEntitlements', uid, 'courses'),
    (snap) => {
      onData(snap.docs.map((d) => d.id));
    },
    (err) => onError?.(err),
  );
}

export async function userOwnsCourse(uid: string, courseId: string): Promise<boolean> {
  const docSnap = await getDoc(doc(db, 'userEntitlements', uid, 'courses', courseId));
  return docSnap.exists();
}
