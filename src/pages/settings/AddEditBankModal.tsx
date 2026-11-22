import { useState } from 'react';
import { Select, SimpleGrid, Switch, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { BankBranchSelect } from '@/components/BankBranchSelect';
import { FormModal } from '@/components/FormModal';
import { useErrorSummary } from '@/hooks/useErrorSummary';
import { toNotify } from '@/hooks/toNotify';
import { useAppDispatch } from '@/store/hooks';
import {
  ACCOUNT_TYPES,
  type AccountType,
  type Bank,
  createBank,
  updateBank,
} from '@/store/bankSlice/bankSlice';
import { accountNumber, required } from '@/utils/validators';

type Values = {
  bankName: string;
  bankCode: string;
  branchName: string;
  branchCode: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  isActive: boolean;
  notes: string;
};

type Props = { opened: boolean; bank: Bank | null; onClose: () => void; onSaved?: () => void };

// `bank` must carry the full accountNumber when editing (fetch GET /banks/:id first).
export const AddEditBankModal = ({ opened, bank, onClose, onSaved }: Props) =>
  opened ? (
    <BankForm key={bank?._id ?? 'new'} bank={bank} onClose={onClose} onSaved={onSaved} />
  ) : null;

const BankForm = ({ bank, onClose, onSaved }: Omit<Props, 'opened'>) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const form = useForm<Values>({
    initialValues: {
      bankName: bank?.bankName ?? '',
      bankCode: bank?.bankCode ?? '',
      branchName: bank?.branchName ?? '',
      branchCode: bank?.branchCode ?? '',
      accountNumber: bank?.accountNumber ?? '',
      accountName: bank?.accountName ?? '',
      accountType: bank?.accountType ?? 'Current',
      isActive: bank?.isActive ?? true,
      notes: bank?.notes ?? '',
    },
    validate: {
      bankCode: required('Select a bank.'),
      branchCode: required('Select a branch.'),
      accountNumber,
      accountName: required('Account name is required.'),
    },
  });

  const submit = async (v: Values) => {
    setLoading(true);
    const payload = {
      bankName: v.bankName.trim(),
      bankCode: v.bankCode.trim(),
      branchName: v.branchName.trim(),
      branchCode: v.branchCode.trim(),
      accountNumber: v.accountNumber.trim(),
      accountName: v.accountName.trim(),
      accountType: v.accountType,
      isActive: v.isActive,
      notes: v.notes.trim(),
    };
    try {
      if (bank) {
        await dispatch(updateBank({ _id: bank._id, ...payload })).unwrap();
        toNotify('Bank account saved', `${payload.bankName} was updated.`, 'SUCCESS');
      } else {
        await dispatch(createBank(payload)).unwrap();
        toNotify('Bank account added', `${payload.bankName} was added.`, 'SUCCESS');
      }
      onSaved?.();
      onClose();
    } catch (e) {
      toNotify(
        bank ? 'Failed to update bank account' : 'Failed to create bank account',
        e as string,
        'ERROR',
      );
    } finally {
      setLoading(false);
    }
  };

  const errorLabels = useErrorSummary(form, {
    bankCode: 'Bank',
    branchCode: 'Branch',
    accountNumber: 'Account number',
    accountName: 'Account name',
  });

  return (
    <FormModal
      opened
      size="lg"
      title={bank ? 'Edit bank account' : 'Add bank account'}
      subject={bank?.bankName}
      submitLabel={bank ? 'Save account' : 'Create account'}
      loading={loading}
      dirty={form.isDirty()}
      errorLabels={errorLabels}
      onSubmit={form.onSubmit(submit)}
      onClose={onClose}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <BankBranchSelect
          bankCode={form.values.bankCode}
          branchCode={form.values.branchCode}
          storedBankName={form.values.bankName}
          storedBranchName={form.values.branchName}
          bankError={form.errors.bankCode}
          branchError={form.errors.branchCode}
          onChange={(v) => form.setValues(v)}
        />
      </SimpleGrid>
      <TextInput
        label="Account number"
        withAsterisk
        description="Keep leading zeros."
        {...form.getInputProps('accountNumber')}
      />
      <TextInput label="Account name" withAsterisk {...form.getInputProps('accountName')} />
      <Select
        label="Account type"
        withAsterisk
        allowDeselect={false}
        data={[...ACCOUNT_TYPES]}
        {...form.getInputProps('accountType')}
      />
      <Textarea label="Notes" autosize minRows={2} maxRows={4} {...form.getInputProps('notes')} />
      <Switch
        label="Active"
        description="Inactive accounts can't be chosen for new cheques. Existing records are unaffected."
        {...form.getInputProps('isActive', { type: 'checkbox' })}
      />
    </FormModal>
  );
};
