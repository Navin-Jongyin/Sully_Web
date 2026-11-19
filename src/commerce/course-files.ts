import type { CourseDownloadFile, OnlineVideoCourse } from './types';

export function courseDownloadFiles(course: OnlineVideoCourse): CourseDownloadFile[] {
  const files = (course.downloadFiles ?? []).filter((file) => file.url?.trim());
  if (files.length > 0) return files;
  if (course.downloadFileUrl?.trim()) {
    return [{
      id: 'legacy',
      name: course.downloadFileName?.trim() || 'Download',
      url: course.downloadFileUrl,
    }];
  }
  return [];
}
