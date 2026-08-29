import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { OtpForm, type OtpFormValues } from '@/components/OtpForm';
import { useAppDispatch } from '@/store/hooks';
import { resendOtp, verifyOtp } from '@/store/authSlice/authSlice';
import { toNotify } from '@/hooks/toNotify';

const RESEND_COOLDOWN_SECONDS = 60;

const VerifyOtpPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [identifier] = useState<string | undefined>(
    (location.state as { identifier?: string } | null)?.identifier,
  );

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  const handleResend = async () => {
    setResending(true);
    try {
      await dispatch(resendOtp({ identifier })).unwrap();
      toNotify('Code sent', 'A new code has been sent.', 'SUCCESS');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      toNotify('Resend failed', error as string, 'ERROR');
    } finally {
      setResending(false);
    }
  };

  return (
    <OtpForm
      identifier={identifier}
      onSubmit={handleSubmit}
      loading={loading}
      onResend={handleResend}
      resending={resending}
      resendCooldown={resendCooldown}
    />
  );
};

export default VerifyOtpPage;
