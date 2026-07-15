import { createContext } from 'react';
import { type Course } from '../components/courses/CourseCard';
import { type OnlineTestRecord } from '../online-test/types';
import { type MerchandiseProduct, type OnlineVideoCourse } from '../commerce/types';

export interface NewsArticle {
  id: string;
  title: string;
  image: string;
  tag: string;
  description: string;
  link: string;
  date?: string;
  author?: string;
  status?: 'Published' | 'Draft';
  order?: number;
}

export interface YearStats {
  id: string;
  stats: { label: string; value: string }[];
  testimonial: { quote: string; author: string };
}

export interface TrackRecord {
  [year: string]: YearStats;
}

export interface StudentMessage {
  id: string;
  name: string;
  message: string;
  position: string;
  rating: number;
  order?: number;
}

export interface DataContextValue {
  courses: Course[];
  news: NewsArticle[];
  trackRecord: TrackRecord;
  studentMessages: StudentMessage[];
  onlineTests: OnlineTestRecord[];
  merchandise: MerchandiseProduct[];
  onlineVideoCourses: OnlineVideoCourse[];
  loading: boolean;
  homeLoading: boolean;
  updateCourse: (updatedCourse: Course) => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  setCourses: (courses: Course[]) => Promise<void>;
  updateNews: (updatedNews: NewsArticle) => Promise<void>;
  addNews: (news: NewsArticle) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  setNews: (news: NewsArticle[]) => Promise<void>;
  updateTrackRecord: (year: string, updatedStats: YearStats) => Promise<void>;
  deleteTrackRecord: (year: string) => Promise<void>;
  updateStudentMessage: (updatedMessage: StudentMessage) => Promise<void>;
  addStudentMessage: (message: StudentMessage) => Promise<void>;
  deleteStudentMessage: (id: string) => Promise<void>;
  setStudentMessages: (messages: StudentMessage[]) => Promise<void>;
  addOnlineTest: (test: OnlineTestRecord) => Promise<void>;
  updateOnlineTest: (test: OnlineTestRecord) => Promise<void>;
  deleteOnlineTest: (id: string) => Promise<void>;
  addMerchandise: (item: MerchandiseProduct) => Promise<void>;
  updateMerchandise: (item: MerchandiseProduct) => Promise<void>;
  deleteMerchandise: (id: string) => Promise<void>;
  addOnlineVideoCourse: (course: OnlineVideoCourse) => Promise<void>;
  updateOnlineVideoCourse: (course: OnlineVideoCourse) => Promise<void>;
  deleteOnlineVideoCourse: (id: string) => Promise<void>;
}

export const DataContext = createContext<DataContextValue | undefined>(undefined);
