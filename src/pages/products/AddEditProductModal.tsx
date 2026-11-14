import { useEffect, useState } from 'react';
import { NumberInput, Select, SimpleGrid, Switch, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FormModal } from '@/components/FormModal';
import { useErrorSummary } from '@/hooks/useErrorSummary';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type Product,
  PRODUCT_UNITS,
  createProduct,
  updateProduct,
} from '@/store/productSlice/productSlice';
import { fetchSuppliers } from '@/store/supplierSlice/supplierSlice';
import { formatSize } from '@/utils/format';
import { required } from '@/utils/validators';
import { toNotify } from '@/hooks/toNotify';

type ProductFormValues = {
  name: string;
  sku: string;
  size: number | '';
  unit: string | null;
  buyingPrice: number | '';
  sellingPrice: number | '';
  supplier: string | null;
  isActive: boolean;
};

type Props = {
  opened: boolean;
  product: Product | null;
  onClose: () => void;
};

export const AddEditProductModal = ({ opened, product, onClose }: Props) =>
  opened ? (
    <AddEditProductForm key={product?._id ?? 'new'} product={product} onClose={onClose} />
  ) : null;

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
      isActive: product?.isActive ?? true,
    },
    validate: {
      name: required('Name is required.'),
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
        await dispatch(
          updateProduct({ _id: product._id, ...payload, isActive: values.isActive }),
        ).unwrap();
        toNotify('Product saved', `${payload.name} was updated.`, 'SUCCESS');
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toNotify('Product added', `${payload.name} was added.`, 'SUCCESS');
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

  const mono = { input: { fontFamily: 'var(--mantine-font-family-monospace)' } };
  const money = {
    prefix: 'LKR ',
    min: 0,
    decimalScale: 2,
    fixedDecimalScale: true,
    thousandSeparator: ',',
  } as const;

  const errorLabels = useErrorSummary(form, {
    name: 'Product name',
    sku: 'SKU',
    size: 'Size',
    unit: 'Unit',
    buyingPrice: 'Buying price',
    sellingPrice: 'Selling price',
    supplier: 'Supplier',
  });

  return (
    <FormModal
      opened
      title={product ? 'Edit product' : 'Add product'}
      subject={product ? `${product.name} ${formatSize(product.size, product.unit)}` : undefined}
      submitLabel={product ? 'Save product' : 'Create product'}
      loading={loading}
      dirty={form.isDirty()}
      errorLabels={errorLabels}
      onSubmit={form.onSubmit(handleSubmit)}
      onClose={onClose}
    >
      <TextInput
        label="Product name"
        withAsterisk
        placeholder="e.g. Samba Rice"
        {...form.getInputProps('name')}
      />
      <TextInput
        label="SKU"
        withAsterisk
        styles={mono}
        placeholder="WE-RC-005"
        description="Must be unique. Shown in monospace on sales."
        {...form.getInputProps('sku')}
      />
      <SimpleGrid cols={{ base: 1, xs: 2 }}>
        <NumberInput
          label="Size"
          placeholder="e.g. 5"
          withAsterisk
          min={0}
          {...form.getInputProps('size')}
        />
        <Select
          label="Unit"
          withAsterisk
          placeholder="Select unit"
          data={PRODUCT_UNITS.map((u) => ({ value: u, label: u === 'L' ? 'L' : u.toLowerCase() }))}
          comboboxProps={{ withinPortal: true }}
          {...form.getInputProps('unit')}
        />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, xs: 2 }}>
        <NumberInput
          label="Buying price"
          placeholder="LKR 0.00"
          withAsterisk
          {...money}
          {...form.getInputProps('buyingPrice')}
        />
        <NumberInput
          label="Selling price"
          placeholder="LKR 0.00"
          withAsterisk
          {...money}
          {...form.getInputProps('sellingPrice')}
        />
      </SimpleGrid>
      <Select
        label="Supplier"
        withAsterisk
        placeholder="Select supplier"
        data={suppliers.map((supplier) => ({ value: supplier._id, label: supplier.name }))}
        searchable
        comboboxProps={{ withinPortal: true }}
        {...form.getInputProps('supplier')}
      />
      {product && (
        <Switch
          label="Available for sale"
          {...form.getInputProps('isActive', { type: 'checkbox' })}
        />
      )}
    </FormModal>
  );
};
