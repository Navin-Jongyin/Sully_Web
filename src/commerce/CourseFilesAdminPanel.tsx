import React, { useState } from 'react';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Download, Upload } from 'lucide-react';
import { db, storage } from '../firebase';
import { useData } from '../hooks/useData';
import { courseDownloadFiles } from './course-files';
import type { CourseDownloadFile, OnlineVideoCourse } from './types';
import { useAdminToast } from './useAdminToast';
import './commerce.css';

function contentTypeForCourseFile(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    pdf: 'application/pdf',
    zip: 'application/zip',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
  };
  return (extension && types[extension]) || file.type || 'application/octet-stream';
}

const CourseFilesAdminPanel: React.FC = () => {
  const { onlineVideoCourses } = useData();
  const [busyId, setBusyId] = useState<string | null>(null);
  const messageToast = useAdminToast<string>();
  const message = messageToast.value;
  const setMessage = (value: string | null) => (value ? messageToast.show(value) : messageToast.clear());

  const saveFiles = async (courseId: string, files: CourseDownloadFile[]) => {
    await updateDoc(doc(db, 'onlineVideoCourses', courseId), {
      downloadFiles: files,
      downloadFileUrl: deleteField(),
      downloadFileName: deleteField(),
      updatedAt: new Date().toISOString(),
    });
  };

  const uploadFiles = async (course: OnlineVideoCourse, selected?: FileList | null) => {
    const incoming = selected ? Array.from(selected) : [];
    if (incoming.length === 0) return;
    const invalid = incoming.find((file) => (
      !/\.(pdf|zip|doc|docx|ppt|pptx|xls|xlsx|txt)$/i.test(file.name) || file.size > 50 * 1024 * 1024
    ));
    if (invalid) {
      setMessage('Each file must be a PDF, Office, or ZIP file smaller than 50 MB.');
      return;
    }
    setBusyId(course.id);
    setMessage(null);
    try {
      const next = [...courseDownloadFiles(course)];
      for (const file of incoming) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const id = `${Date.now()}-${safeName}`;
        const storageRef = ref(storage, `online-course-files/${course.id}/${id}`);
        const snapshot = await uploadBytes(storageRef, file, {
          contentType: contentTypeForCourseFile(file),
        });
        const url = await getDownloadURL(snapshot.ref);
        next.push({ id, name: file.name, url });
      }
      await saveFiles(course.id, next);
      setMessage(incoming.length === 1 ? 'File saved. Assigned students can download it.' : 'Files saved. Assigned students can download them.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'File upload failed.');
    } finally {
      setBusyId(null);
    }
  };

  const removeFile = async (course: OnlineVideoCourse, fileId: string) => {
    setBusyId(course.id);
    setMessage(null);
    try {
      await saveFiles(course.id, courseDownloadFiles(course).filter((file) => file.id !== fileId));
      setMessage('File removed.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not remove the file.');
    } finally {
      setBusyId(null);
    }
  };

  const courses = [...onlineVideoCourses].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="course-file-list">
      {message && (
        <p className={`admin-toast ${message.includes('saved') || message.includes('removed') ? 'commerce-notice' : 'commerce-error'}`} role="status">
          {message}
        </p>
      )}
      {courses.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
          Create an online course first, then attach files here.
        </div>
      ) : (
        courses.map((course) => {
          const files = courseDownloadFiles(course);
          const busy = busyId === course.id;
          return (
            <article key={course.id} className="course-file-card">
              <div className="course-file-card-head">
                <strong>{course.title}</strong>
                <label className="course-file-upload">
                  <Upload size={16} />
                  {busy ? 'Saving…' : 'Add files'}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,application/pdf"
                    disabled={busy}
                    onChange={(event) => {
                      void uploadFiles(course, event.target.files);
                      event.target.value = '';
                    }}
                  />
                </label>
              </div>
              {files.length === 0 ? (
                <p className="course-file-empty">No files yet</p>
              ) : (
                <ul className="course-file-items">
                  {files.map((file) => (
                    <li key={file.id}>
                      <span title={file.name}>{file.name}</span>
                      <div className="course-file-actions">
                        <a className="course-file-open" href={file.url} target="_blank" rel="noopener noreferrer">
                          <Download size={14} /> Open
                        </a>
                        <button className="course-file-remove" type="button" onClick={() => { void removeFile(course, file.id); }} disabled={busy}>
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })
      )}
    </div>
  );
};

export default CourseFilesAdminPanel;
