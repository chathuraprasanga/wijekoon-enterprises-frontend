import { IconMail, IconPhone } from '@tabler/icons-react';
import { useState } from 'react';
import { SimpleGrid, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FormModal } from '@/components/FormModal';
import { useErrorSummary } from '@/hooks/useErrorSummary';
import { useAppDispatch } from '@/store/hooks';
import { type Customer, createCustomer, updateCustomer } from '@/store/customerSlice/customerSlice';
import { optionalEmail, phone, required, digitsOnly } from '@/utils/validators';
import { toNotify } from '@/hooks/toNotify';

type CustomerFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

type Props = {
  opened: boolean;
  customer: Customer | null;
  onClose: () => void;
};

export const AddEditCustomerModal = ({ opened, customer, onClose }: Props) =>
  opened ? (
    <AddEditCustomerForm key={customer?._id ?? 'new'} customer={customer} onClose={onClose} />
  ) : null;

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
      firstName: required('First name is required.'),
      phone: phone,
      email: optionalEmail,
    },
  });

  const handleSubmit = async (values: CustomerFormValues) => {
    setLoading(true);
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim() || null,
      email: values.email.trim() || null,
      phone: digitsOnly(values.phone),
      address: values.address.trim() || null,
    };
    try {
      if (customer) {
        await dispatch(updateCustomer({ _id: customer._id, ...payload })).unwrap();
        toNotify(
          'Customer saved',
          `${payload.firstName} ${payload.lastName ?? ''}`.trim() + ' was updated.',
          'SUCCESS',
        );
      } else {
        await dispatch(createCustomer(payload)).unwrap();
        toNotify(
          'Customer added',
          `${payload.firstName} ${payload.lastName ?? ''}`.trim() + ' was added.',
          'SUCCESS',
        );
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

  const errorLabels = useErrorSummary(form, {
    firstName: 'First name',
    phone: 'Phone',
    email: 'Email',
  });

  return (
    <FormModal
      opened
      title={customer ? 'Edit customer' : 'Add customer'}
      subject={customer ? `${customer.firstName} ${customer.lastName ?? ''}`.trim() : undefined}
      submitLabel={customer ? 'Save customer' : 'Create customer'}
      loading={loading}
      dirty={form.isDirty()}
      errorLabels={errorLabels}
      onSubmit={form.onSubmit(handleSubmit)}
      onClose={onClose}
    >
      <SimpleGrid cols={{ base: 1, xs: 2 }}>
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
      </SimpleGrid>
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
        type="email"
        autoComplete="email"
        placeholder="name@example.lk"
        leftSection={<IconMail size={16} aria-hidden />}
        {...form.getInputProps('email')}
      />
      <TextInput label="Address" placeholder="Enter address" {...form.getInputProps('address')} />
    </FormModal>
  );
};
