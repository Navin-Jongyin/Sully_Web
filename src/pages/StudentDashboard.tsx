import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Play,
  ShoppingBag,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAssignedCourses } from '../hooks/useAssignedCourses';
import { useData } from '../hooks/useData';
import { useTranslation } from '../hooks/useTranslation';
import { formatThb } from '../lib/payments';
import { subscribeUserPurchases } from '../lib/purchases';
import { subscribeCourseProgress } from '../lib/course-progress';
import { fetchStudentIntake, STUDENT_INTAKE_FIELDS, type StudentIntakeKey, type StudentIntakeRecord } from '../lib/student-intake';
import StudentIntakeDialog from '../components/StudentIntakeDialog';
import { BookingPage } from '../booking/pages/BookingPage';
import '../booking/booking-theme.css';
import type { CourseProgress, PurchaseRecord } from '../commerce/types';
import './StudentDashboard.css';

const PROFILE_SECTIONS: { id: 'personalInfo' | 'educationInfo' | 'workInfo' | 'healthInfo'; wide?: boolean; keys: StudentIntakeKey[] }[] = [
  { id: 'personalInfo', wide: true, keys: ['nickname', 'birthDate', 'age', 'province', 'stayArea'] },
  { id: 'educationInfo', keys: ['university', 'faculty', 'major', 'gpa', 'toeic', 'highSchoolTrack'] },
  { id: 'workInfo', keys: ['workplace', 'workSchedule'] },
  {
    id: 'healthInfo',
    wide: true,
    keys: ['vision', 'lasikHistory', 'weight', 'height', 'chronicConditions', 'allergies', 'lastCheckup', 'exercise', 'regularSupplements', 'healthProblems'],
  },
];

