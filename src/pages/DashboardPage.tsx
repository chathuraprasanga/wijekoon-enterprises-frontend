import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Button, Grid, SegmentedControl, SimpleGrid, Stack } from '@mantine/core';
import { IconAlertCircle, IconCircleCheck, IconClock, IconPlus } from '@tabler/icons-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { DataTable } from '@/components/data/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { InlineAlert } from '@/components/InlineAlert';
import { ChequeLifecycleBadge, SaleStatusBadge } from '@/components/StatusBadge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSales } from '@/store/saleSlice/saleSlice';
import { fetchCheques } from '@/store/chequeSlice/chequeSlice';
import { useLookup } from '@/hooks/useLookup';
import { customerName } from '@/pages/sales/saleLabels';
import type { Customer } from '@/store/customerSlice/customerSlice';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatDate, formatLkr } from '@/utils/format';
import { useCan } from '@/utils/permissions';
import { ChartCard } from '@/pages/dashboard/ChartCard';
import { DashboardFilters } from '@/pages/dashboard/DashboardFilters';
import { KpiTile } from '@/pages/dashboard/KpiTile';
import {
  Donut,
  DueColumns,
  GroupedBars,
  HBars,
  LineChart,
  StackBar,
} from '@/pages/dashboard/charts';
import { fetchDashboard, type DashboardData } from '@/pages/dashboard/dashboardApi';
import { CHEQUE_STATUS, PAY_METHOD, SALE_STATUS } from '@/pages/dashboard/chartKinds';
import {
  lkrShort,
  presetRange,
  rangeLabel,
  type Preset,
  type Range,
} from '@/pages/dashboard/dashboardUtils';

const ViewAll = ({ to }: { to: string }) => (
  <Anchor component={Link} to={to} size="sm" fw={500}>
    View all →
  </Anchor>
);

const SALE_ICON = {
  paid: <IconCircleCheck size={15} aria-hidden />,
  partially_paid: <IconClock size={15} aria-hidden />,
  not_paid: <IconAlertCircle size={15} aria-hidden />,
} as const;
const AGEING = [
  { label: '0–30 days', kind: 'solid' },
  { label: '31–60 days', kind: 'dots' },
  { label: '60+ days', kind: 'cross' },
] as const;

