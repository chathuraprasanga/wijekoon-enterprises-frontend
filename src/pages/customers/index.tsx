import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Button } from '@mantine/core';
import { IconPencil, IconUsers } from '@tabler/icons-react';
import { ListPage } from '@/components/data/ListPage';
import { DetailDialog } from '@/components/DetailDialog';
import { SimpleGrid, Box } from '@mantine/core';
import { Field } from '@/components/Field';
import { LocationMap } from '@/components/LocationMap';
import { StatusSection } from '@/components/StatusSection';
import { ActiveBadge } from '@/components/StatusBadge';
import { AddEditCustomerModal } from '@/pages/customers/AddEditCustomerModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type Customer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
} from '@/store/customerSlice/customerSlice';
import { useActiveToggle } from '@/hooks/useActiveToggle';
import { formatDate, formatPhone, fullName, orDash } from '@/utils/format';

const SORT_MAP = { name: 'firstName' };
const FILTERS = [
  {
    type: 'select' as const,
    key: 'status',
    label: 'Status',
    placeholder: 'All statuses',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

const CustomersPage = () => {
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((s) => s.customer);
  const [form, setForm] = useState<{ customer: Customer | null } | null>(null);
  const [view, setView] = useState<Customer | null>(null);

  const { toggle, busyId } = useActiveToggle<Customer>(
    'Customer',
    (c) =>
      dispatch(
        updateCustomer({
          _id: c._id,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          address: c.address,
          isActive: !c.isActive,
        }),
      ).unwrap(),
    (id, isActive) => setView((v) => (v && v._id === id ? { ...v, isActive } : v)),
  );

  return (
    <ListPage<Customer>
      title="Customers"
      description="People and shops you sell to. Search, filter and open any record."
      entity={{ singular: 'customer', plural: 'customers' }}
      searchPlaceholder="Search by name, phone or email"
      filters={FILTERS}
      records={items}
      total={total}
      rowKey={(c) => c._id}
      rowName={fullName}
      defaultSort={{ key: 'name', dir: 'asc' }}
      sortMap={SORT_MAP}
      load={({ page, limit, searchText, sortBy, sortType, filters }) =>
        dispatch(
          fetchCustomers({ page, limit, searchText, status: filters.status, sortBy, sortType }),
        ).unwrap()
      }
      createLabel="Add customer"
      emptyDescription="Add the people and shops you sell to. Their sales and cheques will show on their record."
      emptyIcon={<IconUsers size={20} />}
      onCreate={() => setForm({ customer: null })}
      onView={setView}
      onEdit={(customer) => setForm({ customer })}
      remove={{
        title: 'Delete customer?',
        describe: (c) => (
          <>
            This permanently removes <strong>{fullName(c)}</strong> and their contact details.
          </>
        ),
        run: (c) => dispatch(deleteCustomer(c._id)).unwrap(),
        done: 'Customer deleted.',
      }}
      columns={[
        {
          key: 'name',
          header: 'Name',
          sortable: true,
          primary: true,
          render: (c) => (
            <Anchor component={Link} to={`/app/customers/${c._id}`} fw={500} size="sm">
              {fullName(c)}
            </Anchor>
          ),
        },
        {
          key: 'phone',
          header: 'Phone',
          render: (c) => <span className="num">{formatPhone(c.phone)}</span>,
        },
        {
          key: 'email',
          header: 'Email',
          sortable: true,
          hideBelow: 'md',
          render: (c) => orDash(c.email),
        },
        { key: 'address', header: 'Address', sortable: true, render: (c) => orDash(c.address) },
        {
          key: 'status',
          header: 'Status',
          badge: true,
          render: (c) => <ActiveBadge active={c.isActive} />,
        },
      ]}
    >
      {({ reload }) => (
        <>
          <AddEditCustomerModal
            opened={!!form}
            customer={form?.customer ?? null}
            onClose={() => {
              setForm(null);
              reload();
            }}
          />
          <DetailDialog
            opened={!!view}
            onClose={() => setView(null)}
            title={view ? fullName(view) : ''}
            subtitle={view ? `Customer · since ${formatDate(view.createdAt)}` : undefined}
            actions={
              view && (
                <Button
                  leftSection={<IconPencil size={16} aria-hidden />}
                  onClick={() => {
                    setForm({ customer: view });
                    setView(null);
                  }}
                >
                  Edit customer
                </Button>
              )
            }
          >
            {view && (
              <>
                <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md" verticalSpacing="md">
                  <Field label="Mobile">
                    <span className="num">{formatPhone(view.phone)}</span>
                  </Field>
                  <Field label="Email">{view.email}</Field>
                </SimpleGrid>
                <Box mt="md">
                  <Field label="Address">{view.address}</Field>
                </Box>
                {view.location && (
                  <Box mt="md">
                    <Field label="Location">
                      <span className="num">
                        {view.location.lat.toFixed(5)}, {view.location.lng.toFixed(5)}
                      </span>
                    </Field>
                    <Box mt={6}>
                      <LocationMap
                        lat={view.location.lat}
                        lng={view.location.lng}
                        label={fullName(view)}
                      />
                    </Box>
                  </Box>
                )}
                <StatusSection
                  label="STATUS"
                  title="Active customer"
                  description="Inactive customers can't be picked on new sales."
                  checked={view.isActive}
                  disabled={busyId === view._id}
                  onChange={() => toggle(view)}
                />
                <Anchor
                  component={Link}
                  to={`/app/customers/${view._id}`}
                  fw={500}
                  display="inline-block"
                  mt="lg"
                >
                  Open full record →
                </Anchor>
              </>
            )}
          </DetailDialog>
        </>
      )}
    </ListPage>
  );
};

export default CustomersPage;
