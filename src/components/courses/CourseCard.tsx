import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';

export interface Course {
  id: string;
  category: string;
  title: string;
  image: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  duration: string;
  description: string;
  price: string;
  overview?: string[];
}

interface CourseCardProps {
  course: Course;
  index: number;
  onSelect: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, index, onSelect }) => {
  return (
    <div 
      className="card reveal is-visible" 
      style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', "--delay": index, cursor: 'pointer' } as React.CSSProperties}
      onClick={() => onSelect(course)}
    >
      <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="tag" style={{ background: course.tagBg, color: course.tagColor, border: 'none' }}>{course.tag}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Clock size={14} /> {course.duration}
          </span>
        </div>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{course.title}</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6, flexGrow: 1 }}>
          {course.description}
        </p>
        <div style={{ marginTop: 'auto' }}>
          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '0 0 1.5rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>{course.price}</span>
            <span style={{ color: 'var(--accent-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>Details <ArrowRight size={16} /></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
