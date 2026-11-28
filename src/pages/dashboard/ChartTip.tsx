import type { ReactNode } from 'react';
import { Box } from '@mantine/core';
import { fillOf, type Kind } from './chartKinds';

export const Swatch = ({ kind, size = 14 }: { kind: Kind; size?: number }) => (
  <svg width={size} height={size} aria-hidden style={{ flex: 'none' }}>
    <rect width={size} height={size} rx={3} fill={fillOf(kind)} />
  </svg>
);

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
