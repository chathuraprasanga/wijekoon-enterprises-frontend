import type { ReactNode } from 'react';
import { Box, Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconCalendarEvent, IconClock, IconInfoCircle } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';

const Scope = ({ scope }: { scope: 'period' | 'current' }) => {
  const period = scope === 'period';
  return (
    <Box
      component="span"
      fz={12}
      fw={500}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 6,
        whiteSpace: 'nowrap',
        color: period ? 'var(--ldg-info-text)' : 'var(--ldg-text-muted)',
        background: period ? 'var(--ldg-info-subtle)' : 'var(--ldg-surface-sunken)',
        border: `1px solid ${period ? 'var(--ldg-info-border)' : 'var(--ldg-border)'}`,
      }}
    >
      {period ? <IconCalendarEvent size={14} aria-hidden /> : <IconClock size={14} aria-hidden />}
      {period ? 'Follows date filter' : 'Current state'}
    </Box>
  );
};

type Props = {
  title: string;
  subtitle?: string;
  scope: 'period' | 'current';
  loading: boolean;
  empty?: { title: string; description: string } | null;
  /** Extra control beside the badge (e.g. a quantity / revenue switch). */
  control?: ReactNode;
  children: ReactNode;
};

/** One dashboard chart card: header with scope badge, then skeleton, empty state or the chart. */
export const ChartCard = ({ title, subtitle, scope, loading, empty, control, children }: Props) => (
  <Box
    component="section"
    aria-busy={loading}
    style={{
      background: 'var(--ldg-surface-raised)',
      border: '1px solid var(--ldg-border)',
      borderRadius: 8,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    }}
  >
    <Group justify="space-between" align="flex-start" px="md" py="sm" gap="xs">
      <Stack gap={2} style={{ minWidth: 0, flex: '1 1 140px' }}>
        <Text component="h3" fw={600} fz={16} lh={1.3}>
          {title}
        </Text>
        {subtitle && (
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        )}
      </Stack>
      <Group gap="xs" wrap="wrap" justify="flex-end">
        {control}
        <Scope scope={scope} />
      </Group>
    </Group>
    <Box p="md" style={{ borderTop: '1px solid var(--ldg-border)', flex: 1 }}>
      {loading ? (
        <Stack gap="xs">
          <Skeleton h={12} w="40%" />
          <Skeleton h={150} />
          <Group gap="xs">
            <Skeleton h={10} w={70} />
            <Skeleton h={10} w={70} />
            <Skeleton h={10} w={100} />
          </Group>
        </Stack>
      ) : empty ? (
        <EmptyState title={empty.title} description={empty.description} />
      ) : (
        children
      )}
      {scope === 'current' && !loading && (
        <Group gap={6} mt="md" c="dimmed">
          <IconInfoCircle size={14} aria-hidden />
          <Text size="xs">Not affected by date filter</Text>
        </Group>
      )}
    </Box>
  </Box>
);
