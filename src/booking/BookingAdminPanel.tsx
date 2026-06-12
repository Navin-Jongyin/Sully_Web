import { useEffect, useMemo, useState } from 'react'
import { MAX_BOOKINGS_PER_SLOT, MAX_SESSIONS_PER_EMAIL, SLOT_CATEGORIES } from './constants'
import { useApplicants } from './hooks/useApplicants'
import { useCloudSync } from './hooks/useCloudSync'
import {
  attendanceSummary,
  bookingCategoryForRecord,
  countBookingsForEmail,
  decrementBookingCount,
  getAttendanceStatus,
  getBookingCount,
  migrateSlotBookings,
} from './lib/bookings'
import { normalizeEmail, normalizeTimeStr, timeToMinutes, toISODate, todayISODate } from './lib/dates'
import {
  formatBookingTabLabel,
  formatDateLong,
  isValidSlotCategory,
  mergeOrAppendSlots,
  normalizeSlotEntry,
  purgePastDateData,
  purgePastDateDataMessage,
  slotCategoryFromSlot,
  slotEndResolved,
  slotRangeLabel,
  slotStartKey,
  updatePublishedSlot,
  uniqueSortedDates,
} from './lib/slots'
import type { AdminSection, AttendanceStatus, BookingRecord, PendingSlot } from './types'
import './pages/admin.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function AdminCalendar({
  viewYear,
  viewMonth,
  selectedDateISO,
  slots,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: {
  viewYear: number
  viewMonth: number
  selectedDateISO: string
  slots: AdminSection[]
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDate: (iso: string) => void
}) {
  const published = useMemo(() => {
    const set: Record<string, boolean> = {}
    slots.forEach((row) => {
      if (row.date) set[row.date] = true
    })
    return set
  }, [slots])

  const today = todayISODate()
  const first = new Date(viewYear, viewMonth, 1)
  const startWeekday = first.getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const title = first.toLocaleString(undefined, { month: 'long', year: 'numeric' })
  const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7

  const cells: Array<{ type: 'empty' } | { type: 'day'; iso: string; dayNum: number }> = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startWeekday + 1
    if (dayNum < 1 || dayNum > daysInMonth) cells.push({ type: 'empty' })
    else cells.push({ type: 'day', iso: toISODate(new Date(viewYear, viewMonth, dayNum)), dayNum })
  }

  return (
    <div className="calendar" role="application" aria-labelledby="admin-cal-label">
      <div className="cal-nav">
        <button type="button" className="cal-prev" aria-label="Previous month" onClick={onPrevMonth}>
          ‹
        </button>
        <h2 className="cal-title">{title}</h2>
        <button type="button" className="cal-next" aria-label="Next month" onClick={onNextMonth}>
          ›
        </button>
      </div>
      <div className="cal-legend">
        <span>
          <i className="pub"></i> Already has slots
        </span>
      </div>
      <div className="cal-weekdays" aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((cell, i) => {
          if (cell.type === 'empty') return <div key={i} className="cal-cell" aria-hidden="true" />
          const { iso, dayNum } = cell
          const isPast = iso < today
          const classNames = ['cal-cell', 'cal-cell--day']
          if (isPast) classNames.push('cal-cell--past')
          if (iso === today) classNames.push('cal-cell--today')
          if (selectedDateISO === iso) classNames.push('cal-cell--selected')
          if (published[iso]) classNames.push('cal-cell--has-slots')
          return (
            <button
              key={iso}
              type="button"
              className={classNames.join(' ')}
              disabled={isPast}
              onClick={() => !isPast && onSelectDate(iso)}
            >
              {dayNum}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type AdminBookingRow = BookingRecord & { __adminKey: string }

function AttendanceControls({
  status,
  onChange,
}: {
  status: AttendanceStatus
  onChange: (next: AttendanceStatus) => void
}) {
  return (
    <div className="attendance-controls" role="group" aria-label="Attendance">
      <button
        type="button"
        className={'attendance-icon-btn attendance-icon-btn--check' + (status === 'attended' ? ' is-active' : '')}
        aria-label="Mark attended"
        aria-pressed={status === 'attended'}
        onClick={() => onChange(status === 'attended' ? 'pending' : 'attended')}
      >
        ✓
      </button>
      <button
        type="button"
        className={'attendance-icon-btn attendance-icon-btn--cross' + (status === 'absent' ? ' is-active' : '')}
        aria-label="Mark absent"
        aria-pressed={status === 'absent'}
        onClick={() => onChange(status === 'absent' ? 'pending' : 'absent')}
      >
        ✕
      </button>
    </div>
  )
}

function PersonBookingRow({
  rec,
  nickname,
  sessionsLabel,
  categoryLabel,
  onAttendanceChange,
  onDelete,
  compact,
}: {
  rec: AdminBookingRow
  nickname: string
  sessionsLabel: string
  categoryLabel: string
  onAttendanceChange: (rec: AdminBookingRow, status: AttendanceStatus) => void
  onDelete: (rec: AdminBookingRow) => void
  compact?: boolean
}) {
  const status = getAttendanceStatus(rec)
  return (
    <li className={'person-booking-row' + (compact ? ' person-booking-row--compact' : '')}>
      <div className="person-details">
        <strong>{rec.name || '—'}</strong>
        {!compact && (
          <>
            <span className="person-email">{rec.email || '—'}</span>
            <span className="person-nickname">Nickname: {nickname || '—'}</span>
            <span className="person-category">{categoryLabel}</span>
            <span className="person-phone">Phone: {rec.phone || '—'}</span>
            <span className="person-sessions-left">{sessionsLabel}</span>
          </>
        )}
        {compact && (
          <>
            <span className="person-email">{rec.email || '—'}</span>
            <small style={{ color: 'var(--text-muted)' }}>Nickname: {nickname || '—'}</small>
            <small style={{ color: 'var(--text-muted)' }}>Category: {categoryLabel}</small>
            <small style={{ color: 'var(--text-muted)' }}>{sessionsLabel}</small>
            <small style={{ color: 'var(--text-muted)' }}>
              {(rec.timeLabel || rec.startTime || '—') + ' · session ' + String(rec.sectionId || '').slice(0, 14) + '…'}
            </small>
          </>
        )}
      </div>
      <div className="person-actions">
        <AttendanceControls status={status} onChange={(next) => onAttendanceChange(rec, next)} />
        <button type="button" className="booking-delete-btn" onClick={() => onDelete(rec)}>
          Delete
        </button>
      </div>
    </li>
  )
}

export function BookingAdminPanel() {
  const { slots, bookingCounts, bookings, saveSlots, saveCounts, saveBookings } = useCloudSync()
  const { applicantsByEmail } = useApplicants()

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [selectedDateISO, setSelectedDateISO] = useState(todayISODate())
  const [pendingSlots, setPendingSlots] = useState<PendingSlot[]>([])
  const [addTimeStart, setAddTimeStart] = useState('09:00')
  const [addTimeEnd, setAddTimeEnd] = useState('10:00')
  const [slotCategory, setSlotCategory] = useState('')
  const [formMsg, setFormMsg] = useState('')
  const [formMsgKind, setFormMsgKind] = useState<'ok' | 'error' | ''>('')
  const [bookingTabDate, setBookingTabDate] = useState<string | null>(null)
  const [bookingSearch, setBookingSearch] = useState('')
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState('')
  const [attendanceFilter, setAttendanceFilter] = useState('')
  const [editingSlotStartKey, setEditingSlotStartKey] = useState('')
  const [editTimeStart, setEditTimeStart] = useState('')
  const [editTimeEnd, setEditTimeEnd] = useState('')
  const [editSlotCategory, setEditSlotCategory] = useState('')
  const [editSlotMsg, setEditSlotMsg] = useState('')
  const [editSlotMsgKind, setEditSlotMsgKind] = useState<'ok' | 'error' | ''>('')

  const bookingDates = useMemo(() => bookings.map((b) => b.date).filter(Boolean), [bookings])
  const tabDates = useMemo(() => uniqueSortedDates(slots, bookingDates), [slots, bookingDates])

  useEffect(() => {
    if (!bookingTabDate && tabDates.length) setBookingTabDate(tabDates[0])
    else if (bookingTabDate && !tabDates.includes(bookingTabDate)) {
      setBookingTabDate(tabDates[0] || null)
    }
  }, [tabDates, bookingTabDate])

  const publishedRow = useMemo(
    () => slots.find((r) => r.date === selectedDateISO),
    [slots, selectedDateISO],
  )

  function setMsg(text: string, kind: 'ok' | 'error' | '' = '') {
    setFormMsg(text)
    setFormMsgKind(kind)
  }

  function cancelEditPublishedSlot() {
    setEditingSlotStartKey('')
    setEditSlotMsg('')
    setEditSlotMsgKind('')
  }

  function addPendingSlot(start: string, end: string, category: string) {
    const normS = normalizeTimeStr(start)
    const normE = normalizeTimeStr(end)
    if (!normS || !normE) return false
    const key = normS + '|' + normE + '|' + category
    if (pendingSlots.some((p) => p.start + '|' + p.end + '|' + p.category === key)) return false
    setPendingSlots((prev) => [...prev, { start: normS, end: normE, category }])
    return true
  }

  function addSessionFromPicker() {
    setMsg('')
    const normS = normalizeTimeStr(addTimeStart)
    const normE = normalizeTimeStr(addTimeEnd)
    if (!normS || !normE) {
      setMsg('Pick both start and end times.', 'error')
      return
    }
    if (!isValidSlotCategory(slotCategory)) {
      setMsg('Select a category: Student Pilot or ATC.', 'error')
      return
    }
    if (timeToMinutes(normE) <= timeToMinutes(normS)) {
      setMsg('End time must be after start time.', 'error')
      return
    }
    const added = addPendingSlot(normS, normE, slotCategory)
    setMsg(
      added ? `Added ${normS}–${normE} · ${slotCategory}.` : 'That session is already in the list.',
      added ? 'ok' : 'error',
    )
  }

  function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    const d = selectedDateISO
    if (!d) {
      setMsg('Choose a date on the calendar.', 'error')
      return
    }
    if (d < todayISODate()) {
      setMsg('Date cannot be in the past.', 'error')
      return
    }
    const res = mergeOrAppendSlots(slots, d, pendingSlots)
    if (!res.ok) {
      setMsg(res.reason, 'error')
      return
    }
    saveSlots(res.list)
    setPendingSlots([])
    setMsg('Saved. It appears on the booking page now.', 'ok')
  }

  function startEditPublishedSlot(startKey: string) {
    const row = publishedRow
    if (!row?.slots) return
    const slotIndex = row.slots.findIndex((s) => slotStartKey(s) === startKey)
    if (slotIndex === -1) return
    const o = normalizeSlotEntry(row.slots[slotIndex])
    const endTime = o.end || slotEndResolved(row.slots, slotIndex)
    setEditingSlotStartKey(startKey)
    setEditTimeStart(o.start)
    setEditTimeEnd(endTime)
    setEditSlotCategory(o.category || '')
    setEditSlotMsg('')
    setEditSlotMsgKind('')
  }

  function saveEditedPublishedSlot() {
    if (!editingSlotStartKey || !selectedDateISO) return
    setEditSlotMsg('')
    const res = updatePublishedSlot(slots, selectedDateISO, editingSlotStartKey, {
      start: editTimeStart,
      end: editTimeEnd,
      category: editSlotCategory,
    })
    if (!res.ok) {
      setEditSlotMsg(res.reason)
      setEditSlotMsgKind('error')
      return
    }

    const updatedRow = res.list.find((r) => r.date === selectedDateISO)
    const migrated = migrateSlotBookings(
      bookings,
      bookingCounts,
      res.sectionId,
      editingSlotStartKey,
      res.newStartKey,
      editSlotCategory,
      updatedRow?.slots || [],
    )

    saveSlots(res.list)
    saveCounts(migrated.bookingCounts)
    saveBookings(migrated.bookings)
    cancelEditPublishedSlot()
    setMsg('Session updated.', 'ok')
  }

  function removePublishedSlotAtIndex(slotIndex: number) {
    if (!selectedDateISO) return
    const ri = slots.findIndex((r) => r.date === selectedDateISO)
    if (ri === -1) return
    const row = slots[ri]
    if (!row.slots || slotIndex < 0 || slotIndex >= row.slots.length) return
    const removedStart = slotStartKey(row.slots[slotIndex])
    if (editingSlotStartKey === removedStart) cancelEditPublishedSlot()

    const next = slots.slice()
    const copy = { ...row, slots: row.slots.slice() }
    copy.slots.splice(slotIndex, 1)
    if (copy.slots.length === 0) next.splice(ri, 1)
    else next[ri] = copy
    saveSlots(next)
    setMsg('Removed that session.', 'ok')
  }

  function clearDay() {
    if (!selectedDateISO || !confirm('Remove every published session for this day?')) return
    cancelEditPublishedSlot()
    saveSlots(slots.filter((r) => r.date !== selectedDateISO))
    setMsg('Removed all sessions for this day.', 'ok')
  }

  function handlePurgePast() {
    if (!confirm('Delete all past slot days and their counts? Booking records will be kept.')) return
    const result = purgePastDateData(slots, bookingCounts)
    if (result.hadChanges) {
      saveSlots(result.slots)
      saveCounts(result.bookingCounts)
    }
    if (selectedDateISO && selectedDateISO < todayISODate()) {
      setSelectedDateISO(todayISODate())
    }
    setMsg(purgePastDateDataMessage(result), result.hadChanges ? 'ok' : '')
  }

  function bookingNickname(rec: BookingRecord) {
    const saved = String(rec.nickname || '').trim()
    if (saved) return saved
    const applicant = applicantsByEmail[normalizeEmail(rec.email)]
    return applicant ? String(applicant.nickname || '').trim() : ''
  }

  function sessionsLeftLabel(rec: BookingRecord) {
    const used = countBookingsForEmail(rec.email, bookings)
    const left = Math.max(0, MAX_SESSIONS_PER_EMAIL - used)
    return (
      used +
      '/' +
      MAX_SESSIONS_PER_EMAIL +
      ' booked (lifetime) · ' +
      left +
      ' session' +
      (left === 1 ? '' : 's') +
      ' left'
    )
  }

  function bookingMatchesSearch(rec: BookingRecord) {
    if (!bookingSearch.trim()) return true
    const q = bookingSearch.trim().toLowerCase()
    const applicant = applicantsByEmail[normalizeEmail(rec.email)]
    const parts = [rec.name, rec.email, bookingNickname(rec), applicant?.fullName, applicant?.nickname]
    return parts.some((p) => p && String(p).toLowerCase().includes(q))
  }

  function bookingMatchesCategory(rec: BookingRecord) {
    if (!bookingCategoryFilter) return true
    return bookingCategoryForRecord(rec, slots) === bookingCategoryFilter
  }

  function bookingMatchesAttendance(rec: BookingRecord) {
    if (!attendanceFilter) return true
    return getAttendanceStatus(rec) === attendanceFilter
  }

  function bookingMatchesFilters(rec: BookingRecord) {
    return bookingMatchesSearch(rec) && bookingMatchesCategory(rec) && bookingMatchesAttendance(rec)
  }

  function setAttendance(rec: AdminBookingRow, status: AttendanceStatus) {
    const next = bookings.map((b, idx) => {
      const key =
        b.id ||
        [b.sectionId, normalizeTimeStr(b.startTime || ''), b.emailNorm || b.email, b.createdAt, idx].join('\t')
      if (key !== rec.__adminKey) return b
      return { ...b, attendance: status === 'pending' ? undefined : status }
    })
    saveBookings(next)
    setMsg(
      status === 'attended'
        ? `Marked ${rec.name || rec.email} as attended.`
        : status === 'absent'
          ? `Marked ${rec.name || rec.email} as absent.`
          : `Reset attendance for ${rec.name || rec.email}.`,
      'ok',
    )
  }

  function deleteBookingRecord(rec: BookingRecord & { __adminKey?: string }) {
    const label = (rec.name || rec.email || 'this booking') + (rec.timeLabel ? ' at ' + rec.timeLabel : '')
    if (!confirm('Delete ' + label + '?')) return
    const targetKey = rec.__adminKey
    const withKeys = bookings.map((b, idx) => ({
      ...b,
      __adminKey:
        b.id ||
        [b.sectionId, normalizeTimeStr(b.startTime || ''), b.emailNorm || b.email, b.createdAt, idx].join('\t'),
    }))
    const next = withKeys.filter((b) => b.__adminKey !== targetKey).map(({ __adminKey, ...rest }) => rest)
    saveBookings(next)
    saveCounts(decrementBookingCount(bookingCounts, rec.sectionId, normalizeTimeStr(rec.startTime || '')))
    setMsg('Deleted that booking.', 'ok')
  }

  function removeCountOnlyBooking(sectionId: string, startKey: string) {
    if (!confirm('Remove one booking count for this slot?')) return
    saveCounts(decrementBookingCount(bookingCounts, sectionId, startKey))
    setMsg('Removed one count-only booking.', 'ok')
  }

  function renderBookingPanel(iso: string) {
    const rows = slots.filter((r) => r.date === iso)
    const allDetails = bookings
      .filter((b) => b.date === iso)
      .map((b, idx) => ({
        ...b,
        __adminKey:
          b.id ||
          [b.sectionId, normalizeTimeStr(b.startTime || ''), b.emailNorm || b.email, b.createdAt, idx].join('\t'),
      }))
      .filter(bookingMatchesFilters)

    if (!rows.length && !allDetails.length) {
      return (
        <p className="hint">
          {bookingSearch || bookingCategoryFilter || attendanceFilter
            ? 'No bookings match the current filters.'
            : 'No sessions or bookings for this date.'}
        </p>
      )
    }

    if (!rows.length && allDetails.length) {
      const groups: Record<string, { label: string; category: string; list: typeof allDetails }> = {}
      allDetails.forEach((b) => {
        const k = String(b.sectionId) + '\t' + normalizeTimeStr(String(b.startTime || ''))
        if (!groups[k]) {
          groups[k] = {
            label: b.timeLabel || b.startTime || k,
            category: bookingCategoryForRecord(b, slots),
            list: [],
          }
        }
        groups[k].list.push(b)
      })
      return (
        <>
          <p className="hint" style={{ marginTop: 0, marginBottom: 12 }}>
            No published session row for this day. Bookings on file are grouped by session id and start time:
          </p>
          {Object.keys(groups)
            .sort()
            .map((gk) => {
              const g = groups[gk]
              return (
                <div key={gk} className="slot-booking-block">
                  <div className="slot-booking-head">
                    <span className="slot-booking-time">{g.label}</span>
                    <span className="slot-category-badge">{g.category || 'Uncategorized'}</span>
                    <span className="slot-booking-count">{g.list.length} booked</span>
                  </div>
                  <ul className="slot-booking-people">
                    {g.list.map((p) => (
                      <PersonBookingRow
                        key={p.__adminKey}
                        rec={p}
                        nickname={bookingNickname(p)}
                        sessionsLabel={sessionsLeftLabel(p)}
                        categoryLabel={bookingCategoryForRecord(p, slots) || 'Uncategorized'}
                        onAttendanceChange={setAttendance}
                        onDelete={deleteBookingRecord}
                      />
                    ))}
                  </ul>
                </div>
              )
            })}
        </>
      )
    }

    const matchedIds: Record<string, boolean> = {}

    return (
      <>
        <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>
          Each time window shows who booked that slot. Mark attendance after the session.
        </p>
        {rows.map((row) => (
          <div key={row.id} className="booking-day-group">
            <h3>{row.title || 'Interview'}</h3>
            {(row.slots || []).map((slot, idx) => {
              const startKey = slotStartKey(slot)
              const label = slotRangeLabel(row.slots, idx)
              const slotCat = slotCategoryFromSlot(slot)
              const people = allDetails.filter(
                (b) => b.sectionId === row.id && normalizeTimeStr(String(b.startTime || '')) === startKey,
              )
              people.forEach((b) => {
                matchedIds[b.__adminKey!] = true
              })
              const countFromMap = getBookingCount(bookingCounts, row.id, startKey)
              const booked = Math.max(countFromMap, people.length)
              const missingDetails = Math.max(0, booked - people.length)
              const att = attendanceSummary(people)

              return (
                <div
                  key={startKey}
                  className={'slot-booking-block' + (booked >= MAX_BOOKINGS_PER_SLOT ? ' is-full' : '')}
                >
                  <div className="slot-booking-head">
                    <span className="slot-booking-time">{label}</span>
                    <span className="slot-category-badge">{slotCat || 'Uncategorized'}</span>
                    {people.length > 0 && (
                      <span className="slot-attendance-summary">
                        {att.attended} attended · {att.absent} absent · {att.pending} pending
                      </span>
                    )}
                    <span className="slot-booking-count">
                      {booked} / {MAX_BOOKINGS_PER_SLOT} booked
                    </span>
                  </div>
                  {people.length === 0 ? (
                    booked > 0 ? (
                      <>
                        <p className="hint" style={{ margin: '8px 0 0' }}>
                          {missingDetails} existing booking{missingDetails === 1 ? '' : 's'} for this slot do not have
                          saved name/email details.
                        </p>
                        <button
                          type="button"
                          className="booking-delete-btn booking-missing-action"
                          onClick={() => removeCountOnlyBooking(row.id, startKey)}
                        >
                          Remove one count-only booking
                        </button>
                      </>
                    ) : (
                      <p className="hint" style={{ margin: 0 }}>
                        {bookingSearch || bookingCategoryFilter
                          ? 'No bookings match the current search or category filter for this slot.'
                          : 'No bookings yet for this slot.'}
                      </p>
                    )
                  ) : (
                    <>
                      <ul className="slot-booking-people">
                        {people.map((p) => (
                          <PersonBookingRow
                            key={p.__adminKey}
                            rec={p}
                            nickname={bookingNickname(p)}
                            sessionsLabel={sessionsLeftLabel(p)}
                            categoryLabel={bookingCategoryForRecord(p, slots) || 'Uncategorized'}
                            onAttendanceChange={setAttendance}
                            onDelete={deleteBookingRecord}
                          />
                        ))}
                      </ul>
                      {missingDetails > 0 && (
                        <>
                          <p className="hint" style={{ margin: '8px 0 0' }}>
                            {missingDetails} existing booking{missingDetails === 1 ? '' : 's'} for this slot do not have
                            saved name/email details.
                          </p>
                          <button
                            type="button"
                            className="booking-delete-btn booking-missing-action"
                            onClick={() => removeCountOnlyBooking(row.id, startKey)}
                          >
                            Remove one count-only booking
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
        {(() => {
          const orphans = bookings
            .filter((b) => b.date === iso)
            .map((b, idx) => ({
              ...b,
              __adminKey:
                b.id ||
                [b.sectionId, normalizeTimeStr(b.startTime || ''), b.emailNorm || b.email, b.createdAt, idx].join('\t'),
            }))
            .filter((b) => !matchedIds[b.__adminKey!])
            .filter(bookingMatchesFilters)
          if (!orphans.length) return null
          return (
            <div className="booking-day-group booking-orphan-block">
              <h3>Other bookings (slot or session changed)</h3>
              <p className="hint" style={{ marginBottom: 10 }}>
                These entries do not match a current published slot for this day. They may be from an older schedule.
              </p>
              <ul className="slot-booking-people">
                {orphans.map((p) => (
                  <PersonBookingRow
                    key={p.__adminKey}
                    rec={p}
                    nickname={bookingNickname(p)}
                    sessionsLabel={sessionsLeftLabel(p)}
                    categoryLabel={bookingCategoryForRecord(p, slots) || 'Uncategorized'}
                    onAttendanceChange={setAttendance}
                    onDelete={deleteBookingRecord}
                    compact
                  />
                ))}
              </ul>
            </div>
          )
        })()}
      </>
    )
  }

  const editBookingCount = editingSlotStartKey && publishedRow
    ? getBookingCount(bookingCounts, publishedRow.id, editingSlotStartKey)
    : 0

  return (
    <div className="wrap admin-page">
      <div className="card">
        <h2>Add interview slot</h2>
        <p className="hint">
          Choose a date on the calendar to see what is already published, add more session windows, then save. Each
          session allows up to 5 bookings on the public page.
        </p>

        <form onSubmit={handlePublish} noValidate>
          <div className="admin-add-grid">
            <div className="admin-cal-col">
              <label id="admin-cal-label">Calendar</label>
              <AdminCalendar
                viewYear={viewYear}
                viewMonth={viewMonth}
                selectedDateISO={selectedDateISO}
                slots={slots}
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
                onSelectDate={(iso) => {
                  cancelEditPublishedSlot()
                  setSelectedDateISO(iso)
                }}
              />
            </div>

            <div className="admin-form-col">
              <p className="selected-date-display" aria-live="polite">
                {selectedDateISO ? 'Adding times for: ' + formatDateLong(selectedDateISO) : 'Select a date on the calendar.'}
              </p>

              <div className="row">
                <label id="published-day-label">Published for this day</label>
                <p className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                  Sessions saved for the selected date. Edit to change time or category, remove with ×, or clear the whole day below.
                </p>
                <div className="published-slots-strip" aria-labelledby="published-day-label">
                  {publishedRow?.slots?.map((slot, idx) => {
                    const o = normalizeSlotEntry(slot)
                    const startKey = slotStartKey(slot)
                    const endTime = o.end || slotEndResolved(publishedRow.slots, idx)
                    let label = o.start + '–' + endTime
                    if (o.category) label += ' · ' + o.category
                    const bookingCount = getBookingCount(bookingCounts, publishedRow.id, startKey)
                    if (bookingCount > 0) label += ` (${bookingCount}/${MAX_BOOKINGS_PER_SLOT})`
                    return (
                      <span
                        key={idx}
                        className={'published-chip' + (editingSlotStartKey === startKey ? ' is-editing' : '')}
                      >
                        {label}{' '}
                        <button
                          type="button"
                          className="published-chip-edit"
                          aria-label={'Edit published session ' + label}
                          onClick={() => startEditPublishedSlot(startKey)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="published-chip-remove"
                          aria-label={'Remove published session ' + label}
                          onClick={() => removePublishedSlotAtIndex(idx)}
                        >
                          ×
                        </button>
                      </span>
                    )
                  })}
                </div>
                {!publishedRow?.slots?.length && selectedDateISO && (
                  <p className="hint published-day-empty">No sessions published for this day yet.</p>
                )}
                {publishedRow?.slots?.length ? (
                  <div className="btn-row" style={{ marginTop: 8 }}>
                    <button type="button" className="btn-danger" onClick={clearDay}>
                      Remove all sessions this day
                    </button>
                  </div>
                ) : null}
              </div>

              {editingSlotStartKey && (
                <div className="edit-slot-panel">
                  <p className="edit-slot-title">Edit session</p>
                  <p className="hint">
                    {editBookingCount > 0
                      ? `${editBookingCount} booking${editBookingCount === 1 ? '' : 's'} on this session. Changing the start time will move those bookings to the new time.`
                      : 'Update the time window or category, then save.'}
                  </p>
                  <div className="row">
                    <label htmlFor="edit-slot-category">Category</label>
                    <select
                      id="edit-slot-category"
                      value={editSlotCategory}
                      onChange={(e) => setEditSlotCategory(e.target.value)}
                    >
                      <option value="">Select category</option>
                      {SLOT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="add-time-row" role="group" aria-labelledby="edit-slot-title">
                    <input
                      type="time"
                      step={300}
                      value={editTimeStart}
                      aria-label="Session start time"
                      onChange={(e) => setEditTimeStart(e.target.value)}
                    />
                    <span className="add-time-to" aria-hidden="true">
                      to
                    </span>
                    <input
                      type="time"
                      step={300}
                      value={editTimeEnd}
                      aria-label="Session end time"
                      onChange={(e) => setEditTimeEnd(e.target.value)}
                    />
                    <button type="button" className="btn-primary" onClick={saveEditedPublishedSlot}>
                      Save changes
                    </button>
                    <button type="button" className="btn-ghost" onClick={cancelEditPublishedSlot}>
                      Cancel
                    </button>
                  </div>
                  <p className={'msg' + (editSlotMsgKind ? ' ' + editSlotMsgKind : '')} role="status">
                    {editSlotMsg}
                  </p>
                </div>
              )}

              <div className="row">
                <label htmlFor="slot-category">Category</label>
                <select
                  id="slot-category"
                  required
                  value={slotCategory}
                  onChange={(e) => setSlotCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  {SLOT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row">
                <span id="add-session-label">Add a session (start and end)</span>
                <p className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                  Each entry is one session window (24-hour). End must be after start. Add as many as you need, then
                  publish with the blue button.
                </p>
                <div className="add-time-row" role="group" aria-labelledby="add-session-label">
                  <input
                    type="time"
                    step={300}
                    value={addTimeStart}
                    aria-label="Session start time"
                    onChange={(e) => setAddTimeStart(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSessionFromPicker())}
                  />
                  <span className="add-time-to" aria-hidden="true">
                    to
                  </span>
                  <input
                    type="time"
                    step={300}
                    value={addTimeEnd}
                    aria-label="Session end time"
                    onChange={(e) => setAddTimeEnd(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSessionFromPicker())}
                  />
                  <button type="button" className="btn-ghost" onClick={addSessionFromPicker}>
                    Add session
                  </button>
                </div>
              </div>

              <div className="row">
                <label>Sessions for this date (remove with ×)</label>
                <div className="chip-strip" aria-label="Pending sessions">
                  {pendingSlots.map((p) => (
                    <span key={p.start + '|' + p.end + '|' + p.category} className="time-chip">
                      {p.start}–{p.end}
                      {p.category ? ' · ' + p.category : ''}{' '}
                      <button
                        type="button"
                        aria-label={'Remove session ' + p.start + ' to ' + p.end}
                        onClick={() =>
                          setPendingSlots((prev) =>
                            prev.filter((x) => !(x.start === p.start && x.end === p.end && x.category === p.category)),
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="btn-row">
                <button type="submit" className="btn-primary">
                  Add to calendar
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setPendingSlots([])
                    setMsg('Cleared sessions.', 'ok')
                  }}
                >
                  Clear sessions
                </button>
              </div>
            </div>
          </div>

          <p className={'msg' + (formMsgKind ? ' ' + formMsgKind : '')} role="status">
            {formMsg}
          </p>
        </form>
      </div>

      <div className="card">
        <div className="booking-card-head">
          <div>
            <h2>Booking data by day</h2>
            <p className="hint">
              For each time window: how many of 5 spots are used, and who booked (name and email). Sessions left is a
              lifetime limit (max 2 per email) and only goes back up when you delete a booking here.
            </p>
          </div>
          <button type="button" className="btn-danger btn-small" onClick={handlePurgePast}>
            Delete past slots
          </button>
        </div>

        <div className="booking-filters">
          <div className="booking-filter-field">
            <label htmlFor="booking-user-search">Search user</label>
            <input
              type="search"
              id="booking-user-search"
              placeholder="Name, email, or nickname"
              autoComplete="off"
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
            />
          </div>
          <div className="booking-filter-field">
            <label htmlFor="booking-category-filter">Category</label>
            <select
              id="booking-category-filter"
              value={bookingCategoryFilter}
              onChange={(e) => setBookingCategoryFilter(e.target.value)}
            >
              <option value="">All categories</option>
              {SLOT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="booking-filter-field">
            <label htmlFor="booking-attendance-filter">Attendance</label>
            <select
              id="booking-attendance-filter"
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Not checked</option>
              <option value="attended">Attended</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>

        {!tabDates.length ? (
          <p className="hint">No published days yet. Booking counts will show here after you add sessions.</p>
        ) : (
          <>
            <div className="booking-tabs" role="tablist" aria-label="Bookings by day">
              {tabDates.map((iso) => (
                <button
                  key={iso}
                  type="button"
                  role="tab"
                  className={'booking-tab' + (bookingTabDate === iso ? ' booking-tab--active' : '')}
                  aria-selected={bookingTabDate === iso}
                  onClick={() => setBookingTabDate(iso)}
                >
                  {formatBookingTabLabel(iso)}
                </button>
              ))}
            </div>
            <div className="booking-panel-content" role="tabpanel" aria-live="polite">
              {bookingTabDate && renderBookingPanel(bookingTabDate)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
