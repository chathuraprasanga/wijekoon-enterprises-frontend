import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/routes/RootLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ResetPasswordWizardLayout } from '@/pages/auth/ResetPasswordWizardLayout';
import { RequestCodeStep } from '@/pages/auth/RequestCodeStep';
import { OtpStep } from '@/pages/auth/OtpStep';
import { ResetPasswordStep } from '@/pages/auth/ResetPasswordStep';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { SettingsLayout } from '@/pages/settings/SettingsLayout';
import { ProfilePage } from '@/pages/settings/ProfilePage';
import { AppearancePage } from '@/pages/settings/AppearancePage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        path: '/reset-password',
        element: <ResetPasswordWizardLayout />,
        children: [
          { path: 'request', element: <RequestCodeStep /> },
          { path: 'otp', element: <OtpStep /> },
          { path: 'confirm', element: <ResetPasswordStep /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              { path: 'dashboard', element: <DashboardPage /> },
              {
                path: 'settings',
                element: <SettingsLayout />,
                children: [
                  { index: true, element: <Navigate to="profile" replace /> },
                  { path: 'profile', element: <ProfilePage /> },
                  { path: 'appearance', element: <AppearancePage /> },
                ],
              },
              {
                element: <ProtectedRoute roles={['SUPER_ADMIN']} />,
                children: [{ path: 'users', element: <UsersPage /> }],
              },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
