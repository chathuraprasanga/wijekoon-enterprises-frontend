import { IconMail, IconPhone } from '@tabler/icons-react';
import { useState } from 'react';
import { Input, SegmentedControl, SimpleGrid, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FormModal } from '@/components/FormModal';
import { LocationPicker, type LatLng } from '@/components/LocationPicker';
import { useErrorSummary } from '@/hooks/useErrorSummary';
import { useAppDispatch } from '@/store/hooks';
import {
  CUSTOMER_TYPE_LABELS,
  type Customer,
  type CustomerType,
  createCustomer,
  updateCustomer,
} from '@/store/customerSlice/customerSlice';
import { optionalEmail, phone, digitsOnly } from '@/utils/validators';
import { toNotify } from '@/hooks/toNotify';

type CustomerFormValues = {
  customerType: CustomerType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  location: LatLng | null;
};

type Props = {
  opened: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSaved?: () => void;
};

export const AddEditCustomerModal = ({ opened, customer, onClose, onSaved }: Props) =>
  opened ? (
    <AddEditCustomerForm
      key={customer?._id ?? 'new'}
      customer={customer}
      onClose={onClose}
      onSaved={onSaved}
    />
  ) : null;

type FormProps = {
  customer: Customer | null;
  onClose: () => void;
  onSaved?: () => void;
};

const AddEditCustomerForm = ({ customer, onClose, onSaved }: FormProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const form = useForm<CustomerFormValues>({
    initialValues: {
      customerType: customer?.customerType ?? 'HARDWARE_STORE',
      firstName: customer?.firstName ?? '',
      lastName: customer?.lastName ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      address: customer?.address ?? '',
      location: customer?.location
        ? { lat: customer.location.lat, lng: customer.location.lng }
        : null,
    },
    validate: {
      firstName: (v, values) =>
        v.trim()
          ? null
          : values.customerType === 'HARDWARE_STORE'
            ? 'Name is required.'
            : 'First name is required.',
      phone: phone,
      email: optionalEmail,
    },
  });

  const handleSubmit = async (values: CustomerFormValues) => {
    setLoading(true);
    const payload = {
      customerType: values.customerType,
      firstName: values.firstName.trim(),
      lastName: values.customerType === 'HARDWARE_STORE' ? null : values.lastName.trim() || null,
      email: values.email.trim() || null,
      phone: digitsOnly(values.phone),
      address: values.address.trim() || null,
      location: values.location, // null clears it; the server derives h3index
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
      onSaved?.();
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

  const isStore = form.values.customerType === 'HARDWARE_STORE';

  const errorLabels = useErrorSummary(form, {
    firstName: isStore ? 'Name' : 'First name',
    phone: 'Phone',
    email: 'Email',
  });

  return (
    <FormModal
      opened
      title={customer ? 'Edit customer' : 'Add customer'}
      subject={customer ? `${customer.firstName} ${customer.lastName ?? ''}`.trim() : undefined}
      size="lg"
      submitLabel={customer ? 'Save customer' : 'Create customer'}
      loading={loading}
      dirty={form.isDirty()}
      errorLabels={errorLabels}
      onSubmit={form.onSubmit(handleSubmit)}
      onClose={onClose}
    >
      <Input.Wrapper label="Customer type">
        <SegmentedControl
          fullWidth
          mt={4}
          data={Object.entries(CUSTOMER_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          {...form.getInputProps('customerType')}
        />
      </Input.Wrapper>
      {isStore ? (
        <TextInput
          label="Name"
          withAsterisk
          placeholder="Enter store name"
          {...form.getInputProps('firstName')}
        />
      ) : (
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
      )}
      <TextInput
        label="Phone"
        withAsterisk
        inputMode="tel"
        autoComplete="tel"
        placeholder="Enter phone number"
        description="Sri Lankan mobile, 07X XXXXXXX."
        leftSection={<IconPhone size={16} aria-hidden />}
        {...form.getInputProps('phone')}
      />
      <TextInput
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="Enter email address"
        leftSection={<IconMail size={16} aria-hidden />}
        {...form.getInputProps('email')}
      />
      <Textarea
        label="Address"
        placeholder="Enter address"
        autosize
        minRows={2}
        maxRows={4}
        {...form.getInputProps('address')}
      />
      <LocationPicker
        value={form.values.location}
        onChange={(v) => form.setFieldValue('location', v)}
        customerType={form.values.customerType}
      />
    </FormModal>
  );
};
