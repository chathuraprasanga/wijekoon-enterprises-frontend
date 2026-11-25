import { Box, Group, Skeleton, Text } from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconInfoCircle,
  IconMinus,
} from '@tabler/icons-react';
import { Sparkline } from './charts';
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
      p="sm"
      style={{
        background: 'var(--ldg-surface-raised)',
        border: '1px solid var(--ldg-border)',
        borderRadius: 8,
        minWidth: 0,
      }}
    >
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      {loading ? (
        <>
          <Skeleton h={26} mt={8} w="80%" />
          <Skeleton h={12} mt={10} w="55%" />
        </>
      ) : (
        <>
          <Text
            ta="right"
            fw={600}
            fz={{ base: 20, md: 22 }}
            lh={1.3}
            mt={4}
            className="num"
            style={{ overflowWrap: 'anywhere' }}
          >
            {prefix && <span>{prefix} · </span>}
            <Text component="span" fz={13} fw={500} c="dimmed" mr={4}>
              LKR
            </Text>
            {fmt(value)}
          </Text>
          <Group justify="space-between" align="center" mt={6} gap="xs" wrap="nowrap">
            {current ? (
              <Group gap={4} c="dimmed" wrap="nowrap">
                <IconInfoCircle size={14} aria-hidden />
                <Text size="xs">Not affected by filter</Text>
              </Group>
            ) : (
              <Box style={{ minWidth: 0 }}>
                <Group gap={2} wrap="nowrap" fw={600} fz={13} style={{ color: tone }}>
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
                <Text size="xs" c="dimmed">
                  {value === 0 && previous === 0 && emptyNote ? emptyNote : 'vs previous period'}
                </Text>
              </Box>
            )}
            {spark && spark.length > 1 && (
              <Sparkline sparkline={spark} kind={flat || up ? 'up' : 'down'} />
            )}
          </Group>
        </>
      )}
    </Box>
  );
};
