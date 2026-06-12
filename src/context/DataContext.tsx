import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { type Course } from '../components/courses/CourseCard';
import {
  DataContext,
  type NewsArticle,
  type StudentMessage,
  type TrackRecord,
  type YearStats,
} from './data-context';

/** Firestore orderBy excludes docs without the field — sort client-side instead. */
function sortByOrder<T>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ao = (a as { order?: number }).order ?? Number.MAX_SAFE_INTEGER;
    const bo = (b as { order?: number }).order ?? Number.MAX_SAFE_INTEGER;
    return ao - bo;
  });
}

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
  const homeLoading = !loadedFlags.news || !loadedFlags.trackRecord || !loadedFlags.studentMessages;

  const markLoaded = (key: keyof typeof loadedFlags) => {
    setLoadedFlags((f) => ({ ...f, [key]: true }));
  };

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'courses'),
      (snapshot) => {
        const data = sortByOrder(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Course)));
        setCoursesState(data);
        markLoaded('courses');
      },
      (error) => {
        console.error('Failed to load courses:', error);
        markLoaded('courses');
      },
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'news'),
      (snapshot) => {
        const data = sortByOrder(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NewsArticle)));
        setNewsState(data);
        markLoaded('news');
      },
      (error) => {
        console.error('Failed to load news:', error);
        markLoaded('news');
      },
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'trackRecord'),
      (snapshot) => {
        const data: TrackRecord = {};
        snapshot.docs.forEach((d) => {
          data[d.id] = { id: d.id, ...d.data() } as YearStats;
        });
        setTrackRecordState(data);
        markLoaded('trackRecord');
      },
      (error) => {
        console.error('Failed to load track record:', error);
        markLoaded('trackRecord');
      },
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'studentMessages'),
      (snapshot) => {
        const data = sortByOrder(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as StudentMessage)));
        setStudentMessagesState(data);
        markLoaded('studentMessages');
      },
      (error) => {
        console.error('Failed to load student messages:', error);
        markLoaded('studentMessages');
      },
    );
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
    const existing = studentMessages.find((m) => m.id === updatedMessage.id);
    const order = updatedMessage.order ?? existing?.order ?? studentMessages.length;
    await setDoc(doc(db, 'studentMessages', updatedMessage.id), { ...updatedMessage, order });
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
      courses, news, trackRecord, studentMessages, loading, homeLoading,
      updateCourse, addCourse, deleteCourse, setCourses,
      updateNews, addNews, deleteNews, setNews,
      updateTrackRecord, deleteTrackRecord,
      updateStudentMessage, addStudentMessage, deleteStudentMessage, setStudentMessages,
    }}>
      {children}
    </DataContext.Provider>
  );
};
