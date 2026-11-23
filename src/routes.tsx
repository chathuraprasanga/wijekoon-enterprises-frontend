import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthSplitLayout } from '@/layouts/AuthSplitLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLoaderChecker, redirectIfAuthenticated, requireSession } from '@/utils/authChecker';
import { SystemGate } from '@/components/SystemGate';
import CreateSuperAdminPage from '@/pages/CreateSuperAdminPage';
import ChangePasswordRequiredPage from '@/pages/ChangePasswordRequiredPage';
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
import SaleDetailPage from '@/pages/sales/SaleDetailPage';
import AddEditSalePage from '@/pages/sales/AddEditSalePage';
import ChequesPage from '@/pages/cheques';
import AddEditOrderPage from '@/pages/orders/AddEditOrderPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';
import { SettingsLayout } from '@/layouts/SettingsLayout';
import ProfilePage from '@/pages/settings/ProfilePage';
import UsersPage from '@/pages/settings/UsersPage';
import RolesPage from '@/pages/settings/RolesPage';
import AuditLogsPage from '@/pages/settings/AuditLogsPage';
import NotificationsAdminPage from '@/pages/settings/NotificationsAdminPage';
import BanksPage from '@/pages/settings/BanksPage';
import BusinessRulesPage from '@/pages/settings/BusinessRulesPage';
import BankDetailPage from '@/pages/settings/BankDetailPage';
import AddEditRolePage from '@/pages/settings/AddEditRolePage';
import { Loader } from '@/components/Loader';
import { RequireAccess } from '@/components/RequireAccess';
import NotFoundPage from '@/pages/errors/NotFoundPage';
import AppNotFound from '@/pages/errors/AppNotFound';
import ForbiddenPage from '@/pages/errors/ForbiddenPage';
import RouteErrorPage from '@/pages/errors/RouteErrorPage';

export const router = createBrowserRouter([
  {
    element: <SystemGate />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        // Public first-time setup; the server only honours it while no Super Admin exists.
        element: <AuthSplitLayout />,
        hydrateFallbackElement: <Loader />,
        children: [{ path: '/create-super-admin', element: <CreateSuperAdminPage /> }],
      },
      {
        element: <AuthSplitLayout />,
        loader: requireSession,
        hydrateFallbackElement: <Loader />,
        children: [{ path: '/change-password-required', element: <ChangePasswordRequiredPage /> }],
      },
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
          {
            path: 'customers',
            element: (
              <RequireAccess permission="customer:read" section="Customers">
                <CustomersPage />
              </RequireAccess>
            ),
          },
          {
            path: 'customers/:id',
            element: (
              <RequireAccess permission="customer:read" section="Customers">
                <CustomerDetailPage />
              </RequireAccess>
            ),
          },
          {
            path: 'suppliers',
            element: (
              <RequireAccess permission="supplier:read" section="Suppliers">
                <SuppliersPage />
              </RequireAccess>
            ),
          },
          {
            path: 'products',
            element: (
              <RequireAccess permission="product:read" section="Products">
                <ProductsPage />
              </RequireAccess>
            ),
          },
          {
            path: 'orders',
            element: (
              <RequireAccess permission="order:read" section="Orders">
                <OrdersPage />
              </RequireAccess>
            ),
          },
          {
            path: 'orders/new',
            element: (
              <RequireAccess permission="order:create" section="Orders">
                <AddEditOrderPage />
              </RequireAccess>
            ),
          },
          {
            path: 'orders/:id',
            element: (
              <RequireAccess permission="order:read" section="Orders">
                <OrderDetailPage />
              </RequireAccess>
            ),
          },
          {
            path: 'orders/:id/edit',
            element: (
              <RequireAccess permission="order:update" section="Orders">
                <AddEditOrderPage key="edit" />
              </RequireAccess>
            ),
          },
          {
            path: 'sales',
            element: (
              <RequireAccess permission="sale:read" section="Sales">
                <SalesPage />
              </RequireAccess>
            ),
          },
          {
            path: 'sales/new',
            element: (
              <RequireAccess permission="sale:create" section="Sales">
                <AddEditSalePage />
              </RequireAccess>
            ),
          },
          {
            path: 'sales/:id',
            element: (
              <RequireAccess permission="sale:read" section="Sales">
                <SaleDetailPage />
              </RequireAccess>
            ),
          },
          {
            path: 'sales/:id/edit',
            element: (
              <RequireAccess permission="sale:update" section="Sales">
                <AddEditSalePage key="edit" />
              </RequireAccess>
            ),
          },
          {
            path: 'cheques',
            element: (
              <RequireAccess permission="received-cheque:read|issued-cheque:read" section="Cheques">
                <ChequesPage />
              </RequireAccess>
            ),
          },
          {
            path: 'settings/roles/add-edit',
            element: (
              <RequireAccess permission="role:create" section="Roles">
                <AddEditRolePage />
              </RequireAccess>
            ),
          },
          {
            path: 'settings/roles/add-edit/:id',
            element: (
              <RequireAccess permission="role:update" section="Roles">
                <AddEditRolePage />
              </RequireAccess>
            ),
          },
          {
            path: 'settings/banks/:id',
            element: (
              <RequireAccess permission="bank:read" section="Banks">
                <BankDetailPage />
              </RequireAccess>
            ),
          },
          { path: 'forbidden', element: <ForbiddenPage /> },
          { path: '*', element: <AppNotFound /> },
          {
            path: 'settings',
            element: <SettingsLayout />,
            children: [
              { index: true, element: <Navigate to="profile" replace /> },
              { path: 'profile', element: <ProfilePage /> },
              {
                path: 'users',
                element: (
                  <RequireAccess permission="user:read" section="Users">
                    <UsersPage />
                  </RequireAccess>
                ),
              },
              {
                path: 'roles',
                element: (
                  <RequireAccess permission="role:read" section="Roles">
                    <RolesPage />
                  </RequireAccess>
                ),
              },
              {
                path: 'banks',
                element: (
                  <RequireAccess permission="bank:read" section="Banks">
                    <BanksPage />
                  </RequireAccess>
                ),
              },
              {
                path: 'rules',
                element: (
                  <RequireAccess permission="business-rule:read" section="Business rules">
                    <BusinessRulesPage />
                  </RequireAccess>
                ),
              },
              {
                path: 'audit-logs',
                element: (
                  <RequireAccess permission="audit-log:read" section="Audit logs">
                    <AuditLogsPage />
                  </RequireAccess>
                ),
              },
              {
                path: 'notifications',
                element: (
                  <RequireAccess superAdminOnly section="Notifications">
                    <NotificationsAdminPage />
                  </RequireAccess>
                ),
              },
            ],
          },
        ],
      },
      // AuthLoaderChecker on /app sends logged-out users on to /login.
      { path: '/', element: <Navigate to="/app/dashboard" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
