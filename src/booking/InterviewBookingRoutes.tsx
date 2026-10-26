import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminPage } from './pages/AdminPage';
import { ViewPage } from './pages/ViewPage';
import './booking-theme.css';

export function InterviewBookingRoutes() {
  return (
    <div className="booking-shell">
      <Routes>
        <Route index element={<Navigate to="/dashboard?section=booking" replace />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="view" element={<ViewPage />} />
      </Routes>
    </div>
  );
}
