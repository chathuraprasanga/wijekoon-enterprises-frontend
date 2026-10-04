import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Checkbox, Group, Paper, Stack, Table, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { PageHeader } from '@/components/PageHeader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createRole, fetchRoleById, updateRole } from '@/store/roleSlice/roleSlice';
import { fetchPermissions } from '@/store/permissionSlice/permissionSlice';
import type { Permission } from '@/store/permissionSlice/permissionSlice';
import { toNotify } from '@/hooks/toNotify';
import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_ACTION_ORDER,
  formatModuleLabel,
} from '@/utils/permissionLabels';

type RoleFormValues = {
  name: string;
  permissions: string[];
};

const findPermission = (modulePermissions: Permission[], action: string) =>
  modulePermissions.find((permission) => permission.action === action);

const AddEditRolePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.role.selected);
  const permissions = useAppSelector((state) => state.permission.items);
  const [loading, setLoading] = useState(false);

  const form = useForm<RoleFormValues>({
    initialValues: { name: '', permissions: [] },
    validate: {
      name: (value) => (value.trim() ? null : 'Role name is required'),
    },
  });

  useEffect(() => {
    dispatch(fetchPermissions());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchRoleById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && selected && selected._id === id) {
      form.setValues({
        name: selected.name,
        permissions: selected.permissions,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selected]);

  const permissionsByModule = permissions.reduce<Record<string, Permission[]>>(
    (groups, permission) => {
      (groups[permission.module] ??= []).push(permission);
      return groups;
    },
    {},
  );

  const togglePermission = (modulePermissions: Permission[], action: string) => {
    const permission = findPermission(modulePermissions, action);
    if (!permission) return;

    const current = new Set(form.values.permissions);
    const isChecked = current.has(permission._id);

    if (action === 'read') {
      // Only reachable when not locked (see disabled check below), i.e. no
      // other action is checked for this module.
      if (isChecked) current.delete(permission._id);
      else current.add(permission._id);
    } else if (isChecked) {
      current.delete(permission._id);
    } else {
      current.add(permission._id);
      const viewPermission = findPermission(modulePermissions, 'read');
      if (viewPermission) current.add(viewPermission._id);
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
        toNotify('Updated', 'Role updated successfully', 'SUCCESS');
      } else {
        await dispatch(createRole(payload)).unwrap();
        toNotify('Created', 'Role created successfully', 'SUCCESS');
      }
      navigate('/app/settings/roles');
    } catch (error) {
      toNotify(id ? 'Failed to update role' : 'Failed to create role', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <PageHeader
        title={id ? 'Edit role' : 'Add role'}
        description={id ? 'Update this role’s details.' : 'Create a new role.'}
        onBack={() => navigate('/app/settings/roles')}
      />
      <Paper withBorder p="md" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Stack maw={600}>
              <TextInput
                label="Name"
                withAsterisk
                placeholder="Enter role name"
                {...form.getInputProps('name')}
              />
            </Stack>
            <Stack gap={4}>
              <Table withTableBorder withRowBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ verticalAlign: 'middle' }}>Module</Table.Th>
                    {PERMISSION_ACTION_ORDER.map((action) => (
                      <Table.Th key={action} ta="center" style={{ verticalAlign: 'middle' }}>
                        {PERMISSION_ACTION_LABELS[action]}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                    <Table.Tr key={module}>
                      <Table.Td fw={600} style={{ verticalAlign: 'middle' }}>
                        {formatModuleLabel(module)}
                      </Table.Td>
                      {PERMISSION_ACTION_ORDER.map((action) => {
                        const permission = findPermission(modulePermissions, action);
                        if (!permission)
                          return <Table.Td key={action} style={{ verticalAlign: 'middle' }} />;
                        return (
                          <Table.Td key={action} style={{ verticalAlign: 'middle' }}>
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
            </Stack>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => navigate('/app/settings/roles')}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {id ? 'Save changes' : 'Create role'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
};

export default AddEditRolePage;
