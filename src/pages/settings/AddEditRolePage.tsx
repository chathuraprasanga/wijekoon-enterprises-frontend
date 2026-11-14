import { useEffect, useState } from 'react';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Checkbox, Group, Stack, Table, Text, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useForm } from '@mantine/form';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createRole, fetchRoleById, updateRole } from '@/store/roleSlice/roleSlice';
import { fetchPermissions } from '@/store/permissionSlice/permissionSlice';
import type { Permission } from '@/store/permissionSlice/permissionSlice';
import { toNotify } from '@/hooks/toNotify';
import { required } from '@/utils/validators';
import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_ACTION_ORDER,
  formatModuleLabel,
} from '@/utils/permissionLabels';

type RoleFormValues = { name: string; permissions: string[] };

const findPermission = (modulePermissions: Permission[], action: string) =>
  modulePermissions.find((permission) => permission.action === action);

const AddEditRolePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.role.selected);
  const permissions = useAppSelector((state) => state.permission.items);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const stacked = useMediaQuery('(max-width: 47.99em)');

  const form = useForm<RoleFormValues>({
    initialValues: { name: '', permissions: [] },
    validate: { name: required('Role name is required.') },
  });

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    if (id) dispatch(fetchRoleById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (id && selected && selected._id === id) {
      form.setValues({ name: selected.name, permissions: selected.permissions });
      form.resetDirty({ name: selected.name, permissions: selected.permissions });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selected]);

  // Leaving with unsaved edits asks first.
  const dirty = form.isDirty() && !saved;
  const blocker = useBlocker(dirty);

  const permissionsByModule = permissions.reduce<Record<string, Permission[]>>((groups, p) => {
    (groups[p.module] ??= []).push(p);
    return groups;
  }, {});

  const togglePermission = (modulePermissions: Permission[], action: string) => {
    const permission = findPermission(modulePermissions, action);
    if (!permission) return;
    const current = new Set(form.values.permissions);
    if (current.has(permission._id)) {
      current.delete(permission._id);
    } else {
      current.add(permission._id);
      // Create, edit and delete always include View.
      if (action !== 'read') {
        const view = findPermission(modulePermissions, 'read');
        if (view) current.add(view._id);
      }
    }
    form.setFieldValue('permissions', Array.from(current));
  };

  const isViewLocked = (modulePermissions: Permission[]) =>
    ['create', 'update', 'delete'].some((action) => {
      const permission = findPermission(modulePermissions, action);
      return permission && form.values.permissions.includes(permission._id);
    });

  const handleSubmit = async (values: RoleFormValues) => {
    setLoading(true);
    const payload = { name: values.name.trim(), permissions: values.permissions };
    try {
      if (id) {
        await dispatch(updateRole({ _id: id, ...payload })).unwrap();
        toNotify('Role saved', `${payload.name} was updated.`, 'SUCCESS');
      } else {
        await dispatch(createRole(payload)).unwrap();
        toNotify('Role saved', `${payload.name} was created.`, 'SUCCESS');
      }
      setSaved(true);
      // Navigate after state settles so the blocker no longer sees unsaved edits.
      setTimeout(() => navigate('/app/settings/roles'), 0);
    } catch (error) {
      toNotify("Couldn't save role", error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  const title = id ? 'Edit role' : 'New role';
  const roleName = id ? (selected?.name ?? 'Role') : 'New role';
  const modules = Object.entries(permissionsByModule);

  return (
    <>
      <PageHeader
        title={title}
        badge={
          dirty ? (
            <StatusBadge tone="warning" label="Unsaved changes" icon={IconAlertTriangle} />
          ) : undefined
        }
        description="Choose what people with this role can see and change."
        crumbs={[
          { label: 'Administration' },
          { label: 'Settings', to: '/app/settings/profile' },
          { label: 'Roles', to: '/app/settings/roles' },
          { label: roleName },
        ]}
      />
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="md">
          <SectionCard title="Role details">
            <TextInput
              label="Role name"
              withAsterisk
              maw={420}
              placeholder="e.g. Cashier"
              {...form.getInputProps('name')}
            />
          </SectionCard>
          <SectionCard title="Permissions" flush>
            <Group gap="xs" align="flex-start" wrap="nowrap" p="md" c="dimmed">
              <IconInfoCircle size={18} aria-hidden style={{ flex: 'none', marginTop: 1 }} />
              <Text size="sm">
                Create, Edit and Delete include View automatically, so View stays on and can&apos;t
                be turned off while any of them is on.
              </Text>
            </Group>
            {stacked ? (
              <Stack gap="md" p="md" pt={0}>
                {modules.map(([module, modulePermissions]) => (
                  <Box
                    key={module}
                    p="md"
                    style={{ border: '1px solid var(--ldg-border)', borderRadius: 8 }}
                  >
                    <Text fw={600} mb="sm">
                      {formatModuleLabel(module)}
                    </Text>
                    <Stack gap="md">
                      {PERMISSION_ACTION_ORDER.map((action) => {
                        const permission = findPermission(modulePermissions, action);
                        if (!permission) return null;
                        return (
                          <Checkbox
                            key={action}
                            label={PERMISSION_ACTION_LABELS[action]}
                            checked={form.values.permissions.includes(permission._id)}
                            disabled={action === 'read' && isViewLocked(modulePermissions)}
                            onChange={() => togglePermission(modulePermissions, action)}
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Table.ScrollContainer minWidth={520} type="native">
                <Table
                  styles={{
                    th: {
                      background: 'var(--ldg-surface-sunken)',
                      borderTop: '1px solid var(--ldg-border)',
                      borderBottom: '1px solid var(--ldg-border)',
                      height: 40,
                      fontSize: 13,
                      fontWeight: 600,
                    },
                    td: { borderBottom: '1px solid var(--ldg-border)', height: 52 },
                  }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Module</Table.Th>
                      {PERMISSION_ACTION_ORDER.map((action) => (
                        <Table.Th key={action} ta="center">
                          {PERMISSION_ACTION_LABELS[action]}
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {modules.map(([module, modulePermissions]) => (
                      <Table.Tr key={module}>
                        <Table.Td fw={500}>{formatModuleLabel(module)}</Table.Td>
                        {PERMISSION_ACTION_ORDER.map((action) => {
                          const permission = findPermission(modulePermissions, action);
                          if (!permission) return <Table.Td key={action} />;
                          return (
                            <Table.Td key={action}>
                              <Group justify="center">
                                <Checkbox
                                  aria-label={`${PERMISSION_ACTION_LABELS[action]} ${formatModuleLabel(module)}`}
                                  checked={form.values.permissions.includes(permission._id)}
                                  disabled={action === 'read' && isViewLocked(modulePermissions)}
                                  onChange={() => togglePermission(modulePermissions, action)}
                                />
                              </Group>
                            </Table.Td>
                          );
                        })}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </SectionCard>
          <Group
            justify="flex-end"
            gap="xs"
            pt="md"
            style={{ borderTop: '1px solid var(--ldg-border)' }}
          >
            <Button
              variant="default"
              onClick={() => navigate('/app/settings/roles')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {id ? 'Save changes' : 'Create role'}
            </Button>
          </Group>
        </Stack>
      </form>
      <ConfirmDialog
        opened={blocker.state === 'blocked'}
        title="Discard unsaved changes?"
        destructive={false}
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onClose={() => blocker.state === 'blocked' && blocker.reset()}
        onConfirm={() => blocker.state === 'blocked' && blocker.proceed()}
      >
        Your edits to this role have not been saved and will be lost.
      </ConfirmDialog>
    </>
  );
};

export default AddEditRolePage;
