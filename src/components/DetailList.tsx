import type { ReactNode } from 'react';
import { Box, Divider, Stack, Text } from '@mantine/core';
import { orDash } from '@/utils/format';

type Row = { label: string; value: ReactNode };

// Label/value pairs for detail dialogs and cards; groups are separated by hairlines.
export const DetailList = ({ groups, stacked }: { groups: Row[][]; stacked?: boolean }) => (
  <Stack gap="md">
    {groups.map((rows, i) => (
      <Box key={i}>
        {i > 0 && <Divider mb="md" />}
        <Box
          component="dl"
          m={0}
          style={
            stacked
              ? { display: 'grid', rowGap: 14 }
              : { display: 'grid', gridTemplateColumns: 'minmax(110px, 140px) 1fr', rowGap: 12 }
          }
        >
          {rows.map((row) => (
            <Box key={row.label} style={stacked ? undefined : { display: 'contents' }}>
              <Text component="dt" size="sm" c="dimmed">
                {row.label}
              </Text>
              <Text component="dd" size="md" m={0} style={{ overflowWrap: 'anywhere' }}>
                {typeof row.value === 'string' || row.value == null ? orDash(row.value) : row.value}
              </Text>
            </Box>
          ))}
        </Box>
      </Box>
    ))}
  </Stack>
);
