import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useEcommerceAuth } from '../../context/EcommerceAuthContext';
import { markLessonComplete, useEnrollment } from '../hooks/useEnrollments';
import { fetchProductById } from '../hooks/useProducts';
import { useEffect } from 'react';
import type { Product } from '../types';

export function CoursePlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useEcommerceAuth();
  const { enrollment, loading, isEnrolled } = useEnrollment(courseId);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!courseId) return;
    fetchProductById(courseId).then(setProduct);
  }, [courseId]);

  if (loading) {
    return <main className="container section shop-page"><p className="hint">Loading…</p></main>;
  }

  if (!isEnrolled || !product) {
    return (
      <main className="container section shop-page">
        <h2>Course access required</h2>
        <p className="hint">Purchase this course to unlock all lessons.</p>
        <Link to={`/shop/${product?.slug || ''}`}>View course</Link>
      </main>
    );
  }

  const totalLessons = product.totalLessons || product.syllabus?.reduce((n, s) => n + s.lessons.length, 0) || 0;
  const completed = new Set(enrollment?.progress.completedLessonIds || []);

  return (
    <main className="container section shop-page course-player">
      <Link to="/account" className="shop-back-link">← My courses</Link>
      <h1>{product.title}</h1>
      <div className="course-progress-bar">
        <div style={{ width: `${enrollment?.progress.completionPercent || 0}%` }} />
      </div>
      <p>{enrollment?.progress.completionPercent || 0}% complete</p>

      {product.syllabus?.map((section) => (
        <div key={section.sectionTitle} className="course-section">
          <h2>{section.sectionTitle}</h2>
          <ul className="lesson-list">
            {section.lessons.map((lesson) => {
              const locked = !lesson.isPreview && !isEnrolled;
              const done = completed.has(lesson.lessonId);
              return (
                <li key={lesson.lessonId} className={done ? 'is-done' : ''}>
                  <div>
                    <strong>{lesson.title}</strong>
                    <span className="hint"> · {lesson.duration}</span>
                    {locked && <span className="lesson-lock"> Locked</span>}
                  </div>
                  {!locked && user && (
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => markLessonComplete(user.uid, courseId!, lesson.lessonId, totalLessons)}
                    >
                      {done ? 'Completed' : 'Mark complete'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {enrollment?.progress.completionPercent === 100 && (
        <p className="hint">🎓 Certificate available — TODO: generate certificate URL via Cloud Function.</p>
      )}
    </main>
  );
}
