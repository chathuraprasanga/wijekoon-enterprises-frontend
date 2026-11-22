import { useAppSelector } from '@/store/hooks';
import type { AuthUser } from '@/store/authSlice/authSlice';

/// Same rule as the backend and the tablet app: a super admin passes every check; anyone else needs a
/// role that grants the key, e.g. `customer:create`.
export const hasPermission = (user: AuthUser | null, key: string) =>
  !!user &&
  (user.isSuperAdmin ||
    (user.roles ?? []).some((r) =>
      (r.permissions ?? []).some((p) => (p.key ?? `${p.module}:${p.action}`) === key),
    ));

/// `const can = useCan(); can('customer:update')`
export const useCan = () => {
  const user = useAppSelector((s) => s.auth.user);
  return (key: string) => hasPermission(user, key);
};
