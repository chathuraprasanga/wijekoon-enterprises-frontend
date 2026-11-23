import { useAppSelector } from '@/store/hooks';
import type { AuthUser } from '@/store/authSlice/authSlice';

/// Same rule as the backend and the tablet app: a super admin passes every check; anyone else needs a
/// role that grants the key, e.g. `customer:create`.
/// `a|b` means either key is enough.
export const hasPermission = (user: AuthUser | null, key: string) => {
  const keys = key.split('|');
  return (
    !!user &&
    (user.isSuperAdmin ||
      (user.roles ?? []).some((r) =>
        (r.permissions ?? []).some((p) => keys.includes(p.key ?? `${p.module}:${p.action}`)),
      ))
  );
};

/// `const can = useCan(); can('customer:update')`
export const useCan = () => {
  const user = useAppSelector((s) => s.auth.user);
  return (key: string) => hasPermission(user, key);
};
