import React, { useState, useEffect } from 'react';
import { BookOpen, Layout, Settings, Edit2, Plus, Save, X, Image as ImageIcon, Trash2, Award, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData, type NewsArticle, type TrackRecord, type YearStats, type StudentMessage } from '../context/DataContext';
import { type Course } from '../components/courses/CourseCard';

const AdminPanel: React.FC = () => {
  const { 
    courses, news, trackRecord, studentMessages,
    updateCourse, updateNews, addCourse, addNews, deleteCourse, deleteNews, updateTrackRecord,
    updateStudentMessage, addStudentMessage, deleteStudentMessage
  } = useData();
  
  const [activeMenu, setActiveMenu] = useState('courses');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [editingMessage, setEditingMessage] = useState<StudentMessage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formattedPrice, setFormattedPrice] = useState('');

  // Track Record Local State
  const [selectedYear, setSelectedYear] = useState(Object.keys(trackRecord)[0] || '2024');
  const [localYearStats, setLocalYearStats] = useState<YearStats>(trackRecord[selectedYear] || { stats: [], testimonial: { quote: '', author: '' } });

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

  useEffect(() => {
    if (editingCourse) {
      setFormattedPrice(editingCourse.price);
    } else if (isCreating) {
      setFormattedPrice('');
    }
  }, [editingCourse, isCreating]);

  useEffect(() => {
    if (trackRecord[selectedYear]) {
      setLocalYearStats(trackRecord[selectedYear]);
    }
  }, [selectedYear, trackRecord]);

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const courseData: Partial<Course> = {
      title: formData.get('title') as string,
      category: formData.get('category') as string,
      price: formattedPrice,
      duration: formData.get('duration') as string,
      description: formData.get('description') as string,
      image: '/course_ppl.png',
      tag: (formData.get('category') as string),
      tagColor: 'var(--text-primary)',
      tagBg: 'rgba(150, 0, 251, 0.2)',
    };
    
    if (isCreating) {
      addCourse({ ...courseData, id: `course-${Date.now()}` } as Course);
      alert('Course created successfully!');
    } else if (editingCourse) {
      updateCourse({ ...editingCourse, ...courseData } as Course);
      alert('Course updated successfully!');
    }
    
    setEditingCourse(null);
    setIsCreating(false);
    setFormattedPrice('');
  };

  const handleDeleteCourse = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the course "${title}"?`)) {
      deleteCourse(id);
    }
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const articleData: Partial<NewsArticle> = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      author: formData.get('author') as string,
      description: formData.get('description') as string,
      image: selectedImage || editingNews?.image || '/tg_crew.png',
      link: (formData.get('link') as string) || '#',
      tag: 'Update',
      status: 'Published'
    };
    
    if (isCreating) {
      addNews({ ...articleData, id: `news-${Date.now()}` } as NewsArticle);
      alert('Article created successfully!');
    } else if (editingNews) {
      updateNews({ ...editingNews, ...articleData } as NewsArticle);
      alert('Article updated successfully!');
    }
    
    setEditingNews(null);
    setIsCreating(false);
    setSelectedImage(null);
  };

  const handleDeleteNews = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the article "${title}"?`)) {
      deleteNews(id);
    }
  };

  const handleSaveMessage = (e: React.FormEvent) => {
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
      addStudentMessage(messageData);
      alert('Message added successfully!');
    } else {
      updateStudentMessage(messageData);
      alert('Message updated successfully!');
    }
    
    setEditingMessage(null);
    setIsCreating(false);
  };

  const handleDeleteMessage = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the message from "${name}"?`)) {
      deleteStudentMessage(id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTrackRecord = (e: React.FormEvent) => {
    e.preventDefault();
    updateTrackRecord(selectedYear, localYearStats);
    alert(`Track record for ${selectedYear} updated successfully!`);
  };

  const updateStat = (index: number, field: 'label' | 'value', newValue: string) => {
    const newStats = [...localYearStats.stats];
    newStats[index] = { ...newStats[index], [field]: newValue };
    setLocalYearStats({ ...localYearStats, stats: newStats });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--glass-border)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '3rem', padding: '0 1rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Content<span style={{ color: 'var(--accent-blue)' }}>Manager</span></h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Sully Academy Site Editor</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
          <button 
            onClick={() => { setActiveMenu('courses'); setEditingCourse(null); setEditingNews(null); setEditingMessage(null); setIsCreating(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', background: activeMenu === 'courses' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeMenu === 'courses' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeMenu === 'courses' ? 600 : 400, transition: 'var(--transition)' }}
          >
            <BookOpen size={20} /> Manage Courses
          </button>
          <button 
            onClick={() => { setActiveMenu('news'); setEditingCourse(null); setEditingNews(null); setEditingMessage(null); setIsCreating(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', background: activeMenu === 'news' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeMenu === 'news' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeMenu === 'news' ? 600 : 400, transition: 'var(--transition)' }}
          >
            <Layout size={20} /> Manage News
          </button>
          <button 
            onClick={() => { setActiveMenu('messages'); setEditingCourse(null); setEditingNews(null); setEditingMessage(null); setIsCreating(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', background: activeMenu === 'messages' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeMenu === 'messages' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeMenu === 'messages' ? 600 : 400, transition: 'var(--transition)' }}
          >
            <MessageSquare size={20} /> Student Messages
          </button>
          <button 
            onClick={() => { setActiveMenu('track'); setEditingCourse(null); setEditingNews(null); setEditingMessage(null); setIsCreating(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', background: activeMenu === 'track' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeMenu === 'track' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeMenu === 'track' ? 600 : 400, transition: 'var(--transition)' }}
          >
            <Award size={20} /> Track Record
          </button>
          <button 
            onClick={() => { setActiveMenu('settings'); setEditingCourse(null); setEditingNews(null); setEditingMessage(null); setIsCreating(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)', background: activeMenu === 'settings' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeMenu === 'settings' ? 'var(--accent-blue)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: activeMenu === 'settings' ? 600 : 400, transition: 'var(--transition)' }}
          >
            <Settings size={20} /> Site Settings
          </button>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', marginTop: 'auto' }}>
          <Link to="/" style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>&larr; Back to Main Site</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              {activeMenu === 'courses' ? 'Manage Courses' : 
               activeMenu === 'news' ? 'Manage News' : 
               activeMenu === 'messages' ? 'Student Messages' :
               activeMenu === 'track' ? 'Track Record' : 'Site Settings'}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Update content directly to the live website.</p>
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
        </header>

        {/* Courses Editor View */}
        {activeMenu === 'courses' && !editingCourse && !isCreating && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Course Title</th>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Category</th>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Price</th>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1.25rem 2rem', fontWeight: 500 }}>{course.title}</td>
                    <td style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)' }}>{course.category}</td>
                    <td style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)' }}>{course.price}</td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingCourse(course)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteCourse(course.id, course.title)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius)', padding: '0.5rem', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Student Messages View */}
        {activeMenu === 'messages' && !editingMessage && !isCreating && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Student Name</th>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Position</th>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Message Excerpt</th>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentMessages.map((msg, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1.25rem 2rem', fontWeight: 500 }}>{msg.name}</td>
                    <td style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)' }}>{msg.position}</td>
                    <td style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)' }}>{msg.message.substring(0, 50)}...</td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingMessage(msg)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteMessage(msg.id, msg.name)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius)', padding: '0.5rem', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                <textarea name="message" rows={4} defaultValue={editingMessage?.message || ''} placeholder="Enter student feedback..." style={{ width: '100%', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', marginTop: '0.5rem', resize: 'vertical' }} required></textarea>
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
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              {Object.keys(trackRecord).map(year => (
                <button 
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: 'var(--radius)', 
                    background: selectedYear === year ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                    color: selectedYear === year ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {year} Data
                </button>
              ))}
              <button 
                onClick={() => {
                  const newYear = prompt('Enter year (e.g. 2026):');
                  if (newYear && !trackRecord[newYear]) {
                    updateTrackRecord(newYear, { stats: [], testimonial: { quote: '', author: '' } });
                    setSelectedYear(newYear);
                  }
                }}
                className="button button-secondary" style={{ padding: '0.75rem 1rem' }}
              >
                <Plus size={18} /> Add Year
              </button>
            </div>

            <form onSubmit={handleSaveTrackRecord}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Success Statistics ({selectedYear})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                {localYearStats.stats.map((stat, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 40px', gap: '1rem' }}>
                    <input 
                      type="text" 
                      value={stat.label} 
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      placeholder="Stat Label (e.g. PPL Written)"
                    />
                    <input 
                      type="text" 
                      value={stat.value} 
                      onChange={(e) => updateStat(index, 'value', e.target.value)}
                      placeholder="96%"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        const newStats = localYearStats.stats.filter((_, i) => i !== index);
                        setLocalYearStats({ ...localYearStats, stats: newStats });
                      }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => setLocalYearStats({ ...localYearStats, stats: [...localYearStats.stats, { label: '', value: '' }] })}
                  style={{ alignSelf: 'flex-start', background: 'none', border: '1px dashed var(--glass-border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  + Add Stat Row
                </button>
              </div>

              <button type="submit" className="button button-primary" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> Update {selectedYear} Record
              </button>
            </form>
          </div>
        )}

        {/* Edit/Create Course Form */}
        {activeMenu === 'courses' && (editingCourse || isCreating) && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{isCreating ? 'Add New Course' : `Editing: ${editingCourse?.title}`}</h2>
              <button onClick={() => { setEditingCourse(null); setIsCreating(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form className="contact-form" style={{ padding: 0, border: 'none', background: 'transparent', backdropFilter: 'none' }} onSubmit={handleSaveCourse}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <label>
                  Course Title
                  <input type="text" name="title" defaultValue={editingCourse?.title || ''} placeholder="e.g. Advanced Flight Prep" required />
                </label>
                <label>
                  Category
                  <select name="category" defaultValue={editingCourse?.category || 'Student Pilot'} style={{ width: '100%', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', marginTop: '0.5rem' }}>
                    <option value="Student Pilot">Student Pilot</option>
                    <option value="Qualified Pilot">Qualified Pilot</option>
                    <option value="ATC">ATC</option>
                    <option value="Others">Others</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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

              <label>
                Course Description
                <textarea name="description" rows={4} defaultValue={editingCourse?.description || ''} placeholder="Enter course details..." style={{ width: '100%', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', marginTop: '0.5rem', resize: 'vertical' }}></textarea>
              </label>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {isCreating ? 'Create Course' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setEditingCourse(null); setIsCreating(false); }} className="button button-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* News Manager View */}
        {activeMenu === 'news' && !editingNews && !isCreating && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Article Title</th>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Date</th>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>Author</th>
                  <th style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {news.map((article, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1.25rem 2rem', fontWeight: 500 }}>{article.title}</td>
                    <td style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)' }}>{article.date}</td>
                    <td style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)' }}>{article.author}</td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingNews(article)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', padding: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteNews(article.id, article.title)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius)', padding: '0.5rem', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <label>
                  Publish Date
                  <input type="date" name="date" defaultValue={editingNews?.date || new Date().toISOString().split('T')[0]} />
                </label>
                <label>
                  Author Name
                  <input type="text" name="author" defaultValue={editingNews?.author || ''} placeholder="e.g. Admin" />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <label>
                  Featured Image
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.9rem' }} />
                    {(selectedImage || editingNews?.image) && (
                      <img 
                        src={selectedImage || editingNews?.image} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--glass-border)' }} 
                      />
                    )}
                  </div>
                </label>
                <label>
                  External Link (Read More)
                  <input type="text" name="link" defaultValue={editingNews?.link || ''} placeholder="https://..." />
                </label>
              </div>

              <label style={{ marginTop: '1.5rem' }}>
                Article Description (Excerpt)
                <textarea name="description" rows={4} defaultValue={editingNews?.description || ''} placeholder="Enter article content..." style={{ width: '100%', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', marginTop: '0.5rem', resize: 'vertical' }}></textarea>
              </label>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="button button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={18} /> {isCreating ? 'Create Article' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setEditingNews(null); setIsCreating(false); setSelectedImage(null); }} className="button button-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
