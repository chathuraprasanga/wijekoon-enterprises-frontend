import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ResetPasswordForm, type ResetPasswordFormValues } from '@/components/ResetPasswordForm';
import { useAppDispatch } from '@/store/hooks';
import { resetPassword } from '@/store/authSlice/authSlice';
import { toNotify } from '@/hooks/toNotify';

const ResetPasswordPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [state] = useState<{ identifier?: string; resetToken?: string } | null>(
    location.state as { identifier?: string; resetToken?: string } | null,
  );

  if (!state?.identifier || !state?.resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    setLoading(true);
    try {
      const result = await dispatch(
        resetPassword({
          identifier: state.identifier!,
          resetToken: state.resetToken!,
          newPassword: values.newPassword,
        }),
      ).unwrap();
      toNotify('Password reset', result.message, 'SUCCESS');
      navigate('/login', { replace: true });
    } catch (error) {
      toNotify('Reset failed', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return <ResetPasswordForm onSubmit={handleSubmit} loading={loading} />;
};

export default ResetPasswordPage;
