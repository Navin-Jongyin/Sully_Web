import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Lock, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAssignedCourses } from '../hooks/useAssignedCourses';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import { formatThb } from '../lib/payments';
import '../commerce/commerce.css';

const OnlineCoursesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { onlineVideoCourses } = useData();
  const { assignedCourseIds } = useAssignedCourses(user?.uid ?? null);

  const published = onlineVideoCourses.filter((c) => c.published);

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

        {published.length === 0 ? (
          <div className="commerce-empty">
            <BookOpen size={40} />
            <p>{t.commerce.noOnlineCourses}</p>
          </div>
        ) : (
          <div className="commerce-grid">
            {published.map((course) => {
              const isAssigned = assignedCourseIds.includes(course.id);
              return (
                <article key={course.id} className="commerce-card">
                  <div className="commerce-card-image">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} loading="lazy" />
                    ) : (
                      <div className="commerce-card-image-placeholder">
                        <BookOpen size={32} />
                      </div>
                    )}
                    {isAssigned && (
                      <span className="commerce-owned-badge">
                        <CheckCircle size={14} /> {t.commerce.assigned}
                      </span>
                    )}
                  </div>
                  <div className="commerce-card-body">
                    <span className="commerce-card-tag">{course.category}</span>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <p className="commerce-meta">
                      {course.lessonCount ?? course.lessons?.length ?? 0} {t.commerce.lessons}
                      {course.instructor ? ` · ${course.instructor}` : ''}
                    </p>
                    <div className="commerce-card-footer">
                      <strong>{formatThb(Number(course.priceThb) || 0)}</strong>
                      {isAssigned ? (
                        <Link to={`/online-courses/${course.id}`} className="button button-primary">
                          <Play size={16} /> {t.commerce.watch}
                        </Link>
                      ) : (
                        <button type="button" className="button button-primary" disabled>
                          {t.commerce.assignedOnly}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default OnlineCoursesPage;
