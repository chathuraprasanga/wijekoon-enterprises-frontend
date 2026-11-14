import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ResetPasswordForm, type ResetPasswordFormValues } from '@/components/ResetPasswordForm';
import { useAppDispatch } from '@/store/hooks';
import { resetPassword } from '@/store/authSlice/authSlice';
import { PasswordUpdated } from '@/components/PasswordUpdated';
import { toNotify } from '@/hooks/toNotify';

const ResetPasswordPage = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [state] = useState<{ identifier?: string; resetToken?: string } | null>(
    location.state as { identifier?: string; resetToken?: string } | null,
  );

  if (!state?.identifier || !state?.resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    setLoading(true);
    try {
      await dispatch(
        resetPassword({
          identifier: state.identifier!,
          resetToken: state.resetToken!,
          newPassword: values.newPassword,
        }),
      ).unwrap();
      setDone(true);
    } catch (error) {
      toNotify('Reset failed', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  if (done) return <PasswordUpdated />;

  return <ResetPasswordForm onSubmit={handleSubmit} loading={loading} />;
};

export default ResetPasswordPage;
