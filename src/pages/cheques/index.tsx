import { IconReceipt2 } from '@tabler/icons-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ListPage } from '@/components/data/ListPage';
import { ChequeStatusBadge } from '@/components/StatusBadge';
import { AddEditChequeModal } from '@/pages/cheques/AddEditChequeModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { type Cheque, deleteCheque, fetchCheques } from '@/store/chequeSlice/chequeSlice';
import type { Customer } from '@/store/customerSlice/customerSlice';
import type { Sale } from '@/store/saleSlice/saleSlice';
import { useLookup } from '@/hooks/useLookup';
import { customerName } from '@/pages/sales/saleLabels';
import { formatDate, formatLkr } from '@/utils/format';

const ChequesPage = () => {
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((s) => s.cheque);
  const customers = useLookup<Customer>('customers');
  const sales = useLookup<Sale>('sales');
  // The dashboard's "Add cheque" lands here with the form already open.
  const location = useLocation();
  const [form, setForm] = useState<{ cheque: Cheque | null } | null>(
    (location.state as { create?: boolean } | null)?.create ? { cheque: null } : null,
  );

  return (
    <ListPage<Cheque>
      title="Cheques"
      description="Post-dated cheques on file. Soonest deposit date first."
      entity={{ singular: 'cheque', plural: 'cheques' }}
      searchPlaceholder="Search by cheque number"
      records={items}
      total={total}
      rowKey={(c) => c._id}
      rowName={(c) => `cheque ${c.chequeNumber}`}
      defaultSort={{ key: 'depositDate', dir: 'asc' }}
      load={({ page, limit, searchText, sortBy, sortType }) =>
        dispatch(fetchCheques({ page, limit, searchText, sortBy, sortType })).unwrap()
      }
      createLabel="Add cheque"
      emptyDescription="Add the post-dated cheques you receive. They are listed by deposit date."
      emptyIcon={<IconReceipt2 size={20} />}
      onCreate={() => setForm({ cheque: null })}
      onEdit={(cheque) => setForm({ cheque })}
      remove={{
        title: 'Delete cheque?',
        describe: (c) => (
          <>
            This permanently removes cheque <strong className="mono">{c.chequeNumber}</strong> for{' '}
            <strong>{formatLkr(c.amount)}</strong>.
          </>
        ),
        run: (c) => dispatch(deleteCheque(c._id)).unwrap(),
        done: 'Cheque deleted.',
      }}
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
          header: 'Customer',
          render: (c) => customerName(customers.byId.get(c.customer)),
        },
        {
          key: 'sale',
          header: 'Sale',
          render: (c) => <span className="mono">{sales.byId.get(c.sale)?.salesId ?? '—'}</span>,
        },
        {
          key: 'bank',
          header: 'Bank / branch',
          hideBelow: 'md',
          render: (c) => (
            <span className="mono">
              {c.bankCode} / {c.branchCode}
            </span>
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
          header: 'Deposit date',
          sortable: true,
          render: (c) => <span className="num">{formatDate(c.depositDate)}</span>,
        },
        {
          key: 'state',
          header: 'Status',
          badge: true,
          render: (c) => <ChequeStatusBadge depositDate={c.depositDate} />,
        },
      ]}
    >
      {({ reload }) => (
        <AddEditChequeModal
          opened={!!form}
          cheque={form?.cheque ?? null}
          onClose={() => {
            setForm(null);
            reload();
          }}
        />
      )}
    </ListPage>
  );
};

export default ChequesPage;
