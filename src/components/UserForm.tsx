import { Button, Group, Select, Stack, Switch, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { UserRole } from '@/store/userSlice/userSlice';

export type UserFormValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  role: UserRole | '';
  isActive: boolean;
};

export type UserFormProps = {
  mode: 'create' | 'edit';
  initialValues?: UserFormValues;
  onSubmit: (values: UserFormValues) => void;
  loading: boolean;
};

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OWNER', label: 'Owner' },
  { value: 'SALES_MANAGER', label: 'Sales Manager' },
];

const EMPTY_VALUES: UserFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  role: '',
  isActive: true,
};

export const UserForm = ({ mode, initialValues, onSubmit, loading }: UserFormProps) => {
  const form = useForm<UserFormValues>({
    initialValues: initialValues ?? EMPTY_VALUES,
    validate: {
      firstName: (value) => (value.trim() ? null : 'First name is required'),
      phone: (value) => (value.trim() ? null : 'Phone is required'),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Enter a valid email'),
      role: (value) => (value ? null : 'Role is required'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md">
        <Group grow>
          <TextInput
            label="First name"
            placeholder="Enter first name"
            {...form.getInputProps('firstName')}
          />
          <TextInput
            label="Last name"
            placeholder="Enter last name"
            {...form.getInputProps('lastName')}
          />
        </Group>
        <Group grow>
          <TextInput label="Email" placeholder="Enter email" {...form.getInputProps('email')} />
          <TextInput label="Phone" placeholder="Enter phone" {...form.getInputProps('phone')} />
        </Group>
        <Select
          label="Role"
          placeholder="Select role"
          data={ROLE_OPTIONS}
          {...form.getInputProps('role')}
        />
        {mode === 'edit' && (
          <Switch
            label="Active"
            checked={form.values.isActive}
            onChange={(event) => form.setFieldValue('isActive', event.currentTarget.checked)}
          />
        )}
        <Group justify="flex-end" mt="xs">
          <Button type="submit" loading={loading}>
            {mode === 'create' ? 'Create user' : 'Save changes'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
