import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { collection, doc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { useAppDialog } from '../hooks/useAppDialog';
import './commerce.css';

interface UserRecord {
  id: string;
  uid?: string;
  displayName?: string;
  email?: string;
  role?: string;
  courses?: UserCourseAccess[];
}

interface UserCourseAccess {
  courseId: string;
  assignedBy?: string;
  assignedAt?: unknown;
  expiresAt?: Timestamp | null;
  status?: 'active' | 'revoked';
}

const AssignCourseAdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { onlineVideoCourses } = useData();
  const { confirm } = useAppDialog();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const studentListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const rows = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Partial<UserRecord>),
        })) as UserRecord[];
        setUsers(rows);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  const courseMap = useMemo(
    () => Object.fromEntries(onlineVideoCourses.map((course) => [course.id, course])),
    [onlineVideoCourses],
  );

  const visibleUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return users
      .filter((entry) => {
        if (!term) return true;
        const label = `${entry.displayName ?? ''} ${entry.email ?? ''}`.toLowerCase();
        return label.includes(term);
      })
      .sort((a, b) =>
        (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '', undefined, { sensitivity: 'base' }),
      );
  }, [userSearch, users]);

  useEffect(() => {
    const list = studentListRef.current;
    if (!list) return;

    const fitFive = () => {
      const rows = [...list.querySelectorAll(':scope > .assign-student summary')];
      if (rows.length <= 5) {
        list.style.maxHeight = '';
        list.classList.remove('is-scroll');
        return;
      }
      const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0;
      const height = rows.slice(0, 5).reduce((sum, row) => sum + row.getBoundingClientRect().height, 0);
      list.style.maxHeight = `${Math.ceil(height + gap * 4)}px`;
      list.classList.add('is-scroll');
    };

    fitFive();
    const observer = new ResizeObserver(fitFive);
    list.querySelectorAll(':scope > .assign-student summary').forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [visibleUsers]);

  const activeCourseIds = (userId: string) => {
    const entry = users.find((item) => item.id === userId);
    return (entry?.courses ?? [])
      .filter((course) => course.status !== 'revoked' && course.courseId)
      .map((course) => course.courseId);
  };

  const enrolledCoursesFor = (userId: string) => {
    const assigned = new Set(activeCourseIds(userId));
    return onlineVideoCourses
      .filter((course) => assigned.has(course.id))
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  };

  const unassignedCoursesFor = (userId: string) => {
    const assigned = new Set(activeCourseIds(userId));
    return onlineVideoCourses
      .filter((course) => !assigned.has(course.id))
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
  };

  const assignmentGroups = useMemo(() => {
    const nameOf = (userId: string) => {
      const entry = users.find((item) => item.id === userId);
      return (entry?.displayName || 'Unnamed user').trim();
    };

    const groups = users.flatMap((entry) => {
      if (userFilter !== 'all' && entry.id !== userFilter) return [];
      const courses = (entry.courses ?? [])
        .filter((courseAccess) => courseAccess.status !== 'revoked' && courseAccess.courseId)
        .filter((courseAccess) => courseFilter === 'all' || courseAccess.courseId === courseFilter)
        .map((courseAccess) => ({
          courseId: courseAccess.courseId,
          status: courseAccess.status ?? 'active' as const,
        }))
        .sort((a, b) => {
          const titleA = courseMap[a.courseId]?.title || a.courseId;
          const titleB = courseMap[b.courseId]?.title || b.courseId;
          return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
        });
      if (courses.length === 0) return [];
      return [{ userId: entry.id, courses }];
    });

    return groups.sort((a, b) => nameOf(a.userId).localeCompare(nameOf(b.userId), undefined, { sensitivity: 'base' }));
  }, [courseFilter, courseMap, userFilter, users]);

  const handleAssign = async (userId: string, courseId: string) => {

    setMessage(null);
    setAssigning(true);

    try {
      const adminId = user?.uid ?? 'unknown-admin';
      const existingUser = users.find((entry) => entry.id === userId);
      const currentCourses = existingUser?.courses ?? [];
      const nextCourses = [...currentCourses];
      const index = nextCourses.findIndex((item) => item.courseId === courseId);
      const entry: UserCourseAccess = {
        courseId,
        assignedBy: adminId,
        assignedAt: Timestamp.now(),
        status: 'active',
        expiresAt: null,
      };

      if (index >= 0) nextCourses[index] = { ...nextCourses[index], ...entry, status: 'active' };
      else nextCourses.push(entry);

      await setDoc(doc(db, 'users', userId), { courses: nextCourses }, { merge: true });
      setMessage({ type: 'success', text: 'Course access assigned successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Assignments could not be saved.' });
    } finally {
      setAssigning(false);
    }
  };

  const revokeAssignment = async (userId: string, courseId: string) => {
    const confirmed = await confirm('Remove access for this course from this user?');
    if (!confirmed) return;

    try {
      const existingUser = users.find((entry) => entry.id === userId);
      const nextCourses = (existingUser?.courses ?? []).filter((entry) => entry.courseId !== courseId);
      await setDoc(doc(db, 'users', userId), { courses: nextCourses }, { merge: true });
      setMessage({ type: 'success', text: 'Course access revoked.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Could not revoke access.' });
    }
  };

  return (
    <div className="assign-admin" style={{ display: 'grid', gap: '1.5rem', minWidth: 0, maxWidth: '100%' }}>
      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Assign Course Access</h3>
        <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
          Open a student to see the courses already assigned.
        </p>

        {message && (
          <p
            role="status"
            className={`admin-toast ${message.type === 'success' ? 'commerce-notice' : 'commerce-error'}`}
          >
            {message.text}
          </p>
        )}

        <div className="assign-picker">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Users</label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by name or email"
              style={{
                width: '100%',
                marginBottom: '0.75rem',
                padding: '0.7rem 0.9rem',
                fontSize: '1rem',
                background: 'rgba(96,165,250,0.06)',
                border: '1px solid rgba(96,165,250,0.7)',
                boxShadow: '0 0 0 3px rgba(96,165,250,0.15)',
                outline: 'none',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius)',
              }}
            />
            <div className="assign-student-list" ref={studentListRef}>
              {loading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading users…</p>
              ) : visibleUsers.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No users found.</p>
              ) : (
                visibleUsers.map((entry) => {
                  const enrolled = enrolledCoursesFor(entry.id);
                  const unassigned = unassignedCoursesFor(entry.id);
                  return (
                    <details key={entry.id} className="assign-student">
                      <summary>
                        <span>
                          <strong>{entry.displayName || 'Unnamed user'}</strong>
                          <small>{entry.email || 'No email'} · {enrolled.length} assigned</small>
                        </span>
                        <ChevronDown size={18} />
                      </summary>
                      <div className="assign-student-body">
                        <div>
                          <h4>Assigned</h4>
                          {enrolled.length === 0 ? (
                            <p>None</p>
                          ) : (
                            <ul>
                              {enrolled.map((course) => (
                                <li key={course.id}>
                                  <span>{course.title}</span>
                                  <button type="button" className="assign-revoke" onClick={() => void revokeAssignment(entry.id, course.id)}>
                                    Revoke
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <h4>Unassigned</h4>
                          {unassigned.length === 0 ? (
                            <p>None</p>
                          ) : (
                            <ul>
                              {unassigned.map((course) => (
                                <li key={course.id}>
                                  <span>{course.title}</span>
                                  <button type="button" className="assign-add" disabled={assigning} aria-label={`Assign ${course.title}`} onClick={() => void handleAssign(entry.id, course.id)}>
                                    +
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </details>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0 }}>Assignments</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} style={{ minWidth: '180px' }}>
              <option value="all">All users</option>
              {users.map((entry) => (
                <option key={entry.id} value={entry.id}>{entry.displayName || entry.email || entry.id}</option>
              ))}
            </select>
            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} style={{ minWidth: '180px' }}>
              <option value="all">All courses</option>
              {onlineVideoCourses.map((course) => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
        </div>

        {assignmentGroups.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No assignments found.</p>
        ) : (
          <div className="assign-table-wrap">
            <table className="assign-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Courses</th>
                </tr>
              </thead>
              <tbody>
                {assignmentGroups.map((group) => {
                  const userInfo = users.find((entry) => entry.id === group.userId);

                  return (
                    <tr key={group.userId}>
                      <td>{userInfo?.displayName || 'Unnamed user'}</td>
                      <td>{userInfo?.email || '—'}</td>
                      <td>
                        <ul className="assign-course-list">
                          {group.courses.map((course) => (
                            <li key={course.courseId} className="assign-course-item">
                              <span>
                                {courseMap[course.courseId]?.title || course.courseId}
                                <small>{course.status}</small>
                              </span>
                              <button type="button" className="assign-revoke" onClick={() => void revokeAssignment(group.userId, course.courseId)}>
                                Revoke
                              </button>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignCourseAdminPanel;
