import type { ReactNode } from 'react';
import { ActionIcon, Divider, Group, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

type Props = {
  title: string;
  description: string;
  action?: ReactNode;
  onBack?: () => void;
};

export const PageHeader = ({ title, description, action, onBack }: Props) => {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          {onBack && (
            <Tooltip label="Back">
              <ActionIcon variant="subtle" onClick={onBack} aria-label="Back">
                <IconArrowLeft size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          <Stack gap={5}>
            <Title order={4}>{title}</Title>
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          </Stack>
        </Group>
        {action}
      </Group>
      {/* Bleeds through AppShell.Main's padding="md" so it touches both edges */}
      <Divider mx="calc(var(--mantine-spacing-md) * -1)" />
    </Stack>
  );
};
