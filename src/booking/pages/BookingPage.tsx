import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookingCalendar, isSelectedDateStillValid, sectionsForDate } from '../components/BookingCalendar'
import { TimeSlotList } from '../components/TimeSlotList'
import {
  EMAIL_PATTERN,
  SLOT_CATEGORIES,
} from '../constants'
import { useApplicants } from '../hooks/useApplicants'
import { useCloudSync } from '../hooks/useCloudSync'
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
import { digitsOnly, normalizeEmail, todayISODate } from '../lib/dates'
import type { BookingRecord } from '../types'
import './booking.css'

type FieldErrors = Record<string, string>

export function BookingPage() {
  const { slots, bookingCounts, bookings, saveCounts, saveBookings } = useCloudSync()
  const { applicantsByEmail, loaded: applicantsLoaded, loadFailed: applicantsLoadFailed } = useApplicants()

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDateISO, setSelectedDateISO] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [successMessage, setSuccessMessage] = useState('')

  const [cancelEmail, setCancelEmail] = useState('')
  const [cancelPhone, setCancelPhone] = useState('')
  const [cancelMessage, setCancelMessage] = useState('')
  const [cancelMessageKind, setCancelMessageKind] = useState<'ok' | 'error' | ''>('')
  const [cancelResults, setCancelResults] = useState<Array<{ key: string; record: BookingRecord }>>([])

  const displayName = useMemo(() => {
    const applicant = applicantsByEmail[normalizeEmail(email)]
    if (!applicant) return ''
    return String(applicant.fullName || applicant.thaiName || '').trim()
  }, [email, applicantsByEmail])

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

  function validateEmail(value: string) {
    if (!value?.trim()) return 'Please enter your email.'
    if (!EMAIL_PATTERN.test(value.trim())) return 'Please enter a valid email address.'
    if (applicantsLoadFailed) return 'Could not check the applicant database. Refresh and try again.'
    if (!applicantsLoaded) return 'Checking the applicant database. Try again in a moment.'
    if (!applicantsByEmail[normalizeEmail(value)]) return 'This email is not registered as an applicant.'
    return ''
  }

  function validateName() {
    if (!email.trim()) return 'Enter your email to load your name.'
    if (validateEmail(email)) return 'Enter a registered email to load your name.'
    if (!displayName) return 'No name was found for this applicant.'
    return ''
  }

  function validatePhone(value: string) {
    const d = digitsOnly(value)
    if (!value?.trim()) return 'Please enter your phone number.'
    if (d.length !== 10) return 'Phone number must be exactly 10 digits.'
    return ''
  }

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
      return getBookingCount(bookingCounts, sec.id, slotStartKey(t)) < 5
    })
    if (!hasSlot) return 'That time slot is fully booked.'
    return ''
  }

  function validateTime() {
    if (!selectedSectionId) return 'Choose a time slot first.'
    const sec = slots.find((s) => s.id === selectedSectionId)
    if (!sec) return 'Choose a time slot first.'
    if (!selectedTime) return 'No open time could be set. Pick a different slot.'
    const ok = sec.slots?.some((s) => slotStartKey(s) === selectedTime)
    if (!ok) return 'That time slot is no longer available. Choose another slot.'
    if (getBookingCount(bookingCounts, sec.id, selectedTime) >= 5) {
      return 'That time slot is full (5 bookings). Choose another time.'
    }
    return ''
  }

  function validateBookingQuota() {
    if (validateEmail(email)) return ''
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
      !validateName() &&
      !validateEmail(email) &&
      !validatePhone(phone) &&
      !validateCategory() &&
      !validateDate(selectedDateISO) &&
      !validateSection() &&
      !validateTime() &&
      !validateBookingQuota()
    )
  }, [email, phone, displayName, selectedCategory, selectedDateISO, selectedSectionId, selectedTime, slots, bookingCounts, bookings, applicantsLoaded, applicantsLoadFailed, applicantsByEmail])

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
        const count = getBookingCount(bookingCounts, sec.id, startKey)
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
      name: validateName(),
      email: validateEmail(email),
      phone: validatePhone(phone),
      category: validateCategory(),
      date: validateDate(selectedDateISO),
      section: validateSection(),
      time: validateTime(),
      bookingQuota: validateBookingQuota(),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const emailTrim = email.trim()
    const applicant = applicantsByEmail[normalizeEmail(emailTrim)]
    const timeRangeLabel = rangeLabelForStoredTime(slots, selectedSectionId, selectedTime)

    const nextCounts = incrementBookingCount(bookingCounts, selectedSectionId, selectedTime)
    saveCounts(nextCounts)

    const newRecord: BookingRecord = {
      id: 'bk-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
      emailNorm: emailTrim.toLowerCase(),
      email: emailTrim,
      name: displayName.trim(),
      nickname: applicant ? String(applicant.nickname || '').trim() : '',
      phone: digitsOnly(phone),
      date: selectedDateISO,
      sectionId: selectedSectionId,
      startTime: selectedTime,
      timeLabel: timeRangeLabel || selectedTime,
      category: categoryForSectionSlot(slots, selectedSectionId, selectedTime),
      createdAt: new Date().toISOString(),
    }
    saveBookings([...bookings, newRecord])

    setSuccessMessage(
      `Booked for ${selectedDateISO}${timeRangeLabel ? ' · ' + timeRangeLabel : ' at ' + selectedTime}. Confirmation goes to ${emailTrim}.`,
    )

    setEmail('')
    setPhone('')
    setSelectedCategory('')
    setSelectedDateISO('')
    setSelectedSectionId('')
    setSelectedTime('')
    setErrors({})
    const d = new Date()
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  function handleCancelSearch(e: React.FormEvent) {
    e.preventDefault()
    const phoneDigits = digitsOnly(cancelPhone)
    setCancelPhone(phoneDigits)

    if (!cancelEmail.trim() || !EMAIL_PATTERN.test(cancelEmail.trim())) {
      setCancelMessage('Enter the email used for the booking.')
      setCancelMessageKind('error')
      setCancelResults([])
      return
    }
    if (cancelPhone && phoneDigits.length !== 10) {
      setCancelMessage('Phone is optional, but if entered it must be 10 digits.')
      setCancelMessageKind('error')
      setCancelResults([])
      return
    }

    const results = lookupBookings(cancelEmail, cancelPhone, bookings)
    setCancelResults(results)
    if (!results.length) {
      setCancelMessage('No bookings found for that email and phone number.')
      setCancelMessageKind('error')
    } else {
      setCancelMessage(`Found ${results.length} booking${results.length === 1 ? '.' : 's.'}`)
      setCancelMessageKind('ok')
    }
  }

  function handleCancelBooking(key: string, rec: BookingRecord) {
    if (!confirm('Cancel this booking?')) return
    if (!canCancelBooking(rec)) {
      setCancelMessage('This booking is now within 24 hours and cannot be cancelled.')
      setCancelMessageKind('error')
      setCancelResults(lookupBookings(cancelEmail, cancelPhone, bookings))
      return
    }

    const nextBookings = bookings.filter((r, i) => bookingRecordKey(r, i) !== key)
    if (nextBookings.length === bookings.length) {
      setCancelMessage('Could not find that booking. Refresh and try again.')
      setCancelMessageKind('error')
      return
    }

    saveBookings(nextBookings)
    const nextCounts = decrementBookingCount(bookingCounts, rec.sectionId, rec.startTime || '')
    saveCounts(nextCounts)

    const remaining = lookupBookings(cancelEmail, cancelPhone, nextBookings)
    setCancelResults(remaining)
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
                <h2>Your details</h2>
              </div>
              <div className={`form-group${errors.name ? ' has-error' : ''}`} data-field="name">
                <label htmlFor="full-name">Full Name</label>
                <input
                  type="text"
                  id="full-name"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Enter email to load your name"
                  readOnly
                  value={displayName}
                />
                {errors.name && (
                  <span className="error-text" role="alert">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className={`form-group${errors.email ? ' has-error' : ''}`} data-field="email">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors((err) => ({ ...err, email: '', name: '', bookingQuota: '' }))
                  }}
                  onBlur={() => setErrors((err) => ({ ...err, email: validateEmail(email), name: validateName() }))}
                />
                {errors.email && (
                  <span className="error-text" role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className={`form-group form-group--quota${errors.bookingQuota ? ' has-error' : ''}`} data-field="bookingQuota">
                {errors.bookingQuota && (
                  <span className="error-text" role="alert">
                    {errors.bookingQuota}
                  </span>
                )}
              </div>

              <div className={`form-group${errors.phone ? ' has-error' : ''}`} data-field="phone">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="1234567890"
                  value={phone}
                  onChange={(e) => {
                    setPhone(digitsOnly(e.target.value).slice(0, 10))
                    setErrors((err) => ({ ...err, phone: '' }))
                  }}
                  onBlur={() => setErrors((err) => ({ ...err, phone: validatePhone(phone) }))}
                />
                {errors.phone && (
                  <span className="error-text" role="alert">
                    {errors.phone}
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
          Enter the same email used to book. Phone number is optional and can narrow the search. Cancellations are
          allowed only at least 24 hours before the booked start time.
        </p>
        <form onSubmit={handleCancelSearch} noValidate>
          <div className="cancel-layout">
            <div className="form-group">
              <label htmlFor="cancel-email">Email</label>
              <input
                type="email"
                id="cancel-email"
                autoComplete="email"
                placeholder="you@example.com"
                value={cancelEmail}
                onChange={(e) => {
                  setCancelEmail(e.target.value)
                  setCancelResults([])
                  setCancelMessage('')
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cancel-phone">Phone Number (optional)</label>
              <input
                type="tel"
                id="cancel-phone"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="1234567890"
                value={cancelPhone}
                onChange={(e) => {
                  setCancelPhone(digitsOnly(e.target.value).slice(0, 10))
                  setCancelResults([])
                  setCancelMessage('')
                }}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-ghost">
            Find My Bookings
          </button>
        </form>
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
          {cancelResults.map(({ key, record: rec }) => (
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
