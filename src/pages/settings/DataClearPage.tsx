import { useState } from 'react';
import { Button, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { SectionCard } from '@/components/SectionCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOut } from '@/store/authSlice/authSlice';
import { DataClearModal, type ClearMode } from './DataClearModal';

/** Super admin only (the server enforces it too): wipe the data, with a password and an emailed code. */
const DataClearPage = () => {
  const dispatch = useAppDispatch();
  const email = useAppSelector((s) => s.auth.user?.email ?? '');
  const [mode, setMode] = useState<ClearMode | null>(null);

  const done = (m: ClearMode) => {
    if (m === 'everything') {
      dispatch(logOut());
      // A full reload so the app asks the server again and lands on first-time setup.
      window.location.assign('/');
    } else {
      window.location.reload();
    }
  };

  return (
    <Stack gap="md" maw={720}>
      <SectionCard
        title="Clear all data"
        subtitle="Deletes customers, suppliers, products, sales, orders, payments, cheques, notifications, audit logs and every user except you. Roles, business rules and banks stay."
      >
        <Button
          color="red"
          variant="default"
          leftSection={<IconTrash size={16} aria-hidden />}
          onClick={() => setMode('keep_super_user')}
        >
          Clear all data…
        </Button>
      </SectionCard>
      <SectionCard
        title="Clear everything, including the super user"
        subtitle="Deletes all of it plus your account, roles, banks and settings. The system goes back to first-time setup."
      >
        <Button
          color="red"
          leftSection={<IconTrash size={16} aria-hidden />}
          onClick={() => setMode('everything')}
        >
          Clear everything…
        </Button>
      </SectionCard>
      <Text size="sm" c="dimmed">
        Both ask for your password, then a code emailed to {email}. Neither can be undone.
      </Text>
      {mode && (
        <DataClearModal mode={mode} email={email} onClose={() => setMode(null)} onDone={done} />
      )}
    </Stack>
  );
};

export default DataClearPage;
