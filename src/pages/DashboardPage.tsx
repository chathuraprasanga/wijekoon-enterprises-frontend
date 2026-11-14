import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Box, Button, Flex, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { DataTable } from '@/components/data/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { InlineAlert } from '@/components/InlineAlert';
import { ChequeStatusBadge, PaidBadge } from '@/components/StatusBadge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCustomers } from '@/store/customerSlice/customerSlice';
import { fetchSuppliers } from '@/store/supplierSlice/supplierSlice';
import { fetchProducts } from '@/store/productSlice/productSlice';
import { fetchSales } from '@/store/saleSlice/saleSlice';
import { fetchCheques } from '@/store/chequeSlice/chequeSlice';
import { useLookup } from '@/hooks/useLookup';
import { customerName } from '@/pages/sales/saleLabels';
import type { Customer } from '@/store/customerSlice/customerSlice';
import { formatDate, formatLkr } from '@/utils/format';

const GLANCE = [
  { key: 'sale', label: 'Sales recorded', path: '/app/sales', cta: 'View sales' },
  { key: 'cheque', label: 'Cheques on file', path: '/app/cheques', cta: 'View cheques' },
  { key: 'customer', label: 'Customers', path: '/app/customers', cta: 'View customers' },
  { key: 'supplier', label: 'Suppliers', path: '/app/suppliers', cta: 'View suppliers' },
  { key: 'product', label: 'Products', path: '/app/products', cta: 'View products' },
] as const;

const ViewAll = ({ to }: { to: string }) => (
  <Anchor component={Link} to={to} size="sm" fw={500}>
    View all →
  </Anchor>
);

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const totals = useAppSelector((s) => ({
    customer: s.customer.total,
    supplier: s.supplier.total,
    product: s.product.total,
    sale: s.sale.total,
    cheque: s.cheque.total,
  }));
  const sales = useAppSelector((s) => s.sale.items);
  const cheques = useAppSelector((s) => s.cheque.items);
  const customers = useLookup<Customer>('customers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          dispatch(fetchCustomers({ page: 1, limit: 1 })).unwrap(),
          dispatch(fetchSuppliers({ page: 1, limit: 1 })).unwrap(),
          dispatch(fetchProducts({ page: 1, limit: 1 })).unwrap(),
          dispatch(
            fetchSales({ page: 1, limit: 5, sortBy: 'salesDate', sortType: 'desc' }),
          ).unwrap(),
          dispatch(
            fetchCheques({ page: 1, limit: 5, sortBy: 'depositDate', sortType: 'asc' }),
          ).unwrap(),
        ]);
      } catch (e) {
        if (live) setError(typeof e === 'string' ? e : 'Please try again.');
      } finally {
        if (live) setLoading(false);
      }
    };
    void load();
    return () => {
      live = false;
    };
  }, [dispatch, nonce]);

  const name = (id: string) => customerName(customers.byId.get(id));
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Today at a glance, plus what needs your attention."
        action={
          <Button
            leftSection={<IconPlus size={16} aria-hidden />}
            onClick={() => navigate('/app/cheques', { state: { create: true } })}
          >
            Add cheque
          </Button>
        }
      />
      <Stack gap="md">
        {error && (
          <InlineAlert
            tone="danger"
            title="The dashboard couldn't be loaded"
            action={
              <Button mt="xs" size="xs" variant="default" onClick={() => setNonce((n) => n + 1)}>
                Retry
              </Button>
            }
          >
            {error}
          </InlineAlert>
        )}
        <SectionCard title="Today at a glance" subtitle={today} flush>
          <SimpleGrid cols={{ base: 1, sm: 3, lg: 5 }} spacing={0}>
            {GLANCE.map((g) => (
              <Box
                key={g.key}
                component={Link}
                to={g.path}
                aria-label={`${g.label}: ${totals[g.key]}. ${g.cta}`}
                p="md"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  borderRight: '1px solid var(--ldg-border)',
                  borderBottom: '1px solid var(--ldg-border)',
                  marginRight: -1,
                  marginBottom: -1,
                }}
              >
                <Flex
                  direction={{ base: 'row', sm: 'column' }}
                  justify="space-between"
                  align={{ base: 'center', sm: 'flex-start' }}
                  gap={2}
                >
                  <Text size="sm" c="dimmed">
                    {g.label}
                  </Text>
                  {loading ? (
                    <Skeleton h={32} w={64} my={4} />
                  ) : (
                    <Text fz={30} fw={600} lh={1.25} c="var(--ldg-accent-text)" className="num">
                      {totals[g.key].toLocaleString('en-US')}
                    </Text>
                  )}
                  <Text size="sm" fw={500} c="var(--ldg-accent-text)" visibleFrom="sm">
                    {g.cta} →
                  </Text>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        </SectionCard>
        <SectionCard
          title="Recent sales"
          subtitle="Latest 5 sales recorded"
          action={<ViewAll to="/app/sales" />}
          flush
        >
          {!loading && sales.length === 0 ? (
            <EmptyState
              title="No sales yet"
              description="Sales appear here once they're recorded."
            />
          ) : (
            <DataTable
              caption="Recent sales"
              records={sales}
              rowKey={(s) => s._id}
              loading={loading}
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
                { key: 'customer', header: 'Customer', render: (s) => name(s.customer) },
                {
                  key: 'netTotal',
                  header: 'Total',
                  align: 'right',
                  render: (s) => formatLkr(s.netTotal),
                },
                {
                  key: 'status',
                  header: 'Status',
                  badge: true,
                  render: (s) => <PaidBadge paid={s.status === 'paid'} />,
                },
              ]}
            />
          )}
        </SectionCard>
        <SectionCard
          title="Cheques to follow up"
          subtitle="Past due, due today and coming up"
          action={<ViewAll to="/app/cheques" />}
          flush
        >
          {!loading && cheques.length === 0 ? (
            <EmptyState title="No cheques on file" description="Cheques you add appear here." />
          ) : (
            <DataTable
              caption="Cheques to follow up"
              records={cheques}
              rowKey={(c) => c._id}
              loading={loading}
              columns={[
                {
                  key: 'chequeNumber',
                  header: 'Cheque no.',
                  primary: true,
                  render: (c) => <span className="mono">{c.chequeNumber}</span>,
                },
                { key: 'customer', header: 'Customer', render: (c) => name(c.customer) },
                {
                  key: 'depositDate',
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
                  render: (c) => <ChequeStatusBadge depositDate={c.depositDate} />,
                },
              ]}
            />
          )}
        </SectionCard>
      </Stack>
    </>
  );
};

export default DashboardPage;
