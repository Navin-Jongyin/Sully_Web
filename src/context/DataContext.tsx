import React, { createContext, useContext, useState, useEffect } from 'react';
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
}

export interface YearStats {
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
}

interface DataContextType {
  courses: Course[];
  news: NewsArticle[];
  trackRecord: TrackRecord;
  studentMessages: StudentMessage[];
  updateCourse: (updatedCourse: Course) => void;
  addCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  updateNews: (updatedNews: NewsArticle) => void;
  addNews: (news: NewsArticle) => void;
  deleteNews: (id: string) => void;
  updateTrackRecord: (year: string, updatedStats: YearStats) => void;
  updateStudentMessage: (updatedMessage: StudentMessage) => void;
  addStudentMessage: (message: StudentMessage) => void;
  deleteStudentMessage: (id: string) => void;
}

const initialCourses: Course[] = [
  // Student Pilot
  {
    id: 'full-course',
    category: 'Student Pilot',
    title: 'Full Course',
    image: '/course_ppl.png',
    tag: 'Student Pilot',
    tagColor: 'var(--text-primary)',
    tagBg: 'rgba(150, 0, 251, 0.2)',
    duration: '24 Weeks',
    description: 'The complete blueprint for your cadet pilot journey. This all-inclusive program bundles Math & Physics, Aptitude testing, and Captain Interview preparation to guarantee you are fully equipped for every stage of airline screening.',
    price: '฿39,000'
  },
  {
    id: 'math-physics',
    category: 'Student Pilot',
    title: 'Math + Physics (First Round)',
    image: '/course_cpl.png',
    tag: 'Student Pilot',
    tagColor: 'var(--text-primary)',
    tagBg: 'rgba(150, 0, 251, 0.2)',
    duration: '8 Weeks',
    description: 'Master the core academics required to pass the first round of cadet pilot exams. Focus on speed, accuracy, and aviation-specific problem-solving.',
    price: '฿25,000'
  },
  {
    id: 'captain-interview',
    category: 'Student Pilot',
    title: 'Captain Interview Preparation',
    image: '/course_ir.png',
    tag: 'Student Pilot',
    tagColor: 'var(--text-primary)',
    tagBg: 'rgba(150, 0, 251, 0.2)',
    duration: '4 Weeks',
    description: 'Learn how to present yourself to an airline captain. Practice mock interviews, body language, and structuring your answers professionally.',
    price: '฿18,000'
  },
  {
    id: 'professor-round',
    category: 'Student Pilot',
    title: 'Professor Round (Aptitude & Group)',
    image: '/course_ppl.png',
    tag: 'Student Pilot',
    tagColor: 'var(--text-primary)',
    tagBg: 'rgba(150, 0, 251, 0.2)',
    duration: '6 Weeks',
    description: 'Comprehensive preparation for Aptitude testing, Group Exercises, and Individual psychological tests. Build teamwork and logical reasoning skills.',
    price: '฿30,000'
  },
  {
    id: 'medical-class-1',
    category: 'Student Pilot',
    title: 'Medical Class 1 Prep',
    image: '/course_cpl.png',
    tag: 'Student Pilot',
    tagColor: 'var(--text-primary)',
    tagBg: 'rgba(150, 0, 251, 0.2)',
    duration: '1 Week',
    description: 'Understand the requirements for the CAAT Class 1 Medical certificate. Pre-screening advice and preparation guidelines.',
    price: '฿5,000'
  },
  // Qualified Pilot
  {
    id: 'med-1-rtaf',
    category: 'Qualified Pilot',
    title: 'Medical Class 1 (RTAF)',
    image: '/course_cpl.png',
    tag: 'Medical',
    tagColor: 'var(--text-primary)',
    tagBg: 'rgba(168, 85, 247, 0.2)',
    duration: '1 Week',
    description: 'Specialized preparation for the strict Royal Thai Air Force Class 1 Medical assessment. Covering physical, psychological, and specific vision requirements.',
    price: '฿6,500'
  },
  {
    id: 'med-1-bgh',
    category: 'Qualified Pilot',
    title: 'Medical Class 1 (Bangkok Hospital)',
    image: '/course_ppl.png',
    tag: 'Medical',
    tagColor: 'var(--accent-blue)',
    tagBg: 'rgba(59, 130, 246, 0.2)',
    duration: '1 Week',
    description: 'Comprehensive screening preparation tailored for Bangkok Hospital’s Class 1 Medical standards. Focuses on general health, cardiovascular, and neurological requirements.',
    price: '฿5,500'
  },
  {
    id: 'professor-1-3',
    category: 'Qualified Pilot',
    title: 'Professor Round',
    image: '/course_ir.png',
    tag: 'Assessment',
    tagColor: 'var(--sun-500)',
    tagBg: 'rgba(234, 179, 8, 0.2)',
    duration: '10 Weeks',
    description: 'Intensive aptitude and academic assessment preparation. Learn logical reasoning, spatial awareness, and advanced problem-solving techniques for airline entry tests.',
    price: '฿45,000'
  },
  {
    id: 'interview-prep',
    category: 'Qualified Pilot',
    title: 'Captain Interview Preparation',
    image: '/course_cpl.png',
    tag: 'Career',
    tagColor: 'var(--text-primary)',
    tagBg: 'rgba(255, 255, 255, 0.1)',
    duration: '4 Weeks',
    description: 'Master the Qualified Pilot board interview. Practice technical Q&A, CRM scenarios, and behavioral profiling with experienced airline captains.',
    price: '฿20,000'
  },
  // ATC
  {
    id: 'atc-full-course',
    category: 'ATC',
    title: 'ATC Full Course',
    image: '/course_ir.png',
    tag: 'Comprehensive',
    tagColor: 'var(--text-primary)',
    tagBg: 'rgba(255, 255, 255, 0.1)',
    duration: '42 Weeks',
    description: 'The complete Air Traffic Control training program. Covers Aerodrome, Approach Radar, and Area Control Center operations to fully prepare you for a career as an Air Traffic Controller.',
    price: '฿1,350,000'
  },
  // Others
  {
    id: 'aviation-english',
    category: 'Others',
    title: 'ATPL',
    image: '/course_ppl.png',
    tag: 'Language',
    tagColor: 'var(--accent-blue)',
    tagBg: 'rgba(59, 130, 246, 0.2)',
    duration: '6 Weeks',
    description: 'Achieve ICAO Level 4 proficiency. Specialized vocabulary and radio telephony phrases for safe international communication.',
    price: '฿85,000'
  },
  {
    id: 'drone-pilot',
    category: 'Others',
    title: 'GMAT, SAT, and TOEIC',
    image: '/course_ir.png',
    tag: 'Test',
    tagColor: 'var(--text-primary)',
    tagBg: 'rgba(168, 85, 247, 0.2)',
    duration: '2 Weeks',
    description: 'Get certified for commercial drone operations. Covers regulations, airspace, weather, and practical flight maneuvering.',
    price: '฿45,000'
  }
];

