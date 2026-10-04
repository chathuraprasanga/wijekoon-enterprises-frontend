import { useEffect, useState } from 'react';
import { Button, Group, Modal, MultiSelect, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { type User, createUser, updateUser } from '@/store/userSlice/userSlice';
import { fetchRoles } from '@/store/roleSlice/roleSlice';
import { toNotify } from '@/hooks/toNotify';

type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  roles: string[];
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(070|071|072|074|075|076|077|078)\d{7}$/;

type Props = {
  opened: boolean;
  user: User | null;
  onClose: () => void;
};

export const AddEditUserModal = ({ opened, user, onClose }: Props) => {
  return (
    <Modal opened={opened} onClose={onClose} title={user ? 'Edit user' : 'Add user'} centered>
      {opened && <AddEditUserForm key={user?._id ?? 'new'} user={user} onClose={onClose} />}
    </Modal>
  );
};

type FormProps = {
  user: User | null;
  onClose: () => void;
};

const AddEditUserForm = ({ user, onClose }: FormProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const roles = useAppSelector((state) => state.role.items);

  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 100 }));
  }, [dispatch]);

  const form = useForm<UserFormValues>({
    initialValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
      roles: user?.roles ?? [],
    },
    validate: {
      firstName: (value) => (value.trim() ? null : 'First name is required'),
      phone: (value) => (PHONE_REGEX.test(value) ? null : 'Enter a valid 10-digit mobile number'),
      email: (value) => (EMAIL_REGEX.test(value) ? null : 'Enter a valid email address'),
      roles: (value) => (value.length ? null : 'At least one role is required'),
    },
  });

  const handleSubmit = async (values: UserFormValues) => {
    setLoading(true);
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim() || null,
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim() || null,
      roles: values.roles,
    };
    try {
      if (user) {
        await dispatch(updateUser({ _id: user._id, ...payload })).unwrap();
        toNotify('Updated', 'User updated successfully', 'SUCCESS');
      } else {
        await dispatch(createUser(payload)).unwrap();
        toNotify(
          'Created',
          'User created successfully. Their login details have been emailed to them.',
          'SUCCESS',
        );
      }
      onClose();
    } catch (error) {
      toNotify(user ? 'Failed to update user' : 'Failed to create user', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="First name"
          withAsterisk
          placeholder="Enter first name"
          {...form.getInputProps('firstName')}
        />
        <TextInput
          label="Last name"
          placeholder="Enter last name"
          {...form.getInputProps('lastName')}
        />
        <TextInput
          label="Phone"
          withAsterisk
          placeholder="07XXXXXXXX"
          {...form.getInputProps('phone')}
        />
        <TextInput
          label="Email"
          withAsterisk
          placeholder="Enter email address"
          {...form.getInputProps('email')}
        />
        <TextInput label="Address" placeholder="Enter address" {...form.getInputProps('address')} />
        <MultiSelect
          label="Roles"
          withAsterisk
          placeholder="Select roles"
          data={roles.map((role) => ({ value: role._id, label: role.name }))}
          searchable
          clearable
          comboboxProps={{
            position: 'top',
            middlewares: { flip: true, shift: true },
            withinPortal: true,
          }}
          {...form.getInputProps('roles')}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {user ? 'Save changes' : 'Create user'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
