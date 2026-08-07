import { NavLink as MantineNavLink, Stack, Title } from '@mantine/core';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { IconPalette, IconUser } from '@tabler/icons-react';

const SECTIONS = [
  { label: 'Profile', path: '/settings/profile', icon: IconUser },
  { label: 'Appearance', path: '/settings/appearance', icon: IconPalette },
];

export const SettingsLayout = () => {
  const location = useLocation();

  return (
    <Stack gap="lg">
      <Title order={2}>Settings</Title>

      <div className="flex flex-col gap-6 sm:flex-row">
        <Stack gap="xs" className="w-full flex-shrink-0 sm:w-48">
          {SECTIONS.map((section) => (
            <MantineNavLink
              key={section.path}
              component={Link}
              to={section.path}
              label={section.label}
              leftSection={<section.icon size={18} />}
              active={location.pathname === section.path}
              className="rounded-[var(--mantine-radius-md)]"
            />
          ))}
        </Stack>

        <div className="max-w-xl flex-1">
          <Outlet />
        </div>
      </div>
    </Stack>
  );
};
