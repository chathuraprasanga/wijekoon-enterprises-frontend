import { Divider, Stack, Text, Title } from '@mantine/core';

type Props = {
  title: string;
  description: string;
};

export const PageHeader = ({ title, description }: Props) => {
  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Title order={2}>{title}</Title>
        <Text c="dimmed">{description}</Text>
      </Stack>
      {/* Bleeds through AppShell.Main's padding="md" so it touches both edges */}
      <Divider mx="calc(var(--mantine-spacing-md) * -1)" />
    </Stack>
  );
};
