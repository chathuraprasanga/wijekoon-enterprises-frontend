import { Stack, Text, Title } from '@mantine/core';
import { useAppSelector } from '@/store/hooks';

const DashboardPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Stack gap={4}>
      <Title order={2}>Dashboard</Title>
      <Text c="dimmed">Welcome back{user?.firstName ? `, ${user.firstName}` : ''}.</Text>
    </Stack>
  );
};

export default DashboardPage;
