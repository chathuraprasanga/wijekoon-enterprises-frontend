import { Stack } from '@mantine/core';
import { PageHeader } from '@/components/PageHeader';
import { FilterBar, type FilterFieldConfig } from '@/components/FilterBar';

const FILTER_FIELDS: FilterFieldConfig[] = [
  { type: 'search', key: 'q', placeholder: 'Search orders' },
  {
    type: 'select',
    key: 'status',
    label: 'Status',
    placeholder: 'Any status',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
];

const OrdersPage = () => {
  return (
    <Stack gap="md">
      <PageHeader title="Orders" description="Coming soon." />
      <FilterBar fields={FILTER_FIELDS} />
    </Stack>
  );
};

export default OrdersPage;
