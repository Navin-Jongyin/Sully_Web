import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { CourseProgress, LessonProgress } from '../commerce/types';

export function completionPercentage(completedLessons: number, totalLessons: number): number {
  if (totalLessons <= 0) return 0;
  return Math.min(100, Math.round((completedLessons / totalLessons) * 100));
}

export function subscribeCourseProgress(
  uid: string,
  onData: (progress: Record<string, CourseProgress>) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'users', uid, 'courseProgress'),
    (snapshot) => {
      const records: Record<string, CourseProgress> = {};
      snapshot.docs.forEach((progress) => {
        records[progress.id] = {
          courseId: progress.id,
          ...progress.data(),
        } as CourseProgress;
      });
      onData(records);
    },
    (error) => onError?.(error),
  );
}

export async function fetchCourseProgress(
  uid: string,
  courseId: string,
): Promise<CourseProgress | null> {
  const snapshot = await getDoc(doc(db, 'users', uid, 'courseProgress', courseId));
  return snapshot.exists()
    ? { courseId, ...snapshot.data() } as CourseProgress
    : null;
}

export async function fetchLessonProgress(
  uid: string,
  courseId: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  const snapshot = await getDoc(
    doc(db, 'users', uid, 'courseProgress', courseId, 'lessons', lessonId),
  );
  return snapshot.exists()
    ? { lessonId, courseId, ...snapshot.data() } as LessonProgress
    : null;
}

interface SaveLessonProgressInput {
  uid: string;
  courseId: string;
  lessonId: string;
  currentTimeSeconds: number;
  durationSeconds: number;
  totalLessons: number;
  completed?: boolean;
}

export async function saveLessonProgress({
  uid,
  courseId,
  lessonId,
  currentTimeSeconds,
  durationSeconds,
  totalLessons,
  completed = false,
}: SaveLessonProgressInput): Promise<void> {
  const summaryRef = doc(db, 'users', uid, 'courseProgress', courseId);
  const lessonRef = doc(summaryRef, 'lessons', lessonId);

  await runTransaction(db, async (transaction) => {
    const [summarySnapshot, lessonSnapshot] = await Promise.all([
      transaction.get(summaryRef),
      transaction.get(lessonRef),
    ]);
    const summary = summarySnapshot.data() as Partial<CourseProgress> | undefined;
    const previousLesson = lessonSnapshot.data() as Partial<LessonProgress> | undefined;
    const wasCompleted = previousLesson?.completed === true;
    const isCompleted = wasCompleted || completed;
    const completedIds = new Set(summary?.completedLessonIds ?? []);
    if (isCompleted) completedIds.add(lessonId);
    const completedLessons = completedIds.size;
    const percentage = completionPercentage(completedLessons, totalLessons);

    transaction.set(lessonRef, {
      lessonId,
      courseId,
      currentTimeSeconds: Math.max(0, Math.round(currentTimeSeconds)),
      durationSeconds: Math.max(0, Math.round(durationSeconds)),
      completed: isCompleted,
      updatedAt: serverTimestamp(),
      ...(isCompleted && !wasCompleted ? { completedAt: serverTimestamp() } : {}),
    }, { merge: true });

    transaction.set(summaryRef, {
      uid,
      courseId,
      lastLessonId: lessonId,
      completedLessonIds: [...completedIds],
      completedLessons,
      totalLessons,
      completionPercentage: percentage,
      lastAccessedAt: serverTimestamp(),
      ...(percentage === 100 ? { completedAt: serverTimestamp() } : {}),
    }, { merge: true });
  });
}
