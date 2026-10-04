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
import {
  IconChevronRight,
  IconLayoutDashboard,
  IconLogout,
  IconUsers,
  IconTruckDelivery,
  IconBox,
  IconShoppingCart,
  IconChartBar,
  IconSettings,
} from '@tabler/icons-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOut, logoutAdmin } from '@/store/authSlice/authSlice';
import { ThemeToggle } from '@/components/ThemeToggle';
import companyLogo from '../../assets/company-logo.png';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/app/dashboard', icon: IconLayoutDashboard },
  { label: 'Customers', path: '/app/customers', icon: IconUsers },
  { label: 'Sales', path: '/app/sales', icon: IconChartBar },
  { label: 'Suppliers', path: '/app/suppliers', icon: IconTruckDelivery },
  { label: 'Products', path: '/app/products', icon: IconBox },
  { label: 'Orders', path: '/app/orders', icon: IconShoppingCart },
];

const SETTINGS_ITEM = { label: 'Settings', path: '/app/settings', icon: IconSettings };

export const AppShell = () => {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
    } finally {
      dispatch(logOut());
      navigate('/login', { replace: true });
    }
  };

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <MantineAppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group wrap="nowrap" style={{ minWidth: 0 }}>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Image src={companyLogo} h={32} w={32} fit="contain" style={{ flexShrink: 0 }} />
            <Text fw={550} truncate visibleFrom="xs">
              Wijekoon Enterprises
            </Text>
          </Group>
          <Group gap="xl" wrap="nowrap" style={{ flexShrink: 0 }}>
            <ThemeToggle />
            {user && (
              <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                  <Group gap="md" wrap="nowrap" style={{ cursor: 'pointer' }}>
                    <Avatar src={user.avatar} size="md" radius="xl" color="gray">
                      {`${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()}
                    </Avatar>
                    <Group wrap="nowrap" visibleFrom="sm">
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
                  <Box px="sm" py={4}>
                    <Text size="sm" fw={500} truncate>
                      {user.firstName} {user.lastName ?? ''}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {user.email}
                    </Text>
                  </Box>
                  <Menu.Divider />
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
      <MantineAppShell.Navbar p="sm">
        <Stack gap={4} style={{ flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              component={Link}
              to={item.path}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={location.pathname === item.path}
              onClick={close}
            />
          ))}
        </Stack>
        <NavLink
          component={Link}
          to={SETTINGS_ITEM.path}
          onClick={close}
          label={SETTINGS_ITEM.label}
          leftSection={<SETTINGS_ITEM.icon size={18} />}
          active={location.pathname.startsWith(SETTINGS_ITEM.path)}
        />
      </MantineAppShell.Navbar>
      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>
    </MantineAppShell>
  );
};
