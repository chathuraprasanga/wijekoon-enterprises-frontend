import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { Box, Group, Text } from '@mantine/core';
import { formatLkr } from '@/utils/format';
import { fillOf, type Kind } from './chartKinds';
import { ChartTip, Swatch, TipBody, type TipRow } from './ChartTip';
import {
  bucketise,
  longDay,
  lkrShort,
  niceScale,
  pct,
  shortDay,
  type Bucket,
} from './dashboardUtils';
import type { DueBucket, Point } from './dashboardApi';
import { useChartTip } from './useChartTip';

const AXIS = { fill: 'var(--ldg-text-muted)', fontSize: 11 } as const;
const GRID = 'var(--ldg-border)';

export const Legend = ({ items }: { items: { label: string; kind?: Kind; dash?: boolean }[] }) => (
  <Group gap="md" mb="xs" wrap="wrap">
    {items.map((i) => (
      <Group key={i.label} gap={6} wrap="nowrap">
        {i.kind ? (
          <Swatch kind={i.kind} size={12} />
        ) : (
          <svg width={22} height={8} aria-hidden>
            <line
              x1={0}
              x2={22}
              y1={4}
              y2={4}
              stroke={i.dash ? 'var(--ldg-text-subtle)' : 'var(--ldg-accent)'}
              strokeWidth={2.2}
              strokeDasharray={i.dash ? '4 3' : undefined}
            />
          </svg>
        )}
        <Text size="xs" c="dimmed">
          {i.label}
        </Text>
      </Group>
    ))}
  </Group>
);

