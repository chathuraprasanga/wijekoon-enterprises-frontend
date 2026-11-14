import { useEffect, useState } from 'react';
import { Button, Group } from '@mantine/core';
import { IconKey, IconPencil } from '@tabler/icons-react';
import { ListPage } from '@/components/data/ListPage';
import { DetailDialog } from '@/components/DetailDialog';
import { Box, Stack, Text } from '@mantine/core';
import { Field } from '@/components/Field';
import { StatusSection } from '@/components/StatusSection';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ActiveBadge, StatusBadge } from '@/components/StatusBadge';
import { AddEditUserModal } from '@/pages/settings/AddEditUserModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type User,
  deleteUser,
  fetchUsers,
  resetUserPassword,
  updateUser,
} from '@/store/userSlice/userSlice';
import { fetchRoles } from '@/store/roleSlice/roleSlice';
import { toNotify } from '@/hooks/toNotify';
import { useActiveToggle } from '@/hooks/useActiveToggle';
import { formatPhone, fullName } from '@/utils/format';

const SORT_MAP = { name: 'firstName' };

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((s) => s.user);
  const roles = useAppSelector((s) => s.role.items);
  const [form, setForm] = useState<{ user: User | null } | null>(null);
  const [view, setView] = useState<User | null>(null);
  const [toReset, setToReset] = useState<User | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 100 }));
  }, [dispatch]);

  const roleName = (id: string) => roles.find((r) => r._id === id)?.name ?? '—';

  const { toggle, busyId } = useActiveToggle<User>(
    'User',
    (u) =>
      dispatch(
        updateUser({
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
          address: u.address,
          roles: u.roles,
          isActive: !u.isActive,
        }),
      ).unwrap(),
    (id, isActive) => setView((v) => (v && v._id === id ? { ...v, isActive } : v)),
  );

  const handleReset = async () => {
    if (!toReset) return;
    setResetting(true);
    try {
      await dispatch(resetUserPassword(toReset._id)).unwrap();
      toNotify('Password reset', 'A new password was emailed to the user.', 'SUCCESS');
      setToReset(null);
    } catch (error) {
      toNotify("Couldn't reset password", error as string, 'ERROR');
    } finally {
      setResetting(false);
    }
  };

  const filters = [
    {
      type: 'select' as const,
      key: 'status',
      label: 'Status',
      placeholder: 'All statuses',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    {
      type: 'multiSelect' as const,
      key: 'role',
      label: 'Role',
      placeholder: 'All roles',
      options: roles.map((r) => ({ value: r._id, label: r.name })),
    },
  ];

  return (
    <ListPage<User>
      embedded
      title="Users"
      description="Staff accounts and the roles they hold."
      entity={{ singular: 'user', plural: 'users' }}
      searchPlaceholder="Search by name, phone or email"
      filters={filters}
      records={items}
      total={total}
      rowKey={(u) => u._id}
      rowName={fullName}
      defaultSort={{ key: 'name', dir: 'asc' }}
      sortMap={SORT_MAP}
      load={({ page, limit, searchText, sortBy, sortType, filters: f }) =>
        dispatch(
          fetchUsers({ page, limit, searchText, status: f.status, role: f.role, sortBy, sortType }),
        ).unwrap()
      }
      createLabel="Add user"
      onCreate={() => setForm({ user: null })}
      onView={setView}
      onEdit={(user) => setForm({ user })}
      remove={{
        title: 'Delete user?',
        describe: (u) => (
          <>
            This permanently removes <strong>{fullName(u)}</strong> and their access. This cannot be
            undone.
          </>
        ),
        run: (u) => dispatch(deleteUser(u._id)).unwrap(),
        done: 'User deleted.',
      }}
      columns={[
        {
          key: 'name',
          header: 'Name',
          sortable: true,
          primary: true,
          render: (u) => <b style={{ fontWeight: 500 }}>{fullName(u)}</b>,
        },
        { key: 'email', header: 'Email', sortable: true, render: (u) => u.email },
        {
          key: 'phone',
          header: 'Phone',
          render: (u) => <span className="num">{formatPhone(u.phone)}</span>,
        },
        {
          key: 'roles',
          header: 'Roles',
          render: (u) =>
            u.roles.length ? (
              <Group gap={4}>
                {u.roles.map((id) => (
                  <StatusBadge key={id} tone="accent" label={roleName(id)} />
                ))}
              </Group>
            ) : (
              '—'
            ),
        },
        {
          key: 'status',
          header: 'Status',
          badge: true,
          render: (u) => <ActiveBadge active={u.isActive} />,
        },
      ]}
    >
      {({ reload }) => (
        <>
          <AddEditUserModal
            opened={!!form}
            user={form?.user ?? null}
            onClose={() => {
              setForm(null);
              reload();
            }}
          />
          <DetailDialog
            opened={!!view}
            onClose={() => setView(null)}
            title={view ? fullName(view) : ''}
            subtitle="User account"
            actions={
              view && (
                <Button
                  leftSection={<IconPencil size={16} aria-hidden />}
                  onClick={() => {
                    setForm({ user: view });
                    setView(null);
                  }}
                >
                  Edit user
                </Button>
              )
            }
          >
            {view && (
              <>
                <Stack gap="md">
                  <Field label="Email">{view.email}</Field>
                  <Field label="Phone">
                    <span className="num">{formatPhone(view.phone)}</span>
                  </Field>
                  <Field label="Roles">
                    {view.roles.length ? (
                      <Group gap={4} mt={4}>
                        {view.roles.map((id) => (
                          <StatusBadge key={id} tone="accent" label={roleName(id)} />
                        ))}
                      </Group>
                    ) : (
                      '—'
                    )}
                  </Field>
                </Stack>
                <StatusSection
                  label="ACCOUNT"
                  title="Active account"
                  description="Inactive users can't sign in."
                  checked={view.isActive}
                  disabled={busyId === view._id}
                  onChange={() => toggle(view)}
                />
                <Box mt="lg">
                  <Text className="eyebrow" mb={6}>
                    PASSWORD
                  </Text>
                  <Button
                    variant="default"
                    leftSection={<IconKey size={16} aria-hidden />}
                    onClick={() => setToReset(view)}
                  >
                    Reset password
                  </Button>
                  <Text size="sm" c="dimmed" mt={6}>
                    Emails a new password to this user.
                  </Text>
                </Box>
              </>
            )}
          </DetailDialog>
          <ConfirmDialog
            opened={!!toReset}
            title="Reset password?"
            destructive={false}
            confirmLabel="Reset password"
            loading={resetting}
            onConfirm={handleReset}
            onClose={() => setToReset(null)}
          >
            A new password will be generated for <strong>{toReset ? fullName(toReset) : ''}</strong>{' '}
            and emailed to <strong>{toReset?.email}</strong>. Their current password stops working.
          </ConfirmDialog>
        </>
      )}
    </ListPage>
  );
};

export default UsersPage;
