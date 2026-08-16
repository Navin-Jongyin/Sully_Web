import { BOOKINGS_DETAIL_KEY, BOOKINGS_KEY, CANCEL_DEADLINE_MS, MAX_BOOKINGS_PER_SLOT } from '../constants'
import type { AdminSection, AttendanceStatus, BookingRecord, StoredSlot } from '../types'
import { normalizeEmail, normalizeTimeStr } from './dates'
import { categoryForSectionSlot, slotMatchesCategoryFilter, slotRangeLabel, slotStartKey } from './slots'
import { syncBookingCountsToCloud, syncBookingsToCloud } from '../firebase'

export function bookingMapKey(sectionId: string, timeSlot: string, category = '') {
  const base = String(sectionId) + '\t' + String(timeSlot)
  const cat = String(category || '').trim()
  return cat ? `${base}\t${cat}` : base
}

export function loadBookingMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY)
    if (!raw) return {}
    const o = JSON.parse(raw)
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {}
  } catch {
    return {}
  }
}

export function saveBookingMap(map: Record<string, number>) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(map))
  syncBookingCountsToCloud(map).catch((err) => {
    console.error('Could not sync booking counts to Firebase', err)
  })
}

export function getBookingCount(
  map: Record<string, number>,
  sectionId: string,
  timeSlot: string,
  category = '',
) {
  const keyed = map[bookingMapKey(sectionId, timeSlot, category)]
  if (typeof keyed === 'number' && keyed >= 0) return keyed
  // Legacy counts were stored without category.
  if (category) {
    const legacy = map[bookingMapKey(sectionId, timeSlot)]
    if (typeof legacy === 'number' && legacy >= 0) return legacy
  }
  return 0
}

export function incrementBookingCount(
  map: Record<string, number>,
  sectionId: string,
  timeSlot: string,
  category = '',
) {
  const k = bookingMapKey(sectionId, timeSlot, category)
  const next = { ...map, [k]: getBookingCount(map, sectionId, timeSlot, category) + 1 }
  // Drop legacy shared key once this category has its own counter.
  if (category) delete next[bookingMapKey(sectionId, timeSlot)]
  saveBookingMap(next)
  return next
}

export function decrementBookingCount(
  map: Record<string, number>,
  sectionId: string,
  timeSlot: string,
  category = '',
) {
  if (!sectionId || !timeSlot) return map
  const k = bookingMapKey(sectionId, timeSlot, category)
  const legacyK = bookingMapKey(sectionId, timeSlot)
  const current = typeof map[k] === 'number'
    ? map[k]
    : category && typeof map[legacyK] === 'number'
      ? map[legacyK]
      : 0
  const next = { ...map }
  if (current > 1) {
    next[k] = current - 1
  } else {
    delete next[k]
  }
  if (category) delete next[legacyK]
  saveBookingMap(next)
  return next
}

export function loadBookingsDetail(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_DETAIL_KEY)
    if (!raw) return []
    const a = JSON.parse(raw)
    return Array.isArray(a) ? a : []
  } catch {
    return []
  }
}

export function saveBookingsDetail(arr: BookingRecord[]) {
  localStorage.setItem(BOOKINGS_DETAIL_KEY, JSON.stringify(arr))
  syncBookingsToCloud(arr).catch((err) => {
    console.error('Could not sync booking details to Firebase', err)
  })
}

export function getAttendanceStatus(rec: BookingRecord): AttendanceStatus {
  if (rec.attendance === 'attended' || rec.attendance === 'absent') return rec.attendance
  return 'pending'
}

export function attendanceSummary(records: BookingRecord[]) {
  let attended = 0
  let absent = 0
  let pending = 0
  records.forEach((rec) => {
    const status = getAttendanceStatus(rec)
    if (status === 'attended') attended++
    else if (status === 'absent') absent++
    else pending++
  })
  return { attended, absent, pending }
}

export function bookingRecordKey(rec: BookingRecord, index: number) {
  return (
    rec.id ||
    [
      rec.sectionId || '',
      normalizeTimeStr(rec.startTime || ''),
      rec.emailNorm || rec.email || '',
      rec.phone || '',
      rec.date || '',
      rec.createdAt || '',
      index,
    ].join('\t')
  )
}

export function lookupBookings(email: string, phone: string, bookings: BookingRecord[]) {
  const normEmail = String(email || '').trim().toLowerCase()
  const phoneDigits = String(phone || '').replace(/\D/g, '')
  return bookings
    .map((rec, index) => ({ key: bookingRecordKey(rec, index), record: rec }))
    .filter(({ record: rec }) => {
      const recEmail = String(rec.emailNorm || rec.email || '').trim().toLowerCase()
      const recPhone = String(rec.phone || '').replace(/\D/g, '')
      return recEmail === normEmail && (!phoneDigits || recPhone === phoneDigits)
    })
}

