import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { updateUser } from '@/features/users/usersApi';
import { notifyError, notifySuccess } from '@/utils/notify';
import type { SafeUser } from '@/types/user';

interface EditUserFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface EditUserModalProps {
  opened: boolean;
  onClose: () => void;
  onUpdated: () => void;
  user: SafeUser;
}

export const EditUserModal = ({ opened, onClose, onUpdated, user }: EditUserModalProps) => {
  const form = useForm<EditUserFormValues>({
    initialValues: {
      firstName: user.firstName,
      lastName: user.lastName ?? '',
      phone: user.phone,
      email: user.email,
    },
    validate: {
      firstName: (value) => (value.trim() ? null : 'First name is required'),
      phone: (value) =>
        !value || /^\+?[0-9]{7,15}$/.test(value) ? null : 'Enter a valid phone number',
      email: (value) => (!value || /^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email'),
    },
  });

  const handleSubmit = async (values: EditUserFormValues) => {
    try {
      await updateUser(user.id, { ...values, lastName: values.lastName || undefined });
      notifySuccess('User updated successfully.');
      onUpdated();
      onClose();
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit user">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput label="First name" placeholder="John" {...form.getInputProps('firstName')} />
          <TextInput label="Last name" placeholder="Doe" {...form.getInputProps('lastName')} />
          <TextInput label="Phone" placeholder="+94771234567" {...form.getInputProps('phone')} />
          <TextInput label="Email" placeholder="you@example.com" {...form.getInputProps('email')} />
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
