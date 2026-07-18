import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { OnlineTestAttempt } from '../online-test/attempt-types';

export function normalizeTestEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getAttemptDocId(email: string, testId: string): string {
  return `${normalizeTestEmail(email)}_${testId}`;
}

export async function hasTestAttempt(email: string, testId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'onlineTestAttempts', getAttemptDocId(email, testId)));
  return snap.exists();
}

/** Records that this email has started the test. Fails if an attempt already exists. */
export async function recordTestAttemptStart(
  email: string,
  testId: string,
  uid?: string,
): Promise<void> {
  const id = getAttemptDocId(email, testId);
  const ref = doc(db, 'onlineTestAttempts', id);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    throw new Error('attempt-already-exists');
  }

  const attempt: OnlineTestAttempt = {
    email: normalizeTestEmail(email),
    testId,
    uid,
    status: 'started',
    startedAt: new Date().toISOString(),
  };

  await setDoc(ref, attempt);
}

export async function completeTestAttempt(
  email: string,
  testId: string,
  score: number,
  totalQuestions: number,
): Promise<void> {
  const id = getAttemptDocId(email, testId);
  await setDoc(
    doc(db, 'onlineTestAttempts', id),
    {
      email: normalizeTestEmail(email),
      testId,
      status: 'completed',
      completedAt: new Date().toISOString(),
      score,
      totalQuestions,
    },
    { merge: true },
  );
}
