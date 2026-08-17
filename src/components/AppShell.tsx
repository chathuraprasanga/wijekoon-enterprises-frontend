import {
  AppShell as MantineAppShell,
  Burger,
  Button,
  Group,
  NavLink,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLayoutDashboard, IconLogout } from '@tabler/icons-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOut } from '@/store/authSlice/authSlice';

const NAV_ITEMS = [{ label: 'Dashboard', path: '/app/dashboard', icon: IconLayoutDashboard }];

export const AppShell = () => {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login', { replace: true });
  };

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700}>Wijekoon Enterprises</Text>
          </Group>
          <Group gap="sm">
            {user && (
              <Text size="sm" c="dimmed">
                {user.firstName}
              </Text>
            )}
            <Button
              variant="subtle"
              size="xs"
              leftSection={<IconLogout size={16} />}
              onClick={handleLogout}
            >
              Log out
            </Button>
          </Group>
        </Group>
      </MantineAppShell.Header>
      <MantineAppShell.Navbar p="md">
        <Stack gap={4}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              component={Link}
              to={item.path}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={location.pathname === item.path}
            />
          ))}
        </Stack>
      </MantineAppShell.Navbar>
      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
};
