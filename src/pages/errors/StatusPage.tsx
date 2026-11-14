import type { ReactNode } from 'react';
import { Box, Center, Stack, Text, Title } from '@mantine/core';
import { Wordmark } from '@/components/Wordmark';

type Props = { code: string; title: string; children: ReactNode; actions: ReactNode };

// Shared full-page frame for 403, 404 and crash screens.
export const StatusPage = ({ code, title, children, actions }: Props) => (
  <Center mih="100vh" p="md" style={{ background: 'var(--ldg-surface)' }}>
    <Stack align="center" gap="lg" maw={440} ta="center">
      <Wordmark />
      <Box
        style={{
          background: 'var(--ldg-surface-raised)',
          border: '1px solid var(--ldg-border)',
          borderRadius: 8,
        }}
        p="xl"
      >
        <Stack gap="xs" align="center">
          <Text className="mono" c="dimmed" fz={14}>
            {code}
          </Text>
          <Title order={1}>{title}</Title>
          <Text c="dimmed">{children}</Text>
          <Box mt="sm">{actions}</Box>
        </Stack>
      </Box>
    </Stack>
  </Center>
);
