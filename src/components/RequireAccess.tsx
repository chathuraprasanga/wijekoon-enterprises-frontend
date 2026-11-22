import type { ReactNode } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useCan } from '@/utils/permissions';
import ForbiddenPage from '@/pages/errors/ForbiddenPage';

type Props = {
  /** Permission key such as `customer:read`; omit for a page any signed-in user may open. */
  permission?: string;
  /** Names the area on the "no access" page. */
  section: string;
  /** Only the super admin may open it (the server enforces this too). */
  superAdminOnly?: boolean;
  children: ReactNode;
};

// Wraps a route: typing the address of a page you can't use shows the 403 page, not a broken screen.
export const RequireAccess = ({ permission, section, superAdminOnly, children }: Props) => {
  const can = useCan();
  const isSuperAdmin = useAppSelector((s) => !!s.auth.user?.isSuperAdmin);
  const allowed = (permission ? can(permission) : true) && (!superAdminOnly || isSuperAdmin);
  return allowed ? <>{children}</> : <ForbiddenPage section={section} />;
};
