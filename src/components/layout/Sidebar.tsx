import { NavLink as MantineNavLink, Stack } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { IconLayoutDashboard, IconSettings, IconUsers } from '@tabler/icons-react';
import { useAppSelector } from '@/store/hooks';
import type { Role } from '@/types/user';

interface NavItem {
  label: string;
  path: string;
  icon: typeof IconLayoutDashboard;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: IconLayoutDashboard },
  { label: 'Users', path: '/users', icon: IconUsers, roles: ['SUPER_ADMIN'] },
];

const SETTINGS_ITEM: NavItem = { label: 'Settings', path: '/settings', icon: IconSettings };

interface NavItemLinkProps {
  item: NavItem;
  active: boolean;
}

const NavItemLink = ({ item, active }: NavItemLinkProps) => (
  <MantineNavLink
    component={Link}
    to={item.path}
    label={item.label}
    leftSection={<item.icon size={18} />}
    active={active}
    className={`rounded-(--mantine-radius-md) duration-200`}
  />
);

export const Sidebar = () => {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <div className="flex h-full flex-col justify-between">
      <Stack gap="xs">
        {visibleItems.map((item) => (
          <NavItemLink
            key={item.path}
            item={item}
            active={location.pathname.startsWith(item.path)}
          />
        ))}
      </Stack>

      <Stack gap="xs">
        <NavItemLink
          item={SETTINGS_ITEM}
          active={location.pathname.startsWith(SETTINGS_ITEM.path)}
        />
      </Stack>
    </div>
  );
};
