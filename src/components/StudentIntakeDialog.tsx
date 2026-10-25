import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  ageFromBirthDate,
  emptyStudentIntake,
  fetchStudentIntake,
  saveStudentIntake,
  STUDENT_INTAKE_FIELDS,
  type StudentIntakeAnswers,
} from '../lib/student-intake';
import './StudentIntakeDialog.css';

const StudentIntakeDialog: React.FC = () => {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<StudentIntakeAnswers>(emptyStudentIntake);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) {
      setOpen(false);
      return;
    }

    let cancelled = false;
    fetchStudentIntake(user.uid)
      .then((record) => {
        if (!cancelled) setOpen(record === null);
      })
      .catch(() => {
        if (!cancelled) setOpen(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  if (!open || !user) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveStudentIntake(user.uid, user.email ?? '', {
        ...answers,
        age: ageFromBirthDate(answers.birthDate),
      });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="intake-overlay" role="presentation">
      <form className="intake-dialog" onSubmit={handleSubmit} aria-labelledby="intake-title">
        <header className="intake-head">
          <p>Sully Academy</p>
          <h2 id="intake-title">ข้อมูลผู้สมัคร</h2>
          <span>กรอกครั้งเดียว ระบบจะไม่ถามซ้ำหลังจากบันทึกแล้ว</span>
        </header>
        <div className="intake-fields">
          {STUDENT_INTAKE_FIELDS.map((field) => {
            const readOnly = 'readOnly' in field && field.readOnly;
            return (
              <label key={field.key}>
                {field.th}
                <input
                  type={'type' in field ? field.type : 'text'}
                  required={!readOnly}
                  readOnly={readOnly}
                  value={answers[field.key]}
                  onChange={(event) => {
                    const value = event.target.value;
                    setAnswers((current) => ({
                      ...current,
                      [field.key]: value,
                      ...(field.key === 'birthDate' ? { age: ageFromBirthDate(value) } : {}),
                    }));
                  }}
                />
              </label>
            );
          })}
        </div>
        <footer className="intake-foot">
          {error && <p className="intake-error" role="alert">{error}</p>}
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? 'กำลังบันทึก…' : 'บันทึกข้อมูล'}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default StudentIntakeDialog;
