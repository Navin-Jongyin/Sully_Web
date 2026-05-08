import React from 'react';
import CourseCard, { type Course } from './CourseCard';

const coursesData: Course[] = [
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

interface Props {
  onSelectCourse: (course: Course) => void;
}

const OthersTab: React.FC<Props> = ({ onSelectCourse }) => {
  return (
    <div className="grid cards-3" style={{ marginTop: '2rem' }}>
      {coursesData.map((course, index) => (
        <CourseCard key={course.id} course={course} index={index} onSelect={onSelectCourse} />
      ))}
    </div>
  );
};

export default OthersTab;
