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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [addingCourse, setAddingCourse] = useState(false);
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

  const selectedUser = users.find((entry) => entry.id === selectedUserId) ?? null;

  const activeCourseIds = (userId: string) => {
    const entry = users.find((item) => item.id === userId);
    return (entry?.courses ?? [])
      .filter((course) => course.status !== 'revoked' && course.courseId)
      .map((course) => course.courseId);
  };

  const enrolledCourses = useMemo(() => {
    if (!selectedUserId) return [];
    const assigned = new Set(activeCourseIds(selectedUserId));
    return onlineVideoCourses.filter((course) => assigned.has(course.id));
  }, [onlineVideoCourses, selectedUserId, users]);

  const coursesToAdd = useMemo(() => {
    const term = courseSearch.trim().toLowerCase();
    const assigned = new Set(selectedUserId ? activeCourseIds(selectedUserId) : []);
    return onlineVideoCourses.filter((course) => {
      if (assigned.has(course.id)) return false;
      if (!term) return true;
      return `${course.title} ${course.category}`.toLowerCase().includes(term);
    });
  }, [courseSearch, onlineVideoCourses, selectedUserId, users]);

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
    const nameOf = (userId: string) => {
      const entry = users.find((item) => item.id === userId);
      return (entry?.displayName || 'Unnamed user').trim();
    };

    return rows
      .filter((assignment) => {
        if (userFilter !== 'all' && assignment.userId !== userFilter) return false;
        if (courseFilter !== 'all' && assignment.courseId !== courseFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const byName = nameOf(a.userId).localeCompare(nameOf(b.userId), undefined, { sensitivity: 'base' });
        if (byName !== 0) return byName;
        const courseA = courseMap[a.courseId]?.title || a.courseId;
        const courseB = courseMap[b.courseId]?.title || b.courseId;
        return courseA.localeCompare(courseB, undefined, { sensitivity: 'base' });
      });
  }, [courseFilter, courseMap, userFilter, users]);

  const selectUser = (userId: string) => {
    setAddingCourse(false);
    setCourseSearch('');
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      return;
    }
    setSelectedUserId(userId);
  };

  const handleAssign = async (courseId: string) => {
    if (!selectedUserId) return;

    setMessage(null);
    setAssigning(true);

    try {
      const adminId = user?.uid ?? 'unknown-admin';
      const existingUser = users.find((entry) => entry.id === selectedUserId);
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

      await setDoc(doc(db, 'users', selectedUserId), { courses: nextCourses }, { merge: true });
      setAddingCourse(false);
      setCourseSearch('');
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
          Search for one student. Their courses appear after you select them.
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

        <div className="assign-picker" style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
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
                background: 'rgba(96,165,250,0.06)',
                border: '1px solid rgba(96,165,250,0.7)',
                boxShadow: '0 0 0 3px rgba(96,165,250,0.15)',
                outline: 'none',
                color: 'var(--text-primary)',
              }}
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
                      type="radio"
                      name="assign-user"
                      checked={selectedUserId === entry.id}
                      onChange={() => selectUser(entry.id)}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedUser ? `Courses for ${selectedUser.displayName || selectedUser.email || 'student'}` : 'Courses'}
              </label>
              {selectedUserId && (
                <button type="button" className="button button-primary" onClick={() => setAddingCourse((open) => !open)}>
                  {addingCourse ? 'Close' : 'Add'}
                </button>
              )}
            </div>
            {!selectedUserId ? (
              <p style={{ color: 'var(--text-secondary)' }}>Select one student to see their courses.</p>
            ) : (
              <>
                {addingCourse && (
                  <>
                    <input
                      type="text"
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Search a course to assign"
                      style={{
                        width: '100%',
                        marginBottom: '0.75rem',
                        background: 'rgba(96,165,250,0.06)',
                        border: '1px solid rgba(96,165,250,0.7)',
                        boxShadow: '0 0 0 3px rgba(96,165,250,0.15)',
                        outline: 'none',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'grid', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {coursesToAdd.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No more courses to assign.</p>
                      ) : (
                        coursesToAdd.map((course) => (
                          <div key={course.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.6rem 0.75rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600 }}>{course.title}</div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{course.category}</div>
                            </div>
                            <button type="button" className="button button-secondary" disabled={assigning} onClick={() => void handleAssign(course.id)}>
                              Add
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
                <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'grid', gap: '0.5rem' }}>
                  {enrolledCourses.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No courses assigned yet.</p>
                  ) : (
                    enrolledCourses.map((course) => (
                      <div key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }}>
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center' }}>
                            {course.title.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600 }}>{course.title}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{course.category}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
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

        {userCourseRows.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No assignments found.</p>
        ) : (
          <div className="assign-table-wrap">
            <table className="assign-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {userCourseRows.map((assignment) => {
                  const userInfo = users.find((entry) => entry.id === assignment.userId);
                  const courseInfo = courseMap[assignment.courseId];

                  return (
                    <tr key={`${assignment.userId}-${assignment.courseId}`}>
                      <td>{userInfo?.displayName || 'Unnamed user'}</td>
                      <td>{userInfo?.email || '—'}</td>
                      <td>{courseInfo?.title || assignment.courseId}</td>
                      <td>{assignment.status ?? 'active'}</td>
                      <td>
                        <button type="button" className="assign-revoke" onClick={() => void revokeAssignment(assignment.userId, assignment.courseId)}>
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
