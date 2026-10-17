function randomSuffix(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(value: string, fallback = 'item'): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || fallback;
}

export function createCourseId(title = 'online-course'): string {
  return `ovc-${slugify(title, 'online-course')}-${randomSuffix()}`;
}

export function createLessonId(title = 'lesson', order = 0): string {
  return `lesson-${slugify(title, 'lesson')}-${order}-${randomSuffix()}`;
}
