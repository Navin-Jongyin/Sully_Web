import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ChevronDown } from 'lucide-react';
import { db } from '../firebase';
import { STUDENT_INTAKE_FIELDS, type StudentIntakeRecord } from '../lib/student-intake';
import './commerce.css';

const StudentIntakeAdminPanel: React.FC = () => {
  const [records, setRecords] = useState<StudentIntakeRecord[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        void Promise.all(snapshot.docs.map(async (userDoc) => {
          const intake = await getDoc(doc(db, 'users', userDoc.id, 'studentIntake', 'profile'));
          if (!intake.exists() || intake.data().completed !== true) return null;
          return { uid: userDoc.id, email: userDoc.data().email, ...intake.data() } as StudentIntakeRecord;
        }))
          .then((rows) => {
            const completed = rows.filter((row): row is StudentIntakeRecord => row !== null);
            completed.sort((a, b) => (a.nickname || '').localeCompare(b.nickname || '', 'th', { sensitivity: 'base' }));
            setRecords(completed);
            setError(null);
          })
          .catch((err: unknown) => {
            setError(err instanceof Error ? err.message : 'Could not load student information.');
          });
      },
      (err) => setError(err.message),
    );
  }, []);

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((record) => (record.nickname || '').toLowerCase().includes(term));
  }, [records, search]);

  return (
    <div className="intake-admin-list">
      <input
        className="intake-admin-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="ค้นหาชื่อเล่น"
        aria-label="ค้นหาชื่อเล่น"
      />
      {error && <p className="commerce-error" role="alert">{error}</p>}
      {records.length === 0 && !error ? (
        <p style={{ color: 'var(--text-secondary)' }}>No student information has been submitted yet.</p>
      ) : visibleRecords.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>ไม่พบชื่อเล่นนี้</p>
      ) : (
        visibleRecords.map((record) => (
          <details key={record.uid} className="intake-admin-item">
            <summary>
              <span>
                <strong>{record.nickname || record.email || record.uid}</strong>
                <small>{record.email}</small>
              </span>
              <ChevronDown size={18} />
            </summary>
            <dl>
              {STUDENT_INTAKE_FIELDS.map((field) => (
                <div key={field.key}>
                  <dt>{field.th}</dt>
                  <dd>{record[field.key] || '—'}</dd>
                </div>
              ))}
            </dl>
          </details>
        ))
      )}
    </div>
  );
};

export default StudentIntakeAdminPanel;
