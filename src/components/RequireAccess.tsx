import type { ReactNode } from 'react';
import { useCan, useIsSuperAdmin } from '@/utils/permissions';
import ForbiddenPage from '@/pages/errors/ForbiddenPage';

type Props = {
  /** Permission key such as `customer:read`; omit and pass `superAdmin` for admin-only areas. */
  permission?: string;
  superAdmin?: boolean;
  /** Names the area on the "no access" page. */
  section: string;
  children: ReactNode;
};

// Wraps a route: typing the address of a page you can't use shows the 403 page, not a broken screen.
export const RequireAccess = ({ permission, superAdmin, section, children }: Props) => {
  const can = useCan();
  const isSuper = useIsSuperAdmin();
  const allowed = superAdmin ? isSuper : permission ? can(permission) : true;
  return allowed ? <>{children}</> : <ForbiddenPage section={section} />;
};
