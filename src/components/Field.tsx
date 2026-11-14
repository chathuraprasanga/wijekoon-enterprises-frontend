import type { ReactNode } from 'react';
import { Box, Text } from '@mantine/core';
import { orDash } from '@/utils/format';

// Stacked label over value: the detail-dialog and profile building block.
export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box style={{ minWidth: 0 }}>
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    <Text component="div" style={{ overflowWrap: 'anywhere' }}>
      {typeof children === 'string' || children == null
        ? orDash(children as string | null)
        : children}
    </Text>
  </Box>
);
