import React, { useState } from 'react';
import { Edit2, Plus, Save, Trash2, X, BookOpen, GripVertical, RefreshCw, Upload } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useData } from '../hooks/useData';
import { storage } from '../firebase';
import type { OnlineCourseLesson, OnlineVideoCourse } from '../commerce/types';
import { migrateEmbeddedLessons, fetchCourseLessons } from '../lib/course-lessons';
import { getStripeProductById } from '../lib/stripe-catalog';

const PRODUCT_PLACEHOLDER = 'STRIPE_PRODUCT_ID_PLACEHOLDER';
const PRICE_PLACEHOLDER = 'STRIPE_PRICE_ID_PLACEHOLDER';

const emptyLesson = (order: number): OnlineCourseLesson => ({
  id: `lesson-${Date.now()}-${order}`,
  title: '',
  description: '',
  videoUrl: '',
  videoProvider: 'auto',
  durationSeconds: 0,
  order,
});

const emptyForm = (): Omit<OnlineVideoCourse, 'id'> => ({
  title: '',
  description: '',
  category: 'Student Pilot',
  priceThb: 0,
  thumbnailUrl: '',
  instructor: '',
  lessons: [emptyLesson(0)],
  published: false,
  stripeProductId: PRODUCT_PLACEHOLDER,
  stripePriceId: PRICE_PLACEHOLDER,
});