export const Sparkline = ({
  sparkline,
  kind,
}: {
  sparkline: number[];
  kind: 'up' | 'down' | 'flat';
}) => {
  const w = 84;
  const h = 28;
  const max = Math.max(...sparkline, 1);
  const min = Math.min(...sparkline);
  const pts = sparkline
    .map((v, i) => {
      const x = sparkline.length < 2 ? w : (i / (sparkline.length - 1)) * w;
      const y = h - 2 - ((v - min) / (max - min || 1)) * (h - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={w} height={h} aria-hidden style={{ flex: 'none', maxWidth: '100%' }}>
      <polyline
        points={pts}
        fill="none"
        strokeWidth={1.8}
        strokeLinejoin="round"
        stroke={kind === 'down' ? 'var(--ldg-warning-fill)' : 'var(--ldg-accent)'}
      />
    </svg>
  );
};

/* ───────────────────────── line chart ───────────────────────── */

export const LineChart = ({
  series,
  compare,
  prevLabel,
}: {
  series: Point[];
  compare: boolean;
  prevLabel: string;
}) => {
  const { ref, width } = useChartTip();
  const [active, setActive] = useState<number | null>(null);
  const weekly = series.length > 92;
  const pts = weekly
    ? bucketise(series, 7).map((b) => ({
        label: b.from,
        to: b.to,
        cur: b.sales,
        prev: b.prevSales,
      }))
    : series.map((p) => ({ label: p.date, to: p.date, cur: p.sales ?? 0, prev: p.prevSales ?? 0 }));
  const n = pts.length;
  const H = width < 480 ? 210 : 260;
  const L = 44;
  const R = 12;
  const T = 8;
  const B = 26;
  const pw = Math.max(width - L - R, 1);
  const ph = H - T - B;
  const { top, step } = niceScale(
    Math.max(...pts.map((p) => Math.max(p.cur, compare ? p.prev : 0)), 0),
  );
  const x = (i: number) => L + (n < 2 ? pw / 2 : (i / (n - 1)) * pw);
  const y = (v: number) => T + ph - (v / top) * ph;
  const line = (k: 'cur' | 'prev') =>
    pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p[k]).toFixed(1)}`).join('');
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const labelAt = width < 480 ? 3 : 5;
  const xLabels = Array.from(
    new Set(
      Array.from({ length: Math.min(labelAt, n) }, (_, i) =>
        Math.round((i * (n - 1)) / Math.max(Math.min(labelAt, n) - 1, 1)),
      ),
    ),
  );

  const move = (e: { clientX: number; currentTarget: SVGSVGElement }) => {
    const r = e.currentTarget.getBoundingClientRect();
    setActive(Math.min(n - 1, Math.max(0, Math.round(((e.clientX - r.left - L) / pw) * (n - 1)))));
  };
  const key = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setActive((a) => Math.min(n - 1, (a ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? n) - 1));
    else if (e.key === 'Escape') setActive(null);
    else return;
    e.preventDefault();
  };
  const a = active == null ? null : pts[active];
  const change = a && compare ? pct(a.cur, a.prev) : null;

  return (
    <Box ref={ref} style={{ position: 'relative' }}>
      <Legend
        items={[{ label: 'This period' }, ...(compare ? [{ label: prevLabel, dash: true }] : [])]}
      />
      {width > 0 && (
        <svg
          width={width}
          height={H}
          role="img"
          tabIndex={0}
          aria-label={`Sales per ${weekly ? 'week' : 'day'}, ${n} points. Use left and right arrow keys to read values.`}
          onPointerMove={move}
          onPointerLeave={() => setActive(null)}
          onKeyDown={key}
          onBlur={() => setActive(null)}
          style={{ display: 'block', touchAction: 'pan-y', outlineOffset: 2 }}
        >
          <defs>
            <linearGradient id="ldg-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--ldg-accent)" stopOpacity={0.22} />
              <stop offset="1" stopColor="var(--ldg-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={width - R} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" {...AXIS}>
                {lkrShort(t)}
              </text>
            </g>
          ))}
          <path d={`${line('cur')}L${x(n - 1)} ${y(0)}L${x(0)} ${y(0)}Z`} fill="url(#ldg-area)" />
          {compare && (
            <path
              d={line('prev')}
              fill="none"
              stroke="var(--ldg-text-subtle)"
              strokeWidth={1.8}
              strokeDasharray="4 3"
            />
          )}
          <path
            d={line('cur')}
            fill="none"
            stroke="var(--ldg-accent)"
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
          {xLabels.map((i, k) => (
            <text
              key={i}
              x={x(i)}
              y={H - 6}
              textAnchor={
                k === 0
                  ? 'start'
                  : k === xLabels.length - 1 && xLabels.length > 1
                    ? 'end'
                    : 'middle'
              }
              {...AXIS}
            >
              {shortDay(pts[i].label)}
            </text>
          ))}
          {active != null && a && (
            <>
              <line
                x1={x(active)}
                x2={x(active)}
                y1={T}
                y2={T + ph}
                stroke="var(--ldg-border-strong)"
                strokeDasharray="3 3"
              />
              <circle
                cx={x(active)}
                cy={y(a.cur)}
                r={4}
                fill="var(--ldg-accent)"
                stroke="var(--ldg-surface-raised)"
                strokeWidth={2}
              />
            </>
          )}
        </svg>
      )}
      {active != null && a && (
        <ChartTip x={x(active)} y={y(a.cur)} width={width}>
          <TipBody
            title={weekly ? `${shortDay(a.label)} – ${shortDay(a.to)}` : longDay(a.label)}
            rows={[
              { label: 'This period', value: formatLkr(a.cur), kind: 'solid' },
              ...(compare ? [{ label: 'Previous', value: formatLkr(a.prev) }] : []),
              ...(change != null
                ? [{ label: 'Change', value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` }]
                : []),
            ]}
          />
        </ChartTip>
      )}
    </Box>
  );
};

/* ─────────────────────── sales vs purchases ─────────────────────── */

