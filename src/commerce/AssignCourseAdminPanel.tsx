import React, { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useData } from '../hooks/useData';

interface UserRecord {
  id: string;
  displayName?: string;
  email?: string;
}

const AssignCourseAdminPanel: React.FC = () => {
  const { onlineVideoCourses } = useData();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as UserRecord));
      setUsers(rows);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  useEffect(() => {
    // Load enrollment counts for users (best-effort)
    const load = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(users.map(async (u) => {
        try {
          const snap = await getDocs(collection(db, 'users', u.id, 'enrollments'));
          counts[u.id] = snap.size;
        } catch {
          counts[u.id] = 0;
        }
      }));
      setEnrollmentCounts(counts);
    };
    if (users.length) void load();
  }, [users]);

  const assignCourseToUser = async (userId: string, courseId: string) => {
    if (!courseId) return;
    const course = onlineVideoCourses.find((c) => c.id === courseId);
    if (!course) return;
    const { doc, serverTimestamp, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'users', userId, 'enrollments', courseId), {
      courseId,
      title: course.title,
      thumbnailURL: course.thumbnailUrl || course.image || '',
      enrolledAt: serverTimestamp(),
      progress: {
        completedLessonIds: [],
        lastLessonId: null,
        lastAccessedAt: null,
        completionPercent: 0,
        completedAt: null,
      },
      certificateIssued: false,
      certificateURL: null,
    });
    // Update local count
    setEnrollmentCounts((c) => ({ ...c, [userId]: (c[userId] || 0) + 1 }));
    setSelected((s) => ({ ...s, [userId]: '' }));
  };

  return (
    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
      <h3 style={{ marginTop: 0 }}>Assign Courses to Users</h3>
      {loading ? <p style={{ color: 'var(--text-secondary)' }}>Loading users…</p> : null}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <tr>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Email</th>
              <th style={{ padding: '0.75rem' }}>Enrollments</th>
              <th style={{ padding: '0.75rem' }}>Assign</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '0.75rem' }}>{u.displayName || '—'}</td>
                <td style={{ padding: '0.75rem' }}>{u.email || '—'}</td>
                <td style={{ padding: '0.75rem' }}>{enrollmentCounts[u.id] ?? '—'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select value={selected[u.id] ?? ''} onChange={(e) => setSelected((s) => ({ ...s, [u.id]: e.target.value }))}>
                      <option value="">— Select course —</option>
                      {onlineVideoCourses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <button type="button" className="button button-primary" onClick={() => void assignCourseToUser(u.id, selected[u.id] ?? '')} disabled={!selected[u.id]}>Assign</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignCourseAdminPanel;
