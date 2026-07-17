import { describe, expect, it } from 'vitest';
import { completionPercentage } from './course-progress';
import { resolveVideoSource } from './video-source';
import type { OnlineCourseLesson } from '../commerce/types';

const lesson = (videoUrl: string): OnlineCourseLesson => ({
  id: 'lesson-1',
  title: 'Lesson',
  videoUrl,
  order: 0,
});

describe('course progress', () => {
  it('calculates bounded completion percentages', () => {
    expect(completionPercentage(2, 4)).toBe(50);
    expect(completionPercentage(1, 0)).toBe(0);
    expect(completionPercentage(5, 4)).toBe(100);
  });
});

describe('video source normalization', () => {
  it('uses privacy-enhanced YouTube embeds', () => {
    expect(resolveVideoSource(lesson('https://youtu.be/dQw4w9WgXcQ'))).toEqual({
      kind: 'iframe',
      provider: 'youtube',
      url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    });
  });

  it('supports Vimeo, direct MP4, and generic embeds', () => {
    expect(resolveVideoSource(lesson('https://vimeo.com/123456')).provider).toBe('vimeo');
    expect(resolveVideoSource(lesson('https://cdn.example.com/course.mp4')).kind).toBe('native');
    expect(resolveVideoSource(lesson('https://iframe.example.com/embed/video')).kind).toBe('iframe');
  });

  it('rejects unsafe protocols', () => {
    expect(resolveVideoSource(lesson('javascript:alert(1)')).kind).toBe('none');
  });
});
