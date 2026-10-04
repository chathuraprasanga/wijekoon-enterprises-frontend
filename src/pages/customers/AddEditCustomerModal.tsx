import { useState } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAppDispatch } from '@/store/hooks';
import { type Customer, createCustomer, updateCustomer } from '@/store/customerSlice/customerSlice';
import { toNotify } from '@/hooks/toNotify';

type CustomerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(070|071|072|074|075|076|077|078)\d{7}$/;

type Props = {
  opened: boolean;
  customer: Customer | null;
  onClose: () => void;
};

export const AddEditCustomerModal = ({ opened, customer, onClose }: Props) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={customer ? 'Edit customer' : 'Add customer'}
      centered
    >
      {opened && (
        <AddEditCustomerForm key={customer?._id ?? 'new'} customer={customer} onClose={onClose} />
      )}
    </Modal>
  );
};

type FormProps = {
  customer: Customer | null;
  onClose: () => void;
};

const AddEditCustomerForm = ({ customer, onClose }: FormProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const form = useForm<CustomerFormValues>({
    initialValues: {
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      address: customer?.address ?? '',
    },
    validate: {
      firstName: (value) => (value.trim() ? null : 'First name is required'),
      phone: (value) => (PHONE_REGEX.test(value) ? null : 'Enter a valid 10-digit mobile number'),
      email: (value) => (!value || EMAIL_REGEX.test(value) ? null : 'Enter a valid email address'),
    },
  });

  const handleSubmit = async (values: CustomerFormValues) => {
    setLoading(true);
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim() || null,
      email: values.email.trim() || null,
      phone: values.phone.trim(),
      address: values.address.trim() || null,
    };
    try {
      if (customer) {
        await dispatch(updateCustomer({ _id: customer._id, ...payload })).unwrap();
        toNotify('Updated', 'Customer updated successfully', 'SUCCESS');
      } else {
        await dispatch(createCustomer(payload)).unwrap();
        toNotify('Created', 'Customer created successfully', 'SUCCESS');
      }
      onClose();
    } catch (error) {
      toNotify(
        customer ? 'Failed to update customer' : 'Failed to create customer',
        error as string,
        'ERROR',
      );
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
          placeholder="Enter email address"
          {...form.getInputProps('email')}
        />
        <TextInput label="Address" placeholder="Enter address" {...form.getInputProps('address')} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {customer ? 'Save changes' : 'Create customer'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
