import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { FilterBar, type FilterFieldConfig } from '@/components/FilterBar';
import { Loader } from '@/components/Loader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { type Role, deleteRole, fetchRoles, updateRole } from '@/store/roleSlice/roleSlice';
import { toNotify } from '@/hooks/toNotify';
import { PERMISSION_ACTION_LABELS, formatModuleLabel } from '@/utils/permissionLabels';
import { datePreview } from '@/utils/datePreview';

const groupPermissionsByModule = (rolePermissions: Role['permissions']) => {
  const groups: Record<string, string[]> = {};
  rolePermissions.forEach((permission) => {
    const [module, action] = permission.key.split(':');
    const label = (action && PERMISSION_ACTION_LABELS[action]) ?? action ?? permission.key;
    (groups[module ?? ''] ??= []).push(label);
  });
  return groups;
};

const FILTER_FIELDS: FilterFieldConfig[] = [
  { type: 'search', key: 'q', placeholder: 'Search roles' },
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

const RolesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, limit, total } = useAppSelector((state) => state.role);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewTarget, setViewTarget] = useState<Role | null>(null);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Role>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const searchText = searchParams.get('q') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const sortBy = sortStatus.columnAccessor as string;
  const sortType = sortStatus.direction;

  // Reset to page 1 whenever filters or sort change. Adjusted during render
  // (React's recommended pattern for state derived from props) rather than
  // in an effect, which would otherwise cause a cascading extra render.
  const filterKey = `${searchText ?? ''}|${status ?? ''}|${sortBy}|${sortType}`;
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey);
  if (filterKey !== appliedFilterKey) {
    setAppliedFilterKey(filterKey);
    setPage(1);
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await dispatch(fetchRoles({ page, limit, searchText, status, sortBy, sortType })).unwrap();
      } catch (error) {
        toNotify('Failed to load roles', error as string, 'ERROR');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch, page, limit, searchText, status, sortBy, sortType]);

  const handleToggleActive = async (role: Role) => {
    setTogglingId(role._id);
    try {
      const updated = await dispatch(
        updateRole({
          _id: role._id,
          name: role.name,
          permissions: role.permissions.map((permission) => permission._id),
          isActive: !role.isActive,
        }),
      ).unwrap();
      toNotify(
        'Updated',
        `Role ${role.isActive ? 'deactivated' : 'activated'} successfully`,
        'SUCCESS',
      );
      setViewTarget((prev) =>
        prev && prev._id === role._id ? { ...prev, isActive: updated.isActive } : prev,
      );
    } catch (error) {
      toNotify('Failed to update role', error as string, 'ERROR');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteRole(toDelete._id)).unwrap();
      toNotify('Deleted', 'Role deleted successfully', 'SUCCESS');
      setToDelete(null);
    } catch (error) {
      toNotify('Failed to delete role', error as string, 'ERROR');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Stack gap="md">
      <PageHeader
        title="Roles"
        description="Manage roles and their permissions."
        action={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate('/app/settings/roles/add-edit')}
          >
            Add role
          </Button>
        }
      />
      <FilterBar fields={FILTER_FIELDS} />
      <DataTable
        withTableBorder
        borderRadius="md"
        minHeight={loading || items.length === 0 ? 200 : undefined}
        records={items}
        fetching={loading}
        customLoader={<Loader h="100%" />}
        noRecordsText="No roles found"
        page={page}
        onPageChange={setPage}
        totalRecords={total}
        recordsPerPage={limit}
        idAccessor="_id"
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        columns={[
          { accessor: 'name', title: 'Name', width: 220, sortable: true },
          {
            accessor: 'permissions',
            title: 'Permissions',
            width: 220,
            render: (role) => {
              const count = role.permissions.length;
              return (
                <Text size="sm" c={count ? undefined : 'dimmed'}>
                  {count} Permission{count === 1 ? '' : 's'}
                </Text>
              );
            },
          },
          {
            accessor: 'isActive',
            title: 'Status',
            width: 110,
            render: (role) => (
              <Badge color={role.isActive ? 'green' : 'gray'} variant="light">
                {role.isActive ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            width: 130,
            render: (role) => (
              <Group gap="xs" justify="flex-end" wrap="nowrap">
                <Tooltip label="View">
                  <ActionIcon variant="subtle" onClick={() => setViewTarget(role)}>
                    <IconEye size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Edit">
                  <ActionIcon
                    variant="subtle"
                    onClick={() => navigate(`/app/settings/roles/add-edit/${role._id}`)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                  <ActionIcon variant="subtle" color="red" onClick={() => setToDelete(role)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
      />
      <Drawer
        opened={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Role details"
        position="right"
      >
        {viewTarget && (
          <Stack gap="md">
            <Text fw={600} size="lg">
              {viewTarget.name}
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
              <Text size="sm" c="dimmed">
                Permissions
              </Text>
              {viewTarget.permissions.length ? (
                Object.entries(groupPermissionsByModule(viewTarget.permissions)).map(
                  ([module, actions], index) => (
                    <Fragment key={module}>
                      {index > 0 && <Divider />}
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Text size="sm" fw={600}>
                          {formatModuleLabel(module)}
                        </Text>
                        <Text size="sm" c="dimmed" ta="right">
                          {actions.join(', ')}
                        </Text>
                      </Group>
                    </Fragment>
                  ),
                )
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
      <Modal opened={!!toDelete} onClose={() => setToDelete(null)} title="Delete role" centered>
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete <strong>{toDelete?.name}</strong>? This cannot be
            undone.
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

export default RolesPage;