function formatIntakeValue(key: StudentIntakeKey, value: string, language: string) {
  if (!value.trim()) return '—';
  if (key !== 'birthDate') return value;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type DashSection = 'overview' | 'courses' | 'profile' | 'booking';

const StudentDashboard: React.FC = () => {
  const { t, language } = useTranslation();
  const { user, loading, signOutGoogle } = useAuth();
  const { onlineVideoCourses, merchandise } = useData();
  const { assignedCourseIds } = useAssignedCourses(user?.uid ?? null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [section, setSection] = useState<DashSection>(
    searchParams.get('section') === 'booking' ? 'booking' : 'overview',
  );
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, CourseProgress>>({});
  const [signingOut, setSigningOut] = useState(false);
  const [intake, setIntake] = useState<StudentIntakeRecord | null>(null);
  const [intakeLoading, setIntakeLoading] = useState(true);
  const [editingIntake, setEditingIntake] = useState(false);
  const [intakeVersion, setIntakeVersion] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsubPurchases = subscribeUserPurchases(user.uid, setPurchases);
    const unsubProgress = subscribeCourseProgress(user.uid, setCourseProgress);
    return () => {
      unsubPurchases();
      unsubProgress();
    };
  }, [user]);

  useEffect(() => {
    if (!user || section !== 'profile') return;
    let active = true;
    setIntakeLoading(true);
    fetchStudentIntake(user.uid)
      .then((record) => {
        if (active) setIntake(record);
      })
      .catch(() => {
        if (active) setIntake(null);
      })
      .finally(() => {
        if (active) setIntakeLoading(false);
      });
    return () => {
      active = false;
    };
  }, [section, user, intakeVersion]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutGoogle();
      navigate('/', { replace: true });
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="sd-loading">
        <p>{t.common.loading}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: { pathname: '/dashboard', search: window.location.search } }} replace />;
  }

  const firstName = (user.displayName ?? user.email ?? t.dashboard.studentFallback).split(/[\s@]/)[0];
  const ownedCourses = onlineVideoCourses.filter((c) => assignedCourseIds.includes(c.id));
  const paidOrders = purchases.filter((p) => p.status === 'paid');
  const featuredMerch = merchandise.filter((m) => m.inStock).slice(0, 3);

  const navItems: { id: DashSection; icon: typeof LayoutDashboard; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: t.dashboard.overview },
    { id: 'courses', icon: BookOpen, label: t.dashboard.myCourses },
    { id: 'booking', icon: Calendar, label: t.home.bookInterview },
    { id: 'profile', icon: UserRound, label: t.dashboard.profile },
  ];

  return (
    <div className="sd-shell">
      <aside className="sd-sidebar">
        <div className="sd-brand">
          <GraduationCap size={22} />
          <div>
            <strong>Sully Academy</strong>
            <span>{t.dashboard.studentPortal}</span>
          </div>
        </div>

        <nav className="sd-nav" aria-label={t.dashboard.navAria}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={section === item.id ? 'is-active' : ''}
                onClick={() => setSection(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sd-sidebar-footer">
          <Link to="/" className="sd-sidebar-link">
            <Home size={16} />
            {t.dashboard.backToSite}
          </Link>
          <button type="button" className="sd-sidebar-link sd-signout" onClick={handleSignOut} disabled={signingOut}>
            <LogOut size={16} />
            {signingOut ? t.onlineTest.signingOut : t.onlineTest.signOut}
          </button>
        </div>
      </aside>

      <div className="sd-main">
        <header className="sd-topbar">
          <div>
            <p className="eyebrow">{t.dashboard.eyebrow}</p>
            <h1>
              {section === 'overview' && t.dashboard.welcome.replace('{name}', firstName)}
              {section === 'courses' && t.dashboard.myCourses}
              {section === 'booking' && t.home.bookInterview}
              {section === 'profile' && t.dashboard.studentInfo}
            </h1>
          </div>
          <div className="sd-user-chip">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
            ) : (
              <div className="sd-user-fallback">{firstName.charAt(0).toUpperCase()}</div>
            )}
            <div className="sd-user-meta">
              <strong>{user.displayName ?? firstName}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        </header>

        <div className="sd-content">
          {searchParams.get('purchase') === 'success' && (
            <div className="sd-purchase-notice" role="status">
              Payment is being confirmed. Shop orders appear here after checkout completes.
            </div>
          )}
          {section === 'overview' && (
            <>
              <div className="sd-stats">
                <div className="sd-stat">
                  <span>{t.dashboard.statCourses}</span>
                  <strong>{ownedCourses.length}</strong>
                </div>
                <div className="sd-stat">
                  <span>{t.dashboard.statOrders}</span>
                  <strong>{paidOrders.length}</strong>
                </div>
                <div className="sd-stat">
                  <span>{t.dashboard.statShop}</span>
                  <strong>{merchandise.filter((m) => m.inStock).length}</strong>
                </div>
              </div>

              <div className="sd-quick">
                <Link to="/shop" className="sd-quick-card">
                  <ShoppingBag size={22} />
                  <div>
                    <strong>{t.commerce.shopTitle}</strong>
                    <span>{t.dashboard.browseShopHint}</span>
                  </div>
                </Link>
              </div>

              <section className="sd-panel">
                <div className="sd-panel-head">
                  <h2>{t.dashboard.continueLearning}</h2>
                  <button type="button" className="sd-text-btn" onClick={() => setSection('courses')}>
                    {t.dashboard.viewAll}
                  </button>
                </div>
                {ownedCourses.length === 0 ? (
                  <div className="sd-empty">
                    <BookOpen size={32} />
                    <p>{t.commerce.noOwnedCourses}</p>
                  </div>
                ) : (
                  <div className="sd-course-grid">
                    {ownedCourses.slice(0, 3).map((course) => {
                      const progress = courseProgress[course.id];
                      return (
                      <article key={course.id} className="sd-course-card">
                        <div className="sd-course-thumb">
                          {course.thumbnailUrl ? (
                            <img src={course.thumbnailUrl} alt="" />
                          ) : (
                            <BookOpen size={28} />
                          )}
                        </div>
                        <div className="sd-course-body">
                          <span>{course.category}</span>
                          <h3>{course.title}</h3>
                          <p>{course.instructor || 'Sully Academy'}</p>
                          <p>{course.lessonCount ?? course.lessons?.length ?? 0} {t.commerce.lessons}</p>
                          <div className="sd-progress">
                            <div><i style={{ width: `${progress?.completionPercentage ?? 0}%` }} /></div>
                            <span>{progress?.completionPercentage ?? 0}%</span>
                          </div>
                          <Link to={`/online-courses/${course.id}`} className="button button-primary">
                            <Play size={14} /> {t.dashboard.continueLearning}
                          </Link>
                        </div>
                      </article>
                      );
                    })}
                  </div>
                )}
              </section>

              {featuredMerch.length > 0 && (
                <section className="sd-panel">
                  <div className="sd-panel-head">
                    <h2>{t.dashboard.fromShop}</h2>
                    <Link to="/shop" className="sd-text-btn">
                      {t.dashboard.viewAll}
                    </Link>
                  </div>
                  <div className="sd-merch-row">
                    {featuredMerch.map((item) => (
                      <Link key={item.id} to="/shop" className="sd-merch-card">
                        {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <ShoppingBag size={24} />}
                        <strong>{item.name}</strong>
                        <span>{formatThb(item.priceThb)}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {section === 'courses' && (
            <section className="sd-panel">
              {ownedCourses.length === 0 ? (
                <div className="sd-empty">
                  <BookOpen size={32} />
                  <p>{t.commerce.noOwnedCourses}</p>
                </div>
              ) : (
                <div className="sd-course-grid">
                  {ownedCourses.map((course) => {
                    const progress = courseProgress[course.id];
                    return (
                    <article key={course.id} className="sd-course-card">
                      <div className="sd-course-thumb">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt="" />
                        ) : (
                          <BookOpen size={28} />
                        )}
                      </div>
                      <div className="sd-course-body">
                        <span>{course.category}</span>
                        <h3>{course.title}</h3>
                        <p>{course.instructor || 'Sully Academy'}</p>
                        <p>{course.lessonCount ?? course.lessons?.length ?? 0} {t.commerce.lessons}</p>
                        <div className="sd-progress">
                          <div><i style={{ width: `${progress?.completionPercentage ?? 0}%` }} /></div>
                          <span>{progress?.completionPercentage ?? 0}%</span>
                        </div>
                        <Link to={`/online-courses/${course.id}`} className="button button-primary">
                          <Play size={14} /> {t.dashboard.continueLearning}
                        </Link>
                      </div>
                    </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {section === 'booking' && (
            <div className="booking-shell sd-booking">
              <BookingPage />
            </div>
          )}

          {section === 'profile' && (
            <div className="sd-profile-page">
              <section className="sd-profile-hero">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <div className="sd-profile-avatar">{(intake?.nickname || firstName).charAt(0).toUpperCase()}</div>
                )}
                <div>
                  <p>{t.dashboard.profile}</p>
                  <h2>{intake?.nickname || user.displayName || firstName}</h2>
                  <span>{user.email}</span>
                </div>
                {intake && (
                  <button type="button" className="sd-profile-edit" onClick={() => setEditingIntake(true)}>
                    {t.dashboard.editInfo}
                  </button>
                )}
              </section>

              {intakeLoading ? (
                <section className="sd-profile-empty">{t.dashboard.studentInfoLoading}</section>
              ) : !intake ? (
                <section className="sd-profile-empty">{t.dashboard.studentInfoEmpty}</section>
              ) : (
                <div className="sd-profile-sections">
                  {PROFILE_SECTIONS.map((group) => (
                    <section key={group.id} className={group.wide ? 'sd-profile-section is-wide' : 'sd-profile-section'}>
                      <h2>{t.dashboard[group.id]}</h2>
                      <dl className="sd-profile-fields">
                        {group.keys.map((key) => {
                          const field = STUDENT_INTAKE_FIELDS.find((item) => item.key === key);
                          if (!field) return null;
                          return (
                            <div key={key}>
                              <dt>{language === 'th' ? field.th : field.en}</dt>
                              <dd>{formatIntakeValue(key, intake[key] || '', language)}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {editingIntake && (
        <StudentIntakeDialog
          mode="edit"
          onClose={() => setEditingIntake(false)}
          onSaved={() => {
            setEditingIntake(false);
            setIntakeVersion((version) => version + 1);
          }}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
