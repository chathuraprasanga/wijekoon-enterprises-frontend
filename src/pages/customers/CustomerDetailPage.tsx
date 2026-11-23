import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Anchor,
  Avatar,
  Box,
  Button,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '@/components/PageHeader';
import { LocationMap } from '@/components/LocationMap';
import { SectionCard } from '@/components/SectionCard';
import { DetailList } from '@/components/DetailList';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { InlineAlert } from '@/components/InlineAlert';
import { DataTable } from '@/components/data/DataTable';
import {
  ActiveBadge,
  ChequeLifecycleBadge,
  CustomerTypeBadge,
  SaleStatusBadge,
} from '@/components/StatusBadge';
import { AddEditCustomerModal } from '@/pages/customers/AddEditCustomerModal';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { useAppDispatch } from '@/store/hooks';
import { type Customer, deleteCustomer } from '@/store/customerSlice/customerSlice';
import type { Sale } from '@/store/saleSlice/saleSlice';
import type { Cheque } from '@/store/chequeSlice/chequeSlice';
import { useLookup } from '@/hooks/useLookup';
import { toNotify } from '@/hooks/toNotify';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatDate, formatLkr, formatPhone, fullName, initials } from '@/utils/format';
import { useCan } from '@/utils/permissions';

const CustomerDetailPage = () => {
  const can = useCan();
  const canSales = can('sale:read');
  const canCheques = can('received-cheque:read');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const salesLookup = useLookup<Sale>('sales');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;
    const params = { page: 1, limit: 5, customer: id };
    // Sales and cheques are separate permissions: skip what this user can't read.
    const none = Promise.resolve({ data: { data: [] } });
    Promise.all([
      axiosInstance.get<Customer>(`/customers/${id}`),
      canSales
        ? axiosInstance.get<{ data: Sale[] }>('/sales/paged', { params })
        : (none as Promise<{ data: { data: Sale[] } }>),
      canCheques
        ? axiosInstance.get<{ data: Cheque[] }>('/cheques/paged', { params })
        : (none as Promise<{ data: { data: Cheque[] } }>),
    ])
      .then(([c, s, ch]) => {
        if (!live) return;
        setCustomer(c.data);
        setSales(s.data.data);
        setCheques(ch.data.data);
      })
      .catch((e) => live && setError(getErrorMessage(e)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id, nonce, canSales, canCheques]);

  const handleDelete = async () => {
    if (!customer) return;
    setDeleting(true);
    try {
      await dispatch(deleteCustomer(customer._id)).unwrap();
      toNotify('Deleted', 'Customer deleted.', 'SUCCESS');
      navigate('/app/customers', { replace: true });
    } catch (e) {
      toNotify("Couldn't delete customer", e as string, 'ERROR');
      setDeleting(false);
    }
  };

  const name = customer ? fullName(customer) : 'Customer';

  return (
    <>
      <PageHeader
        title={name}
        badge={customer && <ActiveBadge active={customer.isActive} />}
        description="Customer record and recent activity."
        inlineAction
        crumbs={[
          { label: 'Directory' },
          { label: 'Customers', to: '/app/customers' },
          { label: name },
        ]}
        action={
          customer && (
            <Group gap="xs" wrap="nowrap">
              {can('customer:update') && (
                <Button
                  variant="default"
                  leftSection={<IconPencil size={16} aria-hidden />}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
              {can('customer:delete') && (
                <Button
                  variant="default"
                  leftSection={<IconTrash size={16} aria-hidden />}
                  styles={{
                    root: {
                      borderColor: 'var(--ldg-danger-border)',
                      color: 'var(--ldg-danger-text)',
                    },
                  }}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
              )}
            </Group>
          )
        }
      />
      {error && (
        <InlineAlert
          tone="danger"
          title="This customer couldn't be loaded"
          action={
            <Button
              mt="xs"
              size="xs"
              variant="default"
              onClick={() => {
                setError(null);
                setLoading(true);
                setNonce((n) => n + 1);
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </InlineAlert>
      )}
      {loading && !customer && <Skeleton h={260} />}
      {customer && (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" style={{ alignItems: 'start' }}>
          <SectionCard title="Contact information">
            <Group gap="md" wrap="nowrap" mb="md">
              <Avatar size={52} radius="xl" color="forest" aria-hidden>
                {initials(customer)}
              </Avatar>
              <Box>
                <Text fw={600}>{name}</Text>
                <Text size="sm" c="dimmed">
                  Customer since {formatDate(customer.createdAt)}
                </Text>
              </Box>
            </Group>
            <DetailList
              stacked
              groups={[
                [
                  {
                    label: 'Mobile',
                    value: <span className="num">{formatPhone(customer.phone)}</span>,
                  },
                  { label: 'Email', value: customer.email },
                  { label: 'Address', value: customer.address },
                  { label: 'Type', value: <CustomerTypeBadge type={customer.customerType} /> },
                  { label: 'Status', value: <ActiveBadge active={customer.isActive} /> },
                ],
              ]}
            />
            {customer.location && (
              <Box mt="md">
                <Text size="sm" c="dimmed" mb={4}>
                  Location
                </Text>
                <Text className="num" mb={6}>
                  {customer.location.lat.toFixed(5)}, {customer.location.lng.toFixed(5)}
                </Text>
                <LocationMap
                  lat={customer.location.lat}
                  lng={customer.location.lng}
                  label={name}
                  customerType={customer.customerType}
                />
              </Box>
            )}
          </SectionCard>
          <Stack gap="md" style={{ gridColumn: 'span 2' }}>
            {can('sale:read') && (
              <SectionCard
                title="Recent sales"
                action={
                  <Anchor component={Link} to="/app/sales" size="sm" fw={500}>
                    View all →
                  </Anchor>
                }
                flush
              >
                {sales.length === 0 ? (
                  <EmptyState
                    title="No sales yet"
                    description="Sales for this customer appear here."
                  />
                ) : (
                  <DataTable
                    caption="Recent sales"
                    records={sales}
                    rowKey={(s) => s._id}
                    columns={[
                      {
                        key: 'salesId',
                        header: 'Sale ID',
                        primary: true,
                        render: (s) => (
                          <span className="mono" style={{ color: 'var(--ldg-accent-text)' }}>
                            {s.salesId}
                          </span>
                        ),
                      },
                      {
                        key: 'date',
                        header: 'Date',
                        render: (s) => <span className="num">{formatDate(s.salesDate)}</span>,
                      },
                      {
                        key: 'total',
                        header: 'Total',
                        align: 'right',
                        render: (s) => formatLkr(s.netTotal),
                      },
                      {
                        key: 'status',
                        header: 'Status',
                        badge: true,
                        render: (s) => <SaleStatusBadge status={s.status} />,
                      },
                    ]}
                  />
                )}
              </SectionCard>
            )}
            {can('received-cheque:read') && (
              <SectionCard
                title="Recent cheques"
                action={
                  <Anchor component={Link} to="/app/cheques" size="sm" fw={500}>
                    View all →
                  </Anchor>
                }
                flush
              >
                {cheques.length === 0 ? (
                  <EmptyState
                    title="No cheques yet"
                    description="Cheques from this customer appear here."
                  />
                ) : (
                  <DataTable
                    caption="Recent cheques"
                    records={cheques}
                    rowKey={(c) => c._id}
                    columns={[
                      {
                        key: 'no',
                        header: 'Cheque no.',
                        primary: true,
                        render: (c) => <span className="mono">{c.chequeNumber}</span>,
                      },
                      {
                        key: 'sale',
                        header: 'Sale',
                        render: (c) => (
                          <span className="mono">
                            {salesLookup.byId.get(c.sale ?? '')?.salesId ?? '—'}
                          </span>
                        ),
                      },
                      {
                        key: 'deposit',
                        header: 'Deposit date',
                        render: (c) => <span className="num">{formatDate(c.depositDate)}</span>,
                      },
                      {
                        key: 'amount',
                        header: 'Amount',
                        align: 'right',
                        render: (c) => formatLkr(c.amount),
                      },
                      {
                        key: 'state',
                        header: 'Status',
                        badge: true,
                        render: (c) => <ChequeLifecycleBadge status={c.status} />,
                      },
                    ]}
                  />
                )}
              </SectionCard>
            )}
          </Stack>
        </SimpleGrid>
      )}
      <AddEditCustomerModal
        opened={editing}
        customer={customer}
        onClose={() => {
          setEditing(false);
          setNonce((n) => n + 1);
        }}
      />
      <ConfirmDialog
        opened={confirmDelete}
        title="Delete customer?"
        loading={deleting}
        confirmLabel="Delete customer"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      >
        This permanently removes <strong>{name}</strong> and their contact details. Their sales and
        cheques stay on file.
      </ConfirmDialog>
    </>
  );
};

export default CustomerDetailPage;
