import React, { useState } from 'react';
import { Edit2, Plus, Save, Trash2, X, BookOpen } from 'lucide-react';
import { useData } from '../hooks/useData';
import type { OnlineCourseLesson, OnlineVideoCourse } from '../commerce/types';

const emptyLesson = (order: number): OnlineCourseLesson => ({
  id: `lesson-${Date.now()}-${order}`,
  title: '',
  description: '',
  muxPlaybackId: 'PLACEHOLDER',
  muxAssetId: '',
  order,
});

const emptyForm = (): Omit<OnlineVideoCourse, 'id'> => ({
  title: '',
  description: '',
  category: 'Student Pilot',
  priceThb: 0,
  thumbnailUrl: '',
  lessons: [emptyLesson(0)],
  published: false,
  stripePriceId: '',
});

export const OnlineVideoCourseAdminPanel: React.FC = () => {
  const { onlineVideoCourses, addOnlineVideoCourse, updateOnlineVideoCourse, deleteOnlineVideoCourse } = useData();
  const [editing, setEditing] = useState<OnlineVideoCourse | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setCreating(true);
  };

  const openEdit = (course: OnlineVideoCourse) => {
    setCreating(false);
    setEditing(course);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      priceThb: course.priceThb,
      thumbnailUrl: course.thumbnailUrl,
      lessons: course.lessons.length ? course.lessons : [emptyLesson(0)],
      published: course.published,
      stripePriceId: course.stripePriceId ?? '',
      order: course.order,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    });
  };

  const reset = () => {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm());
  };

  const updateLesson = (index: number, patch: Partial<OnlineCourseLesson>) => {
    setForm((prev) => ({
      ...prev,
      lessons: prev.lessons.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: OnlineVideoCourse = {
        id: editing?.id ?? `ovc-${Date.now()}`,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priceThb: Number(form.priceThb) || 0,
        thumbnailUrl: form.thumbnailUrl.trim(),
        lessons: form.lessons.map((l, i) => ({
          ...l,
          title: l.title.trim(),
          order: i,
          muxPlaybackId: l.muxPlaybackId?.trim() || 'PLACEHOLDER',
          muxAssetId: l.muxAssetId?.trim() || undefined,
        })),
        published: form.published,
        stripePriceId: form.stripePriceId?.trim() || undefined,
        order: editing?.order,
        createdAt: editing?.createdAt ?? now,
        updatedAt: now,
      };
      if (editing) await updateOnlineVideoCourse(payload);
      else await addOnlineVideoCourse(payload);
      reset();
    } finally {
      setSaving(false);
    }
  };

  const showForm = creating || editing !== null;

  return (
    <div>
      {!showForm && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button type="button" className="button button-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Online Course
          </button>
        </div>
      )}

      {!showForm && (
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {onlineVideoCourses.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <BookOpen size={40} style={{ margin: '0 auto 1rem' }} />
              No online video courses yet. Lessons use Mux playback ID placeholders until your Mux service is ready.
            </div>
          ) : (
            onlineVideoCourses.map((course) => (
              <div key={course.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 100px', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', alignItems: 'center' }}>
                <div>
                  <strong>{course.title}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{course.lessons.length} lessons · {course.category}</div>
                </div>
                <div>฿{course.priceThb.toLocaleString()}</div>
                <div>{course.published ? 'Live' : 'Draft'}</div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => openEdit(course)} style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '0.5rem', cursor: 'pointer' }}>
                    <Edit2 size={16} />
                  </button>
                  <button type="button" onClick={() => window.confirm(`Delete ${course.title}?`) && deleteOnlineVideoCourse(course.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)', padding: '0.5rem', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2>{creating ? 'Add Online Course' : `Edit: ${editing?.title}`}</h2>
            <button type="button" onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={22} /></button>
          </div>
          <form className="contact-form" style={{ padding: 0, border: 'none', background: 'transparent' }} onSubmit={handleSave}>
            <label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Description<textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit' }} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label>Price (THB)<input type="number" min={0} required value={form.priceThb} onChange={(e) => setForm({ ...form, priceThb: Number(e.target.value) })} /></label>
              <label>Category
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as OnlineVideoCourse['category'] })} style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)' }}>
                  <option>Student Pilot</option>
                  <option>Qualified Pilot</option>
                  <option>ATC</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
            <label>Thumbnail URL<input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} /></label>
            <label>Stripe Price ID (optional)<input value={form.stripePriceId} onChange={(e) => setForm({ ...form, stripePriceId: e.target.value })} placeholder="price_..." /></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Published
            </label>

            <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--surface-subtle)', borderRadius: 'var(--radius)', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Lessons (Mux placeholders)</h3>
                <button type="button" className="button button-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setForm({ ...form, lessons: [...form.lessons, emptyLesson(form.lessons.length)] })}>
                  + Add lesson
                </button>
              </div>
              {form.lessons.map((lesson, i) => (
                <div key={lesson.id} style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <input placeholder="Lesson title" required value={lesson.title} onChange={(e) => updateLesson(i, { title: e.target.value })} />
                  <input placeholder="Mux Playback ID (PLACEHOLDER until Mux is live)" value={lesson.muxPlaybackId ?? ''} onChange={(e) => updateLesson(i, { muxPlaybackId: e.target.value })} />
                  <input placeholder="Mux Asset ID (optional)" value={lesson.muxAssetId ?? ''} onChange={(e) => updateLesson(i, { muxAssetId: e.target.value })} />
                  {form.lessons.length > 1 && (
                    <button type="button" onClick={() => setForm({ ...form, lessons: form.lessons.filter((_, idx) => idx !== i) })} style={{ justifySelf: 'start', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Remove lesson
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="button button-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save'}</button>
              <button type="button" className="button button-secondary" onClick={reset}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
