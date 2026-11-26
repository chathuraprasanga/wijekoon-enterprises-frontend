import { Box, Group, Skeleton, Text } from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconInfoCircle,
  IconMinus,
} from '@tabler/icons-react';
import { Sparkline } from './charts';
import './dashboard.css';
import { pct } from './dashboardUtils';

type Props = {
  label: string;
  /** Money, or a pre-formatted figure like "6 · LKR 1,036,400.00" via [prefix]. */
  value: number;
  prefix?: string;
  loading: boolean;
  /** Period tiles compare with the previous period; current-state tiles say they ignore the filter. */
  previous?: number;
  spark?: number[];
  emptyNote?: string;
};

const fmt = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const KpiTile = ({ label, value, prefix, loading, previous, spark, emptyNote }: Props) => {
  const current = previous === undefined;
  const change = current ? null : pct(value, previous);
  const flat = !current && (change == null || Math.abs(change) < 0.05);
  const up = (change ?? 0) >= 0;
  const tone = flat
    ? 'var(--ldg-text-muted)'
    : up
      ? 'var(--ldg-success-text)'
      : 'var(--ldg-danger-text)';
  return (
    <Box
      className="kpi"
      p="sm"
      style={{
        background: 'var(--ldg-surface-raised)',
        border: '1px solid var(--ldg-border)',
        borderRadius: 8,
        minWidth: 0,
        height: '100%',
      }}
    >
      <Text size="sm" c="dimmed" truncate>
        {label}
      </Text>
      {loading ? (
        <>
          <Skeleton h={26} mt={8} w="80%" />
          <Skeleton h={12} mt={10} w="55%" />
        </>
      ) : (
        <>
          <Text ta="right" fw={600} mt={4} className="num kpi-amount">
            {prefix && <span>{prefix} · </span>}
            <Text component="span" fz={13} fw={500} c="dimmed" mr={4}>
              LKR
            </Text>
            {fmt(value)}
          </Text>
          <Group justify="space-between" align="center" mt={6} gap="xs" wrap="nowrap" mih={28}>
            {current ? (
              <Group gap={4} c="dimmed" wrap="nowrap" style={{ minWidth: 0 }}>
                <IconInfoCircle size={14} aria-hidden style={{ flex: 'none' }} />
                <Text size="xs" truncate>
                  Not affected by filter
                </Text>
              </Group>
            ) : (
              <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                <Group gap={2} wrap="nowrap" fw={600} fz={13} style={{ color: tone, flex: 'none' }}>
                  {flat ? (
                    <IconMinus size={14} aria-hidden />
                  ) : up ? (
                    <IconArrowUpRight size={14} aria-hidden />
                  ) : (
                    <IconArrowDownRight size={14} aria-hidden />
                  )}
                  <span className="num">
                    {flat ? 'No change' : `${up ? '+' : '−'}${Math.abs(change!).toFixed(1)}%`}
                  </span>
                </Group>
                <Text size="xs" c="dimmed" truncate>
                  {value === 0 && previous === 0 && emptyNote ? emptyNote : 'vs previous period'}
                </Text>
              </Group>
            )}
            {spark && spark.length > 1 && (
              <span className="kpi-spark" style={{ flex: 'none', display: 'inline-flex' }}>
                <Sparkline sparkline={spark} kind={flat || up ? 'up' : 'down'} />
              </span>
            )}
          </Group>
        </>
      )}
    </Box>
  );
};
