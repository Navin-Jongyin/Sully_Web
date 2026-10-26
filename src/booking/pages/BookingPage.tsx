import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookingCalendar, isSelectedDateStillValid, sectionsForDate } from '../components/BookingCalendar'
import { TimeSlotList } from '../components/TimeSlotList'
import { SLOT_CATEGORIES } from '../constants'
import { useCloudSync } from '../hooks/useCloudSync'
import { useAuth } from '../../hooks/useAuth'
import {
  canCancelBooking,
  dateAvailabilityState,
  decrementBookingCount,
  formatBookingStart,
  getBookingCount,
  incrementBookingCount,
  lookupBookings,
  rangeLabelForStoredTime,
  bookingRecordKey,
} from '../lib/bookings'
import { categoryForSectionSlot, datesWithOpeningsSet, slotMatchesCategoryFilter, slotStartKey } from '../lib/slots'
import { normalizeEmail, todayISODate } from '../lib/dates'
import type { BookingRecord } from '../types'
import './booking.css'

type FieldErrors = Record<string, string>

export function BookingPage() {
  const { user } = useAuth()
  const { slots, bookingCounts, bookings, saveCounts, saveBookings } = useCloudSync()
  const email = user?.email ?? ''
  const bookedName = (user?.displayName || email.split('@')[0] || 'Student').trim()

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDateISO, setSelectedDateISO] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [cancelMessage, setCancelMessage] = useState('')
  const [cancelMessageKind, setCancelMessageKind] = useState<'ok' | 'error' | ''>('')

  const myBookings = useMemo(
    () => (email ? lookupBookings(email, '', bookings) : []),
    [bookings, email],
  )

  useEffect(() => {
    if (
      selectedDateISO &&
      !isSelectedDateStillValid(selectedDateISO, slots, bookingCounts, selectedCategory)
    ) {
      setSelectedDateISO('')
      setSelectedSectionId('')
      setSelectedTime('')
    }
  }, [selectedDateISO, slots, bookingCounts, selectedCategory])

  function validateCategory() {
    if (!selectedCategory) return 'Please select Student Pilot, Qualified Pilot, or ATC.'
    return ''
  }

  function validateDate(value: string) {
    if (validateCategory()) return validateCategory()
    if (!value) return 'Please select a date on the calendar.'
    if (value < todayISODate()) return 'Please choose today or a future date.'
    if (!datesWithOpeningsSet(slots)[value]) return 'That day has no published sessions. Pick a different date.'
    if (dateAvailabilityState(value, slots, bookingCounts, selectedCategory) === 'full') {
      return 'That date is fully booked (each time slot allows up to 5 bookings).'
    }
    return ''
  }

  function validateSection() {
    if (validateCategory()) return validateCategory()
    if (!selectedDateISO) return 'Pick a calendar date first.'
    const secs = sectionsForDate(slots, selectedDateISO)
    if (!secs.length) return 'No published times for this date.'
    if (!selectedSectionId) return 'Please select an open time slot.'
    const sec = secs.find((s) => s.id === selectedSectionId)
    if (!sec) return 'Please select a valid time slot.'
    const hasSlot = sec.slots?.some((t) => {
      if (!slotMatchesCategoryFilter(t, selectedCategory)) return false
      return getBookingCount(bookingCounts, sec.id, slotStartKey(t), selectedCategory) < 5
    })
    if (!hasSlot) return 'That time slot is fully booked.'
    return ''
  }

  function validateTime() {
    if (!selectedSectionId) return 'Choose a time slot first.'
    const sec = slots.find((s) => s.id === selectedSectionId)
    if (!sec) return 'Choose a time slot first.'
    if (!selectedTime) return 'No open time could be set. Pick a different slot.'
    const ok = sec.slots?.some((s) => {
      if (slotStartKey(s) !== selectedTime) return false
      return !selectedCategory || slotMatchesCategoryFilter(s, selectedCategory)
    })
    if (!ok) return 'That time slot is no longer available. Choose another slot.'
    if (getBookingCount(bookingCounts, sec.id, selectedTime, selectedCategory) >= 5) {
      return 'That time slot is full (5 bookings). Choose another time.'
    }
    return ''
  }

  function validateBookingQuota() {
    if (!email.trim()) return 'Sign in to book an interview.'
    const norm = normalizeEmail(email)
    const dateVal = selectedDateISO
    if (!dateVal) return ''
    const dayCount = bookings.filter(
      (rec) => normalizeEmail(rec.emailNorm || rec.email || '') === norm && rec.date === dateVal,
    ).length
    if (dayCount >= 1) return 'This email already has a booking on that date (limit: one session per day).'
    return ''
  }

  const isFormValid = useMemo(() => {
    return (
      !validateCategory() &&
      !validateDate(selectedDateISO) &&
      !validateSection() &&
      !validateTime() &&
      !validateBookingQuota()
    )
  }, [email, selectedCategory, selectedDateISO, selectedSectionId, selectedTime, slots, bookingCounts, bookings])

  function handleCategoryChange(category: string) {
    setSelectedCategory(category)
    setErrors((e) => ({ ...e, category: '', date: '', section: '', time: '' }))
    if (selectedDateISO && dateAvailabilityState(selectedDateISO, slots, bookingCounts, category) !== 'available') {
      setSelectedDateISO('')
      setSelectedSectionId('')
      setSelectedTime('')
    }
  }

  const handleSelectDate = useCallback((iso: string) => {
    setSelectedDateISO(iso)
    setSelectedSectionId('')
    setSelectedTime('')
    setErrors((e) => ({ ...e, date: '', section: '', time: '', bookingQuota: '' }))
  }, [])

  const handleDateError = useCallback((message: string) => {
    setErrors((e) => ({ ...e, date: message }))
  }, [])

  const handleSlotSelect = useCallback((sectionId: string, time: string) => {
    setSelectedSectionId(sectionId)
    setSelectedTime(time)
    setErrors((e) => ({ ...e, section: '', time: '' }))
  }, [])

  useEffect(() => {
    if (!selectedDateISO) return
    const secs = sectionsForDate(slots, selectedDateISO)
    const available: Array<{ sectionId: string; time: string }> = []
    secs.forEach((sec) => {
      sec.slots?.forEach((slot) => {
        if (selectedCategory && !slotMatchesCategoryFilter(slot, selectedCategory)) return
        const startKey = slotStartKey(slot)
        const count = getBookingCount(bookingCounts, sec.id, startKey, selectedCategory)
        if (count < 5) available.push({ sectionId: sec.id, time: startKey })
      })
    })
    if (available.length === 1 && !selectedSectionId) {
      setSelectedSectionId(available[0].sectionId)
      setSelectedTime(available[0].time)
    }
  }, [selectedDateISO, slots, bookingCounts, selectedSectionId, selectedCategory])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccessMessage('')

    const nextErrors: FieldErrors = {
      category: validateCategory(),
      date: validateDate(selectedDateISO),
      section: validateSection(),
      time: validateTime(),
      bookingQuota: validateBookingQuota(),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const emailTrim = email.trim()
    const timeRangeLabel = rangeLabelForStoredTime(slots, selectedSectionId, selectedTime, selectedCategory)

    const nextCounts = incrementBookingCount(
      bookingCounts,
      selectedSectionId,
      selectedTime,
      selectedCategory,
    )
    saveCounts(nextCounts)

    const newRecord: BookingRecord = {
      id: 'bk-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
      emailNorm: emailTrim.toLowerCase(),
      email: emailTrim,
      name: bookedName,
      nickname: '',
      phone: '',
      date: selectedDateISO,
      sectionId: selectedSectionId,
      startTime: selectedTime,
      timeLabel: timeRangeLabel || selectedTime,
      category: selectedCategory || categoryForSectionSlot(slots, selectedSectionId, selectedTime),
      createdAt: new Date().toISOString(),
    }
    saveBookings([...bookings, newRecord])

    setSuccessMessage(
      `Booked for ${selectedDateISO}${timeRangeLabel ? ' · ' + timeRangeLabel : ' at ' + selectedTime}.`,
    )

    setSelectedCategory('')
    setSelectedDateISO('')
    setSelectedSectionId('')
    setSelectedTime('')
    setErrors({})
    const d = new Date()
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  function handleCancelBooking(key: string, rec: BookingRecord) {
    if (!confirm('Cancel this booking?')) return
    if (!canCancelBooking(rec)) {
      setCancelMessage('This booking is now within 24 hours and cannot be cancelled.')
      setCancelMessageKind('error')
      return
    }

    const nextBookings = bookings.filter((r, i) => bookingRecordKey(r, i) !== key)
    if (nextBookings.length === bookings.length) {
      setCancelMessage('Could not find that booking. Refresh and try again.')
      setCancelMessageKind('error')
      return
    }

    saveBookings(nextBookings)
    const nextCounts = decrementBookingCount(
      bookingCounts,
      rec.sectionId,
      rec.startTime || '',
      String(rec.category || '').trim(),
    )
    saveCounts(nextCounts)

    setCancelMessage('Booking cancelled.')
    setCancelMessageKind('ok')
  }

  return (
    <div className="page booking-page">
      <header className="page-hero">
        <span className="badge">Interview Scheduling</span>
        <h1>Book Your Interview</h1>
        <p>
          Pick a date, choose one available time slot, then confirm. Each email may book up to 2 sessions total, and at
          most one per calendar day.
        </p>
      </header>

      <div className="card card--main">
        <form onSubmit={handleSubmit} noValidate>
          <div className="booking-layout">
            <div className="booking-block booking-block--contact">
              <div className="block-heading">
                <span className="step-num">1</span>
                <h2>Category</h2>
              </div>
              <div className={`form-group form-group--quota${errors.bookingQuota ? ' has-error' : ''}`} data-field="bookingQuota">
                {errors.bookingQuota && (
                  <span className="error-text" role="alert">
                    {errors.bookingQuota}
                  </span>
                )}
              </div>

              <div className={`form-group form-group--category${errors.category ? ' has-error' : ''}`} data-field="category">
                <label>Category</label>
                <p className="hint" id="category-hint">
                  {selectedCategory
                    ? `Selected: ${selectedCategory}.`
                    : 'Select Student Pilot, Qualified Pilot, or ATC to see available dates.'}
                </p>
                <div className="category-filter" role="group" aria-label="Select category">
                  {SLOT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={'category-filter-btn' + (selectedCategory === cat ? ' is-active' : '')}
                      aria-pressed={selectedCategory === cat}
                      onClick={() => handleCategoryChange(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <span className="error-text" role="alert">
                    {errors.category}
                  </span>
                )}
              </div>
            </div>

            <div className="booking-block booking-block--schedule">
              <div className="block-heading">
                <span className="step-num">2</span>
                <h2>Choose a time</h2>
              </div>

              <div className={`form-group${errors.date ? ' has-error' : ''}`} data-field="date">
                <label id="cal-label">Interview date</label>
                <BookingCalendar
                  viewYear={viewYear}
                  viewMonth={viewMonth}
                  selectedDateISO={selectedDateISO}
                  selectedCategory={selectedCategory}
                  sections={slots}
                  bookingMap={bookingCounts}
                  onCategoryRequired={() => setErrors((e) => ({ ...e, category: 'Please select Student Pilot, Qualified Pilot, or ATC first.' }))}
                  onPrevMonth={() => {
                    setViewMonth((m) => {
                      if (m <= 0) {
                        setViewYear((y) => y - 1)
                        return 11
                      }
                      return m - 1
                    })
                  }}
                  onNextMonth={() => {
                    setViewMonth((m) => {
                      if (m >= 11) {
                        setViewYear((y) => y + 1)
                        return 0
                      }
                      return m + 1
                    })
                  }}
                  onSelectDate={handleSelectDate}
                  onDateError={handleDateError}
                />
                {errors.date && (
                  <span className="error-text" role="alert">
                    {errors.date}
                  </span>
                )}
              </div>

              <TimeSlotList
                dateISO={selectedDateISO}
                categoryFilter={selectedCategory}
                sections={slots}
                bookingMap={bookingCounts}
                selectedSectionId={selectedSectionId}
                selectedTime={selectedTime}
                onSelect={handleSlotSelect}
                muted={!selectedDateISO}
              />
              {(errors.section || errors.time) && (
                <span className="error-text" role="alert" style={{ display: 'block' }}>
                  {errors.section || errors.time}
                </span>
              )}

              <div className="actions">
                <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </form>

        {successMessage && (
          <div className="success-banner visible" role="status" aria-live="polite">
            {successMessage}
          </div>
        )}
      </div>

      <div className="card cancel-card">
        <div className="block-heading">
          <h2>Cancel a Booking</h2>
        </div>
        <p className="hint">
          These are the interviews booked with your signed-in account. You can cancel until 24 hours before the start time.
        </p>
        {cancelMessage && (
          <div
            className={`success-banner visible${cancelMessageKind === 'error' ? ' error' : ''}`}
            role="status"
            aria-live="polite"
          >
            {cancelMessage}
          </div>
        )}
        <div className="cancel-list">
          {myBookings.length === 0 ? (
            <p className="hint">You have no interview bookings.</p>
          ) : myBookings.map(({ key, record: rec }) => (
            <div key={key} className="cancel-booking">
              <div>
                <strong>{rec.timeLabel || rec.startTime || 'Interview'}</strong>
                <small>
                  {formatBookingStart(rec)} · {rec.email}
                </small>
                {!canCancelBooking(rec) && <small>Less than 24 hours before start time.</small>}
              </div>
              <button
                type="button"
                className="btn btn-danger"
                disabled={!canCancelBooking(rec)}
                onClick={() => handleCancelBooking(key, rec)}
              >
                {canCancelBooking(rec) ? 'Cancel Booking' : 'Cannot Cancel'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
