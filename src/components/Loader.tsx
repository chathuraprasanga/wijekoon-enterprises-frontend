import { Center, Loader as MantineLoader, Stack, Text } from '@mantine/core';

export type LoaderProps = {
  label?: string;
  h?: string | number;
};

export const Loader = ({ label, h = '100vh' }: LoaderProps) => {
  return (
    <Center h={h}>
      <Stack align="center" gap="sm">
        <MantineLoader type="bars" size="sm" />
        {label && <Text c="dimmed">{label}</Text>}
      </Stack>
    </Center>
  );
};
