import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Stack, Text } from '@mantine/core';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toNotify } from '@/hooks/toNotify';
import { useAppDispatch } from '@/store/hooks';
import { useCan } from '@/utils/permissions';
import { DetailDialog } from '@/components/DetailDialog';
import { DetailList } from '@/components/DetailList';
import { ChequeLifecycleBadge } from '@/components/StatusBadge';
import { type Cheque, setIssuedChequeStatus } from '@/store/chequeSlice/chequeSlice';
import { formatDate, formatLkr } from '@/utils/format';

// A cheque we wrote to a supplier. Its status changes from the order's payments, not here.
export const IssuedChequeDialog = ({
  cheque,
  onClose,
  onChanged,
}: {
  cheque: Cheque | null;
  onClose: () => void;
  onChanged: () => void;
}) => {
  const can = useCan();
  const dispatch = useAppDispatch();
  const [action, setAction] = useState<{ status: 'CLEARED' | 'RETURNED'; label: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  // Cheques written as an order payment are cleared / returned from that order; standalone ones here.
  const standalone = !!cheque && !cheque.order && can('issued-cheque:update');
  const moves =
    standalone && cheque.status === 'ISSUED'
      ? [
          { status: 'CLEARED' as const, label: 'Mark cleared' },
          { status: 'RETURNED' as const, label: 'Mark returned' },
        ]
      : standalone && cheque.status === 'CLEARED'
        ? [{ status: 'RETURNED' as const, label: 'Mark returned' }]
        : [];

  const run = async () => {
    if (!cheque || !action) return;
    setLoading(true);
    try {
      await dispatch(setIssuedChequeStatus({ id: cheque._id, status: action.status })).unwrap();
      toNotify(
        'Cheque updated',
        `Cheque ${cheque.chequeNumber}: ${action.label.toLowerCase()}.`,
        'SUCCESS',
      );
      setAction(null);
      onClose();
      onChanged();
    } catch (e) {
      toNotify("Couldn't update the cheque", e as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DetailDialog
        opened={!!cheque && !action}
        actions={moves.map((m, i) => (
          <Button
            key={m.status}
            variant={i === 0 ? 'filled' : 'default'}
            color={m.status === 'RETURNED' && i > 0 ? 'red' : undefined}
            onClick={() => setAction(m)}
          >
            {m.label}
          </Button>
        ))}
        onClose={onClose}
        title="Cheque details"
        subtitle={cheque ? `${cheque.chequeNumber} · ${formatLkr(cheque.amount)}` : undefined}
      >
        {cheque && (
          <Stack gap="md">
            <Box>
              <Text size="sm" c="dimmed">
                Status
              </Text>
              <Box mt={4}>
                <ChequeLifecycleBadge status={cheque.status} />
              </Box>
              <Text size="sm" c="dimmed" mt={6}>
                {cheque.order
                  ? 'Our cheque to a supplier. Clear or return it from the order\u2019s payments.'
                  : 'A cheque we issued. It clears by itself after the clearing date.'}
              </Text>
            </Box>
            <DetailList
              groups={[
                [
                  ...(cheque.partyType === 'other'
                    ? [{ label: 'Payee', value: cheque.payee }]
                    : [{ label: 'Supplier', value: cheque.supplierName ?? '—' }]),
                  { label: 'Amount', value: formatLkr(cheque.amount) },
                  ...(cheque.partyType === 'other'
                    ? []
                    : [
                        {
                          label: 'Order',
                          value: cheque.order ? (
                            <Link to={`/app/orders/${cheque.order}`}>
                              {cheque.orderNo ?? 'Open order'}
                            </Link>
                          ) : (
                            '—'
                          ),
                        },
                      ]),
                  {
                    label: 'Our account',
                    value: cheque.bankName
                      ? `${cheque.bankName} · ${cheque.branchName} · ${cheque.accountNumber}`
                      : '—',
                  },
                  { label: 'Cheque date', value: formatDate(cheque.depositDate) },
                  { label: 'Issued on', value: formatDate(cheque.issuedDate) },
                  { label: 'Expected clearing', value: formatDate(cheque.expectedClearingDate) },
                ],
              ]}
            />
          </Stack>
        )}
      </DetailDialog>
      <ConfirmDialog
        opened={!!cheque && !!action}
        title={action?.label ?? ''}
        confirmLabel={action?.label ?? 'Confirm'}
        destructive={action?.status === 'RETURNED'}
        trashIcon={false}
        loading={loading}
        onConfirm={run}
        onClose={() => setAction(null)}
      >
        Cheque <strong className="mono">{cheque?.chequeNumber}</strong> for{' '}
        <strong>{formatLkr(cheque?.amount)}</strong>: {action?.label.toLowerCase()}? This is
        recorded in the cheque&apos;s history.
      </ConfirmDialog>
    </>
  );
};
