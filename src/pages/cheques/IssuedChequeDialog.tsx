import { Link } from 'react-router-dom';
import { Box, Stack, Text } from '@mantine/core';
import { DetailDialog } from '@/components/DetailDialog';
import { DetailList } from '@/components/DetailList';
import { ChequeLifecycleBadge } from '@/components/StatusBadge';
import type { Cheque } from '@/store/chequeSlice/chequeSlice';
import { formatDate, formatLkr } from '@/utils/format';

// A cheque we wrote to a supplier. Its status changes from the order's payments, not here.
export const IssuedChequeDialog = ({
  cheque,
  onClose,
}: {
  cheque: Cheque | null;
  onClose: () => void;
}) => (
  <DetailDialog
    opened={!!cheque}
    onClose={onClose}
    title={cheque ? <span className="mono">{cheque.chequeNumber}</span> : ''}
    subtitle={cheque ? `${formatLkr(cheque.amount)} · ${cheque.supplierName ?? '—'}` : undefined}
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
            Our cheque to a supplier. Clear or return it from the order&apos;s payments.
          </Text>
        </Box>
        <DetailList
          groups={[
            [
              { label: 'Supplier', value: cheque.supplierName },
              { label: 'Payee', value: cheque.payee },
              {
                label: 'Order',
                value: cheque.order ? (
                  <Link to={`/app/orders/${cheque.order}`}>{cheque.orderNo ?? 'Open order'}</Link>
                ) : (
                  '—'
                ),
              },
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
);
