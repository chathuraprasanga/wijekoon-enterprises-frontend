import { useState } from 'react';
import { Box, Tabs } from '@mantine/core';
import { IconShieldLock, IconUser, IconUsers } from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';

const TABS = [
  { value: 'profile', label: 'Profile', icon: IconUser },
  { value: 'users', label: 'Users', icon: IconUsers },
  { value: 'roles', label: 'Roles', icon: IconShieldLock },
];

// Tabs are routes (/app/settings/profile), so the active tab survives a refresh.
export const SettingsLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // The active tab portals its primary action (Add user / New role) into the page header.
  const [actionSlot, setActionSlot] = useState<HTMLElement | null>(null);
  const active = pathname.split('/app/settings/')[1]?.split('/')[0] ?? 'profile';

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile, users and the roles that control access."
        action={<Box ref={setActionSlot} />}
      />
      <Tabs value={active} onChange={(v) => v && navigate(`/app/settings/${v}`)} mb="lg">
        <Tabs.List style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
          {TABS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value} leftSection={<t.icon size={16} aria-hidden />}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <Outlet context={{ actionSlot }} />
    </>
  );
};
