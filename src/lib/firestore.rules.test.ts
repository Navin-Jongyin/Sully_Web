import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { afterAll, beforeAll, describe, it } from 'vitest';

const emulatorAvailable = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

describe.skipIf(!emulatorAvailable)('course commerce Firestore rules', () => {
  let environment: RulesTestEnvironment;

  beforeAll(async () => {
    environment = await initializeTestEnvironment({
      projectId: 'demo-sully-commerce',
      firestore: {
        rules: await readFile('firestore.rules', 'utf8'),
      },
    });
    await environment.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'onlineVideoCourses/course-1'), {
        title: 'Course',
        published: true,
      });
      await setDoc(doc(firestore, 'onlineVideoCourses/course-1/lessons/lesson-1'), {
        title: 'Lesson',
        videoUrl: 'https://video.example/lesson.mp4',
      });
      await setDoc(doc(firestore, 'userEntitlements/alice/courses/course-1'), {
        uid: 'alice',
        courseId: 'course-1',
      });
      await setDoc(doc(firestore, 'users/admin'), {
        uid: 'admin',
        role: 'admin',
      });
      await setDoc(doc(firestore, 'users/alice'), {
        uid: 'alice',
        role: 'customer',
      });
      await setDoc(doc(firestore, 'users/student-no-role'), {
        uid: 'student-no-role',
        email: 'student@example.com',
      });
      await setDoc(doc(firestore, 'users/alice/enrollments/course-1'), {
        courseId: 'course-1',
        title: 'Course',
      });
    });
  });

  afterAll(async () => {
    await environment.cleanup();
  });

  it('prevents clients from forging purchases', async () => {
    const alice = environment.authenticatedContext('alice').firestore();
    await assertFails(setDoc(doc(alice, 'purchases/alice_course-1'), {
      uid: 'alice',
      status: 'paid',
    }));
  });

  it('allows anyone to read and delete course lessons', async () => {
    const guest = environment.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(guest, 'onlineVideoCourses/course-1/lessons/lesson-1')));
    await assertSucceeds(deleteDoc(doc(guest, 'onlineVideoCourses/course-1/lessons/lesson-1')));
    await assertSucceeds(deleteDoc(doc(guest, 'onlineVideoCourses/course-1')));
  });

  it('allows admins to manage another user\'s enrollment records', async () => {
    const admin = environment.authenticatedContext('admin', { email: 'admin@example.com' }).firestore();
    const bob = environment.authenticatedContext('bob').firestore();

    await environment.withSecurityRulesDisabled(async (context) => {
      const firestore = context.firestore();
      await setDoc(doc(firestore, 'users/admin'), { role: 'admin' });
      await setDoc(doc(firestore, 'users/bob'), { role: 'customer', email: 'bob@example.com' });
      await setDoc(doc(firestore, 'users/bob/enrollments/course-1'), { courseId: 'course-1' });
    });

    await assertSucceeds(getDoc(doc(admin, 'users/bob')));
    await assertSucceeds(getDoc(doc(admin, 'users/bob/enrollments/course-1')));
    await assertFails(getDoc(doc(bob, 'users/alice/enrollments/course-1')));
  });

  it('allows a student to save only their own course progress', async () => {
    const alice = environment.authenticatedContext('alice').firestore();
    const bob = environment.authenticatedContext('bob').firestore();
    await assertSucceeds(setDoc(doc(alice, 'users/alice/courseProgress/course-1'), {
      uid: 'alice',
      courseId: 'course-1',
      completionPercentage: 25,
    }));
    await assertFails(setDoc(doc(bob, 'users/alice/courseProgress/course-1'), {
      uid: 'alice',
      courseId: 'course-1',
      completionPercentage: 100,
    }));
  });

  it('allows admins to read user profiles and assign enrollment records', async () => {
    const admin = environment.authenticatedContext('admin').firestore();
    const alice = environment.authenticatedContext('alice').firestore();

    await assertSucceeds(getDoc(doc(admin, 'users/alice')));
    await assertSucceeds(getDoc(doc(admin, 'users/alice/enrollments/course-1')));
    await assertSucceeds(setDoc(doc(admin, 'users/alice/enrollments/course-2'), {
      courseId: 'course-2',
      title: 'Course 2',
      enrolledAt: new Date(),
    }));
    await assertFails(setDoc(doc(alice, 'users/alice/enrollments/course-2'), {
      courseId: 'course-2',
      title: 'Course 2',
      enrolledAt: new Date(),
    }));
  });

  it('allows the admin panel to assign courses without changing account role', async () => {
    const guest = environment.unauthenticatedContext().firestore();
    await assertSucceeds(setDoc(doc(guest, 'users/alice'), {
      courses: [{ courseId: 'course-1', status: 'active' }],
    }, { merge: true }));
    await assertFails(setDoc(doc(guest, 'users/alice'), {
      role: 'admin',
    }, { merge: true }));
    await assertSucceeds(setDoc(doc(guest, 'users/student-no-role'), {
      courses: [{ courseId: 'course-1', status: 'active' }],
    }, { merge: true }));
  });
});
