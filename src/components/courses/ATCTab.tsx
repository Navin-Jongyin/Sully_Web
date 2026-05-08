import React from 'react';
import CourseCard, { type Course } from './CourseCard';
import { useData } from '../../context/DataContext';

interface Props {
  onSelectCourse: (course: Course) => void;
}

const ATCTab: React.FC<Props> = ({ onSelectCourse }) => {
  const { courses } = useData();
  const filteredCourses = courses.filter(c => c.category === 'ATC');

  return (
    <div className="grid cards-3" style={{ marginTop: '2rem' }}>
      {filteredCourses.map((course, index) => (
        <CourseCard key={course.id} course={course} index={index} onSelect={onSelectCourse} />
      ))}
    </div>
  );
};

export default ATCTab;
