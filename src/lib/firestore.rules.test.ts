import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

  it('allows owners and rejects non-owners when reading lessons', async () => {
    const alice = environment.authenticatedContext('alice').firestore();
    const bob = environment.authenticatedContext('bob').firestore();
    await assertSucceeds(getDoc(doc(alice, 'onlineVideoCourses/course-1/lessons/lesson-1')));
    await assertFails(getDoc(doc(bob, 'onlineVideoCourses/course-1/lessons/lesson-1')));
  });

  it('allows an entitled student to save only their progress', async () => {
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
});
