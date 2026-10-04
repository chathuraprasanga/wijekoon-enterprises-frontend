import { useEffect, useState } from 'react';
import { Button, Group, Modal, NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type Product,
  PRODUCT_UNITS,
  createProduct,
  updateProduct,
} from '@/store/productSlice/productSlice';
import { fetchSuppliers } from '@/store/supplierSlice/supplierSlice';
import { toNotify } from '@/hooks/toNotify';

type ProductFormValues = {
  name: string;
  sku: string;
  size: number | '';
  unit: string | null;
  buyingPrice: number | '';
  sellingPrice: number | '';
  supplier: string | null;
};

type Props = {
  opened: boolean;
  product: Product | null;
  onClose: () => void;
};

export const AddEditProductModal = ({ opened, product, onClose }: Props) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={product ? 'Edit product' : 'Add product'}
      centered
    >
      {opened && (
        <AddEditProductForm key={product?._id ?? 'new'} product={product} onClose={onClose} />
      )}
    </Modal>
  );
};

type FormProps = {
  product: Product | null;
  onClose: () => void;
};

const AddEditProductForm = ({ product, onClose }: FormProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const suppliers = useAppSelector((state) => state.supplier.items);

  useEffect(() => {
    dispatch(fetchSuppliers({ page: 1, limit: 100 }));
  }, [dispatch]);

  const form = useForm<ProductFormValues>({
    initialValues: {
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      size: product?.size ?? '',
      unit: product?.unit ?? null,
      buyingPrice: product?.buyingPrice ?? '',
      sellingPrice: product?.sellingPrice ?? '',
      supplier: product?.supplier ?? null,
    },
    validate: {
      name: (value) => (value.trim() ? null : 'Name is required'),
      sku: (value) => (value.trim() ? null : 'SKU is required'),
      size: (value) => (value !== '' && value > 0 ? null : 'Enter a valid size'),
      unit: (value) => (value ? null : 'Unit is required'),
      buyingPrice: (value) => (value !== '' && value >= 0 ? null : 'Enter a valid buying price'),
      sellingPrice: (value) => (value !== '' && value >= 0 ? null : 'Enter a valid selling price'),
      supplier: (value) => (value ? null : 'Supplier is required'),
    },
  });

  const handleSubmit = async (values: ProductFormValues) => {
    setLoading(true);
    const payload = {
      name: values.name.trim(),
      sku: values.sku.trim().toUpperCase(),
      size: Number(values.size),
      unit: values.unit as Product['unit'],
      buyingPrice: Number(values.buyingPrice),
      sellingPrice: Number(values.sellingPrice),
      supplier: values.supplier as string,
    };
    try {
      if (product) {
        await dispatch(updateProduct({ _id: product._id, ...payload })).unwrap();
        toNotify('Updated', 'Product updated successfully', 'SUCCESS');
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toNotify('Created', 'Product created successfully', 'SUCCESS');
      }
      onClose();
    } catch (error) {
      toNotify(
        product ? 'Failed to update product' : 'Failed to create product',
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
          placeholder="Enter product name"
          {...form.getInputProps('name')}
        />
        <TextInput
          label="SKU"
          withAsterisk
          placeholder="Enter SKU"
          {...form.getInputProps('sku')}
        />
        <Group grow>
          <NumberInput
            label="Size"
            withAsterisk
            placeholder="Enter size"
            min={0}
            {...form.getInputProps('size')}
          />
          <Select
            label="Unit"
            withAsterisk
            placeholder="Select unit"
            data={[...PRODUCT_UNITS]}
            comboboxProps={{ withinPortal: true }}
            {...form.getInputProps('unit')}
          />
        </Group>
        <Group grow>
          <NumberInput
            label="Buying price"
            withAsterisk
            placeholder="Enter buying price"
            min={0}
            decimalScale={2}
            {...form.getInputProps('buyingPrice')}
          />
          <NumberInput
            label="Selling price"
            withAsterisk
            placeholder="Enter selling price"
            min={0}
            decimalScale={2}
            {...form.getInputProps('sellingPrice')}
          />
        </Group>
        <Select
          label="Supplier"
          withAsterisk
          placeholder="Select supplier"
          data={suppliers.map((supplier) => ({ value: supplier._id, label: supplier.name }))}
          searchable
          clearable
          comboboxProps={{
            position: 'top',
            middlewares: { flip: true, shift: true },
            withinPortal: true,
          }}
          {...form.getInputProps('supplier')}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {product ? 'Save changes' : 'Create product'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
