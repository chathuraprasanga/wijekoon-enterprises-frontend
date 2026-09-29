import { Stack } from '@mantine/core';
import { PageHeader } from '@/components/PageHeader';
import { FilterBar, type FilterFieldConfig } from '@/components/FilterBar';

const FILTER_FIELDS: FilterFieldConfig[] = [
  { type: 'search', key: 'q', placeholder: 'Search sales' },
  {
    type: 'select',
    key: 'status',
    label: 'Status',
    placeholder: 'Any status',
    options: [
      { value: 'paid', label: 'Paid' },
      { value: 'pending', label: 'Pending' },
      { value: 'refunded', label: 'Refunded' },
    ],
  },
];

const SalesPage = () => {
  return (
    <Stack gap="md">
      <PageHeader title="Sales" description="Coming soon." />
      <FilterBar fields={FILTER_FIELDS} />
    </Stack>
  );
};

export default SalesPage;
