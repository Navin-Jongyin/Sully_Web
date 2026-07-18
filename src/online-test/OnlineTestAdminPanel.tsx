import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Save, Trash2, X, FileJson } from 'lucide-react';
import { useData } from '../hooks/useData';
import {
  ONLINE_TEST_CATEGORIES,
  ONLINE_TEST_CATEGORY_LABELS,
  formatTimeLimit,
  resolveTimeLimitMinutes,
  type OnlineTestCategory,
  type OnlineTestRecord,
} from './types';

const SAMPLE_JSON = `[
  {
    "number": 1,
    "question": "What is the minimum flight crew requirement for most commercial transport aircraft?",
    "options": {
      "A": "1 pilot",
      "B": "2 pilots",
      "C": "3 pilots",
      "D": "4 pilots"
    },
    "answer": "B"
  }
]`;

function parseJsonInput(raw: string): any {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('JSON payload is required.');
  }

  const parsed: unknown = JSON.parse(trimmed);
  if (parsed === null || typeof parsed !== 'object') {
    throw new Error('JSON must be a valid object or array.');
  }

  return parsed;
}

function formatJson(data: any): string {
  return JSON.stringify(data, null, 2);
}

export const OnlineTestAdminPanel: React.FC = () => {
  const { onlineTests, addOnlineTest, updateOnlineTest, deleteOnlineTest } = useData();
  const [editing, setEditing] = useState<OnlineTestRecord | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<OnlineTestCategory>('Student Pilot');
  const [description, setDescription] = useState('');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('30');
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isJsonFocused, setIsJsonFocused] = useState(false);

  const resetForm = () => {
    setEditing(null);
    setIsCreating(false);
    setTitle('');
    setCategory('Student Pilot');
    setDescription('');
    setTimeLimitMinutes('30');
    setJsonInput(SAMPLE_JSON);
    setJsonError(null);
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const openEdit = (test: OnlineTestRecord) => {
    setIsCreating(false);
    setEditing(test);
    setTitle(test.title);
    setCategory(test.category);
    setDescription(test.description ?? '');
    setTimeLimitMinutes(String(resolveTimeLimitMinutes(test)));
    setJsonInput(formatJson(test.data));
    setJsonError(null);
  };

  useEffect(() => {
    if (!jsonInput.trim()) {
      setJsonError(null);
      return;
    }

    try {
      parseJsonInput(jsonInput);
      setJsonError(null);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  }, [jsonInput]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = parseJsonInput(jsonInput);
      const parsedTimeLimit = Number.parseInt(timeLimitMinutes, 10);
      if (!Number.isFinite(parsedTimeLimit) || parsedTimeLimit <= 0) {
        throw new Error('Time limit must be a positive number of minutes.');
      }

      const now = new Date().toISOString();
      const payload: OnlineTestRecord = {
        id: editing?.id ?? `test-${Date.now()}`,
        title: title.trim(),
        category,
        description: description.trim() || undefined,
        timeLimitMinutes: parsedTimeLimit,
        data,
        order: editing?.order,
        createdAt: editing?.createdAt ?? now,
        updatedAt: now,
      };

      if (editing) {
        await updateOnlineTest(payload);
        alert('Test updated successfully!');
      } else {
        await addOnlineTest(payload);
        alert('Test created successfully!');
      }

      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save test.';
      setJsonError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (test: OnlineTestRecord) => {
    if (!window.confirm(`Delete "${test.title}"? This cannot be undone.`)) return;
    await deleteOnlineTest(test.id);
    if (editing?.id === test.id) resetForm();
  };

  const showForm = isCreating || editing !== null;

  return (
    <div>
      {!showForm && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button type="button" onClick={openCreate} className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Test
          </button>
        </div>
      )}

      {!showForm && (
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: '720px' }}>
              <div style={{ padding: '1.25rem 2rem', background: 'var(--surface-subtle)', display: 'grid', gridTemplateColumns: '1fr 120px 140px 1fr 120px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>Title</span>
                <span>Time Limit</span>
                <span>Category</span>
                <span>Description</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>
              {onlineTests.length === 0 ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No tests yet. Click &quot;Add Test&quot; to create one with JSON.
                </div>
              ) : (
                onlineTests.map((test) => (
                  <div
                    key={test.id}
                    style={{
                      padding: '1.25rem 2rem',
                      borderBottom: '1px solid var(--glass-border)',
                      display: 'grid',
                      gridTemplateColumns: '1fr 120px 140px 1fr 120px',
                      alignItems: 'center',
                      background: 'var(--bg-secondary)',
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{test.title}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{formatTimeLimit(resolveTimeLimitMinutes(test))}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{ONLINE_TEST_CATEGORY_LABELS[test.category]}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{test.description || '—'}</div>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => openEdit(test)} style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <Edit2 size={16} />
                      </button>
                      <button type="button" onClick={() => handleDelete(test)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius)', padding: '0.5rem', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileJson size={22} color="var(--accent-blue)" />
              {isCreating ? 'Add Online Test' : `Editing: ${editing?.title}`}
            </h2>
            <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <form className="contact-form contact-form-plain" onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.5rem' }}>
              <label>
                Test Title
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Spatial Aptitude Drill 1" required />
              </label>
              <label>
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as OnlineTestCategory)}
                  required
                >
                  {ONLINE_TEST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{ONLINE_TEST_CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </label>
            </div>

            <label style={{ marginTop: '1.5rem' }}>
              Description (optional)
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary shown to students" />
            </label>

            <label style={{ marginTop: '1.5rem', maxWidth: '240px' }}>
              Time Limit (minutes)
              <input
                type="number"
                min={1}
                step={1}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(e.target.value)}
                placeholder="e.g. 30"
                required
              />
            </label>

            <label style={{ marginTop: '1.5rem' }}>
              Test JSON
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Paste a valid JSON object. Questions, options, and scoring rules live inside this payload.
              </span>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                onFocus={() => setIsJsonFocused(true)}
                onBlur={() => setIsJsonFocused(false)}
                rows={16}
                spellCheck={false}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'var(--input-bg)',
                  border: `1px solid ${jsonError ? 'rgba(239, 68, 68, 0.5)' : isJsonFocused ? 'var(--accent-blue)' : 'var(--glass-border)'}`,
                  boxShadow: isJsonFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem',
                  resize: 'vertical',
                  lineHeight: 1.5,
                  outline: 'none',
                  transition: 'var(--transition)',
                }}
                required
              />
            </label>

            {jsonError && (
              <p role="alert" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.9rem', marginTop: '1rem' }}>
                {jsonError}
              </p>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button type="submit" className="button button-primary" disabled={saving || !!jsonError} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} />
                {saving ? 'Saving…' : isCreating ? 'Create Test' : 'Save Changes'}
              </button>
              <button type="button" className="button button-secondary" onClick={() => setJsonInput(SAMPLE_JSON)}>
                Load Sample JSON
              </button>
              <button type="button" className="button button-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
