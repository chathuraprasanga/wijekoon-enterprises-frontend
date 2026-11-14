import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthSplitLayout } from '@/layouts/AuthSplitLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLoaderChecker, redirectIfAuthenticated } from '@/utils/authChecker';
import LoginPage from '@/pages/LoginPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import VerifyOtpPage from '@/pages/VerifyOtpPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import CustomersPage from '@/pages/customers';
import CustomerDetailPage from '@/pages/customers/CustomerDetailPage';
import SuppliersPage from '@/pages/suppliers';
import ProductsPage from '@/pages/products';
import OrdersPage from '@/pages/orders';
import SalesPage from '@/pages/sales';
import ChequesPage from '@/pages/cheques';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import ProfilePage from '@/pages/settings/ProfilePage';
import UsersPage from '@/pages/settings/UsersPage';
import RolesPage from '@/pages/settings/RolesPage';
import AddEditRolePage from '@/pages/settings/AddEditRolePage';
import { Loader } from '@/components/Loader';
import NotFoundPage from '@/pages/errors/NotFoundPage';
import AppNotFound from '@/pages/errors/AppNotFound';
import ForbiddenPage from '@/pages/errors/ForbiddenPage';
import RouteErrorPage from '@/pages/errors/RouteErrorPage';

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorPage />,
    children: [
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
          { path: 'customers', element: <CustomersPage /> },
          { path: 'customers/:id', element: <CustomerDetailPage /> },
          { path: 'suppliers', element: <SuppliersPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'sales', element: <SalesPage /> },
          { path: 'cheques', element: <ChequesPage /> },
          { path: 'settings/roles/add-edit', element: <AddEditRolePage /> },
          { path: 'settings/roles/add-edit/:id', element: <AddEditRolePage /> },
          { path: 'forbidden', element: <ForbiddenPage /> },
          { path: '*', element: <AppNotFound /> },
          {
            path: 'settings',
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="profile" replace /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'users', element: <UsersPage /> },
              { path: 'roles', element: <RolesPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
