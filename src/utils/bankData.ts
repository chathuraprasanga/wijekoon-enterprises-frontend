import banksJson from '@/data/banks.json';

export type Branch = { code: string; name: string };
export type BankRef = { code: string; name: string; branches: Branch[] };
export const BANKS = banksJson as BankRef[];

export const findBank = (code: string) => BANKS.find((b) => b.code === code);

/// "Commercial Bank PLC (7056)", or just the code when it isn't in the reference list.
export const bankDisplay = (code: string) => {
  const b = findBank(code);
  return b ? `${b.name} (${code})` : code;
};

/// "Colombo 07 (001)", or just the code when the bank/branch isn't in the reference list.
export const branchDisplay = (bank: string, code: string) => {
  const br = findBank(bank)?.branches.find((x) => x.code === code);
  return br ? `${br.name} (${code})` : code;
};

export type BankBranchValue = {
  bankCode: string;
  bankName: string;
  branchCode: string;
  branchName: string;
};
