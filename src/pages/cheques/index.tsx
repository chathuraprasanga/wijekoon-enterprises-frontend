import { IconReceipt2 } from '@tabler/icons-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Group, Text } from '@mantine/core';
import { toNotify } from '@/hooks/toNotify';
import { bankDisplay, branchDisplay } from '@/utils/bankData';
import { ListPage } from '@/components/data/ListPage';
import { ChequeLifecycleBadge, ChequeStatusBadge } from '@/components/StatusBadge';
import { ChequeDetailDialog } from '@/pages/cheques/ChequeDetailDialog';
import { IssuedChequeDialog } from '@/pages/cheques/IssuedChequeDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { IconArrowDownLeft, IconArrowUpRight } from '@tabler/icons-react';
import { AddEditChequeModal } from '@/pages/cheques/AddEditChequeModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { type Cheque, deleteCheque, fetchCheques } from '@/store/chequeSlice/chequeSlice';
import type { Customer } from '@/store/customerSlice/customerSlice';
import type { Sale } from '@/store/saleSlice/saleSlice';
import { useLookup } from '@/hooks/useLookup';
import { CustomerLabel } from '@/components/CustomerLabel';
import { formatDate, formatLkr } from '@/utils/format';
import { customerName } from '@/pages/sales/saleLabels';
import { useCan } from '@/utils/permissions';

const isReceived = (c: Cheque) => c.kind !== 'issued';

const ChequesPage = () => {
  const can = useCan();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((s) => s.cheque);
  const customers = useLookup<Customer>('customers');
  const sales = useLookup<Sale>('sales');
  // The dashboard's "Add cheque" lands here with the form already open.
  const location = useLocation();
  const [view, setView] = useState<Cheque | null>(null);
  const [form, setForm] = useState<{ cheque: Cheque | null } | null>(
    (location.state as { create?: boolean } | null)?.create ? { cheque: null } : null,
  );

  return (
    <ListPage<Cheque>
      title="Cheques"
      description="Every cheque: ones we received from customers and ones we issued to suppliers."
      entity={{ singular: 'cheque', plural: 'cheques' }}
      searchPlaceholder="Search by cheque number"
      records={items}
      total={total}
      rowKey={(c) => c._id}
      rowName={(c) => `cheque ${c.chequeNumber}`}
      defaultSort={{ key: 'depositDate', dir: 'asc' }}
      load={({ page, limit, searchText, sortBy, sortType }) =>
        dispatch(fetchCheques({ page, limit, searchText, sortBy, sortType, type: 'all' })).unwrap()
      }
      extraActions={
        <>
          <Button
            variant="default"
            onClick={() =>
              toNotify('Coming soon', 'Deposit cheques to the bank is not available yet.', 'INFO')
            }
          >
            Deposit cheques
          </Button>
          <Button
            variant="default"
            onClick={() =>
              toNotify('Coming soon', 'Creating our own cheques is not available yet.', 'INFO')
            }
          >
            Create cheque
          </Button>
        </>
      }
      createLabel="Add cheque"
      emptyDescription="Add the post-dated cheques you receive. They are listed by deposit date."
      emptyIcon={<IconReceipt2 size={20} />}
      onCreate={can('cheque:create') ? () => setForm({ cheque: null }) : undefined}
      onView={setView}
      onEdit={can('cheque:update') ? (cheque) => setForm({ cheque }) : undefined}
      rowCanEdit={isReceived}
      rowCanRemove={isReceived}
      remove={
        can('cheque:delete')
          ? {
              title: 'Delete cheque?',
              describe: (c) => (
                <>
                  This permanently removes cheque <strong className="mono">{c.chequeNumber}</strong>{' '}
                  for <strong>{formatLkr(c.amount)}</strong>.
                </>
              ),
              run: (c) => dispatch(deleteCheque(c._id)).unwrap(),
              done: 'Cheque deleted.',
            }
          : undefined
      }
      columns={[
        {
          key: 'chequeNumber',
          header: 'Cheque no.',
          sortable: true,
          primary: true,
          render: (c) => <span className="mono">{c.chequeNumber}</span>,
        },
        {
          key: 'kind',
          header: 'Type',
          render: (c) =>
            c.kind === 'issued' ? (
              <StatusBadge tone="info" label="Issued" icon={IconArrowUpRight} />
            ) : (
              <StatusBadge tone="accent" label="Received" icon={IconArrowDownLeft} />
            ),
        },
        {
          key: 'customer',
          header: 'Customer / supplier',
          render: (c) =>
            c.kind === 'issued' ? (
              <Text size="sm">{c.supplierName ?? '—'}</Text>
            ) : (
              <CustomerLabel customer={customers.byId.get(c.customer)} />
            ),
        },
        {
          key: 'sale',
          header: 'Sale / order',
          render: (c) => (
            <span className="mono">
              {c.kind === 'issued' ? (c.orderNo ?? '—') : (sales.byId.get(c.sale)?.salesId ?? '—')}
            </span>
          ),
        },
        {
          key: 'bank',
          header: 'Bank / branch',
          hideBelow: 'md',
          render: (c) =>
            c.kind === 'issued' ? (
              <>
                <Text size="sm">{c.bankName ?? '—'}</Text>
                <Text size="xs" c="dimmed">
                  {c.branchName} · {c.accountNumber}
                </Text>
              </>
            ) : (
              <>
                <Text size="sm">{bankDisplay(c.bankCode)}</Text>
                <Text size="xs" c="dimmed">
                  {branchDisplay(c.bankCode, c.branchCode)}
                </Text>
              </>
            ),
        },
        {
          key: 'amount',
          header: 'Amount',
          sortable: true,
          align: 'right',
          render: (c) => formatLkr(c.amount),
        },
        {
          key: 'depositDate',
          header: 'Cheque / deposit date',
          sortable: true,
          render: (c) => <span className="num">{formatDate(c.depositDate)}</span>,
        },
        {
          key: 'clearing',
          header: 'Expected clearing',
          hideBelow: 'md',
          render: (c) => <span className="num">{formatDate(c.expectedClearingDate)}</span>,
        },
        {
          key: 'state',
          header: 'Status',
          badge: true,
          render: (c) => (
            <Group gap={4} wrap="wrap">
              <ChequeLifecycleBadge status={c.status} />
              {c.kind !== 'issued' && (c.status ?? 'RECEIVED') === 'RECEIVED' && (
                <ChequeStatusBadge depositDate={c.depositDate} />
              )}
            </Group>
          ),
        },
      ]}
    >
      {({ reload }) => (
        <>
          <AddEditChequeModal
            opened={!!form}
            cheque={form?.cheque ?? null}
            onClose={() => {
              setForm(null);
              reload();
            }}
          />
          <IssuedChequeDialog
            cheque={view?.kind === 'issued' ? view : null}
            onClose={() => setView(null)}
          />
          <ChequeDetailDialog
            cheque={view?.kind === 'issued' ? null : view}
            customerName={customerName(customers.byId.get(view?.customer ?? ''))}
            onClose={() => setView(null)}
            onChanged={reload}
          />
        </>
      )}
    </ListPage>
  );
};

export default ChequesPage;
