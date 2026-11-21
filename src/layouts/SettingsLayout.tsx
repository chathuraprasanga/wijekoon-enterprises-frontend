import { useState } from 'react';
import { Box, Tabs } from '@mantine/core';
import { IconHistory, IconShieldLock, IconUser, IconUsers } from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { useCan, useIsSuperAdmin } from '@/utils/permissions';

const TABS: {
  value: string;
  label: string;
  icon: typeof IconUser;
  superAdmin?: boolean;
  permission?: string;
}[] = [
  { value: 'profile', label: 'Profile', icon: IconUser },
  { value: 'users', label: 'Users', icon: IconUsers, superAdmin: true },
  { value: 'roles', label: 'Roles', icon: IconShieldLock, superAdmin: true },
  { value: 'audit-logs', label: 'Audit logs', icon: IconHistory, permission: 'audit-log:read' },
];

// Tabs are routes (/app/settings/profile), so the active tab survives a refresh.
export const SettingsLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // The active tab portals its primary action (Add user / New role) into the page header.
  const [actionSlot, setActionSlot] = useState<HTMLElement | null>(null);
  const active = pathname.split('/app/settings/')[1]?.split('/')[0] ?? 'profile';
  // Users and Roles are for the super admin; everyone else sees their own profile only.
  const isSuper = useIsSuperAdmin();
  const can = useCan();
  const tabs = TABS.filter(
    (t) => (!t.superAdmin || isSuper) && (!t.permission || can(t.permission)),
  );

  return (
    <>
      <PageHeader
        title="Settings"
        description={
          isSuper
            ? 'Your profile, users and the roles that control access.'
            : 'Your profile and password.'
        }
        action={<Box ref={setActionSlot} />}
      />
      <Tabs value={active} onChange={(v) => v && navigate(`/app/settings/${v}`)} mb="lg">
        <Tabs.List style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
          {tabs.map((t) => (
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
