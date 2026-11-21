import { IconCoin } from '@tabler/icons-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Box, Group, Stack, Table, Text } from '@mantine/core';
import { ListPage } from '@/components/data/ListPage';
import { DetailDialog } from '@/components/DetailDialog';
import { DetailList } from '@/components/DetailList';
import { SaleStatusBadge, StatusBadge } from '@/components/StatusBadge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { type Sale, deleteSale, fetchSales } from '@/store/saleSlice/saleSlice';
import type { Customer } from '@/store/customerSlice/customerSlice';
import type { Cheque } from '@/store/chequeSlice/chequeSlice';
import { Field } from '@/components/Field';
import { useLookup } from '@/hooks/useLookup';
import { formatDate, formatLkr } from '@/utils/format';
import { customerName, PAYMENT_LABELS } from './saleLabels';
import { CustomerLabel } from '@/components/CustomerLabel';
import { useCan } from '@/utils/permissions';

const FILTERS = [
  {
    type: 'select' as const,
    key: 'status',
    label: 'Payment status',
    placeholder: 'All statuses',
    options: [
      { value: 'paid', label: 'Paid' },
      { value: 'partially_paid', label: 'Partially paid' },
      { value: 'not_paid', label: 'Not paid' },
    ],
  },
];

const SalesPage = () => {
  const can = useCan();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((s) => s.sale);
  const customers = useLookup<Customer>('customers');
  const [view, setView] = useState<Sale | null>(null);

  const cheques = useLookup<Cheque>('cheques');
  const nameOf = (id: string) => customerName(customers.byId.get(id));
  const relatedCheques = view ? cheques.items.filter((c) => c.sale === view._id) : [];

  return (
    <>
      <ListPage<Sale>
        title="Sales"
        description="Record and review sales. Sales made in the sales app appear here too."
        entity={{ singular: 'sale', plural: 'sales' }}
        searchPlaceholder="Search by sale ID"
        filters={FILTERS}
        records={items}
        total={total}
        rowKey={(s) => s._id}
        rowName={(s) => s.salesId}
        defaultSort={{ key: 'salesDate', dir: 'desc' }}
        load={({ page, limit, searchText, sortBy, sortType, filters }) =>
          dispatch(
            fetchSales({ page, limit, searchText, status: filters.status, sortBy, sortType }),
          ).unwrap()
        }
        emptyDescription="Create a sale, or record one in the sales app."
        createLabel="Create sale"
        onCreate={can('sale:create') ? () => navigate('/app/sales/new') : undefined}
        onEdit={can('sale:update') ? (s) => navigate(`/app/sales/${s._id}/edit`) : undefined}
        emptyIcon={<IconCoin size={20} />}
        onView={setView}
        remove={
          can('sale:delete')
            ? {
                title: 'Delete sale?',
                describe: (s) => (
                  <>
                    This permanently removes sale <strong className="mono">{s.salesId}</strong>.
                    Cheques linked to it stay on file.
                  </>
                ),
                run: (s) => dispatch(deleteSale(s._id)).unwrap(),
                done: 'Sale deleted.',
              }
            : undefined
        }
        columns={[
          {
            key: 'salesId',
            header: 'Sale ID',
            sortable: true,
            primary: true,
            render: (s) => (
              <span className="mono" style={{ color: 'var(--ldg-accent-text)' }}>
                {s.salesId}
              </span>
            ),
          },
          {
            key: 'salesDate',
            header: 'Date',
            sortable: true,
            render: (s) => <span className="num">{formatDate(s.salesDate)}</span>,
          },
          {
            key: 'customer',
            header: 'Customer',
            render: (s) => <CustomerLabel customer={customers.byId.get(s.customer)} />,
          },
          {
            key: 'payment',
            header: 'Payment',
            hideBelow: 'md',
            render: (s) => <StatusBadge tone="neutral" label={PAYMENT_LABELS[s.paymentMethod]} />,
          },
          {
            key: 'netTotal',
            header: 'Total',
            sortable: true,
            align: 'right',
            render: (s) => formatLkr(s.netTotal),
          },
          {
            key: 'status',
            header: 'Status',
            sortable: true,
            badge: true,
            render: (s) => <SaleStatusBadge status={s.status} />,
          },
        ]}
      >
        {() => (
          <DetailDialog
            opened={!!view}
            onClose={() => setView(null)}
            title={view ? <span className="mono">{view.salesId}</span> : ''}
            subtitle={view ? `${formatDate(view.salesDate)} · ${nameOf(view.customer)}` : undefined}
          >
            {view && (
              <>
                <Stack gap="md">
                  <Field label="Payment method">{PAYMENT_LABELS[view.paymentMethod]}</Field>
                  {view.payments && view.payments.length > 1 && (
                    <Field label="Payments">
                      <Stack gap={2} mt={4}>
                        {view.payments.map((p) => (
                          <Group key={p.method} justify="space-between" wrap="nowrap">
                            <Text size="sm">{PAYMENT_LABELS[p.method]}</Text>
                            <Text size="sm" className="num">
                              {formatLkr(p.amount)}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                    </Field>
                  )}
                  <Field label="Status">
                    <Box mt={4}>
                      <SaleStatusBadge status={view.status} />
                    </Box>
                  </Field>
                  <Field label="Customer">
                    <CustomerLabel customer={customers.byId.get(view.customer)} />
                  </Field>
                  {relatedCheques.length > 0 && (
                    <Field label={relatedCheques.length > 1 ? 'Related cheques' : 'Related cheque'}>
                      <Stack gap={2} mt={4}>
                        {relatedCheques.map((c) => (
                          <Group key={c._id} justify="space-between" wrap="nowrap">
                            <Anchor
                              component={Link}
                              to="/app/cheques"
                              className="mono"
                              style={{ color: 'var(--ldg-accent-text)' }}
                            >
                              {c.chequeNumber}
                            </Anchor>
                            <Text size="sm" className="num">
                              {formatLkr(c.amount)}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                    </Field>
                  )}
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
                              {formatLkr(li.productPrice)}
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
                      ],
                    ]}
                  />
                </Box>
              </>
            )}
          </DetailDialog>
        )}
      </ListPage>
    </>
  );
};

export default SalesPage;