export const GroupedBars = ({ series }: { series: Point[] }) => {
  const { ref, width, tip, show, showAt, hide } = useChartTip();
  const buckets = bucketise(series, series.length <= 98 ? 7 : 30);
  const H = width < 480 ? 210 : 260;
  const L = 44;
  const R = 8;
  const T = 8;
  const B = 26;
  const pw = Math.max(width - L - R, 1);
  const ph = H - T - B;
  const { top, step } = niceScale(Math.max(...buckets.flatMap((b) => [b.sales, b.purchases]), 0));
  const y = (v: number) => T + ph - (v / top) * ph;
  const slot = pw / Math.max(buckets.length, 1);
  const bw = Math.min(34, (slot * 0.7) / 2);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const tipOf = (b: Bucket) => (
    <TipBody
      title={
        b.label.startsWith('Week')
          ? `${b.label} · ${shortDay(b.from)} – ${shortDay(b.to)}`
          : `${shortDay(b.from)} – ${shortDay(b.to)}`
      }
      rows={[
        { label: 'Sales', value: formatLkr(b.sales), kind: 'solid' },
        { label: 'Purchases', value: formatLkr(b.purchases), kind: 'stripe' },
        { label: 'Margin', value: formatLkr(b.sales - b.purchases) },
      ]}
    />
  );
  return (
    <Box ref={ref} style={{ position: 'relative' }}>
      <Legend
        items={[
          { label: 'Sales', kind: 'solid' },
          { label: 'Purchases', kind: 'stripe' },
        ]}
      />
      {width > 0 && (
        <svg
          width={width}
          height={H}
          role="img"
          aria-label="Sales against purchases per period"
          style={{ display: 'block' }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={width - R} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" {...AXIS}>
                {lkrShort(t)}
              </text>
            </g>
          ))}
          {buckets.map((b, i) => {
            const cx = L + slot * i + slot / 2;
            return (
              <g
                key={b.from}
                tabIndex={0}
                aria-label={`${b.label}: sales ${formatLkr(b.sales)}, purchases ${formatLkr(b.purchases)}`}
                onPointerMove={(e) => show(e, tipOf(b))}
                onPointerLeave={hide}
                onFocus={(e) => showAt(e.currentTarget, tipOf(b))}
                onBlur={hide}
                style={{ outline: 'none' }}
              >
                <rect x={cx - slot / 2} y={T} width={slot} height={ph} fill="transparent" />
                <rect
                  x={cx - bw - 1}
                  y={y(b.sales)}
                  width={bw}
                  height={Math.max(y(0) - y(b.sales), 0)}
                  rx={3}
                  fill={fillOf('solid')}
                />
                <rect
                  x={cx + 1}
                  y={y(b.purchases)}
                  width={bw}
                  height={Math.max(y(0) - y(b.purchases), 0)}
                  rx={3}
                  fill={fillOf('stripe')}
                />
                <text x={cx} y={H - 6} textAnchor="middle" {...AXIS}>
                  {b.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {tip && (
        <ChartTip x={tip.x} y={tip.y} width={width}>
          {tip.content}
        </ChartTip>
      )}
    </Box>
  );
};

/* ───────────────────────── donut ───────────────────────── */

export type Slice = { label: string; value: number; kind: Kind; count: number };

const arc = (r0: number, r1: number, a0: number, a1: number) => {
  const p = (r: number, a: number) => [Math.sin(a) * r, -Math.cos(a) * r];
  const big = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = p(r1, a0);
  const [x1, y1] = p(r1, a1);
  const [x2, y2] = p(r0, a1);
  const [x3, y3] = p(r0, a0);
  return `M${x0} ${y0}A${r1} ${r1} 0 ${big} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${big} 0 ${x3} ${y3}Z`;
};

export const Donut = ({
  slices,
  centre,
  sub,
  noun,
}: {
  slices: Slice[];
  centre: string;
  sub: string;
  noun: string;
}) => {
  const { ref, width, tip, show, showAt, hide } = useChartTip();
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const size = 176;
  const starts = slices.map((_, i) => slices.slice(0, i).reduce((n, x) => n + x.value, 0) / total);
  const tipOf = (s: Slice) => (
    <TipBody
      title={s.label}
      rows={[
        { label: 'Value', value: formatLkr(s.value), kind: s.kind },
        { label: 'Share', value: `${Math.round((s.value / total) * 100)}%` },
        { label: noun, value: String(s.count) },
      ]}
    />
  );
  return (
    <Box ref={ref} style={{ position: 'relative' }}>
      <Box style={{ display: 'grid', placeItems: 'center' }}>
        <svg
          width={size}
          height={size}
          viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
          role="img"
          aria-label={`${sub}: ${centre}`}
          style={{ maxWidth: '100%' }}
        >
          {slices.map((s, k) => {
            const a0 = starts[k] * Math.PI * 2;
            const a1 = a0 + (s.value / total) * Math.PI * 2;
            return (
              <path
                key={s.label}
                d={arc(52, 82, a0, Math.min(a1, Math.PI * 2 - 0.0001))}
                fill={fillOf(s.kind)}
                stroke="var(--ldg-surface-raised)"
                strokeWidth={2}
                tabIndex={0}
                aria-label={`${s.label}: ${formatLkr(s.value)}`}
                onPointerMove={(e) => show(e, tipOf(s))}
                onPointerLeave={hide}
                onFocus={(e) => showAt(e.currentTarget, tipOf(s))}
                onBlur={hide}
                style={{ outline: 'none' }}
              />
            );
          })}
          <text
            textAnchor="middle"
            y={2}
            className="mono"
            fontWeight={600}
            fontSize={15}
            fill="var(--ldg-text)"
          >
            {centre}
          </text>
          <text textAnchor="middle" y={20} fontSize={12} fill="var(--ldg-text-muted)">
            {sub}
          </text>
        </svg>
      </Box>
      <Box mt="sm">
        {slices.map((s) => (
          <Group key={s.label} justify="space-between" wrap="nowrap" py={3} gap="sm">
            <Group gap={8} wrap="nowrap">
              <Swatch kind={s.kind} />
              <Text size="sm">{s.label}</Text>
            </Group>
            <Text size="sm" ta="right">
              {formatLkr(s.value)} · {Math.round((s.value / total) * 100)}%
            </Text>
          </Group>
        ))}
      </Box>
      {tip && (
        <ChartTip x={tip.x} y={tip.y} width={width || size}>
          {tip.content}
        </ChartTip>
      )}
    </Box>
  );
};

/* ───────────────────── single stacked bar + legend ───────────────────── */

export type StackItem = { label: string; value: number; kind: Kind; icon?: ReactNode };

export const StackBar = ({ items }: { items: StackItem[] }) => {
  const { ref, width, tip, show, showAt, hide } = useChartTip();
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const offs = items.map(
    (_, i) => (items.slice(0, i).reduce((n, x) => n + x.value, 0) / total) * 100,
  );
  const tipOf = (i: StackItem) => (
    <TipBody
      title={i.label}
      rows={[
        { label: 'Value', value: formatLkr(i.value), kind: i.kind },
        { label: 'Share', value: `${Math.round((i.value / total) * 100)}%` },
      ]}
    />
  );
  return (
    <Box ref={ref} style={{ position: 'relative' }}>
      <svg
        width="100%"
        height={30}
        role="img"
        aria-label={items.map((i) => `${i.label} ${formatLkr(i.value)}`).join(', ')}
      >
        {items
          .map((i, k) => ({ i, x: offs[k] }))
          .filter(({ i }) => i.value > 0)
          .map(({ i, x }) => {
            return (
              <rect
                key={i.label}
                x={`${x}%`}
                width={`${(i.value / total) * 100}%`}
                height={30}
                rx={4}
                fill={fillOf(i.kind)}
                stroke="var(--ldg-surface-raised)"
                strokeWidth={2}
                tabIndex={0}
                aria-label={`${i.label}: ${formatLkr(i.value)}`}
                onPointerMove={(e) => show(e, tipOf(i))}
                onPointerLeave={hide}
                onFocus={(e) => showAt(e.currentTarget, tipOf(i))}
                onBlur={hide}
                style={{ outline: 'none' }}
              />
            );
          })}
      </svg>
      <Box mt="sm">
        {items.map((i) => (
          <Group key={i.label} justify="space-between" wrap="nowrap" py={3} gap="sm">
            <Group gap={8} wrap="nowrap">
              <Swatch kind={i.kind} />
              {i.icon}
              <Text size="sm">{i.label}</Text>
            </Group>
            <Text size="sm" ta="right">
              {formatLkr(i.value)}
            </Text>
          </Group>
        ))}
      </Box>
      {tip && (
        <ChartTip x={tip.x} y={tip.y} width={width}>
          {tip.content}
        </ChartTip>
      )}
    </Box>
  );
};

/* ───────────────────────── ranked bars ───────────────────────── */

export type BarRow = { name: string; value: number; display: string; kind?: Kind; tip?: TipRow[] };

export const HBars = ({ rows, kind }: { rows: BarRow[]; kind: Kind }) => {
  const { ref, width, tip, show, showAt, hide } = useChartTip();
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <Box ref={ref} style={{ position: 'relative' }}>
      {rows.map((r) => {
        const content = r.tip ? <TipBody title={r.name} rows={r.tip} /> : null;
        return (
          <Box
            key={r.name}
            py={6}
            tabIndex={content ? 0 : undefined}
            aria-label={`${r.name}: ${r.display}`}
            onPointerMove={content ? (e) => show(e, content) : undefined}
            onPointerLeave={hide}
            onFocus={content ? (e) => showAt(e.currentTarget, content) : undefined}
            onBlur={hide}
            style={{ outline: 'none' }}
          >
            <Group justify="space-between" wrap="nowrap" gap="sm" mb={2}>
              <Text size="sm" fw={500} truncate>
                {r.name}
              </Text>
              <Text size="sm" className="mono" style={{ flex: 'none' }}>
                {r.display}
              </Text>
            </Group>
            <svg width="100%" height={9} aria-hidden style={{ display: 'block' }}>
              <rect width="100%" height={9} rx={4.5} fill="var(--ldg-surface-sunken)" />
              <rect
                width={`${Math.max((r.value / max) * 100, r.value > 0 ? 2 : 0)}%`}
                height={9}
                rx={4.5}
                fill={fillOf(r.kind ?? kind)}
              />
            </svg>
          </Box>
        );
      })}
      {tip && (
        <ChartTip x={tip.x} y={tip.y} width={width}>
          {tip.content}
        </ChartTip>
      )}
    </Box>
  );
};

/* ─────────────────────── cheques due columns ─────────────────────── */

export const DueColumns = ({ buckets }: { buckets: DueBucket[] }) => {
  const { ref, width, tip, show, showAt, hide } = useChartTip();
  const H = 200;
  const L = 40;
  const R = 6;
  const T = 8;
  const B = 44;
  const pw = Math.max(width - L - R, 1);
  const ph = H - T - B;
  const { top, step } = niceScale(Math.max(...buckets.map((b) => b.value), 0), 2);
  const y = (v: number) => T + ph - (v / top) * ph;
  const slot = pw / buckets.length;
  const bw = Math.min(40, slot * 0.6);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const nameOf = (b: DueBucket) => (b.start ? `Week of ${shortDay(b.start)}` : 'Overdue');
  const tipOf = (b: DueBucket) => (
    <TipBody
      title={`${nameOf(b)} · ${b.count} cheque${b.count === 1 ? '' : 's'}`}
      rows={[
        { label: 'Value', value: formatLkr(b.value), kind: b.start ? 'solid' : 'cross' },
        ...(!b.start && b.oldest ? [{ label: 'Oldest', value: shortDay(b.oldest) }] : []),
      ]}
    />
  );
  return (
    <Box ref={ref} style={{ position: 'relative' }}>
      {width > 0 && (
        <svg
          width={width}
          height={H}
          role="img"
          aria-label="Cheques waiting to be deposited, by week"
          style={{ display: 'block' }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={width - R} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={L - 6} y={y(t) + 4} textAnchor="end" {...AXIS}>
                {lkrShort(t)}
              </text>
            </g>
          ))}
          {buckets.map((b, i) => {
            const cx = L + slot * i + slot / 2;
            return (
              <g
                key={b.start ?? 'overdue'}
                tabIndex={0}
                aria-label={`${nameOf(b)}: ${formatLkr(b.value)}`}
                onPointerMove={(e) => show(e, tipOf(b))}
                onPointerLeave={hide}
                onFocus={(e) => showAt(e.currentTarget, tipOf(b))}
                onBlur={hide}
                style={{ outline: 'none' }}
              >
                <rect x={cx - slot / 2} y={T} width={slot} height={ph + B} fill="transparent" />
                <rect
                  x={cx - bw / 2}
                  y={y(b.value)}
                  width={bw}
                  height={Math.max(y(0) - y(b.value), 0)}
                  rx={3}
                  fill={b.start ? fillOf('solid') : fillOf('cross')}
                />
                <text
                  x={cx}
                  y={H - 24}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={b.start ? 400 : 700}
                  fill={b.start ? 'var(--ldg-text-muted)' : 'var(--ldg-danger-text)'}
                >
                  {b.start ? shortDay(b.start) : '! Overdue'}
                </text>
                {b.start && i === 1 && (
                  <text x={cx} y={H - 10} textAnchor="middle" {...AXIS}>
                    this week
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {tip && (
        <ChartTip x={tip.x} y={tip.y} width={width}>
          {tip.content}
        </ChartTip>
      )}
    </Box>
  );
};
