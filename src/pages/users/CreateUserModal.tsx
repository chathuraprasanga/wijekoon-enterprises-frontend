import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { createUser } from '@/features/users/usersApi';
import { ASSIGNABLE_ROLES } from '@/features/users/constants';
import { notifyError, notifySuccess } from '@/utils/notify';
import type { Role } from '@/types/user';

interface CreateUserFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: Role | '';
}

interface CreateUserModalProps {
  opened: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateUserModal = ({ opened, onClose, onCreated }: CreateUserModalProps) => {
  const form = useForm<CreateUserFormValues>({
    initialValues: { firstName: '', lastName: '', phone: '', email: '', role: '' },
    validate: {
      firstName: (value) => (value.trim() ? null : 'First name is required'),
      phone: (value) => (/^\+?[0-9]{7,15}$/.test(value) ? null : 'Enter a valid phone number'),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email'),
      role: (value) => (value ? null : 'Role is required'),
    },
  });

  const handleSubmit = async (values: CreateUserFormValues) => {
    try {
      await createUser({
        ...values,
        lastName: values.lastName || undefined,
        role: values.role as Role,
      });
      notifySuccess('User created successfully.');
      form.reset();
      onCreated();
      onClose();
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create user">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput label="First name" placeholder="John" {...form.getInputProps('firstName')} />
          <TextInput label="Last name" placeholder="Doe" {...form.getInputProps('lastName')} />
          <TextInput label="Phone" placeholder="+94771234567" {...form.getInputProps('phone')} />
          <TextInput label="Email" placeholder="you@example.com" {...form.getInputProps('email')} />
          <Select
            label="Role"
            placeholder="Select a role"
            data={ASSIGNABLE_ROLES}
            {...form.getInputProps('role')}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={form.submitting}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
