import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, Group, Text } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { ListPage } from '@/components/data/ListPage';
import { DetailDialog } from '@/components/DetailDialog';
import { ActiveBadge } from '@/components/StatusBadge';
import { StatusSection } from '@/components/StatusSection';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPermissions } from '@/store/permissionSlice/permissionSlice';
import { type Role, deleteRole, fetchRoles, updateRole } from '@/store/roleSlice/roleSlice';
import { useActiveToggle } from '@/hooks/useActiveToggle';
import { PERMISSION_ACTION_LABELS, formatModuleLabel } from '@/utils/permissionLabels';
import { formatDate } from '@/utils/format';
import { useCan } from '@/utils/permissions';

const groupPermissionsByModule = (rolePermissions: Role['permissions']) => {
  const groups: Record<string, string[]> = {};
  rolePermissions.forEach((permission) => {
    const [module, action] = permission.key.split(':');
    const label = (action && PERMISSION_ACTION_LABELS[action]) ?? action ?? permission.key;
    (groups[module ?? ''] ??= []).push(label);
  });
  return groups;
};

const FILTERS = [
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
];

const RolesPage = () => {
  const can = useCan();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total } = useAppSelector((s) => s.role);
  const allModules = useAppSelector((s) => new Set(s.permission.items.map((p) => p.module)).size);
  const [view, setView] = useState<Role | null>(null);

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  const accessLabel = (r: Role) => {
    const n = new Set(r.permissions.map((p) => p.key.split(':')[0])).size;
    if (!allModules) return `${n} modules`;
    return n === allModules ? 'All modules' : `${n} of ${allModules} modules`;
  };

  const { toggle, busyId } = useActiveToggle<Role>(
    'Role',
    (r) =>
      dispatch(
        updateRole({
          _id: r._id,
          name: r.name,
          permissions: r.permissions.map((p) => p._id),
          isActive: !r.isActive,
        }),
      ).unwrap(),
    (id, isActive) => setView((v) => (v && v._id === id ? { ...v, isActive } : v)),
  );

  const editPath = (id?: string) => `/app/settings/roles/add-edit${id ? `/${id}` : ''}`;

  return (
    <ListPage<Role>
      embedded
      title="Roles"
      description="Groups of permissions you assign to users."
      entity={{ singular: 'role', plural: 'roles' }}
      searchPlaceholder="Search roles"
      filters={FILTERS}
      records={items}
      total={total}
      rowKey={(r) => r._id}
      rowName={(r) => r.name}
      defaultSort={{ key: 'name', dir: 'asc' }}
      load={({ page, limit, searchText, sortBy, sortType, filters }) =>
        dispatch(
          fetchRoles({ page, limit, searchText, status: filters.status, sortBy, sortType }),
        ).unwrap()
      }
      createLabel="New role"
      onCreate={can('role:create') ? () => navigate(editPath()) : undefined}
      onView={setView}
      onEdit={can('role:update') ? (role) => navigate(editPath(role._id)) : undefined}
      remove={
        can('role:delete')
          ? {
              title: 'Delete role?',
              describe: (r) => (
                <>
                  This permanently removes the <strong>{r.name}</strong> role. Users who hold it
                  lose its permissions.
                </>
              ),
              run: (r) => dispatch(deleteRole(r._id)).unwrap(),
              done: 'Role deleted.',
            }
          : undefined
      }
      columns={[
        {
          key: 'name',
          header: 'Name',
          sortable: true,
          primary: true,
          render: (r) => <b style={{ fontWeight: 500 }}>{r.name}</b>,
        },
        { key: 'access', header: 'Access', render: (r) => accessLabel(r) },
        {
          key: 'status',
          header: 'Status',
          badge: true,
          render: (r) => <ActiveBadge active={r.isActive} />,
        },
      ]}
    >
      {() => (
        <DetailDialog
          opened={!!view}
          onClose={() => setView(null)}
          title={view?.name ?? ''}
          subtitle={view ? `Role · since ${formatDate(view.createdAt)}` : undefined}
          actions={
            view &&
            can('role:update') && (
              <Button
                leftSection={<IconPencil size={16} aria-hidden />}
                onClick={() => navigate(editPath(view._id))}
              >
                Edit role
              </Button>
            )
          }
        >
          {view && (
            <>
              <Text className="eyebrow" mb="xs">
                Permissions
              </Text>
              {view.permissions.length ? (
                Object.entries(groupPermissionsByModule(view.permissions)).map(
                  ([module, actions], i) => (
                    <Fragment key={module}>
                      {i > 0 && <Divider my={8} />}
                      <Group justify="space-between" wrap="nowrap" align="flex-start">
                        <Text size="sm" fw={500}>
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
                <Text size="sm">—</Text>
              )}
              <StatusSection
                label="STATUS"
                title="Active role"
                description="Inactive roles can't be given to users."
                checked={view.isActive}
                disabled={busyId === view._id || !can('role:update')}
                onChange={() => toggle(view)}
              />
            </>
          )}
        </DetailDialog>
      )}
    </ListPage>
  );
};

export default RolesPage;
