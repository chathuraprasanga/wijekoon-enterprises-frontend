import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Modal,
  Stack,
  Switch,
  Text,
  Tooltip,
} from '@mantine/core';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '@/components/PageHeader';
import { Loader } from '@/components/Loader';
import { FilterBar, type FilterFieldConfig } from '@/components/FilterBar';
import { AddEditUserModal } from '@/pages/settings/AddEditUserModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { type User, deleteUser, fetchUsers, updateUser } from '@/store/userSlice/userSlice';
import { fetchRoles } from '@/store/roleSlice/roleSlice';
import { toNotify } from '@/hooks/toNotify';
import { datePreview } from '@/utils/datePreview';

const STATIC_FILTER_FIELDS: FilterFieldConfig[] = [
  { type: 'search', key: 'q', placeholder: 'Search users' },
  {
    type: 'select',
    key: 'status',
    label: 'Status',
    placeholder: 'Any status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { items, limit, total } = useAppSelector((state) => state.user);
  const roles = useAppSelector((state) => state.role.items);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formTarget, setFormTarget] = useState<User | null>();
  const [formOpen, setFormOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<User | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<User>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const searchText = searchParams.get('q') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const role = searchParams.get('role') ?? undefined;
  const sortBy =
    sortStatus.columnAccessor === 'name' ? 'firstName' : (sortStatus.columnAccessor as string);
  const sortType = sortStatus.direction;

  const filterFields: FilterFieldConfig[] = [
    ...STATIC_FILTER_FIELDS,
    {
      type: 'multiSelect',
      key: 'role',
      label: 'Role',
      placeholder: 'Any role',
      options: roles.map((r) => ({ value: r._id, label: r.name })),
    },
  ];

  // Reset to page 1 whenever filters or sort change. Adjusted during render
  // (React's recommended pattern for state derived from props) rather than
  // in an effect, which would otherwise cause a cascading extra render.
  const filterKey = `${searchText ?? ''}|${status ?? ''}|${role ?? ''}|${sortBy}|${sortType}`;
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey);
  if (filterKey !== appliedFilterKey) {
    setAppliedFilterKey(filterKey);
    setPage(1);
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await dispatch(
          fetchUsers({ page, limit, searchText, status, role, sortBy, sortType }),
        ).unwrap();
      } catch (error) {
        toNotify('Failed to load users', error as string, 'ERROR');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch, page, limit, searchText, status, role, sortBy, sortType]);

  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 100 }));
  }, [dispatch]);

  const roleName = (roleId: string) => roles.find((role) => role._id === roleId)?.name ?? roleId;

  const handleToggleActive = async (user: User) => {
    setTogglingId(user._id);
    try {
      const updated = await dispatch(
        updateUser({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          roles: user.roles,
          isActive: !user.isActive,
        }),
      ).unwrap();
      toNotify(
        'Updated',
        `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
        'SUCCESS',
      );
      setViewTarget((prev) =>
        prev && prev._id === user._id ? { ...prev, isActive: updated.isActive } : prev,
      );
    } catch (error) {
      toNotify('Failed to update user', error as string, 'ERROR');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteUser(toDelete._id)).unwrap();
      toNotify('Deleted', 'User deleted successfully', 'SUCCESS');
      setToDelete(null);
    } catch (error) {
      toNotify('Failed to delete user', error as string, 'ERROR');
    } finally {
      setDeleting(false);
    }
  };

  const openAdd = () => {
    setFormTarget(null);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setFormTarget(user);
    setFormOpen(true);
  };

  return (
    <Stack gap="md">
      <PageHeader
        title="Users"
        description="Manage your team members."
        action={
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
            Add user
          </Button>
        }
      />
      <FilterBar fields={filterFields} />
      <DataTable
        withTableBorder
        borderRadius="md"
        minHeight={loading || items.length === 0 ? 200 : undefined}
        records={items}
        fetching={loading}
        customLoader={<Loader h="100%" />}
        noRecordsText="No users found"
        page={page}
        onPageChange={setPage}
        totalRecords={total}
        recordsPerPage={limit}
        idAccessor="_id"
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        columns={[
          {
            accessor: 'name',
            title: 'Name',
            sortable: true,
            width: 180,
            render: (user) => `${user.firstName} ${user.lastName ?? ''}`.trim(),
          },
          { accessor: 'phone', title: 'Phone', width: 130 },
          {
            accessor: 'email',
            title: 'Email',
            sortable: true,
            width: 200,
            render: (user) => user.email ?? '-',
          },
          {
            accessor: 'address',
            title: 'Address',
            sortable: true,
            width: 200,
            render: (user) => user.address ?? '-',
          },
          {
            accessor: 'isActive',
            title: 'Status',
            width: 110,
            render: (user) => (
              <Badge color={user.isActive ? 'green' : 'gray'} variant="light">
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            width: 130,
            render: (user) => (
              <Group gap="xs" justify="flex-end" wrap="nowrap">
                <Tooltip label="View">
                  <ActionIcon variant="subtle" onClick={() => setViewTarget(user)}>
                    <IconEye size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Edit">
                  <ActionIcon variant="subtle" onClick={() => openEdit(user)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                  <ActionIcon variant="subtle" color="red" onClick={() => setToDelete(user)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
      />
      <AddEditUserModal
        opened={formOpen}
        user={formTarget ?? null}
        onClose={() => setFormOpen(false)}
      />
      <Drawer
        opened={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="User details"
        position="right"
      >
        {viewTarget && (
          <Stack gap="md">
            <Text fw={600} size="lg">
              {viewTarget.firstName} {viewTarget.lastName ?? ''}
            </Text>
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">
                Status
              </Text>
              <Switch
                checked={viewTarget.isActive}
                size="md"
                onLabel="ACTIVE"
                offLabel="INACTIVE"
                color="green"
                styles={{
                  trackLabel: {
                    padding: 'var(--mantine-spacing-xs)',
                    fontSize: 'var(--mantine-font-size-xs)',
                  },
                }}
                disabled={togglingId === viewTarget._id}
                onChange={() => handleToggleActive(viewTarget)}
              />
            </Group>
            <Divider />
            <Stack gap="xs">
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Email
                </Text>
                <Text size="sm">{viewTarget.email}</Text>
              </Group>
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Phone
                </Text>
                <Text size="sm">{viewTarget.phone}</Text>
              </Group>
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Text size="sm" c="dimmed">
                  Address
                </Text>
                <Text size="sm" ta="right">
                  {viewTarget.address ?? '-'}
                </Text>
              </Group>
            </Stack>
            <Divider />
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Roles
              </Text>
              {viewTarget.roles.length ? (
                <Group gap="xs">
                  {viewTarget.roles.map((roleId) => (
                    <Badge key={roleId} variant="light">
                      {roleName(roleId)}
                    </Badge>
                  ))}
                </Group>
              ) : (
                <Text size="sm">-</Text>
              )}
            </Stack>
            <Divider />
            <Stack gap="xs">
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Created
                </Text>
                <Text size="sm">{datePreview(viewTarget.createdAt)}</Text>
              </Group>
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Last updated
                </Text>
                <Text size="sm">{datePreview(viewTarget.updatedAt)}</Text>
              </Group>
            </Stack>
          </Stack>
        )}
      </Drawer>
      <Modal opened={!!toDelete} onClose={() => setToDelete(null)} title="Delete user" centered>
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete{' '}
            <strong>
              {toDelete?.firstName} {toDelete?.lastName ?? ''}
            </strong>
            ? This cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button color="red" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default UsersPage;
