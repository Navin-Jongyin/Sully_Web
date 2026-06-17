import { DEFAULT_SLOT_TITLE, SLOT_CATEGORIES } from '../constants'
import type { AdminSection, BookingRecord, PendingSlot, SlotEntry, StoredSlot } from '../types'
import { normalizeTimeStr, pad2, timeToMinutes, toISODate, todayISODate } from './dates'

export function normalizeCategory(value: string) {
  return String(value || '').trim()
}

export function isValidSlotCategory(value: string) {
  return (SLOT_CATEGORIES as readonly string[]).includes(normalizeCategory(value))
}

export function slotStartKey(slot: StoredSlot): string {
  if (slot && typeof slot === 'object' && slot.start !== undefined && slot.start !== null) {
    return normalizeTimeStr(slot.start)
  }
  return normalizeTimeStr(slot)
}

export function slotHasExplicitEnd(slot: StoredSlot) {
  return Boolean(slot && typeof slot === 'object' && slot.end)
}

export function slotEndLabel(startsOnly: string[], index: number) {
  if (index < startsOnly.length - 1) return startsOnly[index + 1]
  const parts = String(startsOnly[index]).split(':')
  const h = parseInt(parts[0], 10) || 0
  const m = parseInt(parts[1], 10) || 0
  const total = h * 60 + m + 60
  const eh = Math.floor(total / 60) % 24
  const em = total % 60
  return pad2(eh) + ':' + pad2(em)
}

export function slotEndResolved(slots: StoredSlot[], index: number) {
  const raw = slots[index]
  if (slotHasExplicitEnd(raw)) return normalizeTimeStr((raw as SlotEntry).end!)
  const starts = slots.map((s) => slotStartKey(s))
  return slotEndLabel(starts, index)
}

export function slotRangeLabel(slots: StoredSlot[], index: number) {
  return slotStartKey(slots[index]) + ' – ' + slotEndResolved(slots, index)
}

export function normalizeSlotEntry(s: StoredSlot): SlotEntry {
  if (s && typeof s === 'object' && s.start !== undefined && s.start !== null) {
    return {
      start: normalizeTimeStr(String(s.start)),
      end: s.end ? normalizeTimeStr(String(s.end)) : null,
      category: normalizeCategory((s as SlotEntry).category || (s as { title?: string }).title || ''),
    }
  }
  return { start: normalizeTimeStr(String(s)), end: null, category: '' }
}

export function slotCategoryFromSlot(slot: StoredSlot): string {
  return normalizeSlotEntry(slot).category || ''
}

export function categoryForSectionSlot(sections: AdminSection[], sectionId: string, startKey: string) {
  const sec = sections.find((s) => s.id === sectionId)
  if (!sec?.slots) return ''
  for (const slot of sec.slots) {
    if (slotStartKey(slot) === startKey) return slotCategoryFromSlot(slot)
  }
  return ''
}

export function slotMatchesCategoryFilter(slot: StoredSlot, categoryFilter: string) {
  if (!categoryFilter) return false
  return slotCategoryFromSlot(slot) === categoryFilter
}

export function serializeSlot(o: SlotEntry): StoredSlot | null {
  if (!o?.start) return null
  if (o.end) {
    const out: { start: string; end: string; category?: string } = { start: o.start, end: o.end }
    if (o.category) out.category = o.category
    return out
  }
  if (o.category) return { start: o.start, category: o.category }
  return o.start
}

export function sortSlotEntries(arr: SlotEntry[]) {
  return arr.slice().sort((a, b) => {
    const as = timeToMinutes(a.start)
    const bs = timeToMinutes(b.start)
    if (as !== bs) return as - bs
    const ae = a.end ? timeToMinutes(a.end) : -1
    const be = b.end ? timeToMinutes(b.end) : -1
    return ae - be
  })
}

export function sectionsForDate(sections: AdminSection[], iso: string) {
  return sections.filter((s) => s.date === iso)
}

export function datesWithOpeningsSet(sections: AdminSection[]) {
  const set: Record<string, boolean> = {}
  sections.forEach((s) => {
    set[s.date] = true
  })
  return set
}

export function newSectionId() {
  return 'sec-' + Date.now() + '-' + Math.floor(Math.random() * 100000)
}

export function mergeOrAppendSlots(
  list: AdminSection[],
  date: string,
  slotEntries: PendingSlot[],
): { ok: true; list: AdminSection[] } | { ok: false; reason: string } {
  const mergedNew = sortSlotEntries(
    (slotEntries || [])
      .map((s) => normalizeSlotEntry({ start: s.start, end: s.end, category: s.category }))
      .filter((o) => o.start),
  )
  if (!mergedNew.length) {
    return { ok: false, reason: 'Add at least one session with Add session.' }
  }

  const combined: Record<string, SlotEntry> = {}
  let keepId: string | null = null
  for (const row of list) {
    if (row.date === date) {
      if (keepId === null) keepId = row.id
      ;(row.slots || []).forEach((s) => {
        const o = normalizeSlotEntry(s)
        if (o.start) {
          if (combined[o.start] && !o.category) o.category = combined[o.start].category || ''
          combined[o.start] = o
        }
      })
    }
  }
  mergedNew.forEach((o) => {
    combined[o.start] = o
  })

  const finalSlots = sortSlotEntries(Object.keys(combined).map((k) => combined[k]))
    .map(serializeSlot)
    .filter(Boolean) as StoredSlot[]

  const next = list.filter((row) => row.date !== date)
  next.push({
    id: keepId || newSectionId(),
    date,
    title: DEFAULT_SLOT_TITLE,
    slots: finalSlots,
  })
  next.sort((a, b) => (a.date !== b.date ? (a.date < b.date ? -1 : 1) : 0))
  return { ok: true, list: next }
}

