import { Center, Loader as MantineLoader, Stack, Text } from '@mantine/core';

export type LoaderProps = {
  label?: string;
};

export const Loader = ({ label }: LoaderProps) => {
  return (
    <Center h="100vh">
      <Stack align="center" gap="sm">
        <MantineLoader type="bars" size="sm" />
        {label && <Text c="dimmed">{label}</Text>}
      </Stack>
    </Center>
  );
};
