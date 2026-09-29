import { Stack } from '@mantine/core';
import { PageHeader } from '@/components/PageHeader';
import { FilterBar, type FilterFieldConfig } from '@/components/FilterBar';

const FILTER_FIELDS: FilterFieldConfig[] = [
  { type: 'search', key: 'q', placeholder: 'Search customers' },
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
  // {
  //   type: 'multiSelect',
  //   key: 'type',
  //   label: 'Type',
  //   placeholder: 'Any type',
  //   options: [
  //     { value: 'retail', label: 'Retail' },
  //     { value: 'wholesale', label: 'Wholesale' },
  //     { value: 'corporate', label: 'Corporate' },
  //   ],
  // },
  // { type: 'date', key: 'registered', label: 'Registered on' },
  // { type: 'dateRange', key: 'lastOrder', label: 'Last order between' },
];

const CustomersPage = () => {
  return (
    <Stack gap="md">
      <PageHeader title="Customers" description="Coming soon." />
      <FilterBar fields={FILTER_FIELDS} />
    </Stack>
  );
};

export default CustomersPage;