export const OnlineVideoCourseAdminPanel: React.FC = () => {
  const { onlineVideoCourses, addOnlineVideoCourse, updateOnlineVideoCourse, deleteOnlineVideoCourse } = useData();
  const [editing, setEditing] = useState<OnlineVideoCourse | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resolvingStripe, setResolvingStripe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setCreating(true);
  };

  const openEdit = async (course: OnlineVideoCourse) => {
    setCreating(false);
    setEditing(course);
    setMessage(null);
    try {
      const lessons = await fetchCourseLessons(course);
      setForm({
        title: course.title,
        description: course.description,
        category: course.category,
        priceThb: course.priceThb,
        thumbnailUrl: course.thumbnailUrl,
        instructor: course.instructor ?? '',
        lessons: lessons.length ? lessons : [emptyLesson(0)],
        published: course.published,
        stripeProductId: course.stripeProductId ?? PRODUCT_PLACEHOLDER,
        stripePriceId: course.stripePriceId ?? PRICE_PLACEHOLDER,
        lessonCount: course.lessonCount,
        order: course.order,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load course lessons.');
      // Fallback to lightweight metadata so admin can still edit core course fields
      setForm((f) => ({ ...f, lessons: course.lessons.length ? course.lessons : [emptyLesson(0)] }));
    }
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
    setMessage(null);
    const invalidVideo = form.lessons.find((lesson) => {
      if (!lesson.videoUrl) return false;
      try {
        const url = new URL(lesson.videoUrl);
        return url.protocol !== 'https:' && url.hostname !== 'localhost';
      } catch {
        return true;
      }
    });
    if (invalidVideo) {
      setMessage(`"${invalidVideo.title || 'Untitled lesson'}" needs a valid HTTPS video URL.`);
      return;
    }
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
        instructor: form.instructor?.trim() || 'Sully Academy',
        lessons: form.lessons.map((l, i) => ({
          ...l,
          title: l.title.trim(),
          description: l.description?.trim() || '',
          videoUrl: l.videoUrl?.trim() || '',
          videoProvider: l.videoProvider ?? 'auto',
          durationSeconds: Math.max(0, Number(l.durationSeconds) || 0),
          order: i,
        })),
        lessonCount: form.lessons.length,
        published: form.published,
        stripeProductId: form.stripeProductId?.trim() || PRODUCT_PLACEHOLDER,
        stripePriceId: form.stripePriceId?.trim() || PRICE_PLACEHOLDER,
        order: editing?.order,
        createdAt: editing?.createdAt ?? now,
        updatedAt: now,
      };
      if (editing) await updateOnlineVideoCourse(payload);
      else await addOnlineVideoCourse(payload);
      reset();
      setMessage('Course saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Course could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const uploadThumbnail = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setMessage('Choose an image smaller than 5 MB.');
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const courseId = editing?.id ?? `draft-${Date.now()}`;
      const storageRef = ref(
        storage,
        `online-course-thumbnails/${courseId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      );
      const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setForm((current) => ({ ...current, thumbnailUrl: downloadUrl }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Thumbnail upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const resolveStripeProduct = async () => {
    setResolvingStripe(true);
    setMessage(null);
    try {
      const product = await getStripeProductById(form.stripeProductId);
      if (!product) throw new Error('Stripe product ID was not found on the configured server.');
      setForm((current) => ({
        ...current,
        stripePriceId: product.priceId,
        priceThb: product.currency.toLowerCase() === 'thb'
          ? product.amount / 100
          : current.priceThb,
      }));
      setMessage(`Loaded Stripe product: ${product.name}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Stripe product lookup failed.');
    } finally {
      setResolvingStripe(false);
    }
  };

  const showForm = creating || editing !== null;

  return (
    <div>
      {!showForm && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="button button-secondary"
            onClick={async () => {
              setMessage(null);
              try {
                const count = await migrateEmbeddedLessons(onlineVideoCourses);
                setMessage(count ? `Migrated ${count} course${count === 1 ? '' : 's'}.` : 'All lessons are already migrated.');
              } catch (error) {
                setMessage(error instanceof Error ? error.message : 'Lesson migration failed.');
              }
            }}
          >
            Migrate lessons
          </button>
          <button type="button" className="button button-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Online Course
          </button>
        </div>
      )}
      {message && <p className={message.includes('saved') || message.includes('Migrated') || message.includes('already') || message.includes('Loaded') ? 'commerce-notice' : 'commerce-error'}>{message}</p>}

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
            <label>
              Upload/change thumbnail
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input type="file" accept="image/*" disabled={uploading} onChange={(event) => void uploadThumbnail(event.target.files?.[0])} />
                <Upload size={18} />
                {uploading ? 'Uploading…' : 'Max 5 MB'}
              </span>
            </label>
            <label>Instructor<input value={form.instructor ?? ''} onChange={(e) => setForm({ ...form, instructor: e.target.value })} /></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label>
                Stripe Product ID
                <span style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={form.stripeProductId ?? ''} onChange={(e) => setForm({ ...form, stripeProductId: e.target.value })} placeholder={PRODUCT_PLACEHOLDER} />
                  <button type="button" className="button button-secondary" disabled={resolvingStripe} onClick={() => void resolveStripeProduct()}>
                    <RefreshCw size={15} /> {resolvingStripe ? 'Loading…' : 'Load'}
                  </button>
                </span>
              </label>
              <label>Stripe Price ID (resolved automatically)<input readOnly value={form.stripePriceId ?? ''} placeholder={PRICE_PLACEHOLDER} /></label>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Published
            </label>

            <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--surface-subtle)', borderRadius: 'var(--radius)', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Lessons</h3>
                <button type="button" className="button button-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => setForm({ ...form, lessons: [...form.lessons, emptyLesson(form.lessons.length)] })}>
                  + Add lesson
                </button>
              </div>
              <Reorder.Group
                axis="y"
                values={form.lessons}
                onReorder={(lessons) => setForm({ ...form, lessons })}
                style={{ listStyle: 'none', margin: 0, padding: 0 }}
              >
                {form.lessons.map((lesson, i) => (
                  <Reorder.Item
                    key={lesson.id}
                    value={lesson}
                    style={{ display: 'grid', gap: '0.65rem', marginBottom: '1rem', padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', background: 'var(--glass-bg)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', cursor: 'grab' }}>
                      <GripVertical size={18} /> Lesson {i + 1}
                    </div>
                    <input placeholder="Lesson title" required value={lesson.title} onChange={(e) => updateLesson(i, { title: e.target.value })} />
                    <textarea
                      placeholder="Lesson description"
                      rows={2}
                      value={lesson.description ?? ''}
                      onChange={(e) => updateLesson(i, { description: e.target.value })}
                      style={{ width: '100%', padding: '0.85rem 1rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(130px, .4fr) 1fr', gap: '0.75rem' }}>
                      <select
                        value={lesson.videoProvider ?? 'auto'}
                        onChange={(e) => updateLesson(i, { videoProvider: e.target.value as OnlineCourseLesson['videoProvider'] })}
                        aria-label="Video provider"
                      >
                        <option value="auto">Auto detect</option>
                        <option value="youtube">YouTube</option>
                        <option value="vimeo">Vimeo</option>
                        <option value="bunny">Bunny Stream</option>
                        <option value="cloudflare">Cloudflare Stream</option>
                        <option value="mux">Mux / HLS</option>
                        <option value="direct">Direct MP4/HLS</option>
                        <option value="iframe">Other embed</option>
                      </select>
                      <input placeholder="HTTPS video/embed URL (blank keeps existing URL)" value={lesson.videoUrl ?? ''} onChange={(e) => updateLesson(i, { videoUrl: e.target.value })} />
                    </div>
                    <label>Duration (seconds)<input type="number" min={0} value={lesson.durationSeconds ?? 0} onChange={(e) => updateLesson(i, { durationSeconds: Number(e.target.value) })} /></label>
                    {form.lessons.length > 1 && (
                      <button type="button" onClick={() => setForm({ ...form, lessons: form.lessons.filter((_, idx) => idx !== i) })} style={{ justifySelf: 'start', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Remove lesson
                      </button>
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>
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
