import { Stack } from '@mantine/core';
import { PageHeader } from '@/components/PageHeader';
import { FilterBar, type FilterFieldConfig } from '@/components/FilterBar';

const FILTER_FIELDS: FilterFieldConfig[] = [
  { type: 'search', key: 'q', placeholder: 'Search suppliers' },
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

const SuppliersPage = () => {
  return (
    <Stack gap="md">
      <PageHeader title="Suppliers" description="Coming soon." />
      <FilterBar fields={FILTER_FIELDS} />
    </Stack>
  );
};

export default SuppliersPage;
