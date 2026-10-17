import type { TrackRecord } from '../context/data-context';

export interface TrackStat {
  label: string;
  value: string;
  color?: string;
}

export const DEFAULT_TRACK_STAT_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#0ea5e9',
  '#d97706',
  '#059669',
  '#dc2626',
] as const;

export const CHART_Y_MAX = 50;

export function defaultStatColor(index: number): string {
  return DEFAULT_TRACK_STAT_COLORS[index % DEFAULT_TRACK_STAT_COLORS.length];
}

export function normalizeTrackColor(color: string | undefined, index: number): string {
  const trimmed = color?.trim();
  return trimmed && /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : defaultStatColor(index);
}

/** Shared result name — text before a trailing "(code)", e.g. "Thai Airways Student Pilot". */
export function extractResultCategory(label: string): string {
  const trimmed = label.trim();
  const match = trimmed.match(/^(.+?)\s*\([^)]+\)\s*$/);
  return match ? match[1].trim() : trimmed;
}

export function resultCategoryKey(label: string): string {
  return extractResultCategory(label).toLowerCase();
}

export function normalizeTrackStat(stat: TrackStat, index: number): TrackStat {
  return {
    label: stat.label,
    value: stat.value,
    color: normalizeTrackColor(stat.color, index),
  };
}

export function normalizeTrackStats(stats: TrackStat[]): TrackStat[] {
  return stats.map((stat, index) => normalizeTrackStat(stat, index));
}

export function parseTrackStatValue(value: string): number {
  const match = value.replace(/,/g, '').trim().match(/-?\d+(\.\d+)?/);
  if (!match) return 0;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildYTicks(yMax: number, count = 6): number[] {
  if (yMax <= 0) return [0];
  const step = yMax / (count - 1);
  return Array.from({ length: count }, (_, index) => Math.round(step * index));
}

export function formatChartTick(value: number): string {
  return String(value);
}

export interface ChartBar {
  label: string;
  category: string;
  value: string;
  color: string;
  numeric: number;
}

export interface YearChartGroup {
  year: string;
  bars: ChartBar[];
}

export interface GroupedChartData {
  groups: YearChartGroup[];
  legend: Array<{ label: string; color: string }>;
  yMax: number;
}

function buildCategoryColorMap(trackRecord: TrackRecord, years: string[]) {
  const categoryLabels = new Map<string, string>();
  const categoryColors = new Map<string, string>();
  const categoryOrder: string[] = [];

  for (const year of years) {
    trackRecord[year].stats.forEach((stat) => {
      const label = stat.label.trim();
      if (!label) return;

      const key = resultCategoryKey(label);
      if (!categoryLabels.has(key)) {
        categoryLabels.set(key, extractResultCategory(label));
        categoryOrder.push(key);
      }

      if (stat.color?.trim() && !categoryColors.has(key)) {
        categoryColors.set(key, normalizeTrackColor(stat.color, categoryOrder.indexOf(key)));
      }
    });
  }

  categoryOrder.forEach((key, index) => {
    if (!categoryColors.has(key)) {
      categoryColors.set(key, defaultStatColor(index));
    }
  });

  return { categoryLabels, categoryColors, categoryOrder };
}

export function sortChartYears(years: string[]): string[] {
  return [...years].sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    if (Number.isFinite(numA) && Number.isFinite(numB)) return numA - numB;
    return a.localeCompare(b);
  });
}

export function buildGroupedChartData(trackRecord: TrackRecord): GroupedChartData | null {
  const years = sortChartYears(Object.keys(trackRecord));
  if (years.length === 0) return null;

  const { categoryLabels, categoryColors, categoryOrder } = buildCategoryColorMap(trackRecord, years);
  if (categoryOrder.length === 0) return null;

  const groups: YearChartGroup[] = [];

  for (const year of years) {
    const bars: ChartBar[] = [];

    trackRecord[year].stats.forEach((stat) => {
      const label = stat.label.trim();
      const value = stat.value.trim();
      if (!label || !value) return;

      const category = extractResultCategory(label);
      const key = resultCategoryKey(label);

      bars.push({
        label,
        category,
        value,
        color: categoryColors.get(key) ?? defaultStatColor(0),
        numeric: parseTrackStatValue(value),
      });
    });

    if (bars.length > 0) {
      groups.push({ year, bars });
    }
  }

  if (groups.length === 0) return null;

  const legend = categoryOrder.map((key) => ({
    label: categoryLabels.get(key) ?? key,
    color: categoryColors.get(key) ?? defaultStatColor(0),
  }));

  return {
    groups,
    legend,
    yMax: CHART_Y_MAX,
  };
}

export function newTrackStat(index: number): TrackStat {
  return {
    label: '',
    value: '',
    color: defaultStatColor(index),
  };
}

export function colorForResultCategory(
  stats: TrackStat[],
  label: string,
  fallbackIndex: number,
): string {
  const key = resultCategoryKey(label);
  const match = stats.find(
    (stat) => resultCategoryKey(stat.label) === key && stat.color?.trim(),
  );
  return normalizeTrackColor(match?.color, fallbackIndex);
}
