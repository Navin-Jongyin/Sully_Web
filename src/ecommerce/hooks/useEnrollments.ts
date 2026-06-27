import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useEcommerceAuth } from '../../context/EcommerceAuthContext';
import type { Enrollment } from '../types';

export function useEnrollments() {
  const { user } = useEcommerceAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEnrollments([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, 'users', user.uid, 'enrollments');
    return onSnapshot(ref, (snap) => {
      setEnrollments(snap.docs.map((d) => ({ courseId: d.id, ...d.data() }) as Enrollment));
      setLoading(false);
    });
  }, [user]);

  return { enrollments, loading };
}

export function useEnrollment(courseId: string | undefined) {
  const { user } = useEcommerceAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !courseId) {
      setEnrollment(null);
      setLoading(false);
      return;
    }

    return onSnapshot(doc(db, 'users', user.uid, 'enrollments', courseId), (snap) => {
      setEnrollment(snap.exists() ? ({ courseId: snap.id, ...snap.data() } as Enrollment) : null);
      setLoading(false);
    });
  }, [user, courseId]);

  return { enrollment, loading, isEnrolled: Boolean(enrollment) };
}

export async function markLessonComplete(userId: string, courseId: string, lessonId: string, totalLessons: number) {
  const ref = doc(db, 'users', userId, 'enrollments', courseId);
  const { getDoc } = await import('firebase/firestore');
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const data = snap.data() as Enrollment;
  const completed = new Set(data.progress.completedLessonIds);
  completed.add(lessonId);
  const completedIds = [...completed];
  const percent = totalLessons > 0 ? Math.round((completedIds.length / totalLessons) * 100) : 0;

  await updateDoc(ref, {
    'progress.completedLessonIds': completedIds,
    'progress.lastLessonId': lessonId,
    'progress.lastAccessedAt': new Date().toISOString(),
    'progress.completionPercent': percent,
    ...(percent >= 100 ? { 'progress.completedAt': new Date().toISOString(), certificateIssued: true } : {}),
  });
}
