import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BOOKING_BASE } from '../paths'
import { useCloudSync } from '../hooks/useCloudSync'
import { formatBookingTabLabel } from '../lib/slots'
import type { BookingRecord } from '../types'
import './view.css'

function groupBookingsByDate(bookings: BookingRecord[]) {
  const map = new Map<string, BookingRecord[]>()
  bookings.forEach((b) => {
    if (!b.date) return
    const list = map.get(b.date) || []
    list.push(b)
    map.set(b.date, list)
  })

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({
      date,
      bookings: list.slice().sort((a, b) => {
        const timeCmp = String(a.startTime || '').localeCompare(String(b.startTime || ''))
        if (timeCmp !== 0) return timeCmp
        return String(a.name || '').localeCompare(String(b.name || ''))
      }),
    }))
}

export function ViewPage() {
  const { bookings } = useCloudSync()

  const byDate = useMemo(() => groupBookingsByDate(bookings), [bookings])
  const totalBookings = bookings.length

  return (
    <div className="view-page">
      <header className="view-header">
        <div>
          <p className="view-eyebrow">Internal summary</p>
          <h1>Bookings by date</h1>
          <p className="view-meta">
            {totalBookings} booking{totalBookings === 1 ? '' : 's'} across {byDate.length} day
            {byDate.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link to={BOOKING_BASE} className="view-back">
          ← Booking page
        </Link>
      </header>

      {!byDate.length ? (
        <div className="view-empty card">
          <p>No bookings recorded yet.</p>
        </div>
      ) : (
        <div className="view-days">
          {byDate.map(({ date, bookings: dayBookings }) => (
            <section key={date} className="view-day card">
              <div className="view-day-head">
                <h2>{formatBookingTabLabel(date)}</h2>
                <span className="view-day-count">
                  {dayBookings.length} booked
                </span>
              </div>
              <ul className="view-people">
                {dayBookings.map((b, i) => (
                  <li key={b.id || `${date}-${b.email}-${b.startTime}-${i}`}>
                    <div className="view-person-main">
                      <strong>{b.name || '—'}</strong>
                      <span className="view-time">{b.timeLabel || b.startTime || '—'}</span>
                    </div>
                    <div className="view-person-meta">
                      <span>{b.email}</span>
                      {b.phone ? <span>{b.phone}</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
