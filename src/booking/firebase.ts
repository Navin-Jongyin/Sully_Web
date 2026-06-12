import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import type { AdminSection, Applicant, BookingRecord, CloudState } from './types';

const BOOKING_APP_NAME = 'interview-booking';

const env = (key: keyof ImportMetaEnv): string | undefined => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

const firebaseConfig = {
  apiKey: env('VITE_BOOKING_FIREBASE_API_KEY') ?? 'AIzaSyAb2rzSQUohyDNE-Q2uhNucDKxiYDmkGOs',
  authDomain: env('VITE_BOOKING_FIREBASE_AUTH_DOMAIN') ?? 'interview-booking-64178.firebaseapp.com',
  projectId: env('VITE_BOOKING_FIREBASE_PROJECT_ID') ?? 'interview-booking-64178',
  storageBucket: env('VITE_BOOKING_FIREBASE_STORAGE_BUCKET') ?? 'interview-booking-64178.firebasestorage.app',
  messagingSenderId: env('VITE_BOOKING_FIREBASE_MESSAGING_SENDER_ID') ?? '695274189930',
  appId: env('VITE_BOOKING_FIREBASE_APP_ID') ?? '1:695274189930:web:0c8ea7a61fb16262d80613',
  measurementId: env('VITE_BOOKING_FIREBASE_MEASUREMENT_ID') ?? 'G-F0E2Y28699',
};

export const bookingApp = getApps().some((app) => app.name === BOOKING_APP_NAME)
  ? getApp(BOOKING_APP_NAME)
  : initializeApp(firebaseConfig, BOOKING_APP_NAME);

export const db = getFirestore(bookingApp);

analyticsIsSupported()
  .then((supported) => {
    if (supported) getAnalytics(bookingApp);
  })
  .catch(() => {});

const COLLECTIONS = {
  slots: 'slots',
  bookingCounts: 'bookingCounts',
  bookings: 'bookings',
  applicants: 'applicants',
} as const;

function countDocId(key: string) {
  return encodeURIComponent(String(key));
}

function bookingDocId(rec: BookingRecord, index: number) {
  if (rec?.id) return String(rec.id);
  return encodeURIComponent(
    [
      rec?.sectionId || '',
      rec?.startTime || '',
      rec?.emailNorm || rec?.email || '',
      rec?.phone || '',
      rec?.date || '',
      rec?.createdAt || '',
      index,
    ].join('\t'),
  );
}

function splitBookingKey(key: string) {
  const parts = String(key).split('\t');
  return { sectionId: parts[0] || '', startTime: parts[1] || '' };
}

function stripPrivateFields(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  Object.keys(obj || {}).forEach((key) => {
    if (!key.startsWith('__')) out[key] = obj[key];
  });
  return out;
}

async function replaceCollection(
  collectionName: string,
  desiredDocs: { id: string; data: Record<string, unknown> }[],
) {
  const col = collection(db, collectionName);
  const existing = await getDocs(col);
  const desiredIds: Record<string, boolean> = {};

  await Promise.all(
    desiredDocs.map((entry) => {
      desiredIds[entry.id] = true;
      return setDoc(doc(db, collectionName, entry.id), entry.data);
    }),
  );

  await Promise.all(
    existing.docs
      .filter((snap) => !desiredIds[snap.id])
      .map((snap) => deleteDoc(doc(db, collectionName, snap.id))),
  );
}

export async function fetchCloudSlots(): Promise<AdminSection[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.slots));
  return snap.docs
    .map((d) => d.data() as AdminSection)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return String(a.id).localeCompare(String(b.id));
    });
}

export async function fetchCloudBookingCounts(): Promise<Record<string, number>> {
  const snap = await getDocs(collection(db, COLLECTIONS.bookingCounts));
  const out: Record<string, number> = {};
  snap.docs.forEach((d) => {
    const data = d.data();
    if (data?.key && typeof data.count === 'number' && data.count > 0) {
      out[data.key as string] = data.count;
    }
  });
  return out;
}

export async function fetchCloudBookings(): Promise<BookingRecord[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.bookings));
  return snap.docs
    .map((d) => d.data() as BookingRecord)
    .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
}

export async function fetchCloudApplicants(): Promise<Applicant[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.applicants));
  return snap.docs
    .map((d) => d.data() as Applicant)
    .sort((a, b) =>
      String(a.fullName || a.thaiName || a.nickname || '').localeCompare(
        String(b.fullName || b.thaiName || b.nickname || ''),
      ),
    );
}

export async function loadCloudState() {
  const [slots, bookingCounts, bookings] = await Promise.all([
    fetchCloudSlots(),
    fetchCloudBookingCounts(),
    fetchCloudBookings(),
  ]);
  return { slots, bookingCounts, bookings };
}

export async function fetchAdminCredentials() {
  const paths: [string, string][] = [
    ['admin', 'admin'],
    ['authentication', 'admin'],
  ];
  for (const [col, id] of paths) {
    const snap = await getDoc(doc(db, col, id));
    if (snap.exists()) return snap.data();
  }
  return null;
}

export function subscribeCloudState(onChange: (partial: Partial<CloudState>) => void) {
  const unsubs = [
    onSnapshot(collection(db, COLLECTIONS.slots), (snap) => {
      const slots = snap.docs
        .map((d) => d.data() as AdminSection)
        .sort((a, b) => {
          if (a.date !== b.date) return a.date < b.date ? -1 : 1;
          return String(a.id).localeCompare(String(b.id));
        });
      onChange({ slots });
    }),
    onSnapshot(collection(db, COLLECTIONS.bookingCounts), (snap) => {
      const bookingCounts: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data?.key && typeof data.count === 'number' && data.count > 0) {
          bookingCounts[data.key as string] = data.count;
        }
      });
      onChange({ bookingCounts });
    }),
    onSnapshot(collection(db, COLLECTIONS.bookings), (snap) => {
      const bookings = snap.docs
        .map((d) => d.data() as BookingRecord)
        .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
      onChange({ bookings });
    }),
  ];

  return () => unsubs.forEach((unsub) => unsub());
}

export function syncSlotsToCloud(slots: AdminSection[]) {
  return replaceCollection(
    COLLECTIONS.slots,
    (slots || []).map((row) => ({ id: String(row.id), data: stripPrivateFields(row as unknown as Record<string, unknown>) })),
  );
}

export function syncBookingCountsToCloud(map: Record<string, number>) {
  return replaceCollection(
    COLLECTIONS.bookingCounts,
    Object.keys(map || {})
      .filter((key) => typeof map[key] === 'number' && map[key] > 0)
      .map((key) => {
        const split = splitBookingKey(key);
        return {
          id: countDocId(key),
          data: { key, sectionId: split.sectionId, startTime: split.startTime, count: map[key] },
        };
      }),
  );
}

export function syncBookingsToCloud(bookings: BookingRecord[]) {
  return replaceCollection(
    COLLECTIONS.bookings,
    (bookings || []).map((rec, index) => ({
      id: bookingDocId(rec, index),
      data: stripPrivateFields(rec as unknown as Record<string, unknown>),
    })),
  );
}

export function subscribeApplicants(onChange: (applicants: Applicant[]) => void) {
  return onSnapshot(collection(db, COLLECTIONS.applicants), (snap) => {
    const applicants = snap.docs
      .map((d) => d.data() as Applicant)
      .sort((a, b) =>
        String(a.fullName || a.thaiName || a.nickname || '').localeCompare(
          String(b.fullName || b.thaiName || b.nickname || ''),
        ),
      );
    onChange(applicants);
  });
}
