import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Group, SimpleGrid, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconCash, IconPencil, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { DetailList } from '@/components/DetailList';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { InlineAlert } from '@/components/InlineAlert';
import { toNotify } from '@/hooks/toNotify';
import { useAppDispatch } from '@/store/hooks';
import {
  type Order,
  type OrderPayment,
  deleteOrder,
  fetchOrderById,
} from '@/store/orderSlice/orderSlice';
import { formatDate, formatLkr } from '@/utils/format';
import { useCan } from '@/utils/permissions';
import { METHOD_LABELS } from './orderLabels';
import {
  OrderStatusBadge,
  OverdueBadge,
  PaymentRowStatusBadge,
  PaymentStatusBadge,
} from './orderBadges';
import { RecordPaymentModal } from './RecordPaymentModal';

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const can = useCan();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  const [paying, setPaying] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const reload = () => setNonce((n) => n + 1);

  useEffect(() => {
    if (!id) return;
    let live = true;
    dispatch(fetchOrderById(id))
      .unwrap()
      .then((o) => {
        if (!live) return;
        setOrder(o);
        setError(null);
      })
      .catch((e) => live && setError(e as string))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id, nonce, dispatch]);

  const open = !!order && order.orderStatus !== 'cancelled';
  const payable = !!order && order.outstandingAmount > 0;

  const handleDelete = async () => {
    if (!order) return;
    setDeleting(true);
    try {
      await dispatch(deleteOrder(order._id)).unwrap();
      toNotify('Deleted', 'Order deleted.', 'SUCCESS');
      navigate('/app/orders', { replace: true });
    } catch (e) {
      toNotify("Couldn't delete order", e as string, 'ERROR');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const chequeLabel = (p: OrderPayment) =>
    p.issuedCheque
      ? `No. ${p.issuedCheque.chequeNumber}`
      : p.customerCheque
        ? `No. ${p.customerCheque.chequeNumber}`
        : (p.reference ?? '—');

  const title = order?.orderNo ?? 'Order';

  return (
    <>
      <PageHeader
        title={title}
        badge={order && <OrderStatusBadge status={order.orderStatus} />}
        description="Items, payments and what's still owed."
        inlineAction
        crumbs={[{ label: 'Trading' }, { label: 'Orders', to: '/app/orders' }, { label: title }]}
        action={
          order && (
            <Group gap="xs" wrap="wrap">
              {open && can('order:update') && (
                <Button
                  leftSection={<IconCash size={16} aria-hidden />}
                  onClick={() => setPaying(true)}
                  disabled={!payable && order.paymentStatus === 'paid'}
                >
                  Record payment
                </Button>
              )}
              {open && can('order:update') && (
                <Button
                  variant="default"
                  leftSection={<IconPencil size={16} aria-hidden />}
                  onClick={() => navigate(`/app/orders/${order._id}/edit`)}
                >
                  Edit
                </Button>
              )}
              {can('order:delete') && (
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
          title="This order couldn't be loaded"
          action={
            <Button
              mt="xs"
              size="xs"
              variant="default"
              onClick={() => {
                setError(null);
                setLoading(true);
                reload();
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </InlineAlert>
      )}
      {loading && !order && <Skeleton h={260} />}
      {order && (
        <Stack gap="md">
          {order.orderStatus === 'cancelled' && (
            <InlineAlert tone="info" title="This order was cancelled">
              {order.cancelReason || 'No reason was recorded.'}
            </InlineAlert>
          )}
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <SectionCard title="Order">
              <DetailList
                stacked
                groups={[
                  [
                    {
                      label: 'Order date',
                      value: <span className="num">{formatDate(order.orderDate)}</span>,
                    },
                    { label: 'Supplier reference', value: order.supplierRef },
                    {
                      label: 'Payment due',
                      value: order.dueDate ? formatDate(order.dueDate) : '—',
                    },
                    { label: 'Notes', value: order.notes },
                    { label: 'Created by', value: order.createdByName },
                    { label: 'Created', value: formatDate(order.createdAt) },
                    { label: 'Last updated', value: formatDate(order.updatedAt) },
                  ],
                ]}
              />
            </SectionCard>
            <SectionCard title="Supplier">
              <DetailList
                stacked
                groups={[
                  [
                    { label: 'Name', value: order.supplier.name },
                    { label: 'Phone', value: order.supplier.phone },
                    { label: 'Email', value: order.supplier.email },
                    { label: 'Address', value: order.supplier.address },
                  ],
                ]}
              />
            </SectionCard>
            <SectionCard title="Payment">
              <Group gap={6} mb="md">
                <PaymentStatusBadge status={order.paymentStatus} />
                {order.isOverdue && <OverdueBadge />}
              </Group>
              <DetailList
                stacked
                groups={[
                  [
                    {
                      label: 'Total',
                      value: <span className="num">{formatLkr(order.netTotal)}</span>,
                    },
                    {
                      label: 'Paid',
                      value: <span className="num">{formatLkr(order.paidAmount)}</span>,
                    },
                    {
                      label: 'Outstanding',
                      value: <strong className="num">{formatLkr(order.outstandingAmount)}</strong>,
                    },
                  ],
                ]}
              />
            </SectionCard>
          </SimpleGrid>

          <SectionCard title="Items" flush>
            <Table.ScrollContainer minWidth={640} type="native">
              <Table withRowBorders verticalSpacing="xs" horizontalSpacing="md">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Item</Table.Th>
                    <Table.Th ta="right">Qty</Table.Th>
                    <Table.Th ta="right">Unit price</Table.Th>
                    <Table.Th ta="right">Discount</Table.Th>
                    <Table.Th ta="right">Tax</Table.Th>
                    <Table.Th ta="right">Total</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {order.lineItems.map((l) => (
                    <Table.Tr key={l.product}>
                      <Table.Td>
                        <Text size="sm">{l.productName}</Text>
                        <Text size="xs" c="dimmed">
                          <span className="mono">{l.productSku}</span> · {l.size}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {l.quantity}
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {formatLkr(l.unitPrice)}
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {formatLkr(l.discount)}
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {formatLkr(l.tax)}
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {formatLkr(l.lineTotal)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <Box p="md" style={{ borderTop: '1px solid var(--ldg-border)' }}>
              <Stack gap={4} maw={320} ml="auto">
                {[
                  ['Shipping', order.shipping],
                  ['Other charges', order.otherExpenses],
                  ['Order tax', order.tax],
                  ['Order discount', order.discount],
                ].map(([label, v]) => (
                  <Group key={label as string} justify="space-between">
                    <Text size="sm" c="dimmed">
                      {label}
                    </Text>
                    <Text size="sm" className="num">
                      {formatLkr(v as number)}
                    </Text>
                  </Group>
                ))}
                <Group justify="space-between">
                  <Text fw={600}>Net total</Text>
                  <Text fw={600} className="num">
                    {formatLkr(order.netTotal)}
                  </Text>
                </Group>
              </Stack>
            </Box>
          </SectionCard>

          {can('order:read') && (
            <SectionCard
              title="Payment history"
              subtitle="Payments recorded against this order."
              flush
            >
              {!order.payments?.length ? (
                <EmptyState
                  title="No payments yet"
                  description={
                    order.dueDate
                      ? `Due ${formatDate(order.dueDate)}. Record a payment when you pay the supplier.`
                      : 'Record a payment when you pay the supplier.'
                  }
                />
              ) : (
                <Table.ScrollContainer minWidth={720} type="native">
                  <Table withRowBorders verticalSpacing="xs" horizontalSpacing="md">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Method</Table.Th>
                        <Table.Th>Reference / cheque</Table.Th>
                        <Table.Th ta="right">Amount</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Recorded by</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {order.payments.map((p) => (
                        <Table.Tr key={p._id}>
                          <Table.Td className="num">{formatDate(p.paymentDate)}</Table.Td>
                          <Table.Td>{METHOD_LABELS[p.method]}</Table.Td>
                          <Table.Td>
                            <span className="mono">{chequeLabel(p)}</span>
                            {p.reversalReason && (
                              <Text size="xs" c="dimmed">
                                {p.reversalReason}
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td ta="right" className="num">
                            {formatLkr(p.amount)}
                          </Table.Td>
                          <Table.Td>
                            <PaymentRowStatusBadge status={p.status} />
                          </Table.Td>
                          <Table.Td>{p.recordedByName ?? '—'}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              )}
            </SectionCard>
          )}
        </Stack>
      )}

      {order && (
        <>
          <RecordPaymentModal
            order={order}
            opened={paying}
            onClose={() => setPaying(false)}
            onDone={reload}
          />
        </>
      )}
      <ConfirmDialog
        opened={confirmDelete}
        title="Delete order?"
        loading={deleting}
        confirmLabel="Delete order"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      >
        This permanently removes <strong className="mono">{order?.orderNo}</strong>. Orders with
        payment history can&apos;t be deleted; cancel them instead.
      </ConfirmDialog>
    </>
  );
};

export default OrderDetailPage;
