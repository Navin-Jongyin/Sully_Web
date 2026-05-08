import React from 'react';
import CourseCard, { type Course } from './CourseCard';

const coursesData: Course[] = [
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
  }
];

interface Props {
  onSelectCourse: (course: Course) => void;
}

const QualifiedPilotTab: React.FC<Props> = ({ onSelectCourse }) => {
  return (
    <div className="grid cards-3" style={{ marginTop: '2rem' }}>
      {coursesData.map((course, index) => (
        <CourseCard key={course.id} course={course} index={index} onSelect={onSelectCourse} />
      ))}
    </div>
  );
};

export default QualifiedPilotTab;
