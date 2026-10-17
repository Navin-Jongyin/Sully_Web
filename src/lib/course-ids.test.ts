import { describe, expect, it } from 'vitest';
import { createCourseId, createLessonId } from './course-ids';

describe('course id helpers', () => {
  it('creates unique IDs for repeated course names', () => {
    const ids = Array.from({ length: 25 }, (_, index) => createCourseId(`Course ${index}`));

    expect(ids.every((id) => id.startsWith('ovc-'))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('creates unique lesson IDs even for the same lesson title', () => {
    const ids = Array.from({ length: 10 }, (_, index) => createLessonId(`Lesson ${index}`, index));

    expect(ids.every((id) => id.startsWith('lesson-'))).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
