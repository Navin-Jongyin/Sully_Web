import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { OnlineCourseLesson, OnlineVideoCourse } from '../commerce/types';

function normalizeLessons(
  courseId: string,
  lessons: OnlineCourseLesson[],
): OnlineCourseLesson[] {
  return lessons
    .map((lesson, index) => ({
      ...lesson,
      courseId,
      order: Number.isFinite(lesson.order) ? lesson.order : index,
      videoProvider: lesson.videoProvider ?? 'auto',
    }))
    .sort((a, b) => a.order - b.order);
}

export function publicLessonMetadata(lessons: OnlineCourseLesson[]): OnlineCourseLesson[] {
  return lessons.map((lesson, index) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description ?? '',
    durationSeconds: lesson.durationSeconds ?? 0,
    order: index,
  }));
}

export async function fetchCourseLessons(
  course: OnlineVideoCourse,
): Promise<OnlineCourseLesson[]> {
  const snapshot = await getDocs(collection(db, 'onlineVideoCourses', course.id, 'lessons'));
  if (snapshot.empty) return normalizeLessons(course.id, course.lessons ?? []);
  return normalizeLessons(
    course.id,
    snapshot.docs.map((lesson) => ({
      id: lesson.id,
      ...lesson.data(),
    } as OnlineCourseLesson)),
  );
}

export function subscribeCourseLessons(
  course: OnlineVideoCourse,
  onData: (lessons: OnlineCourseLesson[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, 'onlineVideoCourses', course.id, 'lessons'),
    (snapshot) => {
      const lessons = snapshot.empty
        ? course.lessons ?? []
        : snapshot.docs.map((lesson) => ({
          id: lesson.id,
          ...lesson.data(),
        } as OnlineCourseLesson));
      onData(normalizeLessons(course.id, lessons));
    },
    (error) => {
      // Legacy embedded lessons remain usable during a staged rules/migration rollout.
      onData(normalizeLessons(course.id, course.lessons ?? []));
      onError?.(error);
    },
  );
}

export async function persistCourseLessons(
  courseId: string,
  lessons: OnlineCourseLesson[],
  previousLessonIds: string[] = [],
): Promise<void> {
  const lessonCollection = collection(db, 'onlineVideoCourses', courseId, 'lessons');
  const incomingIds = new Set(lessons.map((lesson) => lesson.id));
  const batch = writeBatch(db);

  previousLessonIds.forEach((lessonId) => {
    if (!incomingIds.has(lessonId)) batch.delete(doc(lessonCollection, lessonId));
  });
  normalizeLessons(courseId, lessons).forEach((lesson, index) => {
    const lessonData: Record<string, unknown> = {
      ...lesson,
      courseId,
      order: index,
    };
    // Admins using the deferred session-only flow cannot read protected video
    // URLs; leaving the field blank retains the existing URL during metadata edits.
    if (!lesson.videoUrl) delete lessonData.videoUrl;
    batch.set(doc(lessonCollection, lesson.id), lessonData, { merge: true });
  });
  await batch.commit();
}

export async function migrateEmbeddedLessons(
  courses: OnlineVideoCourse[],
): Promise<number> {
  let migrated = 0;
  for (const course of courses) {
    if (
      !course.lessons?.length
      || (course as OnlineVideoCourse & { lessonsMigratedAt?: unknown }).lessonsMigratedAt
    ) continue;
    await persistCourseLessons(course.id, course.lessons);
    await setDoc(doc(db, 'onlineVideoCourses', course.id), {
      lessonCount: course.lessons.length,
      lessons: publicLessonMetadata(course.lessons),
      lessonsMigratedAt: new Date().toISOString(),
    }, { merge: true });
    migrated += 1;
  }
  return migrated;
}

export async function deleteCourseLessons(
  courseId: string,
  lessonIds: string[],
): Promise<void> {
  await Promise.all(
    lessonIds.map((lessonId) => deleteDoc(doc(db, 'onlineVideoCourses', courseId, 'lessons', lessonId))),
  );
}
