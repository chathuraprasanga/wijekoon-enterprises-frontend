import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import { NumberInput, Select, SimpleGrid, TextInput } from '@mantine/core';
import { useCan } from '@/utils/permissions';
import { PartyNameInput, PartyToggle } from './PartyField';
import { useForm } from '@mantine/form';
import { FormModal } from '@/components/FormModal';
import { useErrorSummary } from '@/hooks/useErrorSummary';
import { useAppDispatch } from '@/store/hooks';
import { type Cheque, createCheque, updateCheque } from '@/store/chequeSlice/chequeSlice';
import type { Customer } from '@/store/customerSlice/customerSlice';
import type { Sale } from '@/store/saleSlice/saleSlice';
import { useLookup } from '@/hooks/useLookup';
import { toNotify } from '@/hooks/toNotify';
import { customerName, saleOutstanding } from '@/pages/sales/saleLabels';
import { formatLkr, toYmd } from '@/utils/format';
import { BankBranchSelect } from '@/components/BankBranchSelect';
import { DepositDateInput } from '@/components/DepositDateInput';

type Values = {
  party: 'usual' | 'other';
  partyName: string;
  customer: string | null;
  sale: string | null;
  depositDate: string | null;
  bankCode: string;
  branchCode: string;
  chequeNumber: string;
  amount: number | string;
};

type Props = { opened: boolean; cheque: Cheque | null; onClose: () => void; onSaved?: () => void };

export const AddEditChequeModal = ({ opened, cheque, onClose, onSaved }: Props) =>
  opened ? (
    <ChequeForm key={cheque?._id ?? 'new'} cheque={cheque} onClose={onClose} onSaved={onSaved} />
  ) : null;

