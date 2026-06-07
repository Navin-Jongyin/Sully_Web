import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { type Course } from '../components/courses/CourseCard';
import {
  DataContext,
  type NewsArticle,
  type StudentMessage,
  type TrackRecord,
  type YearStats,
} from './data-context';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCoursesState] = useState<Course[]>([]);
  const [news, setNewsState] = useState<NewsArticle[]>([]);
  const [trackRecord, setTrackRecordState] = useState<TrackRecord>({});
  const [studentMessages, setStudentMessagesState] = useState<StudentMessage[]>([]);

  // Track loading per collection so we don't render empty grids prematurely.
  const [loadedFlags, setLoadedFlags] = useState({
    courses: false,
    news: false,
    trackRecord: false,
    studentMessages: false,
  });
  const loading = !Object.values(loadedFlags).every(Boolean);

  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
      setCoursesState(data);
      setLoadedFlags((f) => ({ ...f, courses: true }));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'news'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NewsArticle));
      setNewsState(data);
      setLoadedFlags((f) => ({ ...f, news: true }));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'trackRecord'), (snapshot) => {
      const data: TrackRecord = {};
      snapshot.docs.forEach((d) => {
        data[d.id] = { id: d.id, ...d.data() } as YearStats;
      });
      setTrackRecordState(data);
      setLoadedFlags((f) => ({ ...f, trackRecord: true }));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'studentMessages'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as StudentMessage));
      setStudentMessagesState(data);
      setLoadedFlags((f) => ({ ...f, studentMessages: true }));
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

  // Atomic batch reorder: one round trip, all-or-nothing.
  const setCourses = async (newOrder: Course[]) => {
    const batch = writeBatch(db);
    newOrder.forEach((c, i) => {
      batch.update(doc(db, 'courses', c.id), { order: i });
    });
    await batch.commit();
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
    const batch = writeBatch(db);
    newOrder.forEach((n, i) => {
      batch.update(doc(db, 'news', n.id), { order: i });
    });
    await batch.commit();
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
    const batch = writeBatch(db);
    newOrder.forEach((m, i) => {
      batch.update(doc(db, 'studentMessages', m.id), { order: i });
    });
    await batch.commit();
  };

  return (
    <DataContext.Provider value={{
      courses, news, trackRecord, studentMessages, loading,
      updateCourse, addCourse, deleteCourse, setCourses,
      updateNews, addNews, deleteNews, setNews,
      updateTrackRecord, deleteTrackRecord,
      updateStudentMessage, addStudentMessage, deleteStudentMessage, setStudentMessages,
    }}>
      {children}
    </DataContext.Provider>
  );
};
