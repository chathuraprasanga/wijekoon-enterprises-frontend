import { useState } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAppDispatch } from '@/store/hooks';
import { type Supplier, createSupplier, updateSupplier } from '@/store/supplierSlice/supplierSlice';
import { toNotify } from '@/hooks/toNotify';

type SupplierFormValues = {
  name: string;
  phone: string;
  email: string;
  address: string;
  chequeIssuedName: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(070|071|072|074|075|076|077|078)\d{7}$/;

type Props = {
  opened: boolean;
  supplier: Supplier | null;
  onClose: () => void;
};

export const AddEditSupplierModal = ({ opened, supplier, onClose }: Props) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={supplier ? 'Edit supplier' : 'Add supplier'}
      centered
    >
      {opened && (
        <AddEditSupplierForm key={supplier?._id ?? 'new'} supplier={supplier} onClose={onClose} />
      )}
    </Modal>
  );
};

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
      name: (value) => (value.trim() ? null : 'Name is required'),
      phone: (value) => (PHONE_REGEX.test(value) ? null : 'Enter a valid 10-digit mobile number'),
      email: (value) => (!value || EMAIL_REGEX.test(value) ? null : 'Enter a valid email address'),
    },
  });

  const handleSubmit = async (values: SupplierFormValues) => {
    setLoading(true);
    const payload = {
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim() || null,
      address: values.address.trim() || null,
      chequeIssuedName: values.chequeIssuedName.trim() || null,
    };
    try {
      if (supplier) {
        await dispatch(updateSupplier({ _id: supplier._id, ...payload })).unwrap();
        toNotify('Updated', 'Supplier updated successfully', 'SUCCESS');
      } else {
        await dispatch(createSupplier(payload)).unwrap();
        toNotify('Created', 'Supplier created successfully', 'SUCCESS');
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

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Name"
          withAsterisk
          placeholder="Enter supplier name"
          {...form.getInputProps('name')}
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
        <TextInput
          label="Cheque issued name"
          placeholder="Name to print on cheques"
          {...form.getInputProps('chequeIssuedName')}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {supplier ? 'Save changes' : 'Create supplier'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
