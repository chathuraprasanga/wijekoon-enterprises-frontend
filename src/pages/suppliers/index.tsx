import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconPencil, IconTruckDelivery } from '@tabler/icons-react';
import { ListPage } from '@/components/data/ListPage';
import { DetailDialog } from '@/components/DetailDialog';
import { SimpleGrid, Stack } from '@mantine/core';
import { Field } from '@/components/Field';
import { StatusSection } from '@/components/StatusSection';
import { ActiveBadge } from '@/components/StatusBadge';
import { AddEditSupplierModal } from '@/pages/suppliers/AddEditSupplierModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type Supplier,
  deleteSupplier,
  fetchSuppliers,
  updateSupplier,
} from '@/store/supplierSlice/supplierSlice';
import { useActiveToggle } from '@/hooks/useActiveToggle';
import { formatDate, formatPhone, orDash } from '@/utils/format';
import { useCan } from '@/utils/permissions';

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

const SuppliersPage = () => {
  const can = useCan();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((s) => s.supplier);
  const [form, setForm] = useState<{ supplier: Supplier | null } | null>(null);
  const [view, setView] = useState<Supplier | null>(null);

  const { toggle, busyId } = useActiveToggle<Supplier>(
    'Supplier',
    (s) =>
      dispatch(
        updateSupplier({
          _id: s._id,
          name: s.name,
          phone: s.phone,
          email: s.email,
          address: s.address,
          chequeIssuedName: s.chequeIssuedName,
          isActive: !s.isActive,
        }),
      ).unwrap(),
    (id, isActive) => setView((v) => (v && v._id === id ? { ...v, isActive } : v)),
  );

  return (
    <ListPage<Supplier>
      title="Suppliers"
      description="Mills, importers and estates you buy from."
      entity={{ singular: 'supplier', plural: 'suppliers' }}
      searchPlaceholder="Search by name, phone or email"
      filters={FILTERS}
      records={items}
      total={total}
      rowKey={(s) => s._id}
      rowName={(s) => s.name}
      defaultSort={{ key: 'name', dir: 'asc' }}
      load={({ page, limit, searchText, sortBy, sortType, filters }) =>
        dispatch(
          fetchSuppliers({ page, limit, searchText, status: filters.status, sortBy, sortType }),
        ).unwrap()
      }
      createLabel="Add supplier"
      emptyDescription="Add the mills and importers you buy from. You'll be able to link products to them."
      emptyIcon={<IconTruckDelivery size={20} />}
      onCreate={can('supplier:create') ? () => setForm({ supplier: null }) : undefined}
      onView={setView}
      onEdit={can('supplier:update') ? (supplier) => setForm({ supplier }) : undefined}
      remove={
        can('supplier:delete')
          ? {
              title: 'Delete supplier?',
              describe: (s) => (
                <>
                  This permanently removes <strong>{s.name}</strong> and their contact details.
                  Products linked to this supplier stay on file.
                </>
              ),
              run: (s) => dispatch(deleteSupplier(s._id)).unwrap(),
              done: 'Supplier deleted.',
            }
          : undefined
      }
      columns={[
        {
          key: 'name',
          header: 'Name',
          sortable: true,
          primary: true,
          render: (s) => <b style={{ fontWeight: 500 }}>{s.name}</b>,
        },
        {
          key: 'phone',
          header: 'Phone',
          render: (s) => <span className="num">{formatPhone(s.phone)}</span>,
        },
        {
          key: 'email',
          header: 'Email',
          sortable: true,
          hideBelow: 'md',
          render: (s) => orDash(s.email),
        },
        { key: 'address', header: 'Address', sortable: true, render: (s) => orDash(s.address) },
        {
          key: 'status',
          header: 'Status',
          badge: true,
          render: (s) => <ActiveBadge active={s.isActive} />,
        },
      ]}
    >
      {({ reload }) => (
        <>
          <AddEditSupplierModal
            opened={!!form}
            supplier={form?.supplier ?? null}
            onClose={() => setForm(null)}
            onSaved={reload}
          />
          <DetailDialog
            opened={!!view}
            onClose={() => setView(null)}
            title={view?.name ?? ''}
            subtitle={view ? `Supplier · since ${formatDate(view.createdAt)}` : undefined}
            actions={
              view &&
              can('supplier:update') && (
                <Button
                  leftSection={<IconPencil size={16} aria-hidden />}
                  onClick={() => {
                    setForm({ supplier: view });
                    setView(null);
                  }}
                >
                  Edit supplier
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
                <Stack gap="md" mt="md">
                  <Field label="Address">{view.address}</Field>
                  <Field label="Cheque issued name">{view.chequeIssuedName}</Field>
                </Stack>
                <StatusSection
                  label="STATUS"
                  title="Active supplier"
                  description="Inactive suppliers can't be picked on new products."
                  checked={view.isActive}
                  disabled={busyId === view._id || !can('supplier:update')}
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

export default SuppliersPage;