export function bookingStartDate(rec: BookingRecord) {
  if (!rec?.date || !rec.startTime) return null
  const d = new Date(rec.date + 'T' + normalizeTimeStr(rec.startTime) + ':00')
  return isNaN(d.getTime()) ? null : d
}

export function canCancelBooking(rec: BookingRecord) {
  const start = bookingStartDate(rec)
  return Boolean(start && start.getTime() - Date.now() >= CANCEL_DEADLINE_MS)
}

export function formatBookingStart(rec: BookingRecord) {
  const start = bookingStartDate(rec)
  if (!start) return rec.date || 'Unknown date'
  try {
    return start.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return (rec.date || '') + ' ' + (rec.startTime || '')
  }
}

export function countBookingsForEmail(email: string, bookings: BookingRecord[]) {
  const norm = normalizeEmail(email)
  if (!norm) return 0
  return bookings.filter((rec) => normalizeEmail(rec.emailNorm || rec.email || '') === norm).length
}

export function sectionHasAvailableSlot(
  sec: AdminSection,
  bookingMap: Record<string, number>,
  categoryFilter = '',
) {
  if (!sec?.slots?.length) return false
  return sec.slots.some((t) => {
    if (categoryFilter && !slotMatchesCategoryFilter(t, categoryFilter)) return false
    return getBookingCount(bookingMap, sec.id, slotStartKey(t)) < MAX_BOOKINGS_PER_SLOT
  })
}

export function dateAvailabilityState(
  iso: string,
  sections: AdminSection[],
  bookingMap: Record<string, number>,
  categoryFilter = '',
): 'closed' | 'available' | 'full' {
  if (!categoryFilter) return 'closed'
  const secs = sections.filter((s) => s.date === iso)
  if (!secs.length) return 'closed'
  let hasMatching = false
  let hasAvailable = false
  for (const sec of secs) {
    if (!sec.slots) continue
    for (const slot of sec.slots) {
      if (!slotMatchesCategoryFilter(slot, categoryFilter)) continue
      hasMatching = true
      if (getBookingCount(bookingMap, sec.id, slotStartKey(slot)) < MAX_BOOKINGS_PER_SLOT) {
        hasAvailable = true
      }
    }
  }
  if (!hasMatching) return 'closed'
  if (hasAvailable) return 'available'
  return 'full'
}

export function bookingCategoryForRecord(rec: BookingRecord, sections: AdminSection[]) {
  const saved = String(rec.category || '').trim()
  if (saved) return saved
  return categoryForSectionSlot(sections, rec.sectionId, normalizeTimeStr(rec.startTime || ''))
}

export function migrateSlotBookings(
  bookings: BookingRecord[],
  bookingCounts: Record<string, number>,
  sectionId: string,
  oldStartKey: string,
  newStartKey: string,
  newCategory: string,
  slotList: StoredSlot[],
) {
  const oldK = bookingMapKey(sectionId, oldStartKey)
  const newK = bookingMapKey(sectionId, newStartKey)
  let nextCounts = { ...bookingCounts }
  if (oldK !== newK) {
    if (typeof nextCounts[oldK] === 'number') {
      nextCounts = {
        ...nextCounts,
        [newK]: (typeof nextCounts[newK] === 'number' ? nextCounts[newK] : 0) + nextCounts[oldK],
      }
      delete nextCounts[oldK]
    }
  }

  let timeLabel = newStartKey
  for (let i = 0; i < slotList.length; i++) {
    if (slotStartKey(slotList[i]) === newStartKey) {
      timeLabel = slotRangeLabel(slotList, i)
      break
    }
  }

  const nextBookings = bookings.map((b) => {
    if (b.sectionId !== sectionId) return b
    if (normalizeTimeStr(b.startTime || '') !== oldStartKey) return b
    return {
      ...b,
      startTime: newStartKey,
      category: newCategory || b.category,
      timeLabel,
    }
  })

  return { bookings: nextBookings, bookingCounts: nextCounts }
}

export function rangeLabelForStoredTime(
  sections: AdminSection[],
  sectionId: string,
  timeVal: string,
) {
  if (!sectionId || !timeVal) return ''
  const sec = sections.find((s) => s.id === sectionId)
  if (!sec?.slots) return timeVal
  for (let i = 0; i < sec.slots.length; i++) {
    if (slotStartKey(sec.slots[i]) === timeVal) {
      return slotRangeLabel(sec.slots, i)
    }
  }
  return timeVal
}
