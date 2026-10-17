import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getActiveCourseIds, type UserCourseAccessEntry } from '../lib/user-course-access';

export type UserCourseAccess = UserCourseAccessEntry;

export function useAssignedCourses(userId?: string | null): {
  assignedCourseIds: string[];
  assignments: UserCourseAccess[];
  loading: boolean;
} {
  const [assignedCourseIds, setAssignedCourseIds] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<UserCourseAccess[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setAssignedCourseIds([]);
      setAssignments([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsub = onSnapshot(
      doc(db, 'users', userId),
      (snapshot) => {
        const courses = (snapshot.data()?.courses ?? []) as UserCourseAccess[];
        const active = courses.filter((entry) => entry.status !== 'revoked' && !((entry.expiresAt && typeof (entry.expiresAt as { toDate?: () => Date }).toDate === 'function') && Date.now() > (entry.expiresAt as { toDate: () => Date }).toDate().getTime()));
        setAssignments(active);
        setAssignedCourseIds(getActiveCourseIds(courses));
        setLoading(false);
      },
      () => {
        setAssignedCourseIds([]);
        setAssignments([]);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [userId]);

  return { assignedCourseIds, assignments, loading };
}
