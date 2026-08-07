import { useEffect, useState } from 'react';
import { Badge, Group, Paper, Stack, Text, Title } from '@mantine/core';
import {
  IconArrowUpRight,
  IconMailCheck,
  IconMailX,
  IconPhoneCheck,
  IconPhoneX,
  IconShieldCog,
  IconUsers,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { StatCard } from '@/components/common/StatCard';
import { getPaged } from '@/features/users/usersApi';

const formatRole = (role: string) =>
  role
    .split('_')
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(' ');

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const DashboardPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [userCountLoading, setUserCountLoading] = useState(user?.role === 'SUPER_ADMIN');

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') return;
    let ignore = false;
    getPaged({ page: 1, limit: 1 })
      .then((result) => {
        if (!ignore) setUserCount(result.total);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!ignore) setUserCountLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [user?.role]);

  return (
    <Stack gap="lg">
      <Paper
        p="xl"
        className="relative overflow-hidden bg-gradient-to-br from-[#013037] to-[#025864]"
      >
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-32 h-32 w-32 rounded-full bg-white/5" />

        <Stack gap={4} className="relative z-10">
          <Text c="gray.3" fw={500}>
            {getGreeting()}
          </Text>
          <Title order={2} c="white">
            {user ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : 'Welcome'}
          </Title>
          <Badge color="brandGreen" mt="xs" w="fit-content">
            {user ? formatRole(user.role) : ''}
          </Badge>
        </Stack>
      </Paper>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {user?.role === 'SUPER_ADMIN' && (
          <Link to="/users" className="no-underline">
            <StatCard
              label="Total Users"
              value={userCount ?? '—'}
              icon={<IconUsers size={22} />}
              color="teal"
              loading={userCountLoading}
            />
          </Link>
        )}

        <StatCard
          label="Email"
          value={user?.email ?? '—'}
          icon={user?.isEmailVerified ? <IconMailCheck size={22} /> : <IconMailX size={22} />}
          color={user?.isEmailVerified ? 'brandGreen' : 'red'}
        />

        <StatCard
          label="Mobile"
          value={user?.phone ?? '—'}
          icon={user?.isMobileVerified ? <IconPhoneCheck size={22} /> : <IconPhoneX size={22} />}
          color={user?.isMobileVerified ? 'brandGreen' : 'red'}
        />
      </div>

      {user?.role === 'SUPER_ADMIN' && (
        <Paper p="lg" withBorder component={Link} to="/users" className="block no-underline">
          <Group justify="space-between">
            <Group gap="md">
              <IconShieldCog size={22} color="var(--mantine-color-teal-6)" />
              <div>
                <Text fw={600}>Manage users</Text>
                <Text size="sm" c="dimmed">
                  Create, edit, and manage roles for your team.
                </Text>
              </div>
            </Group>
            <IconArrowUpRight size={18} color="var(--mantine-color-dimmed)" />
          </Group>
        </Paper>
      )}
    </Stack>
  );
};
