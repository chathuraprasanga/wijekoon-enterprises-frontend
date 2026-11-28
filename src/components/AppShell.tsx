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
  IconHistory,
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
  type Icon,
} from '@tabler/icons-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOut, logoutUser } from '@/store/authSlice/authSlice';
import { TestModeBanner } from '@/components/TestModeBanner';
import { useCan } from '@/utils/permissions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationsBell } from '@/components/NotificationsBell';
import { ActivityDrawer } from '@/components/ActivityDrawer';
import { Wordmark } from '@/components/Wordmark';
import { fullName, initials } from '@/utils/format';
import xcorpionLogo from '../../assets/xcorpion-logo.png';
import xcorpionLogoWhite from '../../assets/xcorpion-logo-white.png';

type NavItem = { label: string; path: string; icon: Icon; permission?: string };

// An item with a `permission` shows only to users who have it (or the super admin).
const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/app/dashboard', icon: IconLayoutDashboard }],
  },
  {
    label: 'Directory',
    items: [
      { label: 'Customers', path: '/app/customers', icon: IconUsers, permission: 'customer:read' },
      {
        label: 'Suppliers',
        path: '/app/suppliers',
        icon: IconTruckDelivery,
        permission: 'supplier:read',
      },
      { label: 'Products', path: '/app/products', icon: IconBox, permission: 'product:read' },
    ],
  },
  {
    label: 'Trading',
    items: [
      { label: 'Sales', path: '/app/sales', icon: IconCoin, permission: 'sale:read' },
      { label: 'Orders', path: '/app/orders', icon: IconShoppingCart, permission: 'order:read' },
      {
        label: 'Cheques',
        path: '/app/cheques',
        icon: IconReceipt2,
        permission: 'received-cheque:read|issued-cheque:read',
      },
    ],
  },
  {
    label: 'Administration',
    items: [{ label: 'Settings', path: '/app/settings', icon: IconSettings }],
  },
];

export const AppShell = () => {
  const [opened, { toggle, close }] = useDisclosure();
  const [activityOpen, activity] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const can = useCan();
  const sections = NAV_SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter((i) => !i.permission || can(i.permission)),
  })).filter((s) => s.items.length > 0);
  // Full navigation on desktop and in the mobile menu; icon rail only on tablet.
  const wide = useMediaQuery('(min-width: 62em)', true);
  const mobile = useMediaQuery('(max-width: 47.99em)', false);
  const showLabels = wide || mobile;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
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
        header={{ height: user?.isTestUser ? 80 : 48 }}
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
          {user?.isTestUser && <TestModeBanner expiresAt={user.testExpiresAt} />}
          <Group h={48} px="md" justify="space-between" wrap="nowrap">
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
              {user && <NotificationsBell />}
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
                    <Menu.Item leftSection={<IconHistory size={16} />} onClick={activity.open}>
                      My activity
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
              {sections.map((section, index) => (
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
            {showLabels && (
              <Box px="xs" lh={1.3}>
                <Text fz={11} c="dimmed">
                  Powered by
                </Text>
                <Image
                  src={xcorpionLogo}
                  alt="XCORPION"
                  h={16}
                  w="auto"
                  lightHidden={false}
                  darkHidden
                />
                <Image
                  src={xcorpionLogoWhite}
                  alt="XCORPION"
                  h={16}
                  w="auto"
                  lightHidden
                  darkHidden={false}
                />
                <Text fz={11} c="dimmed" mt={2}>
                  © {new Date().getFullYear()} XCORPION
                </Text>
              </Box>
            )}
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
      <ActivityDrawer opened={activityOpen} onClose={activity.close} />
    </>
  );
};
