import React, { useState, useEffect } from 'react';
import { Clock, X, Check } from 'lucide-react';
import { type Course, getCourseCategories } from '../components/courses/CourseCard';
import CategoryTab, { type CourseCategory } from '../components/courses/CategoryTab';

const tabs: CourseCategory[] = ['Student Pilot', 'Qualified Pilot', 'ATC', 'Others'];

const Courses: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CourseCategory>('Student Pilot');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedCourse) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedCourse]);

  return (
    <main className="page-transition">
      <section className="container section" style={{ paddingTop: 'clamp(2rem, 8vw, 7.5rem)' }}>
        <div className="section-head reveal is-visible">
          <p className="eyebrow">Curriculum</p>
          <h2>Our Courses</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto 0' }}>
            At Sully Academy we offer different courses across aviation fields to meet your goals.
          </p>
        </div>

        <div className="tabs-container reveal is-visible" style={{ marginTop: '3rem' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <CategoryTab category={activeTab} onSelectCourse={setSelectedCourse} />

      </section>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCourse(null)} aria-label="Close modal">
              <X size={20} />
            </button>
            
            <div style={{ padding: 'clamp(1.25rem, 4vw, 3rem)' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {getCourseCategories(selectedCourse).map((cat) => (
                  <span key={cat} className="tag" style={{ background: selectedCourse.tagBg, color: selectedCourse.tagColor, border: 'none', whiteSpace: 'nowrap' }}>{cat}</span>
                ))}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                  <Clock size={16} /> {selectedCourse.duration}
                </span>
              </div>
              
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>{selectedCourse.title}</h2>
              <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
                {selectedCourse.description}
              </p>
              
              <div style={{ background: 'var(--glass-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Program Overview</h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                  {(selectedCourse.overview || []).map((point, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Check size={20} color="var(--accent-blue)" /> {point}
                    </li>
                  ))}
                  {(!selectedCourse.overview || selectedCourse.overview.length === 0) && (
                    <li style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Program details coming soon.</li>
                  )}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Tuition Fee</p>
                  <span style={{ fontWeight: 700, fontSize: '2rem', color: 'var(--text-primary)' }}>{selectedCourse.price}</span>
                </div>
                <a
                  href="https://line.me/R/ti/p/@sully2017"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-primary"
                  style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
                >
                  Enroll Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Courses;
