import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Modal,
  Stack,
  Switch,
  Text,
  Tooltip,
} from '@mantine/core';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import { IconEdit, IconEye, IconPlus, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '@/components/PageHeader';
import { Loader } from '@/components/Loader';
import { FilterBar, type FilterFieldConfig } from '@/components/FilterBar';
import { AddEditCustomerModal } from '@/pages/customers/AddEditCustomerModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type Customer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
} from '@/store/customerSlice/customerSlice';
import { toNotify } from '@/hooks/toNotify';
import { datePreview } from '@/utils/datePreview';

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
];

const CustomersPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { items, limit, total } = useAppSelector((state) => state.customer);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toDelete, setToDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formTarget, setFormTarget] = useState<Customer | null>();
  const [formOpen, setFormOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<Customer | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Customer>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const searchText = searchParams.get('q') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const sortBy =
    sortStatus.columnAccessor === 'name' ? 'firstName' : (sortStatus.columnAccessor as string);
  const sortType = sortStatus.direction;

  const filterKey = `${searchText ?? ''}|${status ?? ''}|${sortBy}|${sortType}`;
  const [appliedFilterKey, setAppliedFilterKey] = useState(filterKey);
  if (filterKey !== appliedFilterKey) {
    setAppliedFilterKey(filterKey);
    setPage(1);
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await dispatch(
          fetchCustomers({ page, limit, searchText, status, sortBy, sortType }),
        ).unwrap();
      } catch (error) {
        toNotify('Failed to load customers', error as string, 'ERROR');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch, page, limit, searchText, status, sortBy, sortType]);

  const handleToggleActive = async (customer: Customer) => {
    setTogglingId(customer._id);
    try {
      const updated = await dispatch(
        updateCustomer({
          _id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          isActive: !customer.isActive,
        }),
      ).unwrap();
      toNotify(
        'Updated',
        `Customer ${customer.isActive ? 'deactivated' : 'activated'} successfully`,
        'SUCCESS',
      );
      setViewTarget((prev) =>
        prev && prev._id === customer._id ? { ...prev, isActive: updated.isActive } : prev,
      );
    } catch (error) {
      toNotify('Failed to update customer', error as string, 'ERROR');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteCustomer(toDelete._id)).unwrap();
      toNotify('Deleted', 'Customer deleted successfully', 'SUCCESS');
      setToDelete(null);
    } catch (error) {
      toNotify('Failed to delete customer', error as string, 'ERROR');
    } finally {
      setDeleting(false);
    }
  };

  const openAdd = () => {
    setFormTarget(null);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setFormTarget(customer);
    setFormOpen(true);
  };

  return (
    <Stack gap="md">
      <PageHeader
        title="Customers"
        description="Manage your customer records."
        action={
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
            Add customer
          </Button>
        }
      />
      <FilterBar fields={FILTER_FIELDS} />
      <DataTable
        withTableBorder
        borderRadius="md"
        minHeight={loading || items.length === 0 ? 200 : undefined}
        records={items}
        fetching={loading}
        customLoader={<Loader h="100%" />}
        noRecordsText="No customers found"
        page={page}
        onPageChange={setPage}
        totalRecords={total}
        recordsPerPage={limit}
        idAccessor="_id"
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        columns={[
          {
            accessor: 'name',
            title: 'Name',
            sortable: true,
            width: 180,
            render: (customer) => `${customer.firstName} ${customer.lastName ?? ''}`.trim(),
          },
          { accessor: 'phone', title: 'Phone', width: 130 },
          {
            accessor: 'email',
            title: 'Email',
            sortable: true,
            width: 190,
            render: (customer) => customer.email ?? '-',
          },
          {
            accessor: 'address',
            title: 'Address',
            sortable: true,
            width: 190,
            render: (customer) => customer.address ?? '-',
          },
          {
            accessor: 'isActive',
            title: 'Status',
            width: 110,
            render: (customer) => (
              <Badge color={customer.isActive ? 'green' : 'gray'} variant="light">
                {customer.isActive ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            width: 130,
            render: (customer) => (
              <Group gap="xs" justify="flex-end" wrap="nowrap">
                <Tooltip label="View">
                  <ActionIcon variant="subtle" onClick={() => setViewTarget(customer)}>
                    <IconEye size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Edit">
                  <ActionIcon variant="subtle" onClick={() => openEdit(customer)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                  <ActionIcon variant="subtle" color="red" onClick={() => setToDelete(customer)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
      />
      <AddEditCustomerModal
        opened={formOpen}
        customer={formTarget ?? null}
        onClose={() => setFormOpen(false)}
      />
      <Drawer
        opened={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Customer details"
        position="right"
      >
        {viewTarget && (
          <Stack gap="md">
            <Text fw={600} size="lg">
              {viewTarget.firstName} {viewTarget.lastName ?? ''}
            </Text>
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" c="dimmed">
                Status
              </Text>
              <Switch
                checked={viewTarget.isActive}
                size="md"
                onLabel="ACTIVE"
                offLabel="INACTIVE"
                color="green"
                styles={{
                  trackLabel: {
                    padding: 'var(--mantine-spacing-xs)',
                    fontSize: 'var(--mantine-font-size-xs)',
                  },
                }}
                disabled={togglingId === viewTarget._id}
                onChange={() => handleToggleActive(viewTarget)}
              />
            </Group>
            <Divider />
            <Stack gap="xs">
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Email
                </Text>
                <Text size="sm">{viewTarget.email ?? '-'}</Text>
              </Group>
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Phone
                </Text>
                <Text size="sm">{viewTarget.phone}</Text>
              </Group>
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Text size="sm" c="dimmed">
                  Address
                </Text>
                <Text size="sm" ta="right">
                  {viewTarget.address ?? '-'}
                </Text>
              </Group>
            </Stack>
            <Divider />
            <Stack gap="xs">
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Created
                </Text>
                <Text size="sm">{datePreview(viewTarget.createdAt)}</Text>
              </Group>
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Last updated
                </Text>
                <Text size="sm">{datePreview(viewTarget.updatedAt)}</Text>
              </Group>
            </Stack>
          </Stack>
        )}
      </Drawer>
      <Modal opened={!!toDelete} onClose={() => setToDelete(null)} title="Delete customer" centered>
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete{' '}
            <strong>
              {toDelete?.firstName} {toDelete?.lastName ?? ''}
            </strong>
            ? This cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button color="red" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default CustomersPage;
