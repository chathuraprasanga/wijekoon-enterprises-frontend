import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { OtpForm, type OtpFormValues } from '@/components/OtpForm';
import { useAppDispatch } from '@/store/hooks';
import { verifyOtp } from '@/store/authSlice/authSlice';
import { toNotify } from '@/hooks/toNotify';

const VerifyOtpPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [identifier] = useState<string | undefined>(
    (location.state as { identifier?: string } | null)?.identifier,
  );

  if (!identifier) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (values: OtpFormValues) => {
    setLoading(true);
    try {
      const result = await dispatch(verifyOtp({ identifier, code: values.code })).unwrap();
      navigate('/reset-password', { state: { identifier, resetToken: result.resetToken } });
    } catch (error) {
      toNotify('Verification failed', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return <OtpForm identifier={identifier} onSubmit={handleSubmit} loading={loading} />;
};

export default VerifyOtpPage;
