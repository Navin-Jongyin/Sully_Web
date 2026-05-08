import React from 'react';
import CourseCard, { type Course } from './CourseCard';

const coursesData: Course[] = [
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
  }
];

interface Props {
  onSelectCourse: (course: Course) => void;
}

const StudentPilotTab: React.FC<Props> = ({ onSelectCourse }) => {
  return (
    <div className="grid cards-3" style={{ marginTop: '2rem' }}>
      {coursesData.map((course, index) => (
        <CourseCard key={course.id} course={course} index={index} onSelect={onSelectCourse} />
      ))}
    </div>
  );
};

export default StudentPilotTab;
