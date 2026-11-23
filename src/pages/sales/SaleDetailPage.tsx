import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Group, SimpleGrid, Skeleton, Stack, Table, Text } from '@mantine/core';
import { IconCash, IconCircleCheck, IconPencil, IconTrash } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { DetailList } from '@/components/DetailList';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { InlineAlert } from '@/components/InlineAlert';
import { CustomerLabel } from '@/components/CustomerLabel';
import { ChequeLifecycleBadge, SaleStatusBadge, StatusBadge } from '@/components/StatusBadge';
import { toNotify } from '@/hooks/toNotify';
import { useLookup } from '@/hooks/useLookup';
import { useAppDispatch } from '@/store/hooks';
import { type Sale, deleteSale, fetchSaleById } from '@/store/saleSlice/saleSlice';
import { CUSTOMER_TYPE_LABELS, type Customer } from '@/store/customerSlice/customerSlice';
import type { Cheque } from '@/store/chequeSlice/chequeSlice';
import { formatDate, formatLkr, formatPhone } from '@/utils/format';
import { useCan } from '@/utils/permissions';
import { PAYMENT_LABELS, saleOutstanding } from './saleLabels';
import { RecordSalePaymentModal } from './RecordSalePaymentModal';

const SaleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const can = useCan();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const customers = useLookup<Customer>('customers');
  const cheques = useLookup<Cheque>('cheques');
  const [sale, setSale] = useState<Sale | null>(null);
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
    dispatch(fetchSaleById(id))
      .unwrap()
      .then((s) => {
        if (!live) return;
        setSale(s);
        setError(null);
      })
      .catch((e) => live && setError(e as string))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id, nonce, dispatch]);

  const handleDelete = async () => {
    if (!sale) return;
    setDeleting(true);
    try {
      await dispatch(deleteSale(sale._id)).unwrap();
      toNotify('Deleted', 'Sale deleted.', 'SUCCESS');
      navigate('/app/sales', { replace: true });
    } catch (e) {
      toNotify("Couldn't delete sale", e as string, 'ERROR');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const title = sale?.salesId ?? 'Sale';
  const outstanding = sale ? saleOutstanding(sale) : 0;
  const customer = sale ? customers.byId.get(sale.customer) : undefined;
  const related = sale ? cheques.items.filter((c) => c.sale === sale._id) : [];
  // Sales saved before payments were logged: show their cash / cheque parts on the sale date.
  const history: NonNullable<Sale['paymentHistory']> = !sale
    ? []
    : sale.paymentHistory?.length
      ? sale.paymentHistory
      : (sale.payments ?? [])
          .filter((p) => p.method !== 'credit')
          .map((p) => ({ ...p, at: sale.salesDate, byName: sale.createdByName }));

  return (
    <>
      <PageHeader
        title={title}
        badge={sale && <SaleStatusBadge status={sale.status} />}
        description="Items, payments and what's still owed."
        inlineAction
        crumbs={[{ label: 'Trading' }, { label: 'Sales', to: '/app/sales' }, { label: title }]}
        action={
          sale && (
            <Group gap="xs" wrap="wrap">
              {can('sale:update') && outstanding > 0 && (
                <Button
                  leftSection={<IconCash size={16} aria-hidden />}
                  onClick={() => setPaying(true)}
                >
                  Record payment
                </Button>
              )}
              {can('sale:update') && (
                <Button
                  variant="default"
                  leftSection={<IconPencil size={16} aria-hidden />}
                  onClick={() => navigate(`/app/sales/${sale._id}/edit`)}
                >
                  Edit
                </Button>
              )}
              {can('sale:delete') && (
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
          title="This sale couldn't be loaded"
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
      {loading && !sale && <Skeleton h={260} />}
      {sale && (
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <SectionCard title="Sale">
              <DetailList
                stacked
                groups={[
                  [
                    {
                      label: 'Sale date',
                      value: <span className="num">{formatDate(sale.salesDate)}</span>,
                    },
                    { label: 'Payment due', value: sale.dueDate ? formatDate(sale.dueDate) : '—' },
                    { label: 'Notes', value: sale.notes },
                    { label: 'Created', value: formatDate(sale.createdAt) },
                    { label: 'Last updated', value: formatDate(sale.updatedAt) },
                  ],
                ]}
              />
            </SectionCard>
            <SectionCard title="Customer">
              <DetailList
                stacked
                groups={[
                  [
                    {
                      label: 'Name',
                      value: <CustomerLabel customer={customers.byId.get(sale.customer)} />,
                    },
                    {
                      label: 'Type',
                      value: customer?.customerType
                        ? CUSTOMER_TYPE_LABELS[customer.customerType]
                        : customer && CUSTOMER_TYPE_LABELS.HARDWARE_STORE,
                    },
                    { label: 'Phone', value: customer ? formatPhone(customer.phone) : undefined },
                    { label: 'Email', value: customer?.email },
                    { label: 'Address', value: customer?.address },
                  ],
                ]}
              />
            </SectionCard>
            <SectionCard title="Payment">
              <Group gap={6} mb="md">
                <SaleStatusBadge status={sale.status} />
              </Group>
              <DetailList
                stacked
                groups={[
                  [
                    {
                      label: 'Total',
                      value: <span className="num">{formatLkr(sale.netTotal)}</span>,
                    },
                    {
                      label: 'Paid',
                      value: <span className="num">{formatLkr(sale.netTotal - outstanding)}</span>,
                    },
                    {
                      label: 'Outstanding',
                      value: <strong className="num">{formatLkr(outstanding)}</strong>,
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
                  {sale.lineItems.map((li) => (
                    <Table.Tr key={`${li.product}-${li.size}`}>
                      <Table.Td>
                        <Text size="sm">{li.productName}</Text>
                        <Text size="xs" c="dimmed">
                          <span className="mono">{li.productSku}</span> · {li.size}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {li.quantity}
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {formatLkr(li.productPrice)}
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {formatLkr(li.discount)}
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {formatLkr(li.tax)}
                      </Table.Td>
                      <Table.Td ta="right" className="num">
                        {formatLkr(li.lineTotal)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
            <Box p="md" style={{ borderTop: '1px solid var(--ldg-border)' }}>
              <Stack gap={4} maw={320} ml="auto">
                {(
                  [
                    ['Shipping', sale.shipping],
                    ['Other charges', sale.otherExpenses],
                    ['Sale tax', sale.tax],
                    ['Sale discount', sale.discount],
                  ] as const
                ).map(([label, v]) => (
                  <Group key={label} justify="space-between">
                    <Text size="sm" c="dimmed">
                      {label}
                    </Text>
                    <Text size="sm" className="num">
                      {formatLkr(v)}
                    </Text>
                  </Group>
                ))}
                <Group justify="space-between">
                  <Text fw={600}>Net total</Text>
                  <Text fw={600} className="num">
                    {formatLkr(sale.netTotal)}
                  </Text>
                </Group>
              </Stack>
            </Box>
          </SectionCard>

          <SectionCard
            title="Payment history"
            subtitle="Cash and cheques received against this sale."
            flush
          >
            {!history.length ? (
              <EmptyState
                title="No payments yet"
                description={
                  sale.dueDate
                    ? `Due ${formatDate(sale.dueDate)}. Record a payment when the customer pays.`
                    : 'Record a payment when the customer pays.'
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
                    {history.map((h, i) => {
                      const cheque = h.reference
                        ? related.find((c) => c.chequeNumber === h.reference)
                        : undefined;
                      return (
                        <Table.Tr key={i}>
                          <Table.Td className="num">{formatDate(h.at)}</Table.Td>
                          <Table.Td>{PAYMENT_LABELS[h.method as 'cash'] ?? h.method}</Table.Td>
                          <Table.Td>
                            {h.reference ? <span className="mono">No. {h.reference}</span> : '—'}
                          </Table.Td>
                          <Table.Td ta="right" className="num">
                            {formatLkr(h.amount)}
                          </Table.Td>
                          <Table.Td>
                            {cheque ? (
                              <ChequeLifecycleBadge status={cheque.status} />
                            ) : (
                              <StatusBadge tone="success" label="Paid" icon={IconCircleCheck} />
                            )}
                          </Table.Td>
                          <Table.Td>{h.byName ?? '—'}</Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </SectionCard>
        </Stack>
      )}

      {sale && (
        <RecordSalePaymentModal
          sale={sale}
          opened={paying}
          onClose={() => setPaying(false)}
          onDone={reload}
        />
      )}
      <ConfirmDialog
        opened={confirmDelete}
        title="Delete sale?"
        loading={deleting}
        confirmLabel="Delete sale"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      >
        This permanently removes <strong className="mono">{sale?.salesId}</strong>. Cheques linked
        to it stay on file.
      </ConfirmDialog>
    </>
  );
};

export default SaleDetailPage;