const ChequeForm = ({ cheque, onClose, onSaved }: Omit<Props, 'opened'>) => {
  const dispatch = useAppDispatch();
  // A focused text input pops the phone keyboard, which resizes the sheet and makes the dropdown blink.
  const phone = useMediaQuery('(max-width: 47.99em)');
  const customers = useLookup<Customer>('customers');
  const sales = useLookup<Sale>('sales');
  const can = useCan();
  // Customer cheques need received-cheque:create, other-party ones third-party-received-cheque:create (editing keeps the cheque's own type).
  const allowUsual = cheque ? cheque.partyType !== 'other' : can('received-cheque:create');
  const allowOther = cheque
    ? cheque.partyType === 'other'
    : can('third-party-received-cheque:create');
  const [loading, setLoading] = useState(false);

  const form = useForm<Values>({
    initialValues: {
      party: cheque
        ? cheque.partyType === 'other'
          ? 'other'
          : 'usual'
        : allowUsual
          ? 'usual'
          : 'other',
      partyName: cheque?.partyName ?? '',
      customer: cheque?.customer ?? null,
      sale: cheque?.sale ?? null,
      depositDate: cheque?.depositDate.slice(0, 10) ?? toYmd(new Date()),
      bankCode: cheque?.bankCode ?? '',
      branchCode: cheque?.branchCode ?? '',
      chequeNumber: cheque?.chequeNumber ?? '',
      amount: cheque?.amount ?? '',
    },
    validate: {
      customer: (v, all) => (all.party === 'other' || v ? null : 'Select a customer'),
      sale: (v, all) => (all.party === 'other' || v ? null : 'Select the related sale'),
      partyName: (v, all) => (all.party === 'usual' || v.trim() ? null : 'Enter the party name'),
      depositDate: (v) => (v ? null : 'Deposit date is required'),
      bankCode: (v) => (v ? null : 'Select a bank'),
      branchCode: (v) => (v ? null : 'Select a branch'),
      chequeNumber: (v) => (/^\d{6}$/.test(v) ? null : 'Cheque number is 6 digits'),
      amount: (v, all) => {
        if (!(typeof v === 'number' && v > 0)) return 'Enter an amount above 0';
        const room = !cheque && all.party === 'usual' ? owed(all.sale) : null;
        return room !== null && v > room + 0.001
          ? `At most ${formatLkr(room)} is owed on this sale`
          : null;
      },
    },
  });

  // New cheques can only pay what a sale still owes; an edited cheque keeps its own sale in the list.
  const owed = (id: string | null) => {
    const s = sales.items.find((x) => x._id === id);
    return s ? saleOutstanding(s) : null;
  };
  const customerSales = sales.items.filter(
    (s) =>
      s.customer === form.values.customer &&
      (cheque ? s._id === cheque.sale || saleOutstanding(s) > 0 : saleOutstanding(s) > 0),
  );

  const mono = { input: { fontFamily: 'var(--mantine-font-family-monospace)' } };

  const handleSubmit = async (v: Values) => {
    const payload = {
      ...(v.party === 'other'
        ? { partyType: 'other' as const, partyName: v.partyName.trim() }
        : {
            partyType: 'customer' as const,
            customer: v.customer!,
            sale: v.sale!,
            // a new cheque pays down what the sale owes
            ...(!cheque && { settleSale: true }),
          }),
      depositDate: v.depositDate!,
      bankCode: v.bankCode,
      branchCode: v.branchCode,
      chequeNumber: v.chequeNumber,
      amount: Number(v.amount),
    };
    setLoading(true);
    try {
      if (cheque) {
        await dispatch(updateCheque({ _id: cheque._id, ...payload })).unwrap();
        toNotify('Cheque saved', `Cheque ${payload.chequeNumber} was updated.`, 'SUCCESS');
      } else {
        await dispatch(createCheque(payload)).unwrap();
        toNotify('Cheque received', `Cheque ${payload.chequeNumber} was recorded.`, 'SUCCESS');
      }
      onSaved?.();
      onClose();
    } catch (error) {
      toNotify('Failed to save cheque', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  const errorLabels = useErrorSummary(form, {
    customer: 'Customer',
    sale: 'Related sale',
    partyName: 'Party name',
    chequeNumber: 'Cheque number',
    bankCode: 'Bank',
    branchCode: 'Branch',
    amount: 'Amount',
    depositDate: 'Deposit date',
  });

  return (
    <FormModal
      opened
      title={cheque ? 'Edit cheque' : 'Receive cheque'}
      subject={cheque?.chequeNumber}
      submitLabel={cheque ? 'Save cheque' : 'Receive cheque'}
      loading={loading}
      dirty={form.isDirty()}
      errorLabels={errorLabels}
      onSubmit={form.onSubmit(handleSubmit)}
      onClose={onClose}
    >
      <PartyToggle
        value={form.values.party}
        usual="Customer"
        allowUsual={allowUsual && !cheque}
        allowOther={allowOther && !cheque}
        onChange={(v) => form.setFieldValue('party', v)}
      />
      {form.values.party === 'other' ? (
        <PartyNameInput
          direction="received"
          label="Party name"
          value={form.values.partyName}
          error={form.errors.partyName}
          onChange={(v) => form.setFieldValue('partyName', v)}
        />
      ) : (
        <>
          <Select
            label="Customer"
            withAsterisk
            searchable={!phone}
            comboboxProps={{ withinPortal: false }}
            placeholder="Select customer"
            data={customers.items.map((c) => ({ value: c._id, label: customerName(c) }))}
            disabled={customers.loading}
            {...form.getInputProps('customer')}
            onChange={(v) => {
              form.setFieldValue('customer', v);
              form.setFieldValue('sale', null);
            }}
          />
          <Select
            label="Related sale"
            withAsterisk
            searchable={!phone}
            comboboxProps={{ withinPortal: false }}
            placeholder={form.values.customer ? 'Select sale' : 'Select a customer first'}
            description="Only this customer's sales that still owe money are listed."
            inputWrapperOrder={['label', 'input', 'description', 'error']}
            data={customerSales.map((s) => ({
              value: s._id,
              label: `${s.salesId} · owes ${formatLkr(saleOutstanding(s))}`,
            }))}
            disabled={!form.values.customer || sales.loading}
            nothingFoundMessage="This customer has no unpaid sales"
            {...form.getInputProps('sale')}
            onChange={(v) => {
              form.setFieldValue('sale', v);
              const sale = sales.items.find((s) => s._id === v);
              if (sale && !cheque) form.setFieldValue('amount', saleOutstanding(sale));
            }}
          />
        </>
      )}
      <TextInput
        label="Cheque number"
        withAsterisk
        styles={mono}
        placeholder="Enter 6-digit cheque number"
        description="6 digits, printed at the bottom of the cheque."
        inputMode="numeric"
        maxLength={6}
        {...form.getInputProps('chequeNumber')}
      />
      <SimpleGrid cols={{ base: 1, xs: 2 }}>
        <BankBranchSelect
          bankCode={form.values.bankCode}
          branchCode={form.values.branchCode}
          bankError={form.errors.bankCode}
          branchError={form.errors.branchCode}
          onChange={(v) => form.setValues({ bankCode: v.bankCode, branchCode: v.branchCode })}
        />
      </SimpleGrid>
      <NumberInput
        label="Amount"
        placeholder="LKR 0.00"
        withAsterisk
        prefix="LKR "
        min={0}
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator=","
        {...form.getInputProps('amount')}
      />
      <DepositDateInput
        inModal
        value={form.values.depositDate}
        error={form.errors.depositDate}
        allowOverride={false}
        onChange={(d) => form.setFieldValue('depositDate', d ? toYmd(d) : '')}
      />
    </FormModal>
  );
};
