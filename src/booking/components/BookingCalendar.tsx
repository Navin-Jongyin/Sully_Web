import { useMemo } from 'react'
import { MAX_BOOKINGS_PER_SLOT } from '../constants'
import { dateAvailabilityState } from '../lib/bookings'
import { datesWithOpeningsSet, sectionsForDate } from '../lib/slots'
import { toISODate, todayISODate } from '../lib/dates'
import type { AdminSection } from '../types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface BookingCalendarProps {
  viewYear: number
  viewMonth: number
  selectedDateISO: string
  selectedCategory: string
  sections: AdminSection[]
  bookingMap: Record<string, number>
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDate: (iso: string) => void
  onDateError: (message: string) => void
  onCategoryRequired?: () => void
}

export function BookingCalendar({
  viewYear,
  viewMonth,
  selectedDateISO,
  selectedCategory,
  sections,
  bookingMap,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onDateError,
  onCategoryRequired,
}: BookingCalendarProps) {
  const open = useMemo(() => datesWithOpeningsSet(sections), [sections])
  const today = todayISODate()

  const { title, cells } = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1)
    const startWeekday = first.getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const monthTitle = first.toLocaleString(undefined, { month: 'long', year: 'numeric' })
    const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7
    const cellList: Array<{ type: 'empty' } | { type: 'day'; iso: string; dayNum: number }> = []

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startWeekday + 1
      if (dayNum < 1 || dayNum > daysInMonth) {
        cellList.push({ type: 'empty' })
      } else {
        const cellDate = new Date(viewYear, viewMonth, dayNum)
        cellList.push({ type: 'day', iso: toISODate(cellDate), dayNum })
      }
    }

    return { title: monthTitle, cells: cellList }
  }, [viewYear, viewMonth])

  const calHint = !sections.length
    ? 'No slots yet. Open the Admin panel to add dates and times. Green days are bookable once added.'
    : !selectedCategory
      ? 'Choose a category first. The calendar will show matching dates.'
      : `Green = open ${selectedCategory} sessions. Red = full. Grey = no ${selectedCategory} sessions.`

  function handleDayClick(iso: string) {
    const isPast = iso < today
    if (isPast) return

    if (!selectedCategory) {
      onCategoryRequired?.()
      onDateError('Please select Student Pilot or ATC first.')
      return
    }

    const hasSessions = Boolean(open[iso])
    const availState = hasSessions
      ? dateAvailabilityState(iso, sections, bookingMap, selectedCategory)
      : 'closed'

    if (!hasSessions || availState === 'closed') {
      onDateError('No session published that day. Choose another date.')
      return
    }
    if (availState === 'full') {
      onDateError(
        `That date is fully booked. Each time slot allows up to ${MAX_BOOKINGS_PER_SLOT} bookings.`,
      )
      return
    }
    onSelectDate(iso)
  }

  return (
    <div>
      <p className="hint" id="cal-hint">
        {calHint}
      </p>
      <div className="calendar" role="application" aria-labelledby="cal-label" aria-describedby="cal-hint">
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
            <i className="closed"></i> No session
          </span>
          <span>
            <i className="open"></i> Open
          </span>
          <span>
            <i className="full"></i> Full (5/5)
          </span>
        </div>
        <div className="cal-weekdays" aria-hidden="true">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="cal-grid">
          {cells.map((cell, i) => {
            if (cell.type === 'empty') {
              return <div key={i} className="cal-cell" aria-hidden="true" />
            }

            const { iso, dayNum } = cell
            const isPast = iso < today
            const hasSessions = Boolean(open[iso])
            const availState = selectedCategory && hasSessions
              ? dateAvailabilityState(iso, sections, bookingMap, selectedCategory)
              : 'closed'

            const classNames = ['cal-cell', 'cal-cell--day']
            if (isPast) classNames.push('cal-cell--past')
            else if (!selectedCategory || !hasSessions || availState === 'closed') classNames.push('cal-cell--closed')
            else if (availState === 'available') classNames.push('cal-cell--open')
            else classNames.push('cal-cell--full')
            if (iso === today) classNames.push('cal-cell--today')
            if (selectedDateISO === iso) classNames.push('cal-cell--selected')

            const clickable = !isPast && selectedCategory && hasSessions && availState === 'available'

            return (
              <button
                key={iso}
                type="button"
                className={classNames.join(' ')}
                disabled={isPast}
                aria-label={
                  isPast
                    ? `${iso}, past date`
                    : !selectedCategory
                      ? `${iso}, select a category first`
                      : !hasSessions || availState === 'closed'
                        ? `${iso}, no session published`
                        : availState === 'available'
                          ? `${iso}, open with availability`
                          : `${iso}, fully booked`
                }
                onClick={() => (clickable ? onSelectDate(iso) : handleDayClick(iso))}
              >
                {dayNum}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function isSelectedDateStillValid(
  iso: string,
  sections: AdminSection[],
  bookingMap: Record<string, number>,
  categoryFilter: string,
) {
  if (!categoryFilter) return false
  const open = datesWithOpeningsSet(sections)
  if (!open[iso]) return false
  return dateAvailabilityState(iso, sections, bookingMap, categoryFilter) === 'available'
}

export { sectionsForDate }
