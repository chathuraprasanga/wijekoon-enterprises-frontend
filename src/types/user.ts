export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'OWNER' | 'SALES_MANAGER';

export interface SafeUser {
  id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
}
