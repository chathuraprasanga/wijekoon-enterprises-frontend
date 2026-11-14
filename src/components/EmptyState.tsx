import type { ReactNode } from 'react';
import { Box, Center, Stack, Text, Title } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

type Props = { title: string; description?: string; action?: ReactNode; icon?: ReactNode };

// Always says what is missing and offers the next action.
export const EmptyState = ({ title, description, action, icon }: Props) => (
  <Center py={48} px="md">
    <Stack align="center" gap="xs" ta="center" maw={420}>
      <Box
        w={40}
        h={40}
        c="dimmed"
        style={{
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          background: 'var(--ldg-surface-sunken)',
          border: '1px solid var(--ldg-border)',
        }}
        aria-hidden
      >
        {icon ?? <IconInbox size={20} />}
      </Box>
      <Title order={3}>{title}</Title>
      {description && (
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      )}
      {action && <Box mt="xs">{action}</Box>}
    </Stack>
  </Center>
);
