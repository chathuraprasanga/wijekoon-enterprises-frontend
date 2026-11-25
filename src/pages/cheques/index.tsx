import { IconArrowDownLeft, IconArrowUpRight, IconReceipt2 } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Button, Group, SegmentedControl, Text } from '@mantine/core';
import { ListPage } from '@/components/data/ListPage';
import { ChequeLifecycleBadge } from '@/components/StatusBadge';
import { ChequeDetailDialog } from '@/pages/cheques/ChequeDetailDialog';
import { IssuedChequeDialog } from '@/pages/cheques/IssuedChequeDialog';
import { AddEditChequeModal } from '@/pages/cheques/AddEditChequeModal';
import { DepositChequesModal } from '@/pages/cheques/DepositChequesModal';
import { IssueChequeModal } from '@/pages/cheques/IssueChequeModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  type Cheque,
  deleteCheque,
  fetchChequeParties,
  fetchCheques,
} from '@/store/chequeSlice/chequeSlice';
import type { Customer } from '@/store/customerSlice/customerSlice';
import type { Sale } from '@/store/saleSlice/saleSlice';
import type { Supplier } from '@/store/supplierSlice/supplierSlice';
import { useLookup } from '@/hooks/useLookup';
import { formatDate, formatLkr } from '@/utils/format';
import { customerName } from '@/pages/sales/saleLabels';
import { useCan } from '@/utils/permissions';

const isReceived = (c: Cheque) => c.kind !== 'issued';

