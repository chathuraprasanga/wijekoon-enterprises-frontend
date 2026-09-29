import { Stack } from '@mantine/core';
import { PageHeader } from '@/components/PageHeader';
import { FilterBar, type FilterFieldConfig } from '@/components/FilterBar';

const FILTER_FIELDS: FilterFieldConfig[] = [
  { type: 'search', key: 'q', placeholder: 'Search products' },
  {
    type: 'select',
    key: 'status',
    label: 'Status',
    placeholder: 'Any status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

const ProductsPage = () => {
  return (
    <Stack gap="md">
      <PageHeader title="Products" description="Coming soon." />
      <FilterBar fields={FILTER_FIELDS} />
    </Stack>
  );
};

export default ProductsPage;
