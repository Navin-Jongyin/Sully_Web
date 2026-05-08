import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { type Course } from '../components/courses/CourseCard';

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
  id: string; // The year string (e.g. "2024")
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

interface DataContextType {
  courses: Course[];
  news: NewsArticle[];
  trackRecord: TrackRecord;
  studentMessages: StudentMessage[];
  loading: boolean;
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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCoursesState] = useState<Course[]>([]);
  const [news, setNewsState] = useState<NewsArticle[]>([]);
  const [trackRecord, setTrackRecordState] = useState<TrackRecord>({});
  const [studentMessages, setStudentMessagesState] = useState<StudentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync Courses
  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCoursesState(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Sync News
  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsArticle));
      setNewsState(data);
    });
    return () => unsub();
  }, []);

  // Sync Track Record
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'trackRecord'), (snapshot) => {
      const data: TrackRecord = {};
      snapshot.docs.forEach(doc => {
        data[doc.id] = { id: doc.id, ...doc.data() } as YearStats;
      });
      setTrackRecordState(data);
    });
    return () => unsub();
  }, []);

  // Sync Student Messages
  useEffect(() => {
    const q = query(collection(db, 'studentMessages'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudentMessage));
      setStudentMessagesState(data);
    });
    return () => unsub();
  }, []);

  const updateCourse = async (updatedCourse: Course) => {
    await setDoc(doc(db, 'courses', updatedCourse.id), updatedCourse);
  };

  const addCourse = async (course: Course) => {
    const order = courses.length;
    await setDoc(doc(db, 'courses', course.id), { ...course, order });
  };

  const deleteCourse = async (id: string) => {
    await deleteDoc(doc(db, 'courses', id));
  };

  const setCourses = async (newOrder: Course[]) => {
    for (let i = 0; i < newOrder.length; i++) {
      await updateDoc(doc(db, 'courses', newOrder[i].id), { order: i });
    }
  };

  const updateNews = async (updatedNews: NewsArticle) => {
    await setDoc(doc(db, 'news', updatedNews.id), updatedNews);
  };

  const addNews = async (article: NewsArticle) => {
    const order = news.length;
    await setDoc(doc(db, 'news', article.id), { ...article, order });
  };

  const deleteNews = async (id: string) => {
    await deleteDoc(doc(db, 'news', id));
  };

  const setNews = async (newOrder: NewsArticle[]) => {
    for (let i = 0; i < newOrder.length; i++) {
      await updateDoc(doc(db, 'news', newOrder[i].id), { order: i });
    }
  };

  const updateTrackRecord = async (year: string, updatedStats: YearStats) => {
    await setDoc(doc(db, 'trackRecord', year), updatedStats);
  };

  const deleteTrackRecord = async (year: string) => {
    await deleteDoc(doc(db, 'trackRecord', year));
  };

  const updateStudentMessage = async (updatedMessage: StudentMessage) => {
    await setDoc(doc(db, 'studentMessages', updatedMessage.id), updatedMessage);
  };

  const addStudentMessage = async (message: StudentMessage) => {
    const order = studentMessages.length;
    await setDoc(doc(db, 'studentMessages', message.id), { ...message, order });
  };

  const deleteStudentMessage = async (id: string) => {
    await deleteDoc(doc(db, 'studentMessages', id));
  };

  const setStudentMessages = async (newOrder: StudentMessage[]) => {
    for (let i = 0; i < newOrder.length; i++) {
      await updateDoc(doc(db, 'studentMessages', newOrder[i].id), { order: i });
    }
  };

  return (
    <DataContext.Provider value={{ 
      courses, news, trackRecord, studentMessages, loading,
      updateCourse, addCourse, deleteCourse, setCourses,
      updateNews, addNews, deleteNews, setNews,
      updateTrackRecord, deleteTrackRecord,
      updateStudentMessage, addStudentMessage, deleteStudentMessage, setStudentMessages
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
