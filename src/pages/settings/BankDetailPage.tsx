import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Group, SimpleGrid, Skeleton } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { DetailList } from '@/components/DetailList';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { InlineAlert } from '@/components/InlineAlert';
import { DataTable } from '@/components/data/DataTable';
import { ActiveBadge, StatusBadge } from '@/components/StatusBadge';
import { AddEditBankModal } from '@/pages/settings/AddEditBankModal';
import { useAppDispatch } from '@/store/hooks';
import {
  type Bank,
  type IssuedCheque,
  deleteBank,
  fetchBankActivity,
  fetchBankById,
} from '@/store/bankSlice/bankSlice';
import { toNotify } from '@/hooks/toNotify';
import { formatDate, formatLkr } from '@/utils/format';
import { useCan } from '@/utils/permissions';

const CHEQUE_TONE = {
  ISSUED: 'info',
  CLEARED: 'success',
  RETURNED: 'danger',
} as const;

const BankDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const can = useCan();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [bank, setBank] = useState<Bank | null>(null);
  const [cheques, setCheques] = useState<IssuedCheque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!id) return;
    let live = true;
    Promise.all([dispatch(fetchBankById(id)).unwrap(), dispatch(fetchBankActivity(id)).unwrap()])
      .then(([b, a]) => {
        if (!live) return;
        setBank(b);
        setCheques(a.issuedCheques);
        setError(null);
      })
      .catch((e) => live && setError(e as string))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id, nonce, dispatch]);

  const handleDelete = async () => {
    if (!bank) return;
    setDeleting(true);
    try {
      await dispatch(deleteBank(bank._id)).unwrap();
      toNotify('Deleted', 'Bank account deleted.', 'SUCCESS');
      navigate('/app/settings/banks', { replace: true });
    } catch (e) {
      toNotify("Couldn't delete bank account", e as string, 'ERROR');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const title = bank ? `${bank.bankName} · ${bank.branchName}` : 'Bank account';

  return (
    <>
      <PageHeader
        title={title}
        badge={bank && <ActiveBadge active={bank.isActive} />}
        description="Account details and the cheques issued from it."
        inlineAction
        crumbs={[
          { label: 'Administration' },
          { label: 'Settings', to: '/app/settings/banks' },
          { label: 'Banks', to: '/app/settings/banks' },
          { label: title },
        ]}
        action={
          bank && (
            <Group gap="xs" wrap="nowrap">
              {can('bank:update') && (
                <Button
                  variant="default"
                  leftSection={<IconPencil size={16} aria-hidden />}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
              {can('bank:delete') && (
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
          title="This bank account couldn't be loaded"
          action={
            <Button
              mt="xs"
              size="xs"
              variant="default"
              onClick={() => {
                setError(null);
                setLoading(true);
                setNonce((n) => n + 1);
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </InlineAlert>
      )}
      {loading && !bank && <Skeleton h={260} />}
      {bank && (
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" style={{ alignItems: 'start' }}>
          <SectionCard title="Account">
            <DetailList
              stacked
              groups={[
                [
                  { label: 'Bank', value: `${bank.bankName} (${bank.bankCode})` },
                  { label: 'Branch', value: `${bank.branchName} (${bank.branchCode})` },
                  {
                    label: 'Account no.',
                    value: <span className="mono">{bank.accountNumber}</span>,
                  },
                  { label: 'Account name', value: bank.accountName },
                  { label: 'Type', value: bank.accountType },
                  { label: 'Notes', value: bank.notes },
                ],
              ]}
            />
          </SectionCard>
          <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
            <SectionCard
              title="Issued cheques"
              subtitle="Cheques written to suppliers from this account."
              flush
            >
              {cheques.length === 0 ? (
                <EmptyState
                  title="No cheques issued yet"
                  description="Cheques appear here when you pay a supplier order by cheque from this account."
                />
              ) : (
                <DataTable
                  caption="Issued cheques"
                  records={cheques}
                  rowKey={(c) => c._id}
                  columns={[
                    {
                      key: 'no',
                      header: 'Cheque no.',
                      primary: true,
                      render: (c) => <span className="mono">{c.chequeNumber}</span>,
                    },
                    {
                      key: 'date',
                      header: 'Date',
                      render: (c) => <span className="num">{formatDate(c.chequeDate)}</span>,
                    },
                    { key: 'supplier', header: 'Supplier', render: (c) => c.supplier?.name ?? '—' },
                    {
                      key: 'order',
                      header: 'Order',
                      hideBelow: 'md',
                      render: (c) => <span className="mono">{c.order?.orderNo ?? '—'}</span>,
                    },
                    {
                      key: 'amount',
                      header: 'Amount',
                      align: 'right',
                      render: (c) => formatLkr(c.amount),
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      badge: true,
                      render: (c) => (
                        <StatusBadge tone={CHEQUE_TONE[c.status]} label={c.status.toLowerCase()} />
                      ),
                    },
                  ]}
                />
              )}
            </SectionCard>
          </div>
        </SimpleGrid>
      )}
      <AddEditBankModal
        opened={editing}
        bank={bank}
        onClose={() => setEditing(false)}
        onSaved={() => setNonce((n) => n + 1)}
      />
      <ConfirmDialog
        opened={confirmDelete}
        title="Delete bank account?"
        loading={deleting}
        confirmLabel="Delete bank account"
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      >
        This permanently removes <strong>{bank?.bankName}</strong>. Accounts with issued cheques
        can&apos;t be deleted — deactivate them instead.
      </ConfirmDialog>
    </>
  );
};

export default BankDetailPage;
