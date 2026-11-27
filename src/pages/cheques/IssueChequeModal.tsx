import { useState } from 'react';
import { NumberInput, Select, Textarea, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { FormModal } from '@/components/FormModal';
import { toNotify } from '@/hooks/toNotify';
import { useLookup } from '@/hooks/useLookup';
import { useAppDispatch } from '@/store/hooks';
import { issueCheque } from '@/store/chequeSlice/chequeSlice';
import { type Order, fetchOrders } from '@/store/orderSlice/orderSlice';
import type { Bank } from '@/store/bankSlice/bankSlice';
import type { Supplier } from '@/store/supplierSlice/supplierSlice';
import { formatLkr, toYmd } from '@/utils/format';
import { useCan } from '@/utils/permissions';
import { useEffect } from 'react';
import { PartyNameInput, PartyToggle } from './PartyField';

type Props = { opened: boolean; onClose: () => void; onSaved?: () => void };

export const IssueChequeModal = ({ opened, onClose, onSaved }: Props) =>
  opened ? <Form onClose={onClose} onSaved={onSaved} /> : null;

const Form = ({ onClose, onSaved }: Omit<Props, 'opened'>) => {
  const dispatch = useAppDispatch();
  const can = useCan();
  const toSupplier = can('issued-cheque:create');
  const toOther = can('third-party-issued-cheque:create');
  const suppliers = useLookup<Supplier>('suppliers');
  const banks = useLookup<Bank>('banks');
  const [party, setParty] = useState<'usual' | 'other'>(toSupplier ? 'usual' : 'other');
  const [supplier, setSupplier] = useState<string | null>(null);
  const [payee, setPayee] = useState('');
  const [order, setOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bank, setBank] = useState<string | null>(null);
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeDate, setChequeDate] = useState<string | null>(toYmd(new Date()));
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [tried, setTried] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const touch = () => setDirty(true);

  // Orders of the chosen supplier that still owe money (only if the user may read orders).
  useEffect(() => {
    if (!supplier || !can('order:read')) return;
    dispatch(fetchOrders({ supplier, page: 1, limit: 100 }))
      .unwrap()
      .then((r) =>
        setOrders(r.data.filter((o) => o.orderStatus !== 'cancelled' && o.outstandingAmount > 0)),
      )
      .catch(() => setOrders([]));
  }, [supplier, can, dispatch]);

  const orderRoom = order ? (orders.find((o) => o._id === order)?.outstandingAmount ?? null) : null;

  const errors: Record<string, string> = {
    [party === 'usual' ? 'Supplier' : 'Payee']:
      party === 'usual'
        ? supplier
          ? ''
          : 'Select a supplier'
        : payee.trim()
          ? ''
          : 'Enter the payee',
    'Bank account': bank ? '' : 'Select one of your bank accounts',
    'Cheque number': /^\d{6}$/.test(chequeNumber) ? '' : 'Cheque number is 6 digits',
    Amount: !(typeof amount === 'number' && amount > 0)
      ? 'Enter an amount above 0'
      : orderRoom !== null && amount > orderRoom + 0.001
        ? `At most ${formatLkr(orderRoom)} is owed on this order`
        : '',
    'Cheque date': chequeDate ? '' : 'Cheque date is required',
  };
  const bad = Object.entries(errors).filter(([, v]) => v);
  const err = (k: string) => (tried ? errors[k] || undefined : undefined);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (bad.length) return;
    setLoading(true);
    try {
      await dispatch(
        issueCheque({
          partyType: party === 'usual' ? 'supplier' : 'other',
          ...(party === 'usual'
            ? { supplier: supplier!, ...(order && { order }) }
            : { payee: payee.trim() }),
          bank: bank!,
          chequeNumber,
          chequeDate: chequeDate!,
          amount: amount as number,
          notes: notes.trim() || undefined,
        }),
      ).unwrap();
      toNotify('Cheque issued', `Cheque ${chequeNumber} was recorded.`, 'SUCCESS');
      onSaved?.();
      onClose();
    } catch (error) {
      toNotify("Couldn't issue cheque", error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      opened
      title="Issue cheque"
      submitLabel="Issue cheque"
      loading={loading}
      dirty={dirty}
      errorLabels={tried ? bad.map(([k]) => k) : []}
      onSubmit={submit}
      onClose={onClose}
    >
      <PartyToggle
        value={party}
        usual="Supplier"
        allowUsual={toSupplier}
        allowOther={toOther}
        onChange={(v) => {
          setParty(v);
          touch();
        }}
      />
      {party === 'usual' ? (
        <>
          <Select
            label="Supplier"
            withAsterisk
            searchable
            comboboxProps={{ withinPortal: false }}
            placeholder="Select supplier"
            data={suppliers.items
              .filter((s) => s.isActive || s._id === supplier)
              .map((s) => ({ value: s._id, label: s.name }))}
            disabled={suppliers.loading}
            value={supplier}
            error={err('Supplier')}
            onChange={(v) => {
              setSupplier(v);
              setOrder(null);
              touch();
            }}
          />
          <Select
            label="Related order"
            clearable
            searchable
            comboboxProps={{ withinPortal: false }}
            placeholder={supplier ? 'None' : 'Select a supplier first'}
            description="Optional. The cheque is recorded as a payment on this order."
            inputWrapperOrder={['label', 'input', 'description', 'error']}
            data={(supplier ? orders : []).map((o) => ({
              value: o._id,
              label: `${o.orderNo} · owes ${formatLkr(o.outstandingAmount)}`,
            }))}
            disabled={!supplier}
            nothingFoundMessage="This supplier has no unpaid orders"
            value={order}
            onChange={(v) => {
              setOrder(v);
              const o = orders.find((x) => x._id === v);
              if (o) setAmount(o.outstandingAmount);
              touch();
            }}
          />
        </>
      ) : (
        <PartyNameInput
          direction="issued"
          label="Payee"
          value={payee}
          error={err('Payee')}
          onChange={(v) => {
            setPayee(v);
            touch();
          }}
        />
      )}
      <Select
        label="Our bank account"
        withAsterisk
        searchable
        comboboxProps={{ withinPortal: false }}
        placeholder="Select account"
        data={banks.items
          .filter((b) => b.isActive)
          .map((b) => ({
            value: b._id,
            label: `${b.bankName} · ${b.branchName} · ${b.accountNumberMasked ?? ''}`,
          }))}
        disabled={banks.loading}
        value={bank}
        error={err('Bank account')}
        onChange={(v) => {
          setBank(v);
          touch();
        }}
      />
      <TextInput
        label="Cheque number"
        withAsterisk
        inputMode="numeric"
        maxLength={6}
        placeholder="Enter 6-digit cheque number"
        styles={{ input: { fontFamily: 'var(--mantine-font-family-monospace)' } }}
        value={chequeNumber}
        error={err('Cheque number')}
        onChange={(e) => {
          setChequeNumber(e.currentTarget.value);
          touch();
        }}
      />
      <NumberInput
        placeholder="LKR 0.00"
        label="Amount"
        withAsterisk
        prefix="LKR "
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator=","
        hideControls
        value={amount}
        error={err('Amount')}
        onChange={(v) => {
          setAmount(v === '' ? '' : Number(v));
          touch();
        }}
      />
      <DateInput
        placeholder="Select date"
        label="Cheque date"
        withAsterisk
        popoverProps={{ withinPortal: false }}
        value={chequeDate}
        error={err('Cheque date')}
        onChange={(d) => {
          setChequeDate(d ? toYmd(d) : null);
          touch();
        }}
      />
      <Textarea
        placeholder="Optional notes"
        label="Notes"
        maxLength={300}
        autosize
        minRows={2}
        value={notes}
        onChange={(e) => {
          setNotes(e.currentTarget.value);
          touch();
        }}
      />
    </FormModal>
  );
};
