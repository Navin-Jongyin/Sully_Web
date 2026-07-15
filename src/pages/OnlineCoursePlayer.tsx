import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, PlayCircle, VideoOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import { getMuxHlsUrl, lessonHasVideo } from '../lib/mux';
import { userOwnsCourse } from '../lib/purchases';
import '../commerce/commerce.css';

const OnlineCoursePlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { onlineVideoCourses } = useData();
  const [owns, setOwns] = useState<boolean | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const course = onlineVideoCourses.find((c) => c.id === courseId);

  useEffect(() => {
    if (!user || !courseId) {
      setOwns(false);
      return;
    }
    userOwnsCourse(user.uid, courseId)
      .then(setOwns)
      .catch(() => setOwns(false));
  }, [user, courseId]);

  useEffect(() => {
    if (course?.lessons.length && !activeLessonId) {
      const sorted = [...course.lessons].sort((a, b) => a.order - b.order);
      setActiveLessonId(sorted[0]?.id ?? null);
    }
  }, [course, activeLessonId]);

  if (!course) {
    return (
      <main className="container section commerce-page">
        <p>{t.commerce.courseNotFound}</p>
        <Link to="/online-courses" className="button button-secondary">{t.commerce.backToCourses}</Link>
      </main>
    );
  }

  if (owns === null) {
    return (
      <main className="container section commerce-page">
        <p style={{ color: 'var(--text-secondary)' }}>{t.common.loading}</p>
      </main>
    );
  }

  if (!owns) {
    return (
      <main className="container section commerce-page">
        <div className="commerce-locked">
          <Lock size={40} />
          <h2>{t.commerce.accessLocked}</h2>
          <p>{t.commerce.accessLockedDesc}</p>
          <Link to="/online-courses" className="button button-primary">{t.commerce.backToCourses}</Link>
        </div>
      </main>
    );
  }

  const lessons = [...course.lessons].sort((a, b) => a.order - b.order);
  const active = lessons.find((l) => l.id === activeLessonId) ?? lessons[0];
  const hasVideo = lessonHasVideo(active?.muxPlaybackId);

  return (
    <main className="commerce-player-page">
      <div className="commerce-player-top">
        <Link to="/online-courses" className="commerce-back">
          <ArrowLeft size={16} /> {t.commerce.backToCourses}
        </Link>
        <h1>{course.title}</h1>
      </div>

      <div className="commerce-player-layout">
        <section className="commerce-player-stage">
          {hasVideo && active?.muxPlaybackId ? (
            <div className="commerce-mux-placeholder">
              <p className="eyebrow">Mux Video</p>
              <p>{t.commerce.muxPlaceholder}</p>
              <code>{getMuxHlsUrl(active.muxPlaybackId)}</code>
              <p className="commerce-mux-hint">{t.commerce.muxHint}</p>
            </div>
          ) : (
            <div className="commerce-mux-placeholder">
              <VideoOff size={40} />
              <p>{t.commerce.videoPending}</p>
            </div>
          )}
          {active && (
            <div className="commerce-lesson-detail">
              <h2>{active.title}</h2>
              {active.description && <p>{active.description}</p>}
            </div>
          )}
        </section>

        <aside className="commerce-lesson-list">
          <h3>{t.commerce.lessons}</h3>
          <ul>
            {lessons.map((lesson, i) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  className={lesson.id === active?.id ? 'is-active' : ''}
                  onClick={() => setActiveLessonId(lesson.id)}
                >
                  <PlayCircle size={16} />
                  <span>
                    {i + 1}. {lesson.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
};

export default OnlineCoursePlayerPage;
