import type { ReactNode } from 'react';
import { Box, Center, Stack, Text, Title } from '@mantine/core';

type Props = {
  icon: ReactNode;
  /** Big status code (404, 403). */
  code?: string;
  title: string;
  children: ReactNode;
  actions: ReactNode;
  /** Muted line under the buttons (e.g. a reference). */
  footnote?: ReactNode;
  tone?: 'neutral' | 'danger';
};

// Card used for in-app 404/403 and the crash page.
export const ErrorCard = ({
  icon,
  code,
  title,
  children,
  actions,
  footnote,
  tone = 'neutral',
}: Props) => (
  <Box
    style={{
      background: 'var(--ldg-surface-raised)',
      border: '1px solid var(--ldg-border)',
      borderRadius: 8,
    }}
    py={48}
    px="md"
  >
    <Center>
      <Stack align="center" gap="xs" ta="center" maw={460}>
        <Box
          w={50}
          h={50}
          aria-hidden
          style={{
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            background:
              tone === 'danger' ? 'var(--ldg-danger-subtle)' : 'var(--ldg-surface-sunken)',
            border: `1px solid ${tone === 'danger' ? 'var(--ldg-danger-border)' : 'var(--ldg-border)'}`,
            color: tone === 'danger' ? 'var(--ldg-danger-text)' : 'var(--ldg-text-muted)',
          }}
        >
          {icon}
        </Box>
        {code && (
          <Text fz={28} fw={600} lh={1.2} c="var(--ldg-accent-text)" className="num">
            {code}
          </Text>
        )}
        <Title order={2} fz={18}>
          {title}
        </Title>
        <Text c="dimmed">{children}</Text>
        <Box mt="xs">{actions}</Box>
        {footnote && (
          <Text size="sm" c="dimmed" mt="xs">
            {footnote}
          </Text>
        )}
      </Stack>
    </Center>
  </Box>
);
