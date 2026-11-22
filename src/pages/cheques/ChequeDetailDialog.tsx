import { useState } from 'react';
import { Box, Button, Stack, Text } from '@mantine/core';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DetailList } from '@/components/DetailList';
import { DetailDialog } from '@/components/DetailDialog';
import { ChequeLifecycleBadge, ChequeStatusBadge } from '@/components/StatusBadge';
import { toNotify } from '@/hooks/toNotify';
import { useBusinessRules, ymdPlusDays } from '@/hooks/useBusinessRules';
import { useAppDispatch } from '@/store/hooks';
import { type Cheque, setChequeStatus } from '@/store/chequeSlice/chequeSlice';
import { bankDisplay, branchDisplay } from '@/utils/bankData';
import { formatDate, formatLkr } from '@/utils/format';
import { useCan } from '@/utils/permissions';

// The moves the backend allows from each status. TRANSFERRED is handled from the supplier payment.
const ACTIONS: Record<string, { status: string; label: string; destructive?: boolean }[]> = {
  RECEIVED: [{ status: 'DEPOSITED', label: 'Deposit' }],
  // Deposited cheques clear by themselves after the clearing date; "Mark cleared" is only to do it sooner.
  DEPOSITED: [
    { status: 'CLEARED', label: 'Mark cleared' },
    { status: 'RETURNED', label: 'Mark returned', destructive: true },
  ],
  // A return notice can still arrive after the cheque has cleared.
  CLEARED: [{ status: 'RETURNED', label: 'Mark returned', destructive: true }],
  // The customer asked for it to be deposited again.
  RETURNED: [{ status: 'DEPOSITED', label: 'Deposit again' }],
};

type Props = {
  cheque: Cheque | null;
  customerName: string;
  onClose: () => void;
  onChanged: () => void;
};

export const ChequeDetailDialog = ({ cheque, customerName, onClose, onChanged }: Props) => {
  const can = useCan();
  const dispatch = useAppDispatch();
  const rules = useBusinessRules();
  const [action, setAction] = useState<{ status: string; label: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const status = cheque?.status ?? 'RECEIVED';
  const moves = can('cheque:update') ? (ACTIONS[status] ?? []) : [];

  const run = async () => {
    if (!cheque || !action) return;
    setLoading(true);
    try {
      await dispatch(
        setChequeStatus({
          id: cheque._id,
          status: action.status,
        }),
      ).unwrap();
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
        onClose={onClose}
        title={cheque ? <span className="mono">{cheque.chequeNumber}</span> : ''}
        subtitle={cheque ? `${formatLkr(cheque.amount)} · ${customerName}` : undefined}
        actions={moves.map((m, i) => (
          <Button
            key={m.status}
            variant={i === 0 ? 'filled' : 'default'}
            color={m.destructive && i > 0 ? 'red' : undefined}
            onClick={() => {
              setAction(m);
            }}
          >
            {m.label}
          </Button>
        ))}
      >
        {cheque && (
          <Stack gap="md">
            <Box>
              <Text size="sm" c="dimmed">
                Status
              </Text>
              <Stack gap={6} mt={4} align="flex-start">
                <ChequeLifecycleBadge status={status} />
                {status === 'RECEIVED' && <ChequeStatusBadge depositDate={cheque.depositDate} />}
              </Stack>
              {status === 'TRANSFERRED' && (
                <Text size="sm" c="dimmed" mt={6}>
                  With a supplier. Clear, return or take it back from that order&apos;s payments.
                </Text>
              )}
            </Box>
            <DetailList
              groups={[
                [
                  {
                    label: 'Deposit date',
                    value: <span className="num">{formatDate(cheque.depositDate)}</span>,
                  },
                  {
                    label: 'Expected clearing',
                    value: <span className="num">{formatDate(cheque.expectedClearingDate)}</span>,
                  },
                  { label: 'Bank', value: bankDisplay(cheque.bankCode) },
                  { label: 'Branch', value: branchDisplay(cheque.bankCode, cheque.branchCode) },
                  ...(cheque.depositLimitOverridden
                    ? [{ label: 'Deposit limit', value: 'Overridden when saved' }]
                    : []),
                ],
              ]}
            />
            {!!cheque.statusHistory?.length && (
              <Box>
                <Text className="eyebrow" mb="xs">
                  History
                </Text>
                <Stack gap={2}>
                  {[...cheque.statusHistory].reverse().map((h, i) => (
                    <Text key={i} size="sm">
                      {h.status.charAt(0) + h.status.slice(1).toLowerCase()} ·{' '}
                      <span className="num">{formatDate(h.at)}</span>
                      {h.byName ? ` · ${h.byName}` : ''}
                    </Text>
                  ))}
                </Stack>
              </Box>
            )}
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
        {action?.status === 'DEPOSITED' &&
          ` Expected to clear ${formatDate(ymdPlusDays(rules.depositClearingDays))}.`}
      </ConfirmDialog>
    </>
  );
};
