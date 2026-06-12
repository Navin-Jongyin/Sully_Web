export const STORAGE_KEY = 'ib_admin_slots_v1'
export const BOOKINGS_KEY = 'ib_slot_bookings_v1'
export const BOOKINGS_DETAIL_KEY = 'ib_bookings_detail_v1'
export const ADMIN_AUTH_KEY = 'ib_admin_authenticated'

export const MAX_BOOKINGS_PER_SLOT = 5
export const MAX_SESSIONS_PER_EMAIL = 2
export const CANCEL_DEADLINE_MS = 24 * 60 * 60 * 1000
export const DEFAULT_SLOT_TITLE = 'Interview'

export const SLOT_CATEGORIES = ['Student Pilot', 'ATC'] as const
export type SlotCategory = (typeof SLOT_CATEGORIES)[number]

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
