import { Center, Loader as MantineLoader, Stack, Text } from '@mantine/core';

export type LoaderProps = { label?: string; h?: string | number };

export const Loader = ({ label = 'Loading', h = '100vh' }: LoaderProps) => (
  <Center h={h} role="status">
    <Stack align="center" gap="xs">
      <MantineLoader size="sm" />
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Stack>
  </Center>
);
