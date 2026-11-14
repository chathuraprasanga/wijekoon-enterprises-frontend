import { useState } from 'react';
import { NumberInput, Select, SimpleGrid, TextInput } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { FormModal } from '@/components/FormModal';
import { useErrorSummary } from '@/hooks/useErrorSummary';
import { useAppDispatch } from '@/store/hooks';
import { type Cheque, createCheque, updateCheque } from '@/store/chequeSlice/chequeSlice';
import type { Customer } from '@/store/customerSlice/customerSlice';
import type { Sale } from '@/store/saleSlice/saleSlice';
import { useLookup } from '@/hooks/useLookup';
import { toNotify } from '@/hooks/toNotify';
import { customerName } from '@/pages/sales/saleLabels';
import { formatLkr } from '@/utils/format';

type Values = {
  customer: string | null;
  sale: string | null;
  depositDate: string | null;
  bankCode: string;
  branchCode: string;
  chequeNumber: string;
  amount: number | string;
};

type Props = { opened: boolean; cheque: Cheque | null; onClose: () => void };

export const AddEditChequeModal = ({ opened, cheque, onClose }: Props) =>
  opened ? <ChequeForm key={cheque?._id ?? 'new'} cheque={cheque} onClose={onClose} /> : null;

const ChequeForm = ({ cheque, onClose }: Omit<Props, 'opened'>) => {
  const dispatch = useAppDispatch();
  const customers = useLookup<Customer>('customers');
  const sales = useLookup<Sale>('sales');
  const [loading, setLoading] = useState(false);

  const form = useForm<Values>({
    initialValues: {
      customer: cheque?.customer ?? null,
      sale: cheque?.sale ?? null,
      depositDate: cheque?.depositDate.slice(0, 10) ?? null,
      bankCode: cheque?.bankCode ?? '',
      branchCode: cheque?.branchCode ?? '',
      chequeNumber: cheque?.chequeNumber ?? '',
      amount: cheque?.amount ?? '',
    },
    validate: {
      customer: (v) => (v ? null : 'Select a customer'),
      sale: (v) => (v ? null : 'Select the related sale'),
      depositDate: (v) => (v ? null : 'Deposit date is required'),
      bankCode: (v) => (/^\d{4}$/.test(v) ? null : 'Bank code is 4 digits'),
      branchCode: (v) => (/^\d{3}$/.test(v) ? null : 'Branch code is 3 digits'),
      chequeNumber: (v) => (/^\d{6}$/.test(v) ? null : 'Cheque number is 6 digits'),
      amount: (v) => (typeof v === 'number' && v > 0 ? null : 'Enter an amount above 0'),
    },
  });

  const customerSales = sales.items.filter((s) => s.customer === form.values.customer);

  const mono = { input: { fontFamily: 'var(--mantine-font-family-monospace)' } };

  const handleSubmit = async (v: Values) => {
    const payload = {
      customer: v.customer!,
      sale: v.sale!,
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
        toNotify('Cheque added', `Cheque ${payload.chequeNumber} was added.`, 'SUCCESS');
      }
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
    chequeNumber: 'Cheque number',
    bankCode: 'Bank code',
    branchCode: 'Branch code',
    amount: 'Amount',
    depositDate: 'Deposit date',
  });

  return (
    <FormModal
      opened
      title={cheque ? 'Edit cheque' : 'Add cheque'}
      subject={cheque?.chequeNumber}
      submitLabel={cheque ? 'Save cheque' : 'Add cheque'}
      loading={loading}
      dirty={form.isDirty()}
      errorLabels={errorLabels}
      onSubmit={form.onSubmit(handleSubmit)}
      onClose={onClose}
    >
      <Select
        label="Customer"
        withAsterisk
        searchable
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
        searchable
        placeholder={form.values.customer ? 'Select sale' : 'Select a customer first'}
        description="Only this customer's sales are listed."
        inputWrapperOrder={['label', 'input', 'description', 'error']}
        data={customerSales.map((s) => ({
          value: s._id,
          label: `${s.salesId} · ${formatLkr(s.netTotal)}`,
        }))}
        disabled={!form.values.customer || sales.loading}
        nothingFoundMessage="This customer has no sales yet"
        {...form.getInputProps('sale')}
        onChange={(v) => {
          form.setFieldValue('sale', v);
          const sale = sales.items.find((s) => s._id === v);
          if (sale && !form.values.amount) form.setFieldValue('amount', sale.netTotal);
        }}
      />
      <TextInput
        label="Cheque number"
        withAsterisk
        styles={mono}
        placeholder="004217"
        description="6 digits, printed at the bottom of the cheque."
        inputMode="numeric"
        maxLength={6}
        {...form.getInputProps('chequeNumber')}
      />
      <SimpleGrid cols={{ base: 1, xs: 2 }}>
        <TextInput
          label="Bank code"
          withAsterisk
          styles={mono}
          placeholder="7056"
          description="4 digits"
          inputMode="numeric"
          maxLength={4}
          {...form.getInputProps('bankCode')}
        />
        <TextInput
          label="Branch code"
          withAsterisk
          styles={mono}
          placeholder="045"
          description="3 digits"
          inputMode="numeric"
          maxLength={3}
          {...form.getInputProps('branchCode')}
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
      <DateInput
        label="Deposit date"
        placeholder="Select a date"
        withAsterisk
        leftSection={<IconCalendar size={16} aria-hidden />}
        {...form.getInputProps('depositDate')}
      />
    </FormModal>
  );
};
