import { Button, Group, Modal, Select, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { changeUserRole } from '@/features/users/usersApi';
import { ASSIGNABLE_ROLES } from '@/features/users/constants';
import { notifyError, notifySuccess } from '@/utils/notify';
import type { Role, SafeUser } from '@/types/user';

interface ChangeRoleFormValues {
  role: Role;
}

interface ChangeRoleModalProps {
  opened: boolean;
  onClose: () => void;
  onChanged: () => void;
  user: SafeUser;
}

export const ChangeRoleModal = ({ opened, onClose, onChanged, user }: ChangeRoleModalProps) => {
  const form = useForm<ChangeRoleFormValues>({
    initialValues: { role: user.role === 'SUPER_ADMIN' ? 'ADMIN' : user.role },
  });

  const handleSubmit = async (values: ChangeRoleFormValues) => {
    try {
      await changeUserRole(user.id, values.role);
      notifySuccess('Role updated successfully.');
      onChanged();
      onClose();
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Change role">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Select
            label="Role"
            placeholder="Select a role"
            data={ASSIGNABLE_ROLES}
            value={form.values.role}
            onChange={(value) => form.setFieldValue('role', value as Role)}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={form.submitting}>
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
