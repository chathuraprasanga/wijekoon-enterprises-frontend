import type { Role } from '@/types/user';

export const ASSIGNABLE_ROLES: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OWNER', label: 'Owner' },
  { value: 'SALES_MANAGER', label: 'Sales Manager' },
];
