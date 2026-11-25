import type { ReactNode } from 'react';
import { Box } from '@mantine/core';
import { fillOf, type Kind } from './chartKinds';

export const Swatch = ({ kind, size = 14 }: { kind: Kind; size?: number }) => (
  <svg width={size} height={size} aria-hidden style={{ flex: 'none' }}>
    <rect width={size} height={size} rx={3} fill={fillOf(kind)} />
  </svg>
);

/** Hatches and dots are defined once per page; every chart refers to them by id. */
export const ChartPatterns = () => {
  const light = { stroke: 'var(--ldg-surface-raised)', strokeOpacity: 0.65, strokeWidth: 1.4 };
  const dot = { fill: 'var(--ldg-surface-raised)', fillOpacity: 0.7 };
  return (
    <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden focusable="false">
      <defs>
        <pattern id="ldg-pat-stripe" width={6} height={6} patternUnits="userSpaceOnUse">
          <rect width={6} height={6} fill="var(--ldg-info-fill)" />
          <path d="M-1 1L1 -1M0 6L6 0M5 7L7 5" {...light} />
        </pattern>
        <pattern id="ldg-pat-diag" width={7} height={7} patternUnits="userSpaceOnUse">
          <rect width={7} height={7} fill="var(--ldg-warning-fill)" />
          <path d="M-1 1L1 -1M0 7L7 0M6 8L8 6" {...light} strokeWidth={1.8} />
        </pattern>
        <pattern id="ldg-pat-dots" width={6} height={6} patternUnits="userSpaceOnUse">
          <rect width={6} height={6} fill="var(--ldg-warning-fill)" />
          <circle cx={3} cy={3} r={0.95} {...dot} />
        </pattern>
        <pattern id="ldg-pat-grey" width={5} height={5} patternUnits="userSpaceOnUse">
          <rect width={5} height={5} fill="var(--ldg-text-subtle)" />
          <circle cx={2.5} cy={2.5} r={0.9} {...dot} />
        </pattern>
        <pattern id="ldg-pat-cross" width={6} height={6} patternUnits="userSpaceOnUse">
          <rect width={6} height={6} fill="var(--ldg-danger-fill)" />
          <path d="M0 0L6 6M6 0L0 6" {...light} strokeWidth={1.1} />
        </pattern>
      </defs>
    </svg>
  );
};

export type TipRow = { label: string; value: string; kind?: Kind };

export const TipBody = ({ title, rows }: { title: string; rows: TipRow[] }) => (
  <>
    <Box fw={600} fz={12} mb={4}>
      {title}
    </Box>
    {rows.map((r) => (
      <Box
        key={r.label}
        fz={12}
        style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <span
          style={{
            display: 'inline-flex',
            gap: 6,
            alignItems: 'center',
            color: 'var(--ldg-text-muted)',
          }}
        >
          {r.kind && <Swatch kind={r.kind} size={12} />}
          {r.label}
        </span>
        <span className="num">{r.value}</span>
      </Box>
    ))}
  </>
);

type Props = { x: number; y: number; width: number; children: ReactNode };

/** Floating readout on the surface token with a strong border; flips side near the right edge. */
export const ChartTip = ({ x, y, width, children }: Props) => (
  <Box
    role="tooltip"
    style={{
      position: 'absolute',
      left: x,
      top: Math.max(y, 24),
      transform: `translate(${x > width / 2 ? 'calc(-100% - 12px)' : '12px'}, -50%)`,
      pointerEvents: 'none',
      zIndex: 5,
      minWidth: 140,
      padding: '8px 10px',
      background: 'var(--ldg-surface-raised)',
      border: '1px solid var(--ldg-border-strong)',
      borderRadius: 6,
      boxShadow: '0 4px 14px rgba(0,0,0,.14)',
      color: 'var(--ldg-text)',
    }}
  >
    {children}
  </Box>
);
