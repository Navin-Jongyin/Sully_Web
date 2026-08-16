import { useMemo } from 'react'
import { MAX_BOOKINGS_PER_SLOT } from '../constants'
import { getBookingCount } from '../lib/bookings'
import { sectionsForDate, slotCategoryFromSlot, slotMatchesCategoryFilter, slotRangeLabel, slotStartKey } from '../lib/slots'
import type { AdminSection } from '../types'

interface TimeSlotListProps {
  dateISO: string
  categoryFilter: string
  sections: AdminSection[]
  bookingMap: Record<string, number>
  selectedSectionId: string
  selectedTime: string
  onSelect: (sectionId: string, time: string) => void
  muted?: boolean
}

export function TimeSlotList({
  dateISO,
  categoryFilter,
  sections,
  bookingMap,
  selectedSectionId,
  selectedTime,
  onSelect,
  muted,
}: TimeSlotListProps) {
  const secs = useMemo(() => sectionsForDate(sections, dateISO), [sections, dateISO])

  const options = useMemo(() => {
    const list: Array<{
      sectionId: string
      time: string
      rangeLabel: string
      category: string
      count: number
      full: boolean
    }> = []

    secs.forEach((sec) => {
      if (!sec.slots?.length) return
      sec.slots.forEach((slot, slotIdx) => {
        if (categoryFilter && !slotMatchesCategoryFilter(slot, categoryFilter)) return
        const startKey = slotStartKey(slot)
        const category = slotCategoryFromSlot(slot)
        const count = getBookingCount(bookingMap, sec.id, startKey, category)
        const full = count >= MAX_BOOKINGS_PER_SLOT
        list.push({
          sectionId: sec.id,
          time: startKey,
          rangeLabel: slotRangeLabel(sec.slots, slotIdx),
          category,
          count,
          full,
        })
      })
    })
    return list
  }, [secs, bookingMap, categoryFilter])

  const showEmpty = options.length === 0

  let emptyMsg = 'Select a green date on the calendar (red days are fully booked).'
  if (!sections.length) {
    emptyMsg = 'No interview sessions are open yet. Use the Admin panel to publish dates and times.'
  } else if (!categoryFilter) {
    emptyMsg = 'Select Student Pilot, Qualified Pilot, or ATC first before choosing a time slot.'
  } else if (dateISO) {
    emptyMsg = `No open ${categoryFilter} sessions for this date.`
  }

  return (
    <div className="form-group" data-field="section">
      <label>Time slots for this day</label>
      <p className="hint">Pick one time window. Each option shows spots used out of 5.</p>
      <div className={`session-shell${muted ? ' form-block-muted' : ''}`}>
        {!showEmpty && (
          <div className="section-list" role="radiogroup">
            {options.map((opt) => {
              const value = `${opt.sectionId}\t${opt.time}\t${opt.category}`
              const checked = opt.sectionId === selectedSectionId && opt.time === selectedTime
              return (
                <label
                  key={value}
                  className={'section-option' + (opt.full ? ' section-option--disabled' : '')}
                  onClick={() => !opt.full && onSelect(opt.sectionId, opt.time)}
                >
                  <input
                    type="radio"
                    name="adminSection"
                    value={value}
                    checked={checked}
                    disabled={opt.full}
                    readOnly
                  />
                  <span className={'section-card' + (opt.full ? ' section-card--full' : '')}>
                    <strong className="section-card-line">{opt.rangeLabel}</strong>
                    {opt.category && <span className="section-card-category">{opt.category}</span>}
                    <small>
                      {opt.full
                        ? `Full · ${MAX_BOOKINGS_PER_SLOT}/${MAX_BOOKINGS_PER_SLOT} booked`
                        : `${opt.count}/${MAX_BOOKINGS_PER_SLOT} booked`}
                    </small>
                  </span>
                </label>
              )
            })}
          </div>
        )}
        {showEmpty && (
          <div className="session-empty" role="status">
            <p>{emptyMsg}</p>
          </div>
        )}
      </div>
    </div>
  )
}
