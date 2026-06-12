export interface SlotEntry {
  start: string
  end?: string | null
  category?: string
}

export type StoredSlot = string | { start: string; end?: string; category?: string }

export interface AdminSection {
  id: string
  date: string
  title: string
  slots: StoredSlot[]
}

export type AttendanceStatus = 'pending' | 'attended' | 'absent'

export interface BookingRecord {
  id?: string
  emailNorm?: string
  email: string
  name: string
  nickname?: string
  phone: string
  date: string
  sectionId: string
  startTime: string
  timeLabel?: string
  category?: string
  attendance?: AttendanceStatus
  createdAt?: string
}

export interface Applicant {
  email: string
  fullName?: string
  thaiName?: string
  nickname?: string
}
export interface CloudState {
  slots: AdminSection[]
  bookingCounts: Record<string, number>
  bookings: BookingRecord[]
}

export interface PendingSlot {
  start: string
  end: string
  category: string
}
