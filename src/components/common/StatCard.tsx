import type { ReactNode } from 'react';
import { Group, Paper, Skeleton, Text, ThemeIcon } from '@mantine/core';
import type { MantineColor } from '@mantine/core';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  color?: MantineColor;
  loading?: boolean;
}

export const StatCard = ({ label, value, icon, color = 'teal', loading }: StatCardProps) => {
  return (
    <Paper p="lg" withBorder>
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed" fw={500}>
            {label}
          </Text>
          {loading ? (
            <Skeleton height={20} width={100} mt={8} radius="sm" />
          ) : (
            <Text size="xl" fw={700} mt={4}>
              {value}
            </Text>
          )}
        </div>
        {loading ? (
          <Skeleton height={44} width={44} radius="md" />
        ) : (
          <ThemeIcon size={44} color={color}>
            {icon}
          </ThemeIcon>
        )}
      </Group>
    </Paper>
  );
};
