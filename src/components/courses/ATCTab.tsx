import React from 'react';
import CourseCard, { type Course } from './CourseCard';

const coursesData: Course[] = [
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
  
];

interface Props {
  onSelectCourse: (course: Course) => void;
}

const ATCTab: React.FC<Props> = ({ onSelectCourse }) => {
  return (
    <div className="grid cards-3" style={{ marginTop: '2rem' }}>
      {coursesData.map((course, index) => (
        <CourseCard key={course.id} course={course} index={index} onSelect={onSelectCourse} />
      ))}
    </div>
  );
};

export default ATCTab;
