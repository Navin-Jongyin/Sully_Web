import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Lock, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAssignedCourses } from '../hooks/useAssignedCourses';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import type { OnlineVideoCourse } from '../commerce/types';
import '../commerce/commerce.css';

const OnlineCoursesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { onlineVideoCourses } = useData();
  const { assignedCourseIds } = useAssignedCourses(user?.uid ?? null);

  const assigned = onlineVideoCourses.filter((course) => assignedCourseIds.includes(course.id));
  const others = onlineVideoCourses.filter((course) => course.published && !assignedCourseIds.includes(course.id));

  return (
    <main className="page-transition commerce-page">
      <section className="container section" style={{ paddingTop: 'clamp(2rem, 8vw, 7.5rem)' }}>
        <div className="section-head reveal is-visible">
          <p className="eyebrow">{t.commerce.onlineCoursesEyebrow}</p>
          <h2>{t.commerce.onlineCoursesTitle}</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '1rem auto 0' }}>
            {t.commerce.onlineCoursesDesc}
          </p>
        </div>

        {!user && (
          <div className="commerce-login-hint">
            <Lock size={18} />
            <p>{t.commerce.loginToViewAssigned}</p>
            <Link to="/login" className="button button-primary">{t.commerce.goToAccount}</Link>
          </div>
        )}

        {assigned.length === 0 && others.length === 0 ? (
          <div className="commerce-empty">
            <BookOpen size={40} />
            <p>{user ? t.commerce.noOwnedCourses : t.commerce.noOnlineCourses}</p>
          </div>
        ) : (
          <>
            {user && (
              <CourseSection
                title={t.commerce.yourCourses}
                courses={assigned}
                empty={t.commerce.noOwnedCourses}
                assigned
                watchLabel={t.commerce.watch}
                lessonsLabel={t.commerce.lessons}
                assignedLabel={t.commerce.assigned}
              />
            )}
            {others.length > 0 && (
              <CourseSection
                title={user ? t.commerce.otherCourses : t.commerce.onlineCoursesTitle}
                courses={others}
                assigned={false}
                watchLabel={t.commerce.watch}
                lessonsLabel={t.commerce.lessons}
                assignedLabel={t.commerce.assigned}
                lockedLabel={t.commerce.assignedOnly}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
};

const CourseSection: React.FC<{
  title: string;
  courses: OnlineVideoCourse[];
  empty?: string;
  assigned: boolean;
  watchLabel: string;
  lessonsLabel: string;
  assignedLabel: string;
  lockedLabel?: string;
}> = ({ title, courses, empty, assigned, watchLabel, lessonsLabel, assignedLabel, lockedLabel }) => (
  <div className="commerce-course-section">
    <h3>{title}</h3>
    {courses.length === 0 ? (
      <div className="commerce-empty">
        <BookOpen size={32} />
        <p>{empty}</p>
      </div>
    ) : (
      <div className="commerce-grid">
        {courses.map((course) => (
          <article key={course.id} className="commerce-card">
            <div className="commerce-card-image">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} loading="lazy" />
              ) : (
                <div className="commerce-card-image-placeholder">
                  <BookOpen size={32} />
                </div>
              )}
              {assigned && (
                <span className="commerce-owned-badge">
                  <CheckCircle size={14} /> {assignedLabel}
                </span>
              )}
            </div>
            <div className="commerce-card-body">
              <span className="commerce-card-tag">{course.category}</span>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p className="commerce-meta">
                {course.lessonCount ?? course.lessons?.length ?? 0} {lessonsLabel}
                {course.instructor ? ` · ${course.instructor}` : ''}
              </p>
              <div className="commerce-card-footer">
                {assigned ? (
                  <Link to={`/online-courses/${course.id}`} className="button button-primary">
                    <Play size={16} /> {watchLabel}
                  </Link>
                ) : (
                  <span className="commerce-locked-note">
                    <Lock size={14} /> {lockedLabel}
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
);

export default OnlineCoursesPage;
