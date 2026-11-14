import { IconMail, IconPhone } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { MultiSelect, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FormModal } from '@/components/FormModal';
import { useErrorSummary } from '@/hooks/useErrorSummary';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { type User, createUser, updateUser } from '@/store/userSlice/userSlice';
import { fetchRoles } from '@/store/roleSlice/roleSlice';
import { email, phone, required, digitsOnly } from '@/utils/validators';
import { toNotify } from '@/hooks/toNotify';

type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  roles: string[];
};

type Props = {
  opened: boolean;
  user: User | null;
  onClose: () => void;
};

export const AddEditUserModal = ({ opened, user, onClose }: Props) =>
  opened ? <AddEditUserForm key={user?._id ?? 'new'} user={user} onClose={onClose} /> : null;

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
      firstName: required('First name is required.'),
      phone: phone,
      email: email,
      roles: (value) => (value.length ? null : 'At least one role is required'),
    },
  });

  const handleSubmit = async (values: UserFormValues) => {
    setLoading(true);
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim() || null,
      email: values.email.trim(),
      phone: digitsOnly(values.phone),
      address: values.address.trim() || null,
      roles: values.roles,
    };
    try {
      if (user) {
        await dispatch(updateUser({ _id: user._id, ...payload })).unwrap();
        toNotify('User saved', `${payload.firstName} was updated.`, 'SUCCESS');
      } else {
        await dispatch(createUser(payload)).unwrap();
        toNotify(
          'User added',
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

  const errorLabels = useErrorSummary(form, {
    firstName: 'First name',
    phone: 'Phone',
    email: 'Email',
  });

  return (
    <FormModal
      opened
      title={user ? 'Edit user' : 'Add user'}
      subject={user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : undefined}
      size="md"
      submitLabel={user ? 'Save changes' : 'Create user'}
      loading={loading}
      dirty={form.isDirty()}
      errorLabels={errorLabels}
      onSubmit={form.onSubmit(handleSubmit)}
      onClose={onClose}
    >
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
        inputMode="tel"
        autoComplete="tel"
        placeholder="077 123 4567"
        description="Sri Lankan mobile, 07X XXXXXXX."
        leftSection={<IconPhone size={16} aria-hidden />}
        {...form.getInputProps('phone')}
      />
      <TextInput
        label="Email"
        withAsterisk
        placeholder="name@example.lk"
        type="email"
        autoComplete="email"
        leftSection={<IconMail size={16} aria-hidden />}
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
    </FormModal>
  );
};
