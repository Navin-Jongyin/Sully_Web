import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../firebase';

export async function getDocument<T>(path: string): Promise<T | null> {
  const snap = await getDoc(doc(db, path));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
}

export async function setDocument(path: string, data: DocumentData, merge = false) {
  const ref = doc(db, path);
  if (merge) {
    await setDoc(ref, data, { merge: true });
  } else {
    await setDoc(ref, data);
  }
}

export async function updateDocument(path: string, data: DocumentData) {
  await updateDoc(doc(db, path), data);
}

export async function deleteDocument(path: string) {
  await deleteDoc(doc(db, path));
}

export async function queryCollection<T>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const q = query(collection(db, collectionPath), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

export async function addToCollection(collectionPath: string, data: DocumentData) {
  return addDoc(collection(db, collectionPath), data);
}

export { collection, doc, limit, orderBy, query, where };
