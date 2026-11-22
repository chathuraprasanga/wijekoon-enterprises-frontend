import { useState } from 'react';
import { Box, Tabs } from '@mantine/core';
import {
  IconBell,
  IconBuildingBank,
  IconAdjustments,
  IconHistory,
  IconShieldLock,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { useAppSelector } from '@/store/hooks';
import { useCan } from '@/utils/permissions';

const TABS: {
  value: string;
  label: string;
  icon: typeof IconUser;
  permission?: string;
  superAdminOnly?: boolean;
}[] = [
  { value: 'profile', label: 'Profile', icon: IconUser },
  { value: 'users', label: 'Users', icon: IconUsers, permission: 'user:read' },
  { value: 'roles', label: 'Roles', icon: IconShieldLock, permission: 'role:read' },
  { value: 'banks', label: 'Banks', icon: IconBuildingBank, permission: 'bank:read' },
  {
    value: 'rules',
    label: 'Business rules',
    icon: IconAdjustments,
    permission: 'business-rule:read',
  },
  { value: 'audit-logs', label: 'Audit logs', icon: IconHistory, permission: 'audit-log:read' },
  { value: 'notifications', label: 'Notifications', icon: IconBell, superAdminOnly: true },
];

// Tabs are routes (/app/settings/profile), so the active tab survives a refresh.
export const SettingsLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // The active tab portals its primary action (Add user / New role) into the page header.
  const [actionSlot, setActionSlot] = useState<HTMLElement | null>(null);
  const active = pathname.split('/app/settings/')[1]?.split('/')[0] ?? 'profile';
  const can = useCan();
  const isSuperAdmin = useAppSelector((s) => !!s.auth.user?.isSuperAdmin);
  const tabs = TABS.filter(
    (t) => (!t.permission || can(t.permission)) && (!t.superAdminOnly || isSuperAdmin),
  );

  return (
    <>
      <PageHeader
        title="Settings"
        description={
          tabs.length > 1
            ? 'Your profile and the settings you can manage.'
            : 'Your profile and password.'
        }
        action={<Box ref={setActionSlot} />}
      />
      <Tabs value={active} onChange={(v) => v && navigate(`/app/settings/${v}`)} mb="lg">
        <Tabs.List style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
          {tabs.map((t) => (
            <Tabs.Tab
              key={t.value}
              value={t.value}
              px="sm"
              leftSection={
                <Box component="span" visibleFrom="sm" style={{ display: 'inline-flex' }}>
                  <t.icon size={16} aria-hidden />
                </Box>
              }
            >
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <Outlet context={{ actionSlot }} />
    </>
  );
};