const ChequesPage = () => {
  const can = useCan();
  const canReceived = can('received-cheque:read');
  const canIssued = can('issued-cheque:read');
  const [tab, setTab] = useState<'received' | 'issued'>(canReceived ? 'received' : 'issued');
  const [, setParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((s) => s.cheque);
  const customers = useLookup<Customer>('customers');
  const sales = useLookup<Sale>('sales');
  // The dashboard's "Add cheque" lands here with the form already open.
  const location = useLocation();
  const [view, setView] = useState<Cheque | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [form, setForm] = useState<{ cheque: Cheque | null } | null>(
    (location.state as { create?: boolean } | null)?.create ? { cheque: null } : null,
  );

  const issuedTab = tab === 'issued';
  const suppliers = useLookup<Supplier>('suppliers');
  // Other parties used before on this tab (the pick-list for the party filter).
  const [others, setOthers] = useState<string[]>([]);
  useEffect(() => {
    dispatch(fetchChequeParties(tab))
      .unwrap()
      .then(setOthers)
      .catch(() => setOthers([]));
  }, [tab, dispatch]);
  // 'c:<customer id>', 's:<supplier id>' or 'p:<other party name>'
  const partyOptions = [
    ...(issuedTab
      ? suppliers.items.map((s) => ({ value: `s:${s._id}`, label: s.name }))
      : customers.items.map((c) => ({ value: `c:${c._id}`, label: customerName(c) }))),
    ...others.map((n) => ({ value: `p:${n}`, label: `${n} (other party)` })),
  ];

  return (
    <ListPage<Cheque>
      key={tab}
      leading={
        canReceived &&
        canIssued && (
          <SegmentedControl
            size="xs"
            aria-label="Cheque type"
            value={tab}
            onChange={(v) => {
              setParams({}); // a new tab starts on page 1 with no search
              setTab(v as 'received' | 'issued');
            }}
            data={[
              { value: 'received', label: 'Received' },
              { value: 'issued', label: 'Issued' },
            ]}
          />
        )
      }
      title="Cheques"
      description="Every cheque: ones we received from customers and ones we issued to suppliers."
      entity={{ singular: 'cheque', plural: 'cheques' }}
      searchPlaceholder="Search by cheque number"
      records={items}
      total={total}
      rowKey={(c) => c._id}
      rowName={(c) => `cheque ${c.chequeNumber}`}
      defaultSort={{ key: 'depositDate', dir: 'asc' }}
      filters={[
        {
          type: 'select',
          key: 'party',
          label: issuedTab ? 'Supplier / party' : 'Customer / party',
          placeholder: 'All parties',
          options: partyOptions,
        },
      ]}
      load={({ page, limit, searchText, sortBy, sortType, filters }) =>
        dispatch(
          fetchCheques({
            page,
            limit,
            searchText,
            sortBy,
            sortType,
            type: issuedTab ? 'issued' : undefined,
            customer: filters.party?.startsWith('c:') ? filters.party.slice(2) : undefined,
            supplier: filters.party?.startsWith('s:') ? filters.party.slice(2) : undefined,
            partyName:
              !issuedTab && filters.party?.startsWith('p:') ? filters.party.slice(2) : undefined,
            payee:
              issuedTab && filters.party?.startsWith('p:') ? filters.party.slice(2) : undefined,
          }),
        ).unwrap()
      }
      extraActions={
        <>
          {(can('issued-cheque:create') || can('third-party-issued-cheque:create')) && (
            <Button
              color="orange"
              leftSection={<IconArrowUpRight size={16} aria-hidden />}
              onClick={() => setIssuing(true)}
            >
              Issue cheque
            </Button>
          )}
          {can('received-cheque:update') && (
            <Button variant="default" onClick={() => setDepositing(true)}>
              Deposit cheques
            </Button>
          )}
        </>
      }
      createLabel="Receive cheque"
      createIcon={<IconArrowDownLeft size={16} aria-hidden />}
      emptyDescription={
        issuedTab
          ? 'Cheques you issue to suppliers and others are listed here.'
          : 'Add the post-dated cheques you receive. They are listed by deposit date.'
      }
      emptyAction={
        issuedTab ? (
          can('issued-cheque:create') || can('third-party-issued-cheque:create') ? (
            <Button
              color="orange"
              leftSection={<IconArrowUpRight size={16} aria-hidden />}
              onClick={() => setIssuing(true)}
            >
              Issue cheque
            </Button>
          ) : null
        ) : undefined
      }
      emptyIcon={<IconReceipt2 size={20} />}
      onCreate={
        can('received-cheque:create') || can('third-party-received-cheque:create')
          ? () => setForm({ cheque: null })
          : undefined
      }
      onView={setView}
      onEdit={can('received-cheque:update') ? (cheque) => setForm({ cheque }) : undefined}
      rowCanEdit={isReceived}
      rowCanRemove={isReceived}
      remove={
        can('received-cheque:delete')
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
          key: 'customer',
          header: issuedTab ? 'Supplier / party' : 'Customer / party',
          render: (c) =>
            c.kind === 'issued' ? (
              <Text size="sm">{c.supplierName ?? c.payee ?? '—'}</Text>
            ) : c.partyType === 'other' ? (
              <Text size="sm">{c.partyName ?? '—'}</Text>
            ) : (
              <Text size="sm">{customerName(customers.byId.get(c.customer ?? ''))}</Text>
            ),
        },
        {
          key: 'depositDate',
          header: 'Deposit date',
          sortable: true,
          render: (c) => <span className="num">{formatDate(c.depositDate)}</span>,
        },
        {
          key: 'amount',
          header: 'Amount',
          sortable: true,
          align: 'right',
          render: (c) => formatLkr(c.amount),
        },
        {
          key: 'state',
          header: 'Status',
          badge: true,
          render: (c) => (
            <Group gap={4} wrap="wrap">
              <ChequeLifecycleBadge status={c.status} plain />
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
            onClose={() => setForm(null)}
            onSaved={reload}
          />
          <IssuedChequeDialog
            cheque={view?.kind === 'issued' ? view : null}
            onClose={() => setView(null)}
            onChanged={reload}
          />
          {depositing && (
            <DepositChequesModal opened onClose={() => setDepositing(false)} onDone={reload} />
          )}
          <IssueChequeModal opened={issuing} onClose={() => setIssuing(false)} onSaved={reload} />
          <ChequeDetailDialog
            cheque={view?.kind === 'issued' ? null : view}
            customerName={
              view?.partyType === 'other'
                ? (view.partyName ?? '—')
                : customerName(customers.byId.get(view?.customer ?? ''))
            }
            saleNo={sales.byId.get(view?.sale ?? '')?.salesId}
            onClose={() => setView(null)}
            onChanged={reload}
          />
        </>
      )}
    </ListPage>
  );
};

export default ChequesPage;