const initialNews: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Thai Airways Student Pilot 2026',
    image: '/tg_crew.png',
    tag: 'Student Pilot',
    description: 'FLY FOR THE NEW PRIDE. We are ready to fly to the farther future together. Explore recruitment opportunities with Thai Airways.',
    link: 'https://career.thaiairways.com/student-pilot-recruitment-2026/',
    date: '2024-10-15',
    author: 'Capt. Sully',
    status: 'Published'
  },
  {
    id: 'news-2',
    title: 'Thai Vietjet Student Pilot 2025',
    image: '/vz_crew.png',
    tag: 'Career Opportunity',
    description: 'ROAD TO SKY JOURNEY 2025. Student Pilot Recruitment program is now open. Join Vietjet Thailand and start your aviation journey.',
    link: '#',
    date: '2024-10-10',
    author: 'Admin',
    status: 'Published'
  },
  {
    id: 'news-3',
    title: 'Thai Airways Cadet Program',
    image: '/tg_crew.png',
    tag: 'Update',
    description: 'Prepare for your future with the nation\'s leading carrier. Discover comprehensive training programs designed for upcoming aviation professionals.',
    link: '#',
    date: '2024-10-05',
    author: 'Capt. Sully',
    status: 'Published'
  }
];

const initialTrackRecord: TrackRecord = {
  '2024': {
    stats: [
      { label: 'PPL Written', value: '96%' },
      { label: 'CPL Written', value: '89%' },
      { label: 'Aptitude Tests', value: '94%' }
    ],
    testimonial: {
      quote: "Sully Academy transformed my ground school experience. I was struggling with Navigation, but their simplified approach made it click instantly. I passed my exam with a 92%!",
      author: "Student Pilot N. Srisuwan"
    }
  },
  '2025': {
    stats: [
      { label: 'Projected Passes', value: '250+' },
      { label: 'Expansion Rate', value: '40%' },
      { label: 'New Modules', value: '12' }
    ],
    testimonial: {
      quote: "Looking forward to another year of helping more students achieve their wings. 2025 will be our biggest year yet.",
      author: "Capt. Sully"
    }
  }
};

