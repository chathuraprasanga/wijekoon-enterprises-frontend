import { useEffect, useState } from 'react';
import { Button } from '@mantine/core';
import { IconPencil, IconBox } from '@tabler/icons-react';
import { ListPage } from '@/components/data/ListPage';
import { DetailDialog } from '@/components/DetailDialog';
import { Stack } from '@mantine/core';
import { Field } from '@/components/Field';
import { StatusSection } from '@/components/StatusSection';
import { ActiveBadge } from '@/components/StatusBadge';
import { AddEditProductModal } from '@/pages/products/AddEditProductModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type Product,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '@/store/productSlice/productSlice';
import { fetchSuppliers } from '@/store/supplierSlice/supplierSlice';
import { useActiveToggle } from '@/hooks/useActiveToggle';
import { formatLkr, formatSize } from '@/utils/format';
import { useCan } from '@/utils/permissions';

const ProductsPage = () => {
  const can = useCan();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((s) => s.product);
  const suppliers = useAppSelector((s) => s.supplier.items);
  const [form, setForm] = useState<{ product: Product | null } | null>(null);
  const [view, setView] = useState<Product | null>(null);

  useEffect(() => {
    dispatch(fetchSuppliers({ page: 1, limit: 100 }));
  }, [dispatch]);

  const supplierName = (id: string) => suppliers.find((s) => s._id === id)?.name ?? '—';

  const { toggle, busyId } = useActiveToggle<Product>(
    'Product',
    (p) =>
      dispatch(
        updateProduct({
          _id: p._id,
          name: p.name,
          sku: p.sku,
          size: p.size,
          unit: p.unit,
          buyingPrice: p.buyingPrice,
          sellingPrice: p.sellingPrice,
          supplier: p.supplier,
          isActive: !p.isActive,
        }),
      ).unwrap(),
    (id, isActive) => setView((v) => (v && v._id === id ? { ...v, isActive } : v)),
  );

  const filters = [
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
    {
      type: 'select' as const,
      key: 'supplier',
      label: 'Supplier',
      placeholder: 'All suppliers',
      options: suppliers.map((s) => ({ value: s._id, label: s.name })),
    },
  ];

  return (
    <ListPage<Product>
      title="Products"
      description="Everything you stock, with buying and selling prices in LKR."
      entity={{ singular: 'product', plural: 'products' }}
      searchPlaceholder="Search by name or SKU"
      filters={filters}
      records={items}
      total={total}
      rowKey={(p) => p._id}
      rowName={(p) => p.name}
      defaultSort={{ key: 'name', dir: 'asc' }}
      load={({ page, limit, searchText, sortBy, sortType, filters: f }) =>
        dispatch(
          fetchProducts({
            page,
            limit,
            searchText,
            status: f.status,
            supplier: f.supplier,
            sortBy,
            sortType,
          }),
        ).unwrap()
      }
      createLabel="Add product"
      emptyDescription="Add what you stock, with a buying and selling price for each."
      emptyIcon={<IconBox size={20} />}
      onCreate={can('product:create') ? () => setForm({ product: null }) : undefined}
      onView={setView}
      onEdit={can('product:update') ? (product) => setForm({ product }) : undefined}
      remove={
        can('product:delete')
          ? {
              title: 'Delete product?',
              describe: (p) => (
                <>
                  This permanently removes <strong>{p.name}</strong> ({p.sku}) from the catalogue.
                </>
              ),
              run: (p) => dispatch(deleteProduct(p._id)).unwrap(),
              done: 'Product deleted.',
            }
          : undefined
      }
      columns={[
        {
          key: 'name',
          header: 'Name',
          sortable: true,
          primary: true,
          render: (p) => <b style={{ fontWeight: 500 }}>{p.name}</b>,
        },
        {
          key: 'sku',
          header: 'SKU',
          sortable: true,
          render: (p) => <span className="mono">{p.sku}</span>,
        },
        { key: 'size', header: 'Size', sortable: true, render: (p) => formatSize(p.size, p.unit) },
        {
          key: 'buyingPrice',
          header: 'Buying price',
          sortable: true,
          align: 'right',
          render: (p) => formatLkr(p.buyingPrice),
        },
        {
          key: 'sellingPrice',
          header: 'Selling price',
          sortable: true,
          align: 'right',
          render: (p) => formatLkr(p.sellingPrice),
        },
        {
          key: 'supplier',
          header: 'Supplier',
          hideBelow: 'md',
          render: (p) => supplierName(p.supplier),
        },
        {
          key: 'status',
          header: 'Status',
          badge: true,
          render: (p) => <ActiveBadge active={p.isActive} />,
        },
      ]}
    >
      {({ reload }) => (
        <>
          <AddEditProductModal
            opened={!!form}
            product={form?.product ?? null}
            onClose={() => {
              setForm(null);
              reload();
            }}
          />
          <DetailDialog
            opened={!!view}
            onClose={() => setView(null)}
            title={view?.name ?? ''}
            subtitle={
              view ? (
                <>
                  <span className="mono">{view.sku}</span> · Product
                </>
              ) : undefined
            }
            actions={
              view &&
              can('product:update') && (
                <Button
                  leftSection={<IconPencil size={16} aria-hidden />}
                  onClick={() => {
                    setForm({ product: view });
                    setView(null);
                  }}
                >
                  Edit product
                </Button>
              )
            }
          >
            {view && (
              <>
                <Stack gap="md">
                  <Field label="Size">{formatSize(view.size, view.unit)}</Field>
                  <Field label="Supplier">{supplierName(view.supplier)}</Field>
                  <Field label="Buying price">
                    <span className="num">{formatLkr(view.buyingPrice)}</span>
                  </Field>
                  <Field label="Selling price">
                    <span className="num">{formatLkr(view.sellingPrice)}</span>
                  </Field>
                  <Field label="Margin">
                    <span className="num">
                      {formatLkr(view.sellingPrice - view.buyingPrice)}
                      {view.buyingPrice > 0 &&
                        ` (${(((view.sellingPrice - view.buyingPrice) / view.buyingPrice) * 100).toFixed(1)}%)`}
                    </span>
                  </Field>
                </Stack>
                <StatusSection
                  label="STATUS"
                  title="Available for sale"
                  description="Inactive products can't be added to new sales."
                  checked={view.isActive}
                  disabled={busyId === view._id || !can('product:update')}
                  onChange={() => toggle(view)}
                />
              </>
            )}
          </DetailDialog>
        </>
      )}
    </ListPage>
  );
};

export default ProductsPage;
