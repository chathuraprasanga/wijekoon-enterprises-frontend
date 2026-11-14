import {
  AppShell as MantineAppShell,
  Avatar,
  Box,
  Burger,
  Divider,
  Group,
  Image,
  Menu,
  NavLink,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconBox,
  IconChevronDown,
  IconLayoutDashboard,
  IconLogout,
  IconReceipt2,
  IconSettings,
  IconShoppingCart,
  IconTruckDelivery,
  IconUser,
  IconUsers,
  IconCoin,
} from '@tabler/icons-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOut, logoutAdmin } from '@/store/authSlice/authSlice';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Wordmark } from '@/components/Wordmark';
import { fullName, initials } from '@/utils/format';
import devLogo from '../../assets/dev-logo.png';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/app/dashboard', icon: IconLayoutDashboard }],
  },
  {
    label: 'Directory',
    items: [
      { label: 'Customers', path: '/app/customers', icon: IconUsers },
      { label: 'Suppliers', path: '/app/suppliers', icon: IconTruckDelivery },
      { label: 'Products', path: '/app/products', icon: IconBox },
    ],
  },
  {
    label: 'Trading',
    items: [
      { label: 'Sales', path: '/app/sales', icon: IconCoin },
      { label: 'Orders', path: '/app/orders', icon: IconShoppingCart },
      { label: 'Cheques', path: '/app/cheques', icon: IconReceipt2 },
    ],
  },
  {
    label: 'Administration',
    items: [{ label: 'Settings', path: '/app/settings', icon: IconSettings }],
  },
];

export const AppShell = () => {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  // Full navigation on desktop and in the mobile drawer; icon rail only on tablet.
  const wide = useMediaQuery('(min-width: 62em)', true);
  const mobile = useMediaQuery('(max-width: 47.99em)', false);
  const showLabels = wide || mobile;

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
    } finally {
      dispatch(logOut());
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <MantineAppShell
        header={{ height: 48 }}
        navbar={{
          width: { base: 280, sm: 56, md: 240 },
          breakpoint: 'sm',
          collapsed: { mobile: !opened },
        }}
        padding={{ base: 'md', md: 'lg' }}
        styles={{
          header: {
            background: 'var(--ldg-surface-raised)',
            borderBottom: '1px solid var(--ldg-border)',
          },
          navbar: {
            background: 'var(--ldg-surface-raised)',
            borderRight: '1px solid var(--ldg-border)',
          },
          main: { background: 'var(--ldg-surface)' },
        }}
      >
        <MantineAppShell.Header>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap">
            <Group wrap="nowrap" gap="sm">
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
                aria-label="Open navigation"
              />
              <Wordmark />
            </Group>
            <Group gap="xs" wrap="nowrap">
              <ThemeToggle />
              {user && (
                <Menu position="bottom-end">
                  <Menu.Target>
                    <UnstyledButton
                      aria-label="Account menu"
                      py={4}
                      px={8}
                      style={{ borderRadius: 6 }}
                    >
                      <Group gap="xs" wrap="nowrap">
                        <Avatar src={user.avatar} alt="" size={28} radius="xl" color="forest">
                          {initials(user)}
                        </Avatar>
                        <Text size="sm" fw={500} visibleFrom="sm" maw={160} truncate>
                          {fullName(user)}
                        </Text>
                        <IconChevronDown size={16} aria-hidden />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Box px="sm" py={6}>
                      <Text size="sm" fw={600} truncate>
                        {fullName(user)}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {user.email}
                      </Text>
                    </Box>
                    <Menu.Divider />
                    <Menu.Item
                      component={Link}
                      to="/app/settings/profile"
                      leftSection={<IconUser size={16} />}
                    >
                      Profile
                    </Menu.Item>
                    <Menu.Item leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                      Log out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              )}
            </Group>
          </Group>
        </MantineAppShell.Header>
        <MantineAppShell.Navbar p="sm" component="nav" aria-label="Main">
          <Box style={{ overflowY: 'auto', overflowX: 'hidden', flex: 1 }}>
            <Stack gap="md" py={4}>
              {NAV_SECTIONS.map((section, index) => (
                <Stack key={section.label} gap={2}>
                  {!showLabels && index > 0 && <Divider mb={6} aria-hidden />}
                  {showLabels && (
                    <Text className="eyebrow" px="sm" pb={4}>
                      {section.label}
                    </Text>
                  )}
                  {section.items.map((item) => {
                    const active = location.pathname.startsWith(item.path);
                    const link = (
                      <NavLink
                        key={item.path}
                        component={Link}
                        to={item.path}
                        label={showLabels ? item.label : undefined}
                        aria-label={item.label}
                        leftSection={<item.icon size={20} aria-hidden />}
                        active={active}
                        variant="light"
                        fw={active ? 600 : 500}
                        onClick={close}
                        styles={{
                          root: { borderRadius: 6, minHeight: 40 },
                          section: showLabels ? undefined : { marginInlineEnd: 0 },
                        }}
                      />
                    );
                    return showLabels ? (
                      link
                    ) : (
                      <Tooltip key={item.path} label={item.label} position="right">
                        {link}
                      </Tooltip>
                    );
                  })}
                </Stack>
              ))}
            </Stack>
          </Box>
          <Box
            pt="sm"
            style={{ borderTop: '1px solid var(--ldg-border)' }}
            aria-label="Powered by XCORPION"
            role="contentinfo"
          >
            <Group
              gap="xs"
              wrap="nowrap"
              justify={showLabels ? 'flex-start' : 'center'}
              px={showLabels ? 'xs' : 0}
            >
              <Image
                src={devLogo}
                alt="XCORPION"
                w={28}
                h={28}
                fit="contain"
                style={{ flex: 'none' }}
              />
              {showLabels && (
                <Box lh={1.3}>
                  <Text size="xs" fw={500}>
                    Powered by XCORPION
                  </Text>
                  <Text fz={11} c="dimmed">
                    © {new Date().getFullYear()} XCORPION
                  </Text>
                </Box>
              )}
            </Group>
          </Box>
        </MantineAppShell.Navbar>
        <MantineAppShell.Main id="main">
          <Box maw="var(--ldg-content-max)" mx="auto">
            <Outlet />
            <Text size="xs" c="dimmed" mt="xl">
              Wijekoon Enterprises back-office.
            </Text>
          </Box>
        </MantineAppShell.Main>
      </MantineAppShell>
    </>
  );
};
