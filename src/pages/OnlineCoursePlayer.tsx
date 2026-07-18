import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Lock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import { userOwnsCourse } from '../lib/purchases';
import { subscribeCourseLessons } from '../lib/course-lessons';
import {
  fetchCourseProgress,
  fetchLessonProgress,
  saveLessonProgress,
} from '../lib/course-progress';
import { CourseVideoPlayer } from '../commerce/CourseVideoPlayer';
import type { OnlineCourseLesson } from '../commerce/types';
import '../commerce/commerce.css';

function formatDuration(seconds?: number): string {
  if (!seconds) return '—';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

const OnlineCoursePlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { onlineVideoCourses, loading } = useData();
  const [owns, setOwns] = useState<boolean | null>(null);
  const [lessons, setLessons] = useState<OnlineCourseLesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [startAtSeconds, setStartAtSeconds] = useState(0);
  const [progressError, setProgressError] = useState<string | null>(null);
  const lastSavedAt = useRef(0);

  const course = onlineVideoCourses.find((c) => c.id === courseId);

  useEffect(() => {
    if (!user || !courseId) return;
    userOwnsCourse(user.uid, courseId)
      .then(setOwns)
      .catch(() => setOwns(false));
  }, [user, courseId]);

  useEffect(() => {
    if (!course || !owns) return;
    return subscribeCourseLessons(course, setLessons, () => {
      setProgressError('Some lesson details could not be refreshed.');
    });
  }, [course, owns]);

  useEffect(() => {
    if (!user || !courseId || !owns || lessons.length === 0) return;
    fetchCourseProgress(user.uid, courseId)
      .then((progress) => {
        setCompletedLessonIds(progress?.completedLessonIds ?? []);
        setActiveLessonId((current) => current ?? progress?.lastLessonId ?? lessons[0].id);
      })
      .catch(() => setActiveLessonId((current) => current ?? lessons[0].id));
  }, [user, courseId, owns, lessons]);

  useEffect(() => {
    if (!user || !courseId || !activeLessonId) return;
    fetchLessonProgress(user.uid, courseId, activeLessonId)
      .then((progress) => setStartAtSeconds(progress?.currentTimeSeconds ?? 0))
      .catch(() => setStartAtSeconds(0));
    lastSavedAt.current = 0;
  }, [user, courseId, activeLessonId]);

  if (loading || owns === null) {
    return (
      <main className="container section commerce-page">
        <p style={{ color: 'var(--text-secondary)' }}>{t.common.loading}</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="container section commerce-page">
        <p>{t.commerce.courseNotFound}</p>
        <Link to="/online-courses" className="button button-secondary">{t.commerce.backToCourses}</Link>
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

  const active = lessons.find((l) => l.id === activeLessonId) ?? lessons[0];
  const activeIndex = active ? lessons.findIndex((lesson) => lesson.id === active.id) : -1;
  const percentage = lessons.length
    ? Math.min(100, Math.round((completedLessonIds.length / lessons.length) * 100))
    : 0;

  const persistProgress = async (
    currentTimeSeconds: number,
    durationSeconds: number,
    completed = false,
  ) => {
    if (!user || !courseId || !active) return;
    try {
      await saveLessonProgress({
        uid: user.uid,
        courseId,
        lessonId: active.id,
        currentTimeSeconds,
        durationSeconds: durationSeconds || active.durationSeconds || 0,
        totalLessons: lessons.length,
        completed,
      });
      if (completed) {
        setCompletedLessonIds((current) => current.includes(active.id) ? current : [...current, active.id]);
      }
      setProgressError(null);
    } catch {
      setProgressError('Progress could not be saved. Please check your connection.');
    }
  };

  return (
    <main className="commerce-player-page">
      <div className="commerce-player-top">
        <Link to="/online-courses" className="commerce-back">
          <ArrowLeft size={16} /> {t.commerce.backToCourses}
        </Link>
        <div>
          <h1>{course.title}</h1>
          <div className="commerce-course-progress">
            <span>{percentage}% complete</span>
            <div><i style={{ width: `${percentage}%` }} /></div>
          </div>
        </div>
      </div>

      <div className="commerce-player-layout">
        <section className="commerce-player-stage">
          {active && (
            <>
              <CourseVideoPlayer
                lesson={active}
                startAtSeconds={startAtSeconds}
                onProgress={(currentTime, duration) => {
                  const now = Date.now();
                  const nearlyFinished = duration > 0
                    && currentTime / duration >= 0.9
                    && !completedLessonIds.includes(active.id);
                  if (nearlyFinished || now - lastSavedAt.current >= 10_000) {
                    lastSavedAt.current = now;
                    void persistProgress(currentTime, duration, nearlyFinished);
                  }
                }}
                onEnded={() => void persistProgress(
                  active.durationSeconds ?? 0,
                  active.durationSeconds ?? 0,
                  true,
                )}
              />
              <div className="commerce-lesson-detail">
                <div>
                  <h2>{active.title}</h2>
                  <span className="commerce-lesson-duration">
                    <Clock size={14} /> {formatDuration(active.durationSeconds)}
                  </span>
                </div>
                {active.description && <p>{active.description}</p>}
                {progressError && <p className="commerce-error" role="alert">{progressError}</p>}
                <div className="commerce-player-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={activeIndex <= 0}
                    onClick={() => setActiveLessonId(lessons[activeIndex - 1]?.id)}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={completedLessonIds.includes(active.id)}
                    onClick={() => void persistProgress(
                      active.durationSeconds ?? 0,
                      active.durationSeconds ?? 0,
                      true,
                    )}
                  >
                    <CheckCircle size={16} /> Mark complete
                  </button>
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={activeIndex < 0 || activeIndex >= lessons.length - 1}
                    onClick={() => setActiveLessonId(lessons[activeIndex + 1]?.id)}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
          {!active && <div className="commerce-video-unavailable">No lessons have been published yet.</div>}
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
                  {completedLessonIds.includes(lesson.id)
                    ? <CheckCircle size={16} />
                    : <Circle size={16} />}
                  <span>
                    {i + 1}. {lesson.title}
                    <small>{formatDuration(lesson.durationSeconds)}</small>
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
