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
import { AddEditSupplierModal } from '@/pages/suppliers/AddEditSupplierModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type Supplier,
  deleteSupplier,
  fetchSuppliers,
  updateSupplier,
} from '@/store/supplierSlice/supplierSlice';
import { toNotify } from '@/hooks/toNotify';
import { datePreview } from '@/utils/datePreview';

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
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { items, limit, total } = useAppSelector((state) => state.supplier);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toDelete, setToDelete] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formTarget, setFormTarget] = useState<Supplier | null>();
  const [formOpen, setFormOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<Supplier | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Supplier>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const searchText = searchParams.get('q') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const sortBy = sortStatus.columnAccessor as string;
  const sortType = sortStatus.direction;

  // Reset to page 1 whenever filters or sort change. Adjusted during render
  // (React's recommended pattern for state derived from props) rather than
  // in an effect, which would otherwise cause a cascading extra render.
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
          fetchSuppliers({ page, limit, searchText, status, sortBy, sortType }),
        ).unwrap();
      } catch (error) {
        toNotify('Failed to load suppliers', error as string, 'ERROR');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch, page, limit, searchText, status, sortBy, sortType]);

  const handleToggleActive = async (supplier: Supplier) => {
    setTogglingId(supplier._id);
    try {
      const updated = await dispatch(
        updateSupplier({
          _id: supplier._id,
          name: supplier.name,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          chequeIssuedName: supplier.chequeIssuedName,
          isActive: !supplier.isActive,
        }),
      ).unwrap();
      toNotify(
        'Updated',
        `Supplier ${supplier.isActive ? 'deactivated' : 'activated'} successfully`,
        'SUCCESS',
      );
      setViewTarget((prev) =>
        prev && prev._id === supplier._id ? { ...prev, isActive: updated.isActive } : prev,
      );
    } catch (error) {
      toNotify('Failed to update supplier', error as string, 'ERROR');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteSupplier(toDelete._id)).unwrap();
      toNotify('Deleted', 'Supplier deleted successfully', 'SUCCESS');
      setToDelete(null);
    } catch (error) {
      toNotify('Failed to delete supplier', error as string, 'ERROR');
    } finally {
      setDeleting(false);
    }
  };

  const openAdd = () => {
    setFormTarget(null);
    setFormOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setFormTarget(supplier);
    setFormOpen(true);
  };

  return (
    <Stack gap="md">
      <PageHeader
        title="Suppliers"
        description="Manage your supplier records."
        action={
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
            Add supplier
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
        noRecordsText="No suppliers found"
        page={page}
        onPageChange={setPage}
        totalRecords={total}
        recordsPerPage={limit}
        idAccessor="_id"
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        columns={[
          { accessor: 'name', title: 'Name', sortable: true, width: 180 },
          { accessor: 'phone', title: 'Phone', width: 130 },
          {
            accessor: 'email',
            title: 'Email',
            sortable: true,
            width: 190,
            render: (supplier) => supplier.email ?? '-',
          },
          {
            accessor: 'address',
            title: 'Address',
            sortable: true,
            width: 190,
            render: (supplier) => supplier.address ?? '-',
          },
          {
            accessor: 'isActive',
            title: 'Status',
            width: 110,
            render: (supplier) => (
              <Badge color={supplier.isActive ? 'green' : 'gray'} variant="light">
                {supplier.isActive ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            width: 130,
            render: (supplier) => (
              <Group gap="xs" justify="flex-end" wrap="nowrap">
                <Tooltip label="View">
                  <ActionIcon variant="subtle" onClick={() => setViewTarget(supplier)}>
                    <IconEye size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Edit">
                  <ActionIcon variant="subtle" onClick={() => openEdit(supplier)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                  <ActionIcon variant="subtle" color="red" onClick={() => setToDelete(supplier)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
      />
      <AddEditSupplierModal
        opened={formOpen}
        supplier={formTarget ?? null}
        onClose={() => setFormOpen(false)}
      />
      <Drawer
        opened={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Supplier details"
        position="right"
      >
        {viewTarget && (
          <Stack gap="md">
            <Text fw={600} size="lg">
              {viewTarget.name}
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
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Text size="sm" c="dimmed">
                  Cheque issued name
                </Text>
                <Text size="sm" ta="right">
                  {viewTarget.chequeIssuedName ?? '-'}
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
      <Modal opened={!!toDelete} onClose={() => setToDelete(null)} title="Delete supplier" centered>
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to delete <strong>{toDelete?.name}</strong>? This cannot be
            undone.
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

export default SuppliersPage;
