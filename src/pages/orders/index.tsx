import { IconShoppingCart } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Group, Stack, Table, Text } from '@mantine/core';
import { ListPage } from '@/components/data/ListPage';
import { DetailDialog } from '@/components/DetailDialog';
import { DetailList } from '@/components/DetailList';
import { Field } from '@/components/Field';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type Order,
  deleteOrder,
  fetchOrderById,
  fetchOrders,
} from '@/store/orderSlice/orderSlice';
import type { Supplier } from '@/store/supplierSlice/supplierSlice';
import { useLookup } from '@/hooks/useLookup';
import { formatDate, formatLkr } from '@/utils/format';
import { useCan } from '@/utils/permissions';
import { OrderStatusBadge, OverdueBadge, PaymentStatusBadge } from './orderBadges';
import { METHOD_LABELS } from './orderLabels';

const SORT_MAP = {
  orderNo: 'orderNo',
  orderDate: 'orderDate',
  total: 'netTotal',
  paid: 'paidAmount',
  payment: 'paymentStatus',
};

const OrdersPage = () => {
  const can = useCan();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((s) => s.order);
  const suppliers = useLookup<Supplier>('suppliers');
  const [view, setView] = useState<Order | null>(null);
  // The list rows carry no payments: fetch the full order when one is opened.
  const [fetched, setFetched] = useState<Order | null>(null);
  const full = fetched && fetched._id === view?._id ? fetched : null;
  useEffect(() => {
    if (!view) return;
    let live = true;
    dispatch(fetchOrderById(view._id))
      .unwrap()
      .then((o) => live && setFetched(o))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [view, dispatch]);

  const filters = [
    {
      type: 'select' as const,
      key: 'supplier',
      label: 'Supplier',
      placeholder: 'All suppliers',
      options: suppliers.items.map((s) => ({ value: s._id, label: s.name })),
    },
    {
      type: 'select' as const,
      key: 'paymentStatus',
      label: 'Payment status',
      placeholder: 'All',
      options: [
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'partially_paid', label: 'Partially paid' },
        { value: 'paid', label: 'Paid' },
      ],
    },
    {
      type: 'select' as const,
      key: 'status',
      label: 'Order',
      placeholder: 'All',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      type: 'select' as const,
      key: 'overdue',
      label: 'Due date',
      placeholder: 'Any',
      options: [{ value: 'true', label: 'Overdue only' }],
    },
    {
      type: 'dateRange' as const,
      fromKey: 'dateFrom',
      toKey: 'dateTo',
      label: 'Order date',
      placeholder: 'Any date',
    },
  ];

  return (
    <>
      <ListPage<Order>
        title="Orders"
        description="Goods you buy from suppliers, what you've paid and what you still owe."
        entity={{ singular: 'order', plural: 'orders' }}
        searchPlaceholder="Search order no., supplier or reference"
        filters={filters}
        records={items}
        total={total}
        rowKey={(o) => o._id}
        rowName={(o) => o.orderNo}
        defaultSort={{ key: 'orderDate', dir: 'desc' }}
        sortMap={SORT_MAP}
        load={({ page, limit, searchText, sortBy, sortType, filters: f }) =>
          dispatch(
            fetchOrders({
              page,
              limit,
              searchText,
              sortBy,
              sortType,
              supplier: f.supplier,
              paymentStatus: f.paymentStatus,
              status: f.status,
              overdue: f.overdue,
              dateFrom: f.dateFrom,
              dateTo: f.dateTo,
            }),
          ).unwrap()
        }
        emptyDescription="Create an order to record goods you're buying from a supplier."
        emptyIcon={<IconShoppingCart size={20} />}
        createLabel="Create order"
        onCreate={can('order:create') ? () => navigate('/app/orders/new') : undefined}
        onView={setView}
        onEdit={can('order:update') ? (o) => navigate(`/app/orders/${o._id}/edit`) : undefined}
        remove={
          can('order:delete')
            ? {
                title: 'Delete order?',
                describe: (o) => (
                  <>
                    This permanently removes order <strong className="mono">{o.orderNo}</strong>.
                    Orders with payment history can&apos;t be deleted; cancel them instead.
                  </>
                ),
                run: (o) => dispatch(deleteOrder(o._id)).unwrap(),
                done: 'Order deleted.',
              }
            : undefined
        }
        columnsKey="orders"
        defaultHiddenColumns={['supplierRef', 'items', 'paid', 'dueDate', 'by', 'createdAt']}
        columns={[
          {
            key: 'orderNo',
            header: 'Order ID',
            sortable: true,
            primary: true,
            render: (o) => (
              <span className="mono" style={{ color: 'var(--ldg-accent-text)' }}>
                {o.orderNo}
              </span>
            ),
          },
          {
            key: 'orderDate',
            header: 'Date',
            sortable: true,
            render: (o) => <span className="num">{formatDate(o.orderDate)}</span>,
          },
          { key: 'supplier', header: 'Supplier', render: (o) => o.supplier?.name ?? '—' },
          { key: 'supplierRef', header: 'Supplier ref', render: (o) => o.supplierRef || '—' },
          { key: 'items', header: 'Items', align: 'right', render: (o) => o.lineItems.length },
          {
            key: 'total',
            header: 'Total',
            sortable: true,
            align: 'right',
            render: (o) => formatLkr(o.netTotal),
          },
          {
            key: 'paid',
            header: 'Paid',
            sortable: true,
            align: 'right',
            render: (o) => formatLkr(o.paidAmount),
          },
          {
            key: 'outstanding',
            header: 'Outstanding',
            align: 'right',
            render: (o) => (
              <Text span fw={o.outstandingAmount > 0 ? 600 : 400} inherit>
                {formatLkr(o.outstandingAmount)}
              </Text>
            ),
          },
          {
            key: 'dueDate',
            header: 'Due date',
            sortable: true,
            render: (o) => (o.dueDate ? <span className="num">{formatDate(o.dueDate)}</span> : '—'),
          },
          {
            key: 'payment',
            header: 'Status',
            sortable: true,
            badge: true,
            render: (o) => (
              <Group gap={4} wrap="wrap">
                <PaymentStatusBadge status={o.paymentStatus} />
                {o.isOverdue && <OverdueBadge />}
                <OrderStatusBadge status={o.orderStatus} />
              </Group>
            ),
          },
          {
            key: 'by',
            header: 'Created by',
            render: (o) => o.createdByName ?? '—',
          },
          {
            key: 'createdAt',
            header: 'Created',
            sortable: true,
            render: (o) => <span className="num">{formatDate(o.createdAt)}</span>,
          },
        ]}
      />
      <DetailDialog
        opened={!!view}
        onClose={() => setView(null)}
        title={view ? <span className="mono">{view.orderNo}</span> : ''}
        subtitle={view ? `${formatDate(view.orderDate)} · ${view.supplier?.name ?? ''}` : undefined}
        actions={
          view && (
            <Button component={Link} to={`/app/orders/${view._id}`}>
              Open order
            </Button>
          )
        }
      >
        {view && (
          <>
            <Stack gap="md">
              <Field label="Supplier">{view.supplier?.name}</Field>
              <Field label="Supplier reference">{view.supplierRef}</Field>
              <Field label="Payment due">{view.dueDate ? formatDate(view.dueDate) : '—'}</Field>
            </Stack>
            <Text className="eyebrow" mt="lg" mb="xs">
              Items
            </Text>
            <Table.ScrollContainer minWidth={380} type="native">
              <Table withRowBorders verticalSpacing="xs" horizontalSpacing="xs">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Product</Table.Th>
                    <Table.Th ta="right">Qty</Table.Th>
                    <Table.Th ta="right">Total</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {view.lineItems.map((li) => (
                    <Table.Tr key={li.product}>
                      <Table.Td>
                        <Text size="sm">{li.productName}</Text>
                        <Text size="xs" c="dimmed" className="num">
                          <span className="mono">{li.productSku}</span> · {li.size} ·{' '}
                          {formatLkr(li.unitPrice)}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {li.quantity}
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {formatLkr(li.lineTotal)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <Box mt="lg">
              <DetailList
                groups={[
                  [
                    {
                      label: 'Shipping',
                      value: <span className="num">{formatLkr(view.shipping)}</span>,
                    },
                    {
                      label: 'Other expenses',
                      value: <span className="num">{formatLkr(view.otherExpenses)}</span>,
                    },
                    {
                      label: 'Discount',
                      value: <span className="num">{formatLkr(view.discount)}</span>,
                    },
                    { label: 'Tax', value: <span className="num">{formatLkr(view.tax)}</span> },
                    {
                      label: 'Net total',
                      value: <strong className="num">{formatLkr(view.netTotal)}</strong>,
                    },
                    {
                      label: 'Paid',
                      value: <span className="num">{formatLkr(view.paidAmount)}</span>,
                    },
                    {
                      label: 'Outstanding',
                      value: <strong className="num">{formatLkr(view.outstandingAmount)}</strong>,
                    },
                  ],
                ]}
              />
            </Box>
            <Stack gap="md" mt="lg">
              {full?.payments && full.payments.length > 0 && (
                <Field label="Payments">
                  <Stack gap={2} mt={4}>
                    {full.payments.map((p) => (
                      <Group key={p._id} justify="space-between" wrap="nowrap">
                        <Text size="sm">{METHOD_LABELS[p.method]}</Text>
                        <Text size="sm" className="num">
                          {formatLkr(p.amount)}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Field>
              )}
            </Stack>
          </>
        )}
      </DetailDialog>
    </>
  );
};

export default OrdersPage;
