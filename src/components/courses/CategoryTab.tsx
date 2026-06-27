import React from 'react';
import CourseCard, { type Course, getCourseCategories } from './CourseCard';
import { useData } from '../../hooks/useData';

export type CourseCategory = 'Student Pilot' | 'Qualified Pilot' | 'ATC' | 'Others';

interface Props {
  category: CourseCategory;
  onSelectCourse: (course: Course) => void;
}

const CategoryTab: React.FC<Props> = ({ category, onSelectCourse }) => {
  const { courses } = useData();
  const filtered = courses.filter((c) => getCourseCategories(c).includes(category));

  if (filtered.length === 0) {
    return (
      <div
        style={{
          marginTop: '2rem',
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'var(--glass-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--glass-border)',
          color: 'var(--text-secondary)',
        }}
      >
        <p>No courses available in this category yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid cards-3" style={{ marginTop: '2rem' }}>
      {filtered.map((course, index) => (
        <CourseCard key={course.id} course={course} index={index} onSelect={onSelectCourse} />
      ))}
    </div>
  );
};

export default CategoryTab;
