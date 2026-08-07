import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useAppSelector } from '@/store/hooks';
import { AppSkeleton } from '@/components/common/AppSkeleton';
import type { Role } from '@/types/user';

interface ProtectedRouteProps {
  roles?: Role[];
}

export const ProtectedRoute = ({ roles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { bootstrapped, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const hasRequiredRole = !roles || (user != null && roles.includes(user.role));

  useEffect(() => {
    if (bootstrapped && isAuthenticated && !hasRequiredRole) {
      notifications.show({
        color: 'yellow',
        title: 'Access denied',
        message: "You don't have access to that page.",
      });
    }
  }, [bootstrapped, isAuthenticated, hasRequiredRole]);

  if (!bootstrapped) {
    return <AppSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