const initialStudentMessages: StudentMessage[] = [
  {
    id: 'msg-1',
    name: 'Thanawat K.',
    message: 'The best ground school in Thailand! The instructors really care about your success and make complex topics so easy to understand.',
    position: 'Thai Airways Cadet',
    rating: 5
  },
  {
    id: 'msg-2',
    name: 'Pattara S.',
    message: 'Passed my CPL written exam on the first try thanks to Sully Academy. Their mock exams are incredibly accurate to the real thing.',
    position: 'Student Pilot',
    rating: 5
  },
  {
    id: 'msg-3',
    name: 'Anirut W.',
    message: 'Excellent curriculum and very professional environment. Highly recommend for anyone serious about a career in aviation.',
    position: 'Qualified Pilot',
    rating: 5
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('sully_courses');
    return saved ? JSON.parse(saved) : initialCourses;
  });

  const [news, setNews] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem('sully_news');
    return saved ? JSON.parse(saved) : initialNews;
  });

  const [trackRecord, setTrackRecord] = useState<TrackRecord>(() => {
    const saved = localStorage.getItem('sully_track_record_v2');
    return saved ? JSON.parse(saved) : initialTrackRecord;
  });

  const [studentMessages, setStudentMessages] = useState<StudentMessage[]>(() => {
    const saved = localStorage.getItem('sully_student_messages');
    return saved ? JSON.parse(saved) : initialStudentMessages;
  });

  useEffect(() => {
    localStorage.setItem('sully_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('sully_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('sully_track_record_v2', JSON.stringify(trackRecord));
  }, [trackRecord]);

  useEffect(() => {
    localStorage.setItem('sully_student_messages', JSON.stringify(studentMessages));
  }, [studentMessages]);

  const updateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const addCourse = (course: Course) => {
    setCourses(prev => [...prev, course]);
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const updateNews = (updatedNews: NewsArticle) => {
    setNews(prev => prev.map(n => n.id === updatedNews.id ? updatedNews : n));
  };

  const addNews = (article: NewsArticle) => {
    setNews(prev => [...prev, article]);
  };

  const deleteNews = (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
  };

  const updateTrackRecord = (year: string, updatedStats: YearStats) => {
    setTrackRecord(prev => ({
      ...prev,
      [year]: updatedStats
    }));
  };

  const updateStudentMessage = (updatedMessage: StudentMessage) => {
    setStudentMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
  };

  const addStudentMessage = (message: StudentMessage) => {
    setStudentMessages(prev => [...prev, message]);
  };

  const deleteStudentMessage = (id: string) => {
    setStudentMessages(prev => prev.filter(m => m.id !== id));
  };

  return (
    <DataContext.Provider value={{ 
      courses, 
      news, 
      trackRecord, 
      studentMessages,
      updateCourse, 
      addCourse, 
      deleteCourse, 
      updateNews, 
      addNews, 
      deleteNews, 
      updateTrackRecord,
      updateStudentMessage,
      addStudentMessage,
      deleteStudentMessage
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
