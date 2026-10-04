import { Stack, Tabs } from '@mantine/core';
import { IconShieldLock, IconUserCircle, IconUsers } from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';

const TABS = [
  { value: 'profile', label: 'Profile', icon: IconUserCircle },
  { value: 'users', label: 'Users', icon: IconUsers },
  { value: 'roles', label: 'Roles', icon: IconShieldLock },
];

export const SettingsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Use the first segment after /app/settings/ so a sub-route like
  // roles/add-edit/:id still keeps the Roles tab highlighted.
  const activeTab = location.pathname.split('/app/settings/')[1]?.split('/')[0];

  return (
    <Stack gap="md">
      <PageHeader title="Settings" description="Manage your account, team, and roles." />
      <Tabs
        value={activeTab}
        variant="default"
        onChange={(value) => value && navigate(`/app/settings/${value}`)}
        mx="calc(var(--mantine-spacing-md) * -1)"
      >
        <Tabs.List>
          {TABS.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={<tab.icon size={16} />}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>
      <Outlet />
    </Stack>
  );
};
