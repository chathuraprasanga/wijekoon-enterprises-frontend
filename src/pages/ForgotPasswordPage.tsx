import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForgotPasswordForm, type ForgotPasswordFormValues } from '@/components/ForgotPasswordForm';
import { useAppDispatch } from '@/store/hooks';
import { forgotPassword } from '@/store/authSlice/authSlice';
import { toNotify } from '@/hooks/toNotify';

const ForgotPasswordPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      const result = await dispatch(forgotPassword(values)).unwrap();
      toNotify('Code sent', result.message, 'SUCCESS');
      navigate('/verify-otp', { state: { identifier: values.identifier } });
    } catch (error) {
      toNotify('Request failed', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} />;
};

export default ForgotPasswordPage;
