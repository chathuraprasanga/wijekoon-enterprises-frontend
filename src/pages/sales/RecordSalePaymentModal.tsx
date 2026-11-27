import { useState } from 'react';
import { NumberInput, SegmentedControl, SimpleGrid, Text, TextInput } from '@mantine/core';
import { FormModal } from '@/components/FormModal';
import { BankBranchSelect } from '@/components/BankBranchSelect';
import { DepositDateInput } from '@/components/DepositDateInput';
import { toNotify } from '@/hooks/toNotify';
import { useAppDispatch } from '@/store/hooks';
import { type Sale, recordSalePayment } from '@/store/saleSlice/saleSlice';
import { formatLkr, toYmd } from '@/utils/format';
import { useCan } from '@/utils/permissions';
import { saleOutstanding } from './saleLabels';

type Props = { sale: Sale; opened: boolean; onClose: () => void; onDone: () => void };

export const RecordSalePaymentModal = ({ sale, opened, onClose, onDone }: Props) =>
  opened ? <Form sale={sale} onClose={onClose} onDone={onDone} /> : null;

const Form = ({ sale, onClose, onDone }: Omit<Props, 'opened'>) => {
  const dispatch = useAppDispatch();
  // A cheque payment also records a received cheque, so it needs Received Cheques → Create.
  const canCheque = useCan()('received-cheque:create');
  const room = saleOutstanding(sale);
  const [method, setMethod] = useState<'cash' | 'cheque'>('cash');
  const [amount, setAmount] = useState<number | ''>(room);
  const [chequeNumber, setChequeNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [depositDate, setDepositDate] = useState(toYmd(new Date()));
  const [tried, setTried] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = {
    Amount:
      typeof amount !== 'number' || amount <= 0
        ? 'Enter an amount above 0'
        : amount > room
          ? `At most ${formatLkr(room)}`
          : '',
    ...(method === 'cheque' && {
      'Cheque number': /^\d{6}$/.test(chequeNumber) ? '' : 'Cheque number is 6 digits',
      Bank: bankCode && branchCode ? '' : 'Select a bank and branch',
    }),
  } as Record<string, string>;
  const bad = Object.entries(errors).filter(([, v]) => v);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (bad.length) return;
    setLoading(true);
    try {
      await dispatch(
        recordSalePayment({
          id: sale._id,
          method,
          amount: amount as number,
          ...(method === 'cheque' && {
            cheque: { depositDate, bankCode, branchCode, chequeNumber },
          }),
        }),
      ).unwrap();
      toNotify('Payment recorded', `${formatLkr(amount as number)} received.`, 'SUCCESS');
      onDone();
      onClose();
    } catch (err) {
      toNotify("Couldn't record payment", err as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      opened
      title="Record payment"
      subject={sale.salesId}
      submitLabel="Record payment"
      loading={loading}
      dirty={false}
      errorLabels={tried ? bad.map(([k]) => k) : []}
      onSubmit={submit}
      onClose={onClose}
    >
      <Text size="sm" c="dimmed">
        Outstanding: <strong className="num">{formatLkr(room)}</strong>
      </Text>
      {canCheque && (
        <SegmentedControl
          fullWidth
          value={method}
          onChange={(v) => setMethod(v as 'cash' | 'cheque')}
          data={[
            { value: 'cash', label: 'Cash' },
            { value: 'cheque', label: 'Cheque' },
          ]}
        />
      )}
      <NumberInput
        placeholder="LKR 0.00"
        label="Amount"
        withAsterisk
        prefix="LKR "
        decimalScale={2}
        thousandSeparator=","
        hideControls
        value={amount}
        onChange={(v) => setAmount(v === '' ? '' : Number(v))}
        error={tried && errors.Amount}
      />
      {method === 'cheque' && (
        <>
          <TextInput
            label="Cheque number"
            withAsterisk
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit cheque number"
            value={chequeNumber}
            onChange={(e) => setChequeNumber(e.currentTarget.value)}
            error={tried && errors['Cheque number']}
          />
          <SimpleGrid cols={{ base: 1, xs: 2 }}>
            <BankBranchSelect
              bankCode={bankCode}
              branchCode={branchCode}
              bankError={tried && !bankCode ? 'Select a bank' : undefined}
              branchError={tried && !branchCode ? 'Select a branch' : undefined}
              onChange={(v) => {
                setBankCode(v.bankCode);
                setBranchCode(v.branchCode);
              }}
            />
          </SimpleGrid>
          <DepositDateInput
            inModal
            value={depositDate}
            allowOverride={false}
            onChange={(d) => setDepositDate(d ? toYmd(d) : '')}
          />
        </>
      )}
    </FormModal>
  );
};
