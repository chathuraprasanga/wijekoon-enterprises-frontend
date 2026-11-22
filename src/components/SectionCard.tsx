import type { ReactNode } from 'react';
import { Box, Group, Stack, Text, Title } from '@mantine/core';

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  /** Remove body padding so tables run edge to edge. */
  flush?: boolean;
};

// The one white card: raised surface, hairline border, 8px radius, flat.
export const SectionCard = ({ title, subtitle, action, children, flush }: Props) => (
  <Box
    component="section"
    style={{
      background: 'var(--ldg-surface-raised)',
      border: '1px solid var(--ldg-border)',
      borderRadius: 8,
      overflow: 'hidden',
    }}
  >
    <Group justify="space-between" align="flex-start" px="md" py="sm" wrap="nowrap" gap="md">
      <Stack gap={2} style={{ minWidth: 0 }}>
        <Title order={3}>{title}</Title>
        {subtitle && (
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        )}
      </Stack>
      {action && <Box style={{ flex: 'none' }}>{action}</Box>}
    </Group>
    {children && (
      <Box style={{ borderTop: '1px solid var(--ldg-border)' }} p={flush ? 0 : 'md'}>
        {children}
      </Box>
    )}
  </Box>
);
