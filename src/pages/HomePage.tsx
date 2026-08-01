import { Button, Stack, Text, Title } from '@mantine/core';
import { config } from '../../config';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { increment } from '../store/counterSlice';

export function HomePage() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <Stack align="center" justify="center" className="min-h-screen gap-4 p-8">
      <Title order={1}>Wijekoon Enterprises Admin</Title>
      <Text c="dimmed">API base URL: {config.baseUrl}</Text>
      <Button onClick={() => dispatch(increment())}>Count is {count}</Button>
    </Stack>
  );
}
