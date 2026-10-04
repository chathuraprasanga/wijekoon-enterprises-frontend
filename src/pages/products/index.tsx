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
import { AddEditProductModal } from '@/pages/products/AddEditProductModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type Product,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '@/store/productSlice/productSlice';
import { fetchSuppliers } from '@/store/supplierSlice/supplierSlice';
import { toNotify } from '@/hooks/toNotify';
import { datePreview } from '@/utils/datePreview';

const STATIC_FILTER_FIELDS: FilterFieldConfig[] = [
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
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { items, limit, total } = useAppSelector((state) => state.product);
  const suppliers = useAppSelector((state) => state.supplier.items);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formTarget, setFormTarget] = useState<Product | null>();
  const [formOpen, setFormOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<Product | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Product>>({
    columnAccessor: 'name',
    direction: 'asc',
  });

  const searchText = searchParams.get('q') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const supplier = searchParams.get('supplier') ?? undefined;
  const sortBy = sortStatus.columnAccessor as string;
  const sortType = sortStatus.direction;

  const filterFields: FilterFieldConfig[] = [
    ...STATIC_FILTER_FIELDS,
    {
      type: 'select',
      key: 'supplier',
      label: 'Supplier',
      placeholder: 'Any supplier',
      options: suppliers.map((s) => ({ value: s._id, label: s.name })),
    },
  ];

  // Reset to page 1 whenever filters or sort change. Adjusted during render
  // (React's recommended pattern for state derived from props) rather than
  // in an effect, which would otherwise cause a cascading extra render.
  const filterKey = `${searchText ?? ''}|${status ?? ''}|${supplier ?? ''}|${sortBy}|${sortType}`;
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
          fetchProducts({ page, limit, searchText, status, supplier, sortBy, sortType }),
        ).unwrap();
      } catch (error) {
        toNotify('Failed to load products', error as string, 'ERROR');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [dispatch, page, limit, searchText, status, supplier, sortBy, sortType]);

  useEffect(() => {
    dispatch(fetchSuppliers({ page: 1, limit: 100 }));
  }, [dispatch]);

  const supplierName = (supplierId: string) =>
    suppliers.find((s) => s._id === supplierId)?.name ?? supplierId;

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product._id);
    try {
      const updated = await dispatch(
        updateProduct({
          _id: product._id,
          name: product.name,
          sku: product.sku,
          size: product.size,
          unit: product.unit,
          buyingPrice: product.buyingPrice,
          sellingPrice: product.sellingPrice,
          supplier: product.supplier,
          isActive: !product.isActive,
        }),
      ).unwrap();
      toNotify(
        'Updated',
        `Product ${product.isActive ? 'deactivated' : 'activated'} successfully`,
        'SUCCESS',
      );
      setViewTarget((prev) =>
        prev && prev._id === product._id ? { ...prev, isActive: updated.isActive } : prev,
      );
    } catch (error) {
      toNotify('Failed to update product', error as string, 'ERROR');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteProduct(toDelete._id)).unwrap();
      toNotify('Deleted', 'Product deleted successfully', 'SUCCESS');
      setToDelete(null);
    } catch (error) {
      toNotify('Failed to delete product', error as string, 'ERROR');
    } finally {
      setDeleting(false);
    }
  };

  const openAdd = () => {
    setFormTarget(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setFormTarget(product);
    setFormOpen(true);
  };

  return (
    <Stack gap="md">
      <PageHeader
        title="Products"
        description="Manage your product catalog."
        action={
          <Button leftSection={<IconPlus size={16} />} onClick={openAdd}>
            Add product
          </Button>
        }
      />
      <FilterBar fields={filterFields} />
      <DataTable
        withTableBorder
        borderRadius="md"
        minHeight={loading || items.length === 0 ? 200 : undefined}
        records={items}
        fetching={loading}
        customLoader={<Loader h="100%" />}
        noRecordsText="No products found"
        page={page}
        onPageChange={setPage}
        totalRecords={total}
        recordsPerPage={limit}
        idAccessor="_id"
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        columns={[
          { accessor: 'name', title: 'Name', sortable: true, width: 180 },
          { accessor: 'sku', title: 'SKU', sortable: true, width: 120 },
          {
            accessor: 'size',
            title: 'Size',
            sortable: true,
            width: 110,
            render: (product) => `${product.size} ${product.unit}`,
          },
          {
            accessor: 'buyingPrice',
            title: 'Buying price',
            sortable: true,
            width: 130,
            render: (product) => product.buyingPrice.toFixed(2),
          },
          {
            accessor: 'sellingPrice',
            title: 'Selling price',
            sortable: true,
            width: 130,
            render: (product) => product.sellingPrice.toFixed(2),
          },
          {
            accessor: 'isActive',
            title: 'Status',
            width: 110,
            render: (product) => (
              <Badge color={product.isActive ? 'green' : 'gray'} variant="light">
                {product.isActive ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
          {
            accessor: 'actions',
            title: 'Actions',
            textAlign: 'right',
            width: 130,
            render: (product) => (
              <Group gap="xs" justify="flex-end" wrap="nowrap">
                <Tooltip label="View">
                  <ActionIcon variant="subtle" onClick={() => setViewTarget(product)}>
                    <IconEye size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Edit">
                  <ActionIcon variant="subtle" onClick={() => openEdit(product)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                  <ActionIcon variant="subtle" color="red" onClick={() => setToDelete(product)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ),
          },
        ]}
      />
      <AddEditProductModal
        opened={formOpen}
        product={formTarget ?? null}
        onClose={() => setFormOpen(false)}
      />
      <Drawer
        opened={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Product details"
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
                  SKU
                </Text>
                <Text size="sm">{viewTarget.sku}</Text>
              </Group>
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Size
                </Text>
                <Text size="sm">
                  {viewTarget.size} {viewTarget.unit}
                </Text>
              </Group>
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Buying price
                </Text>
                <Text size="sm">{viewTarget.buyingPrice.toFixed(2)}</Text>
              </Group>
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Selling price
                </Text>
                <Text size="sm">{viewTarget.sellingPrice.toFixed(2)}</Text>
              </Group>
              <Group justify="space-between" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  Supplier
                </Text>
                <Text size="sm">{supplierName(viewTarget.supplier)}</Text>
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
      <Modal opened={!!toDelete} onClose={() => setToDelete(null)} title="Delete product" centered>
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

export default ProductsPage;
