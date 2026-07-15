export const ONLINE_TEST_CATEGORIES = [
  'Student Pilot',
  'Qualified Pilot',
  'ATC',
] as const;

export type OnlineTestCategory = (typeof ONLINE_TEST_CATEGORIES)[number];

export interface OnlineTestRecord {
  id: string;
  title: string;
  category: OnlineTestCategory;
  description?: string;
  /** Time limit in minutes for the full test. */
  timeLimitMinutes: number;
  /** Parsed test payload from admin JSON input. */
  data: any;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const ONLINE_TEST_CATEGORY_LABELS: Record<OnlineTestCategory, string> = {
  'Student Pilot': 'Student Pilot',
  'Qualified Pilot': 'Qualified Pilot',
  ATC: 'ATC',
};

export function resolveTimeLimitMinutes(test: OnlineTestRecord): number {
  if (typeof test.timeLimitMinutes === 'number' && test.timeLimitMinutes > 0) {
    return test.timeLimitMinutes;
  }

  const fromData = test.data?.timeLimitMinutes;
  if (typeof fromData === 'number' && fromData > 0) {
    return fromData;
  }

  return 30;
}

export function formatTimeLimit(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function isOnlineTestCategory(value: string): value is OnlineTestCategory {
  return (ONLINE_TEST_CATEGORIES as readonly string[]).includes(value);
}