export function updatePublishedSlot(
  list: AdminSection[],
  date: string,
  oldStartKey: string,
  newEntry: { start: string; end: string; category: string },
): { ok: true; list: AdminSection[]; sectionId: string; newStartKey: string } | { ok: false; reason: string } {
  const ri = list.findIndex((r) => r.date === date)
  if (ri === -1) return { ok: false, reason: 'No sessions for this day.' }

  const row = list[ri]
  const slotIndex = (row.slots || []).findIndex((s) => slotStartKey(s) === oldStartKey)
  if (slotIndex === -1) return { ok: false, reason: 'Session not found.' }

  const norm = normalizeSlotEntry({ start: newEntry.start, end: newEntry.end, category: newEntry.category })
  if (!norm.start || !norm.end) return { ok: false, reason: 'Pick both start and end times.' }
  if (!isValidSlotCategory(norm.category || '')) {
    return { ok: false, reason: 'Select a category: Student Pilot or ATC.' }
  }
  if (timeToMinutes(norm.end) <= timeToMinutes(norm.start)) {
    return { ok: false, reason: 'End time must be after start time.' }
  }

  for (let k = 0; k < (row.slots || []).length; k++) {
    if (k === slotIndex) continue
    if (slotStartKey(row.slots![k]) === norm.start) {
      return { ok: false, reason: 'Another session already starts at ' + norm.start + '.' }
    }
  }

  const next = list.slice()
  const copy = { ...row, slots: row.slots!.slice() }
  copy.slots[slotIndex] = serializeSlot(norm)!
  copy.slots = sortSlotEntries(copy.slots.map(normalizeSlotEntry))
    .map(serializeSlot)
    .filter(Boolean) as StoredSlot[]
  next[ri] = copy

  return { ok: true, list: next, sectionId: row.id, newStartKey: norm.start }
}

export function purgePastDateData(
  slots: AdminSection[],
  bookingCounts: Record<string, number>,
  bookings: BookingRecord[] = [],
) {
  const today = todayISODate()
  const pastSectionIds: Record<string, boolean> = {}
  const nextSlots = slots.filter((row) => {
    if (row.date && row.date < today) {
      if (row.id) pastSectionIds[row.id] = true
      return false
    }
    return true
  })

  const nextMap: Record<string, number> = {}
  let countsRemoved = 0
  Object.keys(bookingCounts).forEach((key) => {
    const sectionId = String(key).split('\t')[0]
    if (pastSectionIds[sectionId]) {
      countsRemoved++
      return
    }
    nextMap[key] = bookingCounts[key]
  })

  const nextBookings = bookings.filter((rec) => !(rec.date && rec.date < today))
  const bookingsRemoved = bookings.length - nextBookings.length

  const hadChanges =
    nextSlots.length !== slots.length ||
    Object.keys(nextMap).length !== Object.keys(bookingCounts).length ||
    bookingsRemoved > 0

  return {
    hadChanges,
    slots: nextSlots,
    bookingCounts: nextMap,
    bookings: nextBookings,
    slotsRemoved: slots.length - nextSlots.length,
    countsRemoved,
    bookingsRemoved,
  }
}

export function purgePastDateDataMessage(result: {
  hadChanges: boolean
  slotsRemoved: number
  countsRemoved: number
  bookingsRemoved: number
}) {
  if (!result.hadChanges) return 'No past slot data to delete.'
  return (
    'Deleted past data: ' +
    result.slotsRemoved +
    ' slot day' +
    (result.slotsRemoved === 1 ? '' : 's') +
    ', ' +
    result.countsRemoved +
    ' slot count' +
    (result.countsRemoved === 1 ? '' : 's') +
    ', ' +
    result.bookingsRemoved +
    ' booking record' +
    (result.bookingsRemoved === 1 ? '' : 's') +
    '.'
  )
}

export function formatDateLong(iso: string) {
  try {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return iso
  }
}

export function formatBookingTabLabel(iso: string) {
  try {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function uniqueSortedDates(rows: AdminSection[], bookingDates: string[]) {
  const set: Record<string, boolean> = {}
  ;(rows || []).forEach((r) => {
    if (r?.date) set[r.date] = true
  })
  bookingDates.forEach((d) => {
    if (d) set[d] = true
  })
  return Object.keys(set).sort()
}

export { toISODate }
