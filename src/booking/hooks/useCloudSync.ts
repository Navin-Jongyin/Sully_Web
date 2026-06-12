import { useCallback, useEffect, useState } from 'react'
import { BOOKINGS_DETAIL_KEY, BOOKINGS_KEY, STORAGE_KEY } from '../constants'
import {
  loadCloudState,
  subscribeCloudState,
  syncBookingCountsToCloud,
  syncBookingsToCloud,
  syncSlotsToCloud,
} from '../firebase'
import { loadBookingMap, loadBookingsDetail } from '../lib/bookings'
import { purgePastDateData } from '../lib/slots'
import type { AdminSection, BookingRecord, CloudState } from '../types'

function loadSlotsFromStorage(): AdminSection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function useCloudSync() {
  const [slots, setSlots] = useState<AdminSection[]>(() => loadSlotsFromStorage())
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>(() => loadBookingMap())
  const [bookings, setBookings] = useState<BookingRecord[]>(() => loadBookingsDetail())

  const applyCloudState = useCallback((state: Partial<CloudState>) => {
    if (state.slots) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.slots))
      setSlots(state.slots)
    }
    if (state.bookingCounts) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(state.bookingCounts))
      setBookingCounts(state.bookingCounts)
    }
    if (state.bookings) {
      localStorage.setItem(BOOKINGS_DETAIL_KEY, JSON.stringify(state.bookings))
      setBookings(state.bookings)
    }
  }, [])

  const refreshFromStorage = useCallback(() => {
    setSlots(loadSlotsFromStorage())
    setBookingCounts(loadBookingMap())
    setBookings(loadBookingsDetail())
  }, [])

  useEffect(() => {
    loadCloudState()
      .then((state) => {
        const localSlots = loadSlotsFromStorage()
        const localCounts = loadBookingMap()
        const localBookings = loadBookingsDetail()
        const cloudCountsEmpty = !Object.keys(state.bookingCounts || {}).length

        if ((!state.slots || !state.slots.length) && localSlots.length) syncSlotsToCloud(localSlots)
        if (cloudCountsEmpty && Object.keys(localCounts).length) syncBookingCountsToCloud(localCounts)
        if ((!state.bookings || !state.bookings.length) && localBookings.length) syncBookingsToCloud(localBookings)

        const mergedSlots = state.slots?.length ? state.slots : localSlots
        const mergedCounts = cloudCountsEmpty ? localCounts : state.bookingCounts
        const mergedBookings = state.bookings?.length ? state.bookings : localBookings

        const purged = purgePastDateData(mergedSlots, mergedCounts)
        if (purged.hadChanges) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(purged.slots))
          localStorage.setItem(BOOKINGS_KEY, JSON.stringify(purged.bookingCounts))
          syncSlotsToCloud(purged.slots).catch(() => {})
          syncBookingCountsToCloud(purged.bookingCounts).catch(() => {})
        }

        applyCloudState({
          slots: purged.slots,
          bookingCounts: purged.bookingCounts,
          bookings: mergedBookings,
        })
      })
      .catch((err) => console.error('Could not load Firebase data', err))

    const unsub = subscribeCloudState(applyCloudState)

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === BOOKINGS_KEY || e.key === BOOKINGS_DETAIL_KEY || e.key === null) {
        refreshFromStorage()
      }
    }
    window.addEventListener('storage', onStorage)
    const onVisibility = () => {
      if (!document.hidden) refreshFromStorage()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      unsub()
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [applyCloudState, refreshFromStorage])

  const saveSlots = useCallback((next: AdminSection[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSlots(next)
    syncSlotsToCloud(next).catch((err) => console.error('Could not sync slots to Firebase', err))
  }, [])

  const saveCounts = useCallback((next: Record<string, number>) => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next))
    setBookingCounts(next)
    syncBookingCountsToCloud(next).catch((err) => console.error('Could not sync booking counts to Firebase', err))
  }, [])

  const saveBookings = useCallback((next: BookingRecord[]) => {
    localStorage.setItem(BOOKINGS_DETAIL_KEY, JSON.stringify(next))
    setBookings(next)
    syncBookingsToCloud(next).catch((err) => console.error('Could not sync booking details to Firebase', err))
  }, [])

  return { slots, bookingCounts, bookings, saveSlots, saveCounts, saveBookings, refreshFromStorage }
}
