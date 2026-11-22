import { useEffect, useRef, useState } from 'react';
import {
  NumberInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { FormModal } from '@/components/FormModal';
import { InlineAlert } from '@/components/InlineAlert';
import { toNotify } from '@/hooks/toNotify';
import { useLookup } from '@/hooks/useLookup';
import { useBusinessRules, ymdPlusDays } from '@/hooks/useBusinessRules';
import { useAppDispatch } from '@/store/hooks';
import type { Bank } from '@/store/bankSlice/bankSlice';
import {
  type Order,
  type PaymentInput,
  type TransferableCheque,
  createPayment,
  fetchTransferableCheques,
  updateOrder,
} from '@/store/orderSlice/orderSlice';
import { formatDate, formatLkr, toYmd } from '@/utils/format';
import { useCan } from '@/utils/permissions';

type Kind = 'cash' | 'credit' | 'issued_cheque' | 'customer_cheque';
type Props = { order: Order; opened: boolean; onClose: () => void; onDone: () => void };

const money = { decimalScale: 2, min: 0, hideControls: true, thousandSeparator: ',' } as const;

export const RecordPaymentModal = ({ order, opened, onClose, onDone }: Props) =>
  opened ? <Form order={order} onClose={onClose} onDone={onDone} /> : null;

const Form = ({ order, onClose, onDone }: Omit<Props, 'opened'>) => {
  const dispatch = useAppDispatch();
  const can = useCan();
  const banks = useLookup<Bank>('banks');
  const room = Math.round(order.outstandingAmount * 100) / 100;
  // One key per opened form: a double click or retry can never record the payment twice.
  const key = useRef(crypto.randomUUID());

  const [kind, setKind] = useState<Kind>('cash');
  const [date, setDate] = useState(toYmd(new Date()));
  const [amount, setAmount] = useState<number | ''>(room > 0 ? room : '');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const rules = useBusinessRules();
  // The due date follows Settings → Business rules until edited. Expected clearing dates are computed by the server.
  const [dueEdited, setDueEdited] = useState<string | null>(
    order.dueDate ? toYmd(order.dueDate) : null,
  );
  const dueDate = dueEdited ?? ymdPlusDays(rules.orderDueDays, order.orderDate);
  const [bank, setBank] = useState<string | null>(null);
  const [chequeNo, setChequeNo] = useState('');
  const [chequeDate, setChequeDate] = useState(toYmd(new Date()));
  const clearing =
    kind === 'customer_cheque'
      ? ymdPlusDays(rules.transferClearingDays, date)
      : ymdPlusDays(rules.issuedClearingDays, chequeDate);
  const [cheques, setCheques] = useState<TransferableCheque[]>([]);
  const [chequeError, setChequeError] = useState('');
  const [customerCheque, setCustomerCheque] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const touch = () => setDirty(true);

  useEffect(() => {
    if (kind !== 'customer_cheque' || cheques.length) return;
    dispatch(fetchTransferableCheques())
      .unwrap()
      .then(setCheques)
      .catch((e) => setChequeError(e as string));
  }, [kind, cheques.length, dispatch]);

  const picked = cheques.find((c) => c._id === customerCheque);
  const finalAmount =
    kind === 'customer_cheque' ? (picked?.amount ?? 0) : amount === '' ? 0 : amount;

  const errors = {
    amount:
      kind === 'cash' || kind === 'issued_cheque'
        ? !finalAmount || finalAmount <= 0
          ? 'Enter an amount above zero.'
          : finalAmount > room
            ? `That's more than the ${formatLkr(room)} still payable.`
            : ''
        : '',
    date: date ? '' : 'Choose a date.',
    bank: kind === 'issued_cheque' && !bank ? 'Choose a bank account.' : '',
    chequeNo:
      kind === 'issued_cheque' && !/^\d{6}$/.test(chequeNo.trim())
        ? 'Cheque number is 6 digits.'
        : '',
    chequeDate: kind === 'issued_cheque' && !chequeDate ? 'Choose the cheque date.' : '',
    customerCheque:
      kind === 'customer_cheque' && !picked
        ? 'Choose a cheque.'
        : picked && picked.amount > room
          ? `This cheque (${formatLkr(picked.amount)}) is more than the ${formatLkr(room)} still payable.`
          : '',
  };
  const show = (k: keyof typeof errors) => (tried ? errors[k] : '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    try {
      if (kind === 'credit') {
        // Credit isn't a payment: it just records when the supplier expects the money.
        await dispatch(updateOrder({ id: order._id, body: { dueDate: dueDate || null } })).unwrap();
        toNotify('Due date saved', 'The order stays unpaid until you record a payment.', 'SUCCESS');
      } else {
        const body: PaymentInput = {
          method: kind,
          paymentDate: date,
          reference: reference.trim() || undefined,
          notes: notes.trim() || undefined,
          idempotencyKey: key.current,
          ...(kind === 'customer_cheque'
            ? {
                customerCheque: customerCheque!,
                transferDate: date,
              }
            : { amount: finalAmount }),
          ...(kind === 'issued_cheque'
            ? {
                cheque: {
                  bank: bank!,
                  chequeNumber: chequeNo.trim(),
                  chequeDate,
                },
              }
            : {}),
        };
        await dispatch(createPayment({ id: order._id, body })).unwrap();
        toNotify(
          kind === 'cash' ? 'Payment recorded' : 'Cheque recorded',
          kind === 'cash'
            ? `${formatLkr(finalAmount)} was paid on ${order.orderNo}.`
            : 'It counts as paid once the cheque clears.',
          'SUCCESS',
        );
      }
      onDone();
      onClose();
    } catch (err) {
      toNotify("Couldn't record payment", err as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  const bankData = banks.items
    .filter((b) => b.isActive)
    .map((b) => ({
      value: b._id,
      label: `${b.bankName} · ${b.accountNumberMasked}`,
    }));

  return (
    <FormModal
      opened
      title="Record payment"
      subject={order.orderNo}
      size="md"
      submitLabel={kind === 'credit' ? 'Save due date' : 'Record payment'}
      loading={loading}
      dirty={dirty}
      errorLabels={
        tried
          ? Object.entries(errors)
              .filter(([, v]) => v)
              .map(([k]) => k)
          : []
      }
      onSubmit={submit}
      onClose={onClose}
    >
      <Text size="sm" c="dimmed">
        Outstanding <strong className="num">{formatLkr(order.outstandingAmount)}</strong>
      </Text>
      <SegmentedControl
        fullWidth
        aria-label="Payment type"
        value={kind}
        onChange={(v) => {
          setKind(v as Kind);
          touch();
        }}
        data={[
          { value: 'cash', label: 'Cash' },
          { value: 'credit', label: 'Credit' },
          { value: 'issued_cheque', label: 'Our cheque' },
          { value: 'customer_cheque', label: 'Customer cheque' },
        ]}
      />

      {kind === 'credit' ? (
        <>
          <InlineAlert tone="info" title="Buying on credit">
            Credit isn&apos;t a payment. The order stays unpaid and you can pay later, in full or in
            parts. Set when the supplier expects the money.
          </InlineAlert>
          <DateInput
            label="Payment due date"
            description={`Order date + ${rules.orderDueDays} days unless you change it`}
            clearable
            value={dueDate || null}
            onChange={(v) => {
              setDueEdited(toYmd(v));
              touch();
            }}
          />
        </>
      ) : (
        <>
          {room <= 0 && (
            <InlineAlert tone="warning" title="Nothing left to pay">
              The outstanding balance is fully covered, including cheques not yet cleared.
            </InlineAlert>
          )}
          <SimpleGrid cols={{ base: 1, xs: 2 }}>
            <DateInput
              label={kind === 'customer_cheque' ? 'Transfer date' : 'Payment date'}
              withAsterisk
              value={date}
              error={show('date')}
              onChange={(v) => {
                setDate(toYmd(v));
                touch();
              }}
            />
            {kind !== 'customer_cheque' && (
              <NumberInput
                label="Amount (LKR)"
                withAsterisk
                {...money}
                value={amount}
                error={show('amount')}
                onChange={(v) => {
                  setAmount(v === '' ? '' : Number(v));
                  touch();
                }}
              />
            )}
          </SimpleGrid>

          {kind === 'issued_cheque' && (
            <>
              {!can('bank:read') ? (
                <InlineAlert tone="warning" title="Bank accounts unavailable">
                  You need permission to view bank accounts to issue a cheque.
                </InlineAlert>
              ) : (
                <Select
                  label="Bank account"
                  withAsterisk
                  searchable
                  placeholder={
                    bankData.length || banks.loading
                      ? 'Select an account'
                      : 'No active bank accounts'
                  }
                  description="Add accounts under Settings → Banks."
                  data={bankData}
                  value={bank}
                  error={show('bank')}
                  onChange={(v) => {
                    setBank(v);
                    touch();
                  }}
                />
              )}
              <SimpleGrid cols={{ base: 1, xs: 2 }}>
                <TextInput
                  label="Cheque number"
                  withAsterisk
                  inputMode="numeric"
                  value={chequeNo}
                  error={show('chequeNo')}
                  onChange={(e) => {
                    setChequeNo(e.currentTarget.value);
                    touch();
                  }}
                />
                <DateInput
                  label="Cheque date"
                  withAsterisk
                  value={chequeDate}
                  error={show('chequeDate')}
                  onChange={(v) => {
                    setChequeDate(toYmd(v));
                    touch();
                  }}
                />
              </SimpleGrid>
              <Text size="sm" c="dimmed">
                Expected to clear {formatDate(clearing)}
              </Text>
            </>
          )}

          {kind === 'customer_cheque' && (
            <>
              {chequeError ? (
                <InlineAlert tone="warning" title="Cheques couldn't be loaded">
                  {chequeError}
                </InlineAlert>
              ) : (
                <Select
                  label="Customer cheque"
                  withAsterisk
                  searchable
                  placeholder={cheques.length ? 'Select a cheque' : 'No transferable cheques'}
                  description="Only cheques still in hand that aren't crossed or restricted."
                  data={cheques.map((c) => ({
                    value: c._id,
                    label: `${c.chequeNumber} · ${formatLkr(c.amount)} · ${formatDate(c.depositDate)}${
                      c.customer?.firstName
                        ? ` · ${c.customer.firstName} ${c.customer.lastName ?? ''}`
                        : ''
                    }`,
                  }))}
                  value={customerCheque}
                  error={show('customerCheque')}
                  onChange={(v) => {
                    setCustomerCheque(v);
                    touch();
                  }}
                />
              )}
              <Text size="sm" c="dimmed">
                Expected to clear {formatDate(clearing)}
              </Text>
              {picked && (
                <Text size="sm">
                  The whole cheque is handed over:{' '}
                  <strong className="num">{formatLkr(picked.amount)}</strong>. It counts as paid
                  once the supplier clears it.
                </Text>
              )}
            </>
          )}

          <TextInput
            label="Reference"
            maxLength={80}
            value={reference}
            onChange={(e) => {
              setReference(e.currentTarget.value);
              touch();
            }}
          />
          <Textarea
            label="Notes"
            autosize
            minRows={2}
            maxRows={4}
            maxLength={300}
            value={notes}
            onChange={(e) => {
              setNotes(e.currentTarget.value);
              touch();
            }}
          />
        </>
      )}
    </FormModal>
  );
};
