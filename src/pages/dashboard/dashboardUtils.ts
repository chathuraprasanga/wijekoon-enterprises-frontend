import { toYmd } from '@/utils/format';
import type { Point } from './dashboardApi';

export type Preset = 'today' | '7d' | '30d' | 'mtd' | 'ytd' | 'month' | 'custom';
export type Range = { from: string; to: string };

export const PRESETS: { value: Preset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'mtd', label: 'Month to date' },
  { value: 'ytd', label: 'Year to date' },
];

const day = (s: string) => new Date(`${s}T00:00:00`);
const shift = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const presetRange = (p: Preset, now = new Date()): Range => {
  const to = toYmd(now);
  const t = shift(now, 0);
  if (p === 'today') return { from: to, to };
  if (p === '7d') return { from: toYmd(shift(t, -6)), to };
  if (p === '30d') return { from: toYmd(shift(t, -29)), to };
  if (p === 'ytd') return { from: toYmd(new Date(t.getFullYear(), 0, 1)), to };
  return { from: toYmd(new Date(t.getFullYear(), t.getMonth(), 1)), to };
};

/** A whole month, cut off at today when it is the current one. */
export const monthRange = (anyDay: string, now = new Date()): Range => {
  const d = day(anyDay);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    from: toYmd(new Date(d.getFullYear(), d.getMonth(), 1)),
    to: toYmd(last > now ? now : last),
  };
};

export const addMonths = (anyDay: string, n: number) => {
  const d = day(anyDay);
  return toYmd(new Date(d.getFullYear(), d.getMonth() + n, 1));
};

export const monthLabel = (anyDay: string) =>
  day(anyDay).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const shortDay = (s: string) =>
  day(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const longDay = (s: string) =>
  day(s).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const rangeLabel = (from: string, to: string) =>
  `${shortDay(from)}${from.slice(0, 4) === to.slice(0, 4) ? '' : ` ${from.slice(0, 4)}`} – ${shortDay(to)} ${to.slice(0, 4)}`;

/** 4820000000 -> "4.8B", 12400000 -> "12.4M", 240000 -> "240k". */
export const lkrShort = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e9) return `${+(n / 1e9).toFixed(a >= 1e10 ? 0 : 1)}B`;
  if (a >= 1e6) return `${+(n / 1e6).toFixed(a >= 1e7 ? 0 : 1)}M`;
  if (a >= 1e3) return `${+(n / 1e3).toFixed(a >= 1e4 ? 0 : 1)}k`;
  return String(Math.round(n));
};

export const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);

/** A "nice" axis ceiling and step so ticks land on round numbers. */
export const niceScale = (max: number, ticks = 4) => {
  if (max <= 0) return { top: 1, step: 1 / ticks };
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag;
  return { top: step * ticks, step };
};

export type Bucket = {
  label: string;
  from: string;
  to: string;
  sales: number;
  purchases: number;
  prevSales: number;
};

/** Sum days into buckets of [size] days (the last one may be shorter). */
export const bucketise = (series: Point[], size: number): Bucket[] => {
  const out: Bucket[] = [];
  for (let i = 0; i < series.length; i += size) {
    const part = series.slice(i, i + size);
    out.push({
      label: size === 7 ? `Week ${out.length + 1}` : shortDay(part[0].date),
      from: part[0].date,
      to: part[part.length - 1].date,
      sales: part.reduce((s, p) => s + (p.sales ?? 0), 0),
      purchases: part.reduce((s, p) => s + (p.purchases ?? 0), 0),
      prevSales: part.reduce((s, p) => s + (p.prevSales ?? 0), 0),
    });
  }
  return out;
};
