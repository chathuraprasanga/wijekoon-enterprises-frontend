import { IconMail, IconPhone } from '@tabler/icons-react';
import { useState } from 'react';
import { SimpleGrid, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FormModal } from '@/components/FormModal';
import { useErrorSummary } from '@/hooks/useErrorSummary';
import { useAppDispatch } from '@/store/hooks';
import { type Supplier, createSupplier, updateSupplier } from '@/store/supplierSlice/supplierSlice';
import { optionalEmail, phone, required, digitsOnly } from '@/utils/validators';
import { toNotify } from '@/hooks/toNotify';

type SupplierFormValues = {
  name: string;
  phone: string;
  email: string;
  address: string;
  chequeIssuedName: string;
};

type Props = {
  opened: boolean;
  supplier: Supplier | null;
  onClose: () => void;
};

export const AddEditSupplierModal = ({ opened, supplier, onClose }: Props) =>
  opened ? (
    <AddEditSupplierForm key={supplier?._id ?? 'new'} supplier={supplier} onClose={onClose} />
  ) : null;

type FormProps = {
  supplier: Supplier | null;
  onClose: () => void;
};

const AddEditSupplierForm = ({ supplier, onClose }: FormProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const form = useForm<SupplierFormValues>({
    initialValues: {
      name: supplier?.name ?? '',
      phone: supplier?.phone ?? '',
      email: supplier?.email ?? '',
      address: supplier?.address ?? '',
      chequeIssuedName: supplier?.chequeIssuedName ?? '',
    },
    validate: {
      name: required('Name is required.'),
      phone: phone,
      email: optionalEmail,
    },
  });

  const handleSubmit = async (values: SupplierFormValues) => {
    setLoading(true);
    const payload = {
      name: values.name.trim(),
      phone: digitsOnly(values.phone),
      email: values.email.trim() || null,
      address: values.address.trim() || null,
      chequeIssuedName: values.chequeIssuedName.trim() || null,
    };
    try {
      if (supplier) {
        await dispatch(updateSupplier({ _id: supplier._id, ...payload })).unwrap();
        toNotify('Supplier saved', `${payload.name} was updated.`, 'SUCCESS');
      } else {
        await dispatch(createSupplier(payload)).unwrap();
        toNotify('Supplier added', `${payload.name} was added.`, 'SUCCESS');
      }
      onClose();
    } catch (error) {
      toNotify(
        supplier ? 'Failed to update supplier' : 'Failed to create supplier',
        error as string,
        'ERROR',
      );
    } finally {
      setLoading(false);
    }
  };

  const errorLabels = useErrorSummary(form, {
    name: 'Supplier name',
    phone: 'Phone',
    email: 'Email',
  });

  return (
    <FormModal
      opened
      title={supplier ? 'Edit supplier' : 'Add supplier'}
      subject={supplier?.name}
      submitLabel={supplier ? 'Save supplier' : 'Create supplier'}
      loading={loading}
      dirty={form.isDirty()}
      errorLabels={errorLabels}
      onSubmit={form.onSubmit(handleSubmit)}
      onClose={onClose}
    >
      <TextInput
        label="Supplier name"
        withAsterisk
        placeholder="Enter the supplier name"
        {...form.getInputProps('name')}
      />
      <SimpleGrid cols={{ base: 1, xs: 2 }}>
        <TextInput
          label="Phone"
          withAsterisk
          inputMode="tel"
          autoComplete="tel"
          placeholder="Enter phone number"
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
      </SimpleGrid>
      <Textarea
        label="Address"
        placeholder="Enter address"
        autosize
        minRows={2}
        maxRows={4}
        {...form.getInputProps('address')}
      />
      <TextInput
        label="Cheque issued name"
        placeholder="Enter the cheque issued name"
        description="The payee name written on cheques you issue to this supplier."
        {...form.getInputProps('chequeIssuedName')}
      />
    </FormModal>
  );
};
