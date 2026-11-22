import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBuildingBank } from '@tabler/icons-react';
import { ListPage } from '@/components/data/ListPage';
import { ActiveBadge, StatusBadge } from '@/components/StatusBadge';
import { AddEditBankModal } from '@/pages/settings/AddEditBankModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  ACCOUNT_TYPES,
  type Bank,
  deleteBank,
  fetchBankById,
  fetchBanks,
} from '@/store/bankSlice/bankSlice';
import { toNotify } from '@/hooks/toNotify';
import { useCan } from '@/utils/permissions';

const FILTERS = [
  {
    type: 'select' as const,
    key: 'status',
    label: 'Status',
    placeholder: 'All statuses',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  {
    type: 'select' as const,
    key: 'accountType',
    label: 'Account type',
    placeholder: 'All types',
    options: ACCOUNT_TYPES.map((t) => ({ value: t, label: t })),
  },
];

const SORT_MAP = {
  bank: 'bankName',
  branch: 'branchName',
  account: 'accountName',
  type: 'accountType',
};

const BanksPage = () => {
  const can = useCan();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, total } = useAppSelector((s) => s.bank);
  const [form, setForm] = useState<{ bank: Bank | null } | null>(null);

  // The list only has masked numbers: editing needs the full record.
  const openEdit = async (b: Bank) => {
    try {
      setForm({ bank: await dispatch(fetchBankById(b._id)).unwrap() });
    } catch (e) {
      toNotify("Couldn't open bank account", e as string, 'ERROR');
    }
  };

  return (
    <ListPage<Bank>
      embedded
      title="Banks"
      description="Your business bank accounts."
      entity={{ singular: 'bank account', plural: 'bank accounts' }}
      searchPlaceholder="Search bank, branch or account name"
      filters={FILTERS}
      records={items}
      total={total}
      rowKey={(b) => b._id}
      rowName={(b) => `${b.bankName} ${b.accountNumberMasked ?? ''}`}
      defaultSort={{ key: 'bank', dir: 'asc' }}
      sortMap={SORT_MAP}
      load={({ page, limit, searchText, sortBy, sortType, filters }) =>
        dispatch(
          fetchBanks({
            page,
            limit,
            searchText,
            status: filters.status,
            accountType: filters.accountType,
            sortBy,
            sortType,
          }),
        ).unwrap()
      }
      emptyDescription="Add the bank accounts you pay suppliers from. They're used when issuing cheques."
      emptyIcon={<IconBuildingBank size={20} />}
      createLabel="Add bank account"
      onCreate={can('bank:create') ? () => setForm({ bank: null }) : undefined}
      onView={(b) => navigate(`/app/settings/banks/${b._id}`)}
      onEdit={can('bank:update') ? openEdit : undefined}
      remove={
        can('bank:delete')
          ? {
              title: 'Delete bank account?',
              describe: (b) => (
                <>
                  This permanently removes <strong>{b.bankName}</strong> ({b.accountNumberMasked}).
                  Accounts with issued cheques can&apos;t be deleted — deactivate them instead.
                </>
              ),
              run: (b) => dispatch(deleteBank(b._id)).unwrap(),
              done: 'Bank account deleted.',
            }
          : undefined
      }
      columns={[
        {
          key: 'bank',
          header: 'Bank',
          sortable: true,
          primary: true,
          render: (b) => b.bankName,
        },
        {
          key: 'branch',
          header: 'Branch',
          sortable: true,
          hideBelow: 'md',
          render: (b) => b.branchName,
        },
        { key: 'account', header: 'Account name', sortable: true, render: (b) => b.accountName },
        {
          key: 'number',
          header: 'Account no.',
          render: (b) => <span className="mono">{b.accountNumberMasked}</span>,
        },
        {
          key: 'type',
          header: 'Type',
          sortable: true,
          hideBelow: 'md',
          render: (b) => <StatusBadge tone="neutral" label={b.accountType} />,
        },
        {
          key: 'status',
          header: 'Status',
          badge: true,
          render: (b) => <ActiveBadge active={b.isActive} />,
        },
      ]}
    >
      {({ reload }) => (
        <AddEditBankModal
          opened={!!form}
          bank={form?.bank ?? null}
          onClose={() => setForm(null)}
          onSaved={reload}
        />
      )}
    </ListPage>
  );
};

export default BanksPage;
