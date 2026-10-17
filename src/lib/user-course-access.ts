export interface CourseExpiry {
  toDate: () => Date;
}

export interface UserCourseAccessEntry {
  courseId: string;
  assignedBy?: string;
  assignedAt?: unknown;
  expiresAt?: CourseExpiry | null;
  status?: 'active' | 'revoked';
}

export function isCourseAccessActive(
  entries: UserCourseAccessEntry[] | undefined,
  courseId: string,
): boolean {
  const entry = entries?.find((item) => item.courseId === courseId);
  if (!entry) return false;
  if (entry.status === 'revoked') return false;

  const expiresAt = entry.expiresAt;
  if (expiresAt && typeof expiresAt.toDate === 'function') {
    const expiryMs = expiresAt.toDate().getTime();
    if (Date.now() > expiryMs) return false;
  }

  return true;
}

export function getActiveCourseIds(entries: UserCourseAccessEntry[] | undefined): string[] {
  return (entries ?? [])
    .filter((entry) => isCourseAccessActive([entry], entry.courseId))
    .map((entry) => entry.courseId);
}