const share = (v: number, total: number) =>
  `${total > 0 ? ((v / total) * 100).toFixed(1) : '0.0'}%`;

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const can = useCan();
  const canSales = can('sale:read');
  const canOrders = can('order:read');
  const canCheques = can('received-cheque:read');
  const canCustomers = canSales && can('customer:read');
  const canSuppliers = canOrders && can('supplier:read');
  const user = useAppSelector((s) => s.auth.user);
  const sales = useAppSelector((s) => s.sale.items);
  const cheques = useAppSelector((s) => s.cheque.items);
  const customers = useLookup<Customer>('customers');
  const [range, setRange] = useState<Range>(() => presetRange('mtd'));
  const [preset, setPreset] = useState<Preset>('mtd');
  const [compare, setCompare] = useState(true);
  const [prodBy, setProdBy] = useState<'quantity' | 'revenue'>('quantity');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [listsLoading, setListsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const anyData = canSales || canOrders || canCheques;

  // Charts: refetched whenever the range changes.
  useEffect(() => {
    if (!anyData) return;
    let live = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await fetchDashboard(range.from, range.to);
        if (live) setData(d);
      } catch (e) {
        if (live) setError(getErrorMessage(e));
      } finally {
        if (live) setLoading(false);
      }
    };
    void load();
    return () => {
      live = false;
    };
  }, [anyData, range.from, range.to, nonce]);

  // The two lists at the bottom ignore the date filter.
  useEffect(() => {
    let live = true;
    const load = async () => {
      setListsLoading(true);
      await Promise.allSettled([
        canSales &&
          dispatch(
            fetchSales({ page: 1, limit: 5, sortBy: 'salesDate', sortType: 'desc' }),
          ).unwrap(),
        canCheques &&
          dispatch(
            fetchCheques({ page: 1, limit: 5, sortBy: 'depositDate', sortType: 'asc' }),
          ).unwrap(),
      ]);
      if (live) setListsLoading(false);
    };
    void load();
    return () => {
      live = false;
    };
  }, [dispatch, nonce, canSales, canCheques]);

  const name = (id: string) => customerName(customers.byId.get(id));
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const series = data?.series ?? [];
  const spark = (k: 'sales' | 'purchases' | 'received') => series.map((p) => p[k] ?? 0);
  const t = data?.totals;
  const salesTotal = t?.sales?.value ?? 0;
  const prevLabel = data ? rangeLabel(data.range.previousFrom, data.range.previousTo) : '';
  const noSales = !!t?.sales && t.sales.value === 0 && t.sales.previous === 0;
  const split = data?.paymentSplit ?? [];
  const status = data?.saleStatus ?? [];
  const proj = data?.topProducts?.[prodBy] ?? [];
  const pipeline = CHEQUE_STATUS.map((c) => ({
    label: c.label,
    kind: c.kind,
    value: data?.chequePipeline?.find((p) => p.status === c.status)?.value ?? 0,
  }));

  return (
    <>
      <PageHeader
        title={`Welcome${user ? `, ${user.firstName}` : ''}`}
        description={today}
        action={
          can('sale:create') ? (
            <Button
              leftSection={<IconPlus size={16} aria-hidden />}
              onClick={() => navigate('/app/sales/new')}
            >
              New sale
            </Button>
          ) : undefined
        }
      />
      <Stack gap="md">
        {error && (
          <InlineAlert
            tone="danger"
            title="The dashboard couldn't be loaded"
            action={
              <Button mt="xs" size="xs" variant="default" onClick={() => setNonce((n) => n + 1)}>
                Try again
              </Button>
            }
          >
            {error}
          </InlineAlert>
        )}
        {!anyData && (
          <EmptyState
            title="Nothing to show yet"
            description="Your role does not include viewing any records. Contact an administrator if you need access."
          />
        )}
        {anyData && (
          <DashboardFilters
            range={range}
            preset={preset}
            compare={compare}
            previous={data ? { from: data.range.previousFrom, to: data.range.previousTo } : null}
            onChange={(r, p) => {
              setRange(r);
              setPreset(p);
            }}
            onCompare={setCompare}
          />
        )}
        {anyData && (
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3, xl: 6 }} spacing="sm">
            {canSales && (
              <KpiTile
                label="Sales"
                loading={loading}
                value={salesTotal}
                previous={compare ? t?.sales?.previous : undefined}
                spark={spark('sales')}
                emptyNote="No sales in this period"
              />
            )}
            {canOrders && (
              <KpiTile
                label="Purchases"
                loading={loading}
                value={t?.purchases?.value ?? 0}
                previous={compare ? t?.purchases?.previous : undefined}
                spark={spark('purchases')}
              />
            )}
            {canSales && (
              <KpiTile
                label="Received"
                loading={loading}
                value={t?.received?.value ?? 0}
                previous={compare ? t?.received?.previous : undefined}
                spark={spark('received')}
              />
            )}
            {canSales && (
              <KpiTile
                label="Outstanding receivables"
                loading={loading}
                value={t?.receivables ?? 0}
              />
            )}
            {canOrders && (
              <KpiTile label="Outstanding payables" loading={loading} value={t?.payables ?? 0} />
            )}
            {canCheques && (
              <KpiTile
                label="Cheques pending"
                loading={loading}
                value={t?.cheques?.value ?? 0}
                prefix={String(t?.cheques?.count ?? 0)}
              />
            )}
          </SimpleGrid>
        )}
        <Grid gap="md">
          {canSales && (
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <ChartCard
                title="Sales over time"
                subtitle={`${series.length > 92 ? 'Weekly' : 'Daily'}, ${rangeLabel(range.from, range.to)}`}
                scope="period"
                loading={loading}
                empty={
                  noSales
                    ? {
                        title: 'No sales in this period',
                        description: 'Try a longer range, or record a sale.',
                      }
                    : null
                }
              >
                <LineChart series={series} compare={compare} prevLabel={prevLabel} />
              </ChartCard>
            </Grid.Col>
          )}
          {canSales && (
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <ChartCard
                title="Payment method split"
                subtitle="Share of sales value"
                scope="period"
                loading={loading}
                empty={
                  split.length === 0
                    ? {
                        title: 'No sales in this period',
                        description: 'Try a longer range, or record a sale.',
                      }
                    : null
                }
              >
                <Donut
                  noun="Sales"
                  centre={`LKR ${lkrShort(split.reduce((n, p) => n + p.value, 0))}`}
                  sub={`${split.length} method${split.length === 1 ? '' : 's'}`}
                  slices={split.map((p) => ({
                    label: PAY_METHOD[p.method]?.label ?? p.method,
                    kind: PAY_METHOD[p.method]?.kind ?? 'grey',
                    value: p.value,
                    count: p.count,
                  }))}
                />
              </ChartCard>
            </Grid.Col>
          )}
          {canSales && canOrders && (
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <ChartCard
                title="Sales vs purchases"
                subtitle={series.length <= 98 ? 'Weekly totals, LKR' : '30-day totals, LKR'}
                scope="period"
                loading={loading}
                empty={
                  noSales && (t?.purchases?.value ?? 0) === 0
                    ? { title: 'Nothing in this period', description: 'Try a longer range.' }
                    : null
                }
              >
                <GroupedBars series={series} />
              </ChartCard>
            </Grid.Col>
          )}
          {canSales && (
            <Grid.Col span={{ base: 12, lg: canOrders ? 4 : 12 }}>
              <ChartCard
                title="Sale status"
                subtitle="Value by payment status"
                scope="period"
                loading={loading}
                empty={
                  status.length === 0
                    ? {
                        title: 'No sales in this period',
                        description: 'Try a longer range, or record a sale.',
                      }
                    : null
                }
              >
                <StackBar
                  items={(['paid', 'partially_paid', 'not_paid'] as const).map((k) => ({
                    label: SALE_STATUS[k].label,
                    kind: SALE_STATUS[k].kind,
                    icon: SALE_ICON[k],
                    value: status.find((s) => s.status === k)?.value ?? 0,
                  }))}
                />
              </ChartCard>
            </Grid.Col>
          )}
          {canCustomers && (
            <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
              <ChartCard
                title="Top customers"
                subtitle="By sales value, top 5"
                scope="period"
                loading={loading}
                empty={
                  (data?.topCustomers ?? []).length === 0
                    ? { title: 'No sales in this period', description: 'Try a longer range.' }
                    : null
                }
              >
                <HBars
                  kind="solid"
                  rows={(data?.topCustomers ?? []).map((c) => ({
                    name: c.name,
                    value: c.value,
                    display: `LKR ${c.value.toLocaleString('en-US')}`,
                    tip: [
                      { label: 'Sales', value: formatLkr(c.value) },
                      { label: 'Orders', value: String(c.orders) },
                      { label: 'Share', value: share(c.value, salesTotal) },
                    ],
                  }))}
                />
              </ChartCard>
            </Grid.Col>
          )}
          {canSales && (
            <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
              <ChartCard
                title="Top products"
                subtitle={`Top 5 by ${prodBy === 'quantity' ? 'quantity sold' : 'revenue'}`}
                scope="period"
                loading={loading}
                control={
                  <SegmentedControl
                    size="xs"
                    aria-label="Rank products by"
                    value={prodBy}
                    onChange={(v) => setProdBy(v as 'quantity' | 'revenue')}
                    data={[
                      { value: 'quantity', label: 'Quantity' },
                      { value: 'revenue', label: 'Revenue' },
                    ]}
                  />
                }
                empty={
                  proj.length === 0
                    ? { title: 'No sales in this period', description: 'Try a longer range.' }
                    : null
                }
              >
                <HBars
                  kind="stripe"
                  rows={proj.map((p) => ({
                    name: p.name,
                    value: prodBy === 'quantity' ? p.quantity : p.revenue,
                    display:
                      prodBy === 'quantity'
                        ? `${p.quantity.toLocaleString('en-US')} units`
                        : `LKR ${p.revenue.toLocaleString('en-US')}`,
                    tip: [
                      { label: 'Units', value: p.quantity.toLocaleString('en-US') },
                      { label: 'Revenue', value: formatLkr(p.revenue) },
                    ],
                  }))}
                />
              </ChartCard>
            </Grid.Col>
          )}
          {canSuppliers && (
            <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
              <ChartCard
                title="Top suppliers"
                subtitle="By purchase value, top 5"
                scope="period"
                loading={loading}
                empty={
                  (data?.topSuppliers ?? []).length === 0
                    ? { title: 'No purchases in this period', description: 'Try a longer range.' }
                    : null
                }
              >
                <HBars
                  kind="dots"
                  rows={(data?.topSuppliers ?? []).map((s) => ({
                    name: s.name,
                    value: s.value,
                    display: `LKR ${s.value.toLocaleString('en-US')}`,
                    tip: [
                      { label: 'Purchases', value: formatLkr(s.value) },
                      { label: 'Orders', value: String(s.orders) },
                      { label: 'Share', value: share(s.value, t?.purchases?.value ?? 0) },
                    ],
                  }))}
                />
              </ChartCard>
            </Grid.Col>
          )}
          {canCheques && (
            <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
              <ChartCard
                title="Cheque pipeline"
                subtitle="Value by status, LKR"
                scope="current"
                loading={loading}
                empty={
                  pipeline.every((p) => p.value === 0) && !loading
                    ? {
                        title: 'No cheques yet',
                        description: 'Cheques you receive show here by status.',
                      }
                    : null
                }
              >
                <StackBar items={pipeline} />
              </ChartCard>
            </Grid.Col>
          )}
          {canCheques && (
            <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
              <ChartCard
                title="Cheques due"
                subtitle="By week of deposit date"
                scope="current"
                loading={loading}
                empty={
                  (data?.chequesDue ?? []).every((b) => b.count === 0) && !loading
                    ? {
                        title: 'No cheques waiting',
                        description: 'Cheques you receive will show here by week.',
                      }
                    : null
                }
              >
                <DueColumns buckets={data?.chequesDue ?? []} />
              </ChartCard>
            </Grid.Col>
          )}
          {canSales && (
            <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
              <ChartCard
                title="Receivables ageing"
                subtitle="Outstanding by days overdue"
                scope="current"
                loading={loading}
                empty={
                  (data?.ageing ?? []).every((v) => v === 0) && !loading
                    ? {
                        title: 'Nothing outstanding',
                        description: 'Credit sales that are not yet paid show here.',
                      }
                    : null
                }
              >
                <HBars
                  kind="solid"
                  rows={AGEING.map((a, i) => ({
                    name: a.label,
                    kind: a.kind,
                    value: data?.ageing?.[i] ?? 0,
                    display: formatLkr(data?.ageing?.[i] ?? 0),
                  }))}
                />
              </ChartCard>
            </Grid.Col>
          )}
        </Grid>

        {canSales && (
          <SectionCard
            title="Recent sales"
            subtitle="Latest 5 sales recorded"
            action={<ViewAll to="/app/sales" />}
            flush
          >
            {!listsLoading && sales.length === 0 ? (
              <EmptyState
                title="No sales yet"
                description="Sales appear here once they're recorded."
              />
            ) : (
              <DataTable
                caption="Recent sales"
                records={sales}
                rowKey={(s) => s._id}
                loading={listsLoading}
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
                    render: (s) => <SaleStatusBadge status={s.status} />,
                  },
                ]}
              />
            )}
          </SectionCard>
        )}
        {canCheques && (
          <SectionCard
            title="Cheques to follow up"
            subtitle="Past due, due today and coming up"
            action={<ViewAll to="/app/cheques" />}
            flush
          >
            {!listsLoading && cheques.length === 0 ? (
              <EmptyState title="No cheques yet" description="Cheques you add appear here." />
            ) : (
              <DataTable
                caption="Cheques to follow up"
                records={cheques}
                rowKey={(c) => c._id}
                loading={listsLoading}
                columns={[
                  {
                    key: 'chequeNumber',
                    header: 'Cheque no.',
                    primary: true,
                    render: (c) => <span className="mono">{c.chequeNumber}</span>,
                  },
                  { key: 'customer', header: 'Customer', render: (c) => name(c.customer ?? '') },
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
                    render: (c) => <ChequeLifecycleBadge status={c.status} />,
                  },
                ]}
              />
            )}
          </SectionCard>
        )}
      </Stack>
    </>
  );
};

export default DashboardPage;
