import {
  AppShell as MantineAppShell,
  Avatar,
  Box,
  Burger,
  Group,
  Image,
  Menu,
  NavLink,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronRight, IconLayoutDashboard, IconLogout, IconUsers } from '@tabler/icons-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOut } from '@/store/authSlice/authSlice';
import { ThemeToggle } from '@/components/ThemeToggle';
import companyLogo from '../../assets/company-logo.png';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/app/dashboard', icon: IconLayoutDashboard },
  { label: 'Users', path: '/app/users', icon: IconUsers },
];

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
            <Image src={companyLogo} h={32} w={32} fit="contain" />
            <Text fw={700}>Wijekoon Enterprises</Text>
          </Group>
          <Group gap="xl">
            <ThemeToggle />
            {user && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Group gap="md" style={{ cursor: 'pointer' }}>
                    <Avatar size="md" radius="xl" color="gray">
                      {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
                    </Avatar>
                    <Group>
                      <Box>
                        <Text size="sm" c="dimmed">
                          {user.firstName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {user.email}
                        </Text>
                      </Box>
                      <IconChevronRight size="20" color="gray" />
                    </Group>
                  </Group>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Danger Zone</Menu.Label>
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={16} />}
                    onClick={handleLogout}
                  >
                    Log out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
      </MantineAppShell.Header>
      <MantineAppShell.Navbar p="md">
        <Stack gap={4} style={{ flex: 1 }}>
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
