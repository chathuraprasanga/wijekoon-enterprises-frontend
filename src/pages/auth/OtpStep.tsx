import { useEffect, useState } from 'react';
import { Anchor, Button, Group, PinInput, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { Link, Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import { forgotPassword, verifyOtp } from '@/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/notify';
import { msFromNow, secondsUntil } from '@/utils/time';
import type { ResetPasswordWizardContext } from '@/pages/auth/ResetPasswordWizardLayout';

const RESEND_COOLDOWN_SECONDS = 60;

interface OtpFormValues {
  code: string;
}

export const OtpStep = () => {
  const navigate = useNavigate();
  const { identifier, setResetToken, cooldownEndsAt, setCooldownEndsAt } =
    useOutletContext<ResetPasswordWizardContext>();
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    let ignore = false;
    const tick = () => {
      if (ignore) return;
      setRemainingSeconds(cooldownEndsAt ? secondsUntil(cooldownEndsAt) : 0);
    };
    const interval = setInterval(tick, 1000);
    Promise.resolve().then(tick);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [cooldownEndsAt]);

  const form = useForm<OtpFormValues>({
    initialValues: { code: '' },
    validate: {
      code: (value) => (/^\d{6}$/.test(value) ? null : 'Enter the 6-digit code'),
    },
  });

  if (!identifier) {
    return <Navigate to="/reset-password/request" replace />;
  }

  const handleSubmit = async (values: OtpFormValues) => {
    try {
      const { resetToken } = await verifyOtp({ identifier, code: values.code });
      setResetToken(resetToken);
      navigate('/reset-password/confirm');
    } catch (error) {
      notifyError(error);
    }
  };

  const handleResend = async () => {
    try {
      await forgotPassword(identifier);
      setCooldownEndsAt(msFromNow(RESEND_COOLDOWN_SECONDS));
      notifySuccess('A new code has been sent.');
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>Enter verification code</Title>
        <Text size="sm" c="dimmed">
          We sent a code to {identifier}.
        </Text>
      </Stack>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md" align="center">
          <PinInput length={6} {...form.getInputProps('code')} />
          {form.errors.code && (
            <Text size="sm" c="red">
              {form.errors.code}
            </Text>
          )}
          <Button type="submit" loading={form.submitting} fullWidth mt="xs">
            Continue
          </Button>
        </Stack>
      </form>

      <Text size="sm" ta="center">
        Didn&apos;t get a code?{' '}
        <Anchor
          component="button"
          type="button"
          onClick={handleResend}
          disabled={remainingSeconds > 0}
        >
          {remainingSeconds > 0 ? `Resend in ${remainingSeconds}s` : 'Resend code'}
        </Anchor>
      </Text>

      <Group justify="center" gap={4}>
        <Anchor
          component={Link}
          to="/login"
          size="sm"
          display="flex"
          style={{ alignItems: 'center', gap: 4 }}
        >
          <IconArrowLeft size={14} />
          Back to sign in
        </Anchor>
      </Group>
    </Stack>
  );
};
