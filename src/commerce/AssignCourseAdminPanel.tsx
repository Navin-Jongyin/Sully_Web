import React, { useEffect, useMemo, useState } from 'react';
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
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    return users.filter((entry) => {
      if (!term) return true;
      const label = `${entry.displayName ?? ''} ${entry.email ?? ''}`.toLowerCase();
      return label.includes(term);
    });
  }, [userSearch, users]);

  const visibleCourses = useMemo(() => {
    const term = courseSearch.trim().toLowerCase();
    return onlineVideoCourses.filter((course) => {
      if (!term) return true;
      return `${course.title} ${course.category}`.toLowerCase().includes(term);
    });
  }, [courseSearch, onlineVideoCourses]);

  const userCourseRows = useMemo(() => {
    const rows: Array<{ userId: string; courseId: string; assignedBy?: string; assignedAt?: unknown; status?: 'active' | 'revoked' }> = [];
    users.forEach((entry) => {
      const courses = entry.courses ?? [];
      courses.forEach((courseAccess) => {
        if (courseAccess.status !== 'revoked') {
          rows.push({
            userId: entry.id,
            courseId: courseAccess.courseId,
            assignedBy: courseAccess.assignedBy,
            assignedAt: courseAccess.assignedAt,
            status: courseAccess.status ?? 'active',
          });
        }
      });
    });
    return rows.filter((assignment) => {
      if (userFilter !== 'all' && assignment.userId !== userFilter) return false;
      if (courseFilter !== 'all' && assignment.courseId !== courseFilter) return false;
      return true;
    });
  }, [courseFilter, userFilter, users]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((current) =>
      current.includes(courseId) ? current.filter((id) => id !== courseId) : [...current, courseId],
    );
  };

  const handleAssign = async () => {
    if (!selectedUserIds.length || !selectedCourseIds.length) {
      setMessage({ type: 'error', text: 'Choose at least one user and one course.' });
      return;
    }

    setMessage(null);
    setAssigning(true);

    try {
      const adminId = user?.uid ?? 'unknown-admin';
      for (const userId of selectedUserIds) {
        const existingUser = users.find((entry) => entry.id === userId);
        const currentCourses = existingUser?.courses ?? [];
        const nextCourses = [...currentCourses];

        for (const courseId of selectedCourseIds) {
          const index = nextCourses.findIndex((item) => item.courseId === courseId);
          const entry: UserCourseAccess = {
            courseId,
            assignedBy: adminId,
            assignedAt: Timestamp.now(),
            status: 'active',
            expiresAt: null,
          };

          if (index >= 0) {
            nextCourses[index] = { ...nextCourses[index], ...entry, status: 'active' };
          } else {
            nextCourses.push(entry);
          }
        }

        await setDoc(doc(db, 'users', userId), { courses: nextCourses }, { merge: true });
      }

      setSelectedUserIds([]);
      setSelectedCourseIds([]);
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
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Assign Course Access</h3>
        <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
          Choose one or more students and courses. Access is saved on the student account and opens the course player.
        </p>

        {message && (
          <p
            role="status"
            style={{
              marginBottom: '1rem',
              color: message.type === 'success' ? '#22c55e' : '#ef4444',
              background: message.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: 'var(--radius)',
              padding: '0.75rem 1rem',
            }}
          >
            {message.text}
          </p>
        )}

        <div className="assign-picker">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Users</label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users by name or email"
              style={{ width: '100%', marginBottom: '0.75rem' }}
            />
            <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'grid', gap: '0.5rem' }}>
              {loading ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading users…</p>
              ) : visibleUsers.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No users found.</p>
              ) : (
                visibleUsers.map((entry) => (
                  <label key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }}>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(entry.id)}
                      onChange={() => toggleUser(entry.id)}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{entry.displayName || 'Unnamed user'}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', overflowWrap: 'anywhere' }}>{entry.email || 'No email'}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Courses</label>
            <input
              type="text"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              placeholder="Search courses"
              style={{ width: '100%', marginBottom: '0.75rem' }}
            />
            <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'grid', gap: '0.5rem' }}>
              {visibleCourses.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No courses found.</p>
              ) : (
                visibleCourses.map((course) => (
                  <label key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }}>
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.includes(course.id)}
                      onChange={() => toggleCourse(course.id)}
                    />
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center' }}>
                        {course.title.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{course.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{course.category}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button type="button" className="button button-primary" disabled={assigning || !selectedUserIds.length || !selectedCourseIds.length} onClick={() => void handleAssign()}>
            {assigning ? 'Assigning…' : 'Assign'}
          </button>
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

        {userCourseRows.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No assignments found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>User</th>
                  <th style={{ padding: '0.75rem' }}>Course</th>
                  <th style={{ padding: '0.75rem' }}>Assigned At</th>
                  <th style={{ padding: '0.75rem' }}>Assigned By</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {userCourseRows.map((assignment) => {
                  const userInfo = users.find((entry) => entry.id === assignment.userId);
                  const courseInfo = courseMap[assignment.courseId];
                  const assignedAt = assignment.assignedAt && typeof assignment.assignedAt === 'object' && 'toDate' in (assignment.assignedAt as Record<string, unknown>)
                    ? (assignment.assignedAt as Timestamp).toDate().toLocaleString()
                    : '—';

                  return (
                    <tr key={`${assignment.userId}-${assignment.courseId}`} style={{ borderTop: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '0.75rem' }}>{userInfo?.displayName || userInfo?.email || assignment.userId}</td>
                      <td style={{ padding: '0.75rem' }}>{courseInfo?.title || assignment.courseId}</td>
                      <td style={{ padding: '0.75rem' }}>{assignedAt}</td>
                      <td style={{ padding: '0.75rem' }}>{assignment.assignedBy || '—'}</td>
                      <td style={{ padding: '0.75rem' }}>{assignment.status ?? 'active'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <button type="button" className="button button-secondary" onClick={() => void revokeAssignment(assignment.userId, assignment.courseId)}>
                          Revoke
                        </button>
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
