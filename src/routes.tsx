import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthSplitLayout } from '@/layouts/AuthSplitLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLoaderChecker, redirectIfAuthenticated } from '@/utils/authChecker';
import LoginPage from '@/pages/LoginPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import VerifyOtpPage from '@/pages/VerifyOtpPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/users';
import { Loader } from '@/components/Loader';

export const router = createBrowserRouter([
  {
    element: <AuthSplitLayout />,
    loader: redirectIfAuthenticated,
    hydrateFallbackElement: <Loader />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/verify-otp', element: <VerifyOtpPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  {
    path: '/app',
    element: <AppLayout />,
    loader: AuthLoaderChecker,
    hydrateFallbackElement: <Loader />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);
