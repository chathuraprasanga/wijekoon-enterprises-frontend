import { Select } from '@mantine/core';
import { BANKS, findBank, type BankBranchValue } from '@/utils/bankData';

type Props = {
  bankCode: string;
  branchCode: string;
  onChange: (v: BankBranchValue) => void;
  bankError?: React.ReactNode;
  branchError?: React.ReactNode;
  /** Names already stored with the record, shown when its code is not in the reference list. */
  storedBankName?: string;
  storedBranchName?: string;
  size?: 'xs' | 'sm' | 'md';
  disabled?: boolean;
};

/// A bank select and a dependent branch select (two siblings: the caller lays them out).
/// Picking a bank clears the branch. Codes stay strings so leading zeros survive.
export const BankBranchSelect = ({
  bankCode,
  branchCode,
  onChange,
  bankError,
  branchError,
  storedBankName,
  storedBranchName,
  size,
  disabled,
}: Props) => {
  const bank = findBank(bankCode);
  const bankData = BANKS.map((b) => ({ value: b.code, label: `${b.name} (${b.code})` }));
  if (bankCode && !bank) {
    bankData.push({
      value: bankCode,
      label: storedBankName ? `${storedBankName} (${bankCode})` : bankCode,
    });
  }
  const branchData = (bank?.branches ?? []).map((b) => ({
    value: b.code,
    label: `${b.name} (${b.code})`,
  }));
  if (branchCode && !branchData.some((b) => b.value === branchCode)) {
    branchData.push({
      value: branchCode,
      label: storedBranchName ? `${storedBranchName} (${branchCode})` : branchCode,
    });
  }
  const nameOfBranch = (code: string) =>
    bank?.branches.find((b) => b.code === code)?.name ?? storedBranchName ?? '';

  return (
    <>
      <Select
        label="Bank"
        withAsterisk
        searchable
        size={size}
        disabled={disabled}
        placeholder="Select bank"
        nothingFoundMessage="No bank found"
        data={bankData}
        value={bankCode || null}
        error={bankError}
        onChange={(v) =>
          onChange({
            bankCode: v ?? '',
            bankName: (v && findBank(v)?.name) || (v === bankCode ? (storedBankName ?? '') : ''),
            branchCode: '',
            branchName: '',
          })
        }
      />
      <Select
        label="Branch"
        withAsterisk
        searchable
        size={size}
        limit={100}
        disabled={disabled || !bankCode}
        placeholder={bankCode ? 'Select branch' : 'Select a bank first'}
        nothingFoundMessage="No branch found"
        data={branchData}
        value={branchCode || null}
        error={branchError}
        onChange={(v) =>
          onChange({
            bankCode,
            bankName: bank?.name ?? storedBankName ?? '',
            branchCode: v ?? '',
            branchName: v ? nameOfBranch(v) : '',
          })
        }
      />
    </>
  );
};
