import { Route, Routes } from 'react-router-dom';
import { AdminPage } from './pages/AdminPage';
import { BookingPage } from './pages/BookingPage';
import { ViewPage } from './pages/ViewPage';
import './booking-theme.css';

export function InterviewBookingRoutes() {
  return (
    <div className="booking-shell">
      <Routes>
        <Route index element={<BookingPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="view" element={<ViewPage />} />
      </Routes>
    </div>
  );
}
