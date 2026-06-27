import React, { useState, useEffect } from 'react';
import { BookOpen, Layout, Settings, Edit2, Plus, Save, X, Image as ImageIcon, Trash2, Award, MessageSquare, GripVertical, Check, Loader2, LogOut, Calendar, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Reorder } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useData } from '../hooks/useData';
import type { NewsArticle, YearStats, StudentMessage } from '../context/data-context';
import { useAuth } from '../hooks/useAuth';
import { type Course } from '../components/courses/CourseCard';
import { BookingAdminPanel } from '../booking/BookingAdminPanel';
import { StoreAdminPanel } from '../ecommerce/StoreAdminPanel';
import '../booking/booking-theme.css';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const { 
    courses, news, trackRecord, studentMessages, loading,
    updateCourse, updateNews, addCourse, addNews, deleteCourse, deleteNews, updateTrackRecord, deleteTrackRecord,
    updateStudentMessage, addStudentMessage, deleteStudentMessage,
    setCourses, setNews, setStudentMessages
  } = useData();
  const { signOutUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/', { replace: true });
  };

  const [activeMenu, setActiveMenu] = useState('courses');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [editingMessage, setEditingMessage] = useState<StudentMessage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formattedPrice, setFormattedPrice] = useState('');
  
  // Local state for overview bullet points
  const [localOverview, setLocalOverview] = useState<string[]>([]);

  // Track Record Local State
  const [selectedYear, setSelectedYear] = useState(Object.keys(trackRecord)[0] || '2024');
  const [localYearStats, setLocalYearStats] = useState<YearStats>(trackRecord[selectedYear] || { id: selectedYear, stats: [], testimonial: { quote: '', author: '' } } as YearStats);
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');

  const formatPrice = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';  
    const formatted = new Intl.NumberFormat('th-TH').format(parseInt(numbers));
    return `฿${formatted}`;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setFormattedPrice(formatPrice(rawValue));
  };

  // TODO: extract the course form into its own component and pass `key={editingCourse?.id}`
  // so React resets state on record change, eliminating this prefill effect.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (editingCourse) {
      setFormattedPrice(editingCourse.price);
      setLocalOverview(editingCourse.overview || []);
    } else if (isCreating) {
      setFormattedPrice('');
      setLocalOverview([
        'CAAT Approved Curriculum',
        'Highly Experienced Instructors',
        'Modern Training Facilities',
        'Flexible Scheduling Options'
      ]);
    }
  }, [editingCourse, isCreating]);

  // TODO: same — extract the track-record editor sub-component and key it on `selectedYear`.
  useEffect(() => {
    if (trackRecord[selectedYear]) {
      setLocalYearStats(trackRecord[selectedYear]);
    } else if (Object.keys(trackRecord).length > 0) {
      setSelectedYear(Object.keys(trackRecord)[0]);
    }
  }, [selectedYear, trackRecord]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const courseData: Partial<Course> = {
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      price: formattedPrice,
      duration: formData.get('duration') as string,
      description: formData.get('description') as string,
      image: selectedImage || editingCourse?.image || '/course_ppl.png',
      tag: (formData.get('category') as string),
      tagColor: 'var(--text-primary)',
      tagBg: 'rgba(150, 0, 251, 0.2)',
      overview: localOverview
    };
    
    if (isCreating) {
      await addCourse({ ...courseData, id: `course-${Date.now()}` } as Course);
      alert('Course created successfully!');
    } else if (editingCourse) {
      await updateCourse({ ...editingCourse, ...courseData } as Course);
      alert('Course updated successfully!');
    }
    
    setEditingCourse(null);
    setIsCreating(false);
    setFormattedPrice('');
    setSelectedImage(null);
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the course "${title}"?`)) {
      await deleteCourse(id);
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const articleData: Partial<NewsArticle> = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      author: formData.get('author') as string,
      description: formData.get('description') as string,
      image: selectedImage || editingNews?.image || '/tg_crew.png',
      link: (formData.get('link') as string) || '#',
      tag: (formData.get('tag') as string) || 'Update',
      status: 'Published'
    };
    
    if (isCreating) {
      await addNews({ ...articleData, id: `news-${Date.now()}` } as NewsArticle);
      alert('Article created successfully!');
    } else if (editingNews) {
      await updateNews({ ...editingNews, ...articleData } as NewsArticle);
      alert('Article updated successfully!');
    }
    
    setEditingNews(null);
    setIsCreating(false);
    setSelectedImage(null);
  };

  const handleDeleteNews = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the article "${title}"?`)) {
      await deleteNews(id);
    }
  };

  const handleSaveMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const messageData: StudentMessage = {
      id: editingMessage?.id || `msg-${Date.now()}`,
      name: formData.get('name') as string,
      message: formData.get('message') as string,
      position: formData.get('position') as string,
      rating: 5
    };
    
    if (isCreating) {
      await addStudentMessage(messageData);
      alert('Message added successfully!');
    } else {
      await updateStudentMessage(messageData);
      alert('Message updated successfully!');
    }
    
    setEditingMessage(null);
    setIsCreating(false);
  };

  const handleDeleteMessage = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the message from "${name}"?`)) {
      await deleteStudentMessage(id);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setSelectedImage(downloadURL);
      console.log('File available at', downloadURL);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please check your Firebase Storage rules.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTrackRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTrackRecord(selectedYear, localYearStats);
    alert(`Track record for ${selectedYear} updated successfully!`);
  };

  const handleDeleteYear = async () => {
    if (window.confirm(`Are you sure you want to delete all data for the year ${selectedYear}? This cannot be undone.`)) {
      await deleteTrackRecord(selectedYear);
      alert(`Year ${selectedYear} deleted.`);
    }
  };

  const updateStat = (index: number, field: 'label' | 'value', newValue: string) => {
    const newStats = [...localYearStats.stats];
    newStats[index] = { ...newStats[index], [field]: newValue };
    setLocalYearStats({ ...localYearStats, stats: newStats });
  };

  const handleAddYear = async () => {
    const year = newYearInput.trim();
    if (!year || trackRecord[year]) return;
    await updateTrackRecord(year, {
      id: year,
      stats: [],
      testimonial: { quote: '', author: '' },
    } as YearStats);
    setSelectedYear(year);
    setNewYearInput('');
    setShowAddYear(false);
  };

  const updateTestimonial = (field: 'quote' | 'author', value: string) => {
    setLocalYearStats({
      ...localYearStats,
      testimonial: { ...localYearStats.testimonial, [field]: value },
    });
  };

  const addOverviewPoint = () => {
    setLocalOverview([...localOverview, '']);
  };

  const updateOverviewPoint = (index: number, value: string) => {
    const newOverview = [...localOverview];
    newOverview[index] = value;
    setLocalOverview(newOverview);
  };

  const removeOverviewPoint = (index: number) => {
    setLocalOverview(localOverview.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ border: '3px solid #e2e8f0', borderTop: '3px solid var(--accent-blue)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Connecting to Sully Cloud...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const menuItems = [
    { key: 'courses', icon: <BookOpen size={18} />, label: 'Courses' },
    { key: 'news', icon: <Layout size={18} />, label: 'News' },
    { key: 'messages', icon: <MessageSquare size={18} />, label: 'Messages' },
    { key: 'track', icon: <Award size={18} />, label: 'Track Record' },
    { key: 'booking', icon: <Calendar size={18} />, label: 'Interview Booking' },
    { key: 'store', icon: <ShoppingBag size={18} />, label: 'Store' },
    { key: 'settings', icon: <Settings size={18} />, label: 'Settings' },
  ] as const;

  const selectMenu = (key: typeof menuItems[number]['key']) => {
    setActiveMenu(key);
    setEditingCourse(null);
    setEditingNews(null);
    setEditingMessage(null);
    setIsCreating(false);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>Content<span>Manager</span></h2>
          <p>Sully Academy</p>
        </div>

        <nav className="admin-sidebar-nav">
          {menuItems.map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              className={`admin-sidebar-link${activeMenu === key ? ' is-active' : ''}`}
              onClick={() => selectMenu(key)}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-sidebar-link admin-sidebar-link--muted">
            &larr; Main Site
          </Link>
          <button type="button" className="admin-sidebar-link admin-sidebar-link--danger" onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              {activeMenu === 'courses' ? 'Manage Courses' : 
               activeMenu === 'news' ? 'Manage News' : 
               activeMenu === 'messages' ? 'Student Messages' :
               activeMenu === 'track' ? 'Track Record' :
               activeMenu === 'booking' ? 'Interview Booking' :
               activeMenu === 'store' ? 'Store & Products' : 'Site Settings'}
            </h1>
            {activeMenu === 'track' && (
              <p style={{ color: 'var(--text-secondary)' }}>Manage yearly exam stats shown on the home page achievements section.</p>
            )}
            {activeMenu !== 'booking' && activeMenu !== 'track' && activeMenu !== 'store' && (
            <p style={{ color: 'var(--text-secondary)' }}>Drag the <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}><GripVertical size={14} /></span> handle to reposition items.</p>
            )}
          </div>
          {activeMenu === 'courses' && !editingCourse && !isCreating && (
            <button onClick={() => setIsCreating(true)} className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Add New Course
            </button>
          )}
          {activeMenu === 'news' && !editingNews && !isCreating && (
            <button onClick={() => setIsCreating(true)} className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Create News Article
            </button>
          )}
          {activeMenu === 'messages' && !editingMessage && !isCreating && (
            <button onClick={() => setIsCreating(true)} className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Add New Message
            </button>
          )}
          {activeMenu === 'track' && (
            <button
              type="button"
              onClick={() => setShowAddYear((v) => !v)}
              className="button button-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> Add Year
            </button>
          )}
        </header>

        {/* Courses Editor View */}
        {activeMenu === 'courses' && !editingCourse && !isCreating && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: '560px' }}>
                <div style={{ padding: '1.25rem 2rem', background: 'var(--surface-subtle)', display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 120px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span></span>
                  <span>Course Title</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span style={{ textAlign: 'right' }}>Actions</span>
                </div>
                <Reorder.Group axis="y" values={courses} onReorder={setCourses} style={{ listStyle: 'none', padding: 0 }}>
                  {courses.map((course) => (
                    <Reorder.Item 
                      key={course.id} 
                      value={course}
                      style={{ 
                        padding: '1.25rem 2rem', 
                        borderBottom: '1px solid var(--glass-border)', 
                        display: 'grid', 
                        gridTemplateColumns: '40px 1fr 1fr 1fr 120px',
                        alignItems: 'center',
                        background: 'var(--bg-secondary)',
                        cursor: 'default'
                      }}
                    >
                      <div style={{ cursor: 'grab', color: 'var(--text-secondary)' }}><GripVertical size={18} /></div>
                      <div style={{ fontWeight: 500 }}>{course.title}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{course.category}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{course.price}</div>
                      <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingCourse(course)} style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteCourse(course.id, course.title)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius)', padding: '0.5rem', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Create Course Form */}
        {activeMenu === 'courses' && (editingCourse || isCreating) && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{isCreating ? 'Add New Course' : `Editing: ${editingCourse?.title}`}</h2>
              <button onClick={() => { setEditingCourse(null); setIsCreating(false); setSelectedImage(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form className="contact-form" style={{ padding: 0, border: 'none', background: 'transparent', backdropFilter: 'none' }} onSubmit={handleSaveCourse}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.5rem' }}>
                <label>
                  Course Title
                  <input type="text" name="title" defaultValue={editingCourse?.title || ''} placeholder="e.g. Advanced Flight Prep" required />
                </label>
                <label>
                  Category
                  <select name="category" defaultValue={editingCourse?.category || 'Student Pilot'} style={{ width: '100%', padding: '1rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', marginTop: '0.5rem' }}>
                    <option value="Student Pilot">Student Pilot</option>
                    <option value="Qualified Pilot">Qualified Pilot</option>
                    <option value="ATC">ATC</option>
                    <option value="Others">Others</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.5rem' }}>
                <label>
                  Price
                  <input 
                    type="text" 
                    name="price" 
                    value={formattedPrice} 
                    onChange={handlePriceChange}
                    placeholder="฿0,000" 
                    required 
                  />
                </label>
                <label>
                  Duration
                  <input type="text" name="duration" defaultValue={editingCourse?.duration || ''} placeholder="e.g. 12 Weeks" required />
                </label>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label>
                  Featured Image
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        style={{ position: 'absolute', inset: 0, opacity: 0, zIndex: 2, cursor: 'pointer' }} 
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'var(--input-bg)', border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                        {isUploading ? (
                          <>
                            <Loader2 className="animate-spin" size={24} color="var(--accent-blue)" />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Uploading...</span>
                          </>
                        ) : selectedImage || editingCourse?.image ? (
                          <img 
                            src={selectedImage || editingCourse?.image} 
                            alt="Preview" 
                            loading="lazy"
                            decoding="async"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} 
                          />
                        ) : (
                          <>
                            <ImageIcon size={24} color="var(--text-secondary)" />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click or Drag to Upload</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <label style={{ marginTop: '1.5rem' }}>
                Course Description
                <textarea name="description" rows={4} defaultValue={editingCourse?.description || ''} placeholder="Enter course details..." style={{ width: '100%', padding: '1rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', marginTop: '0.5rem', resize: 'vertical' }}></textarea>
              </label>

              {/* Course Overview Points */}
              <div style={{ marginTop: '2rem', background: 'var(--surface-subtle)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="var(--accent-blue)" /> Program Overview Highlights</h3>
                  <button type="button" onClick={addOverviewPoint} className="button button-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>+ Add Point</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {localOverview.map((point, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                      <input 
                        type="text" 
                        value={point} 
                        onChange={(e) => updateOverviewPoint(idx, e.target.value)} 
                        placeholder="e.g. CAAT Approved Curriculum"
                        style={{ flex: 1 }}
                      />
                      <button type="button" onClick={() => removeOverviewPoint(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {localOverview.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>No overview highlights added yet.</p>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="submit" className="button button-primary" disabled={isUploading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isUploading ? 0.5 : 1 }}>
                  <Save size={18} /> {isCreating ? 'Create Course' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setEditingCourse(null); setIsCreating(false); setSelectedImage(null); }} className="button button-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* News Manager View */}
        {activeMenu === 'news' && !editingNews && !isCreating && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: '580px' }}>
                <div style={{ padding: '1.25rem 2rem', background: 'var(--surface-subtle)', display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr 1fr 120px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span></span>
                  <span>Article Title</span>
                  <span>Date</span>
                  <span>Author</span>
                  <span style={{ textAlign: 'right' }}>Actions</span>
                </div>
                <Reorder.Group axis="y" values={news} onReorder={setNews} style={{ listStyle: 'none', padding: 0 }}>
                  {news.map((article) => (
                    <Reorder.Item 
                      key={article.id} 
                      value={article}
                      style={{ 
                        padding: '1.25rem 2rem', 
                        borderBottom: '1px solid var(--glass-border)', 
                        display: 'grid', 
                        gridTemplateColumns: '40px 1.5fr 1fr 1fr 120px',
                        alignItems: 'center',
                        background: 'var(--bg-secondary)',
                        cursor: 'default'
                      }}
                    >
                      <div style={{ cursor: 'grab', color: 'var(--text-secondary)' }}><GripVertical size={18} /></div>
                      <div style={{ fontWeight: 500 }}>{article.title}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{article.date}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{article.author}</div>
                      <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingNews(article)} style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteNews(article.id, article.title)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius)', padding: '0.5rem', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Create News Form */}
        {activeMenu === 'news' && (editingNews || isCreating) && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{isCreating ? 'Create News Article' : `Editing Article: ${editingNews?.title}`}</h2>
              <button onClick={() => { setEditingNews(null); setIsCreating(false); setSelectedImage(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form className="contact-form" style={{ padding: 0, border: 'none', background: 'transparent', backdropFilter: 'none' }} onSubmit={handleSaveNews}>
              <label>
                Article Title
                <input type="text" name="title" defaultValue={editingNews?.title || ''} placeholder="e.g. New Intake Announcement" required />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <label>
                  Publish Date
                  <input type="date" name="date" defaultValue={editingNews?.date || new Date().toISOString().split('T')[0]} />
                </label>
                <label>
                  Author Name
                  <input type="text" name="author" defaultValue={editingNews?.author || ''} placeholder="e.g. Admin" />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <label>
                  Category Tag
                  <select name="tag" defaultValue={editingNews?.tag || 'Student Pilot'} style={{ width: '100%', padding: '1rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', marginTop: '0.5rem' }}>
                    <option value="Student Pilot">Student Pilot</option>
                    <option value="Qualified Pilot">Qualified Pilot</option>
                    <option value="ATC">ATC</option>
                    <option value="Update">Update</option>
                  </select>
                </label>
                <label>
                  External Link (Read More)
                  <input type="text" name="link" defaultValue={editingNews?.link || ''} placeholder="https://..." />
                </label>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label>
                  Featured Image
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        style={{ position: 'absolute', inset: 0, opacity: 0, zIndex: 2, cursor: 'pointer' }} 
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'var(--input-bg)', border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                        {isUploading ? (
                          <>
                            <Loader2 className="animate-spin" size={24} color="var(--accent-blue)" />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Uploading...</span>
                          </>
                        ) : selectedImage || editingNews?.image ? (
                          <img 
                            src={selectedImage || editingNews?.image} 
                            alt="Preview" 
                            loading="lazy"
                            decoding="async"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }} 
                          />
                        ) : (
                          <>
                            <ImageIcon size={24} color="var(--text-secondary)" />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click or Drag to Upload</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <label style={{ marginTop: '1.5rem' }}>
                Article Description (Excerpt)
                <textarea name="description" rows={4} defaultValue={editingNews?.description || ''} placeholder="Enter article content..." style={{ width: '100%', padding: '1rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', marginTop: '0.5rem', resize: 'vertical' }}></textarea>
              </label>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="button button-primary" disabled={isUploading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isUploading ? 0.5 : 1 }}>
                  <Save size={18} /> {isCreating ? 'Create Article' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setEditingNews(null); setIsCreating(false); setSelectedImage(null); }} className="button button-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Student Messages View */}
        {activeMenu === 'messages' && !editingMessage && !isCreating && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: '580px' }}>
                <div style={{ padding: '1.25rem 2rem', background: 'var(--surface-subtle)', display: 'grid', gridTemplateColumns: '40px 1fr 1fr 2fr 120px', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span></span>
                  <span>Student Name</span>
                  <span>Position</span>
                  <span>Message Excerpt</span>
                  <span style={{ textAlign: 'right' }}>Actions</span>
                </div>
                <Reorder.Group axis="y" values={studentMessages} onReorder={setStudentMessages} style={{ listStyle: 'none', padding: 0 }}>
                  {studentMessages.map((msg) => (
                    <Reorder.Item 
                      key={msg.id} 
                      value={msg}
                      style={{ 
                        padding: '1.25rem 2rem', 
                        borderBottom: '1px solid var(--glass-border)', 
                        display: 'grid', 
                        gridTemplateColumns: '40px 1fr 1fr 2fr 120px',
                        alignItems: 'center',
                        background: 'var(--bg-secondary)',
                        cursor: 'default'
                      }}
                    >
                      <div style={{ cursor: 'grab', color: 'var(--text-secondary)' }}><GripVertical size={18} /></div>
                      <div style={{ fontWeight: 500 }}>{msg.name}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{msg.position}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{msg.message.substring(0, 50)}...</div>
                      <div style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingMessage(msg)} style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteMessage(msg.id, msg.name)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius)', padding: '0.5rem', color: '#ef4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Create Student Message Form */}
        {activeMenu === 'messages' && (editingMessage || isCreating) && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{isCreating ? 'Add New Message' : `Editing Message from: ${editingMessage?.name}`}</h2>
              <button onClick={() => { setEditingMessage(null); setIsCreating(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form className="contact-form" style={{ padding: 0, border: 'none', background: 'transparent', backdropFilter: 'none' }} onSubmit={handleSaveMessage}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.5rem' }}>
                <label>
                  Student Name
                  <input type="text" name="name" defaultValue={editingMessage?.name || ''} placeholder="e.g. Jane Doe" required />
                </label>
                <label>
                  Position/Airline
                  <input type="text" name="position" defaultValue={editingMessage?.position || ''} placeholder="e.g. Thai Airways Cadet" required />
                </label>
              </div>

              <label style={{ marginTop: '1.5rem' }}>
                Message
                <textarea name="message" rows={4} defaultValue={editingMessage?.message || ''} placeholder="Enter student feedback..." style={{ width: '100%', padding: '1rem', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', marginTop: '0.5rem', resize: 'vertical' }} required></textarea>
              </label>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {isCreating ? 'Add Message' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setEditingMessage(null); setIsCreating(false); }} className="button button-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Track Record Management */}
        {activeMenu === 'track' && (
          <div className="track-record-panel">
            {showAddYear && (
              <div className="track-record-section" style={{ marginBottom: '1.25rem' }}>
                <div className="track-record-section-head">
                  <h3>Add new year</h3>
                  <button type="button" onClick={() => { setShowAddYear(false); setNewYearInput(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
                <div className="track-add-year-inline">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 2026"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddYear())}
                  />
                  <button type="button" className="button button-primary" onClick={handleAddYear} disabled={!newYearInput.trim() || !!trackRecord[newYearInput.trim()]}>
                    Create
                  </button>
                </div>
              </div>
            )}

            {Object.keys(trackRecord).length === 0 ? (
              <div className="track-empty-state">
                <Award size={48} />
                <h3 style={{ marginBottom: '0.5rem' }}>No track record yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add a year to start publishing success statistics on the home page.</p>
                <button type="button" className="button button-primary" onClick={() => setShowAddYear(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={18} /> Add First Year
                </button>
              </div>
            ) : (
              <>
                <div className="track-year-tabs">
                  {Object.keys(trackRecord).sort().reverse().map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={`track-year-tab${selectedYear === year ? ' is-active' : ''}`}
                      onClick={() => setSelectedYear(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSaveTrackRecord}>
                  <div className="track-record-grid">
                    <div className="track-record-editor">
                      <div className="track-record-section">
                        <div className="track-record-section-head">
                          <h3>Exam statistics — {selectedYear}</h3>
                        </div>
                        {localYearStats.stats.length > 0 && (
                          <div className="track-stat-table-head">
                            <span>Label</span>
                            <span>Result</span>
                            <span></span>
                          </div>
                        )}
                        {localYearStats.stats.map((stat, index) => (
                          <div key={index} className="track-stat-row">
                            <input
                              type="text"
                              value={stat.label}
                              onChange={(e) => updateStat(index, 'label', e.target.value)}
                              placeholder="e.g. PPL Written"
                            />
                            <input
                              type="text"
                              value={stat.value}
                              onChange={(e) => updateStat(index, 'value', e.target.value)}
                              placeholder="e.g. 96%"
                            />
                            <button
                              type="button"
                              className="track-stat-remove"
                              onClick={() => {
                                const newStats = localYearStats.stats.filter((_, i) => i !== index);
                                setLocalYearStats({ ...localYearStats, stats: newStats });
                              }}
                              aria-label="Remove stat"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="track-add-stat"
                          onClick={() => setLocalYearStats({ ...localYearStats, stats: [...localYearStats.stats, { label: '', value: '' }] })}
                        >
                          <Plus size={14} /> Add stat
                        </button>
                      </div>

                      <div className="track-record-section">
                        <div className="track-record-section-head">
                          <h3>Featured quote (optional)</h3>
                        </div>
                        <div className="track-testimonial-fields">
                          <label>
                            Quote
                            <textarea
                              value={localYearStats.testimonial.quote}
                              onChange={(e) => updateTestimonial('quote', e.target.value)}
                              placeholder="Student success story for this year..."
                              rows={3}
                            />
                          </label>
                          <label>
                            Author
                            <input
                              type="text"
                              value={localYearStats.testimonial.author}
                              onChange={(e) => updateTestimonial('author', e.target.value)}
                              placeholder="e.g. Cadet Name, Thai Airways"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="track-record-actions">
                        <button type="submit" className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Save size={18} /> Save {selectedYear}
                        </button>
                        <button type="button" className="track-delete-year" onClick={handleDeleteYear}>
                          <Trash2 size={16} /> Delete year
                        </button>
                      </div>
                    </div>

                    <aside className="track-record-preview">
                      <p className="track-record-preview-label">Home page preview</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{selectedYear} results</p>
                      {localYearStats.stats.filter((s) => s.label || s.value).length > 0 ? (
                        <div className="track-preview-stats">
                          {localYearStats.stats.filter((s) => s.label || s.value).map((stat, i) => (
                            <div key={i} className="track-preview-stat">
                              <p className="track-preview-stat-label">{stat.label || 'Label'}</p>
                              <p className="track-preview-stat-value">{stat.value || '—'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="track-preview-empty">No stats added yet</div>
                      )}
                      {localYearStats.testimonial.quote && (
                        <blockquote className="track-preview-quote">
                          <p>&ldquo;{localYearStats.testimonial.quote}&rdquo;</p>
                          {localYearStats.testimonial.author && (
                            <cite>— {localYearStats.testimonial.author}</cite>
                          )}
                        </blockquote>
                      )}
                    </aside>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {activeMenu === 'booking' && (
          <div className="booking-shell">
            <BookingAdminPanel />
          </div>
        )}

        {activeMenu === 'store' && (
          <StoreAdminPanel />
        )}

        {/* Site Settings Placeholder */}
        {activeMenu === 'settings' && (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
            <Settings size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
            <h3>Site Settings</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Configure global site settings, social links, and contact information.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
