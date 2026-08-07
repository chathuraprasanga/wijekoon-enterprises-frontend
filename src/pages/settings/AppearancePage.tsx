import { Group, Paper, Text } from '@mantine/core';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export const AppearancePage = () => {
  return (
    <Paper p="lg" withBorder>
      <Text fw={600} mb="md">
        Theme
      </Text>
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          Color scheme
        </Text>
        <ThemeToggle />
      </Group>
    </Paper>
  );
};
