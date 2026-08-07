import { useState } from 'react';
import {
  Anchor,
  Badge,
  Button,
  Group,
  Paper,
  PasswordInput,
  PinInput,
  Stack,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import * as authApi from '@/features/auth/authApi';
import { setUser } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { notifyError, notifySuccess } from '@/utils/notify';
import type { SafeUser } from '@/types/user';

const formatRole = (role: string) =>
  role
    .split('_')
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(' ');

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <Group justify="space-between" py="xs">
    <Text size="sm" c="dimmed">
      {label}
    </Text>
    <Text size="sm" fw={500}>
      {value}
    </Text>
  </Group>
);

interface VerifyRowProps {
  label: string;
  value: string;
  verified: boolean;
  onResend: () => Promise<{ message: string }>;
  onVerify: (code: string) => Promise<SafeUser>;
}

const VerifyRow = ({ label, value, verified, onResend, onVerify }: VerifyRowProps) => {
  const dispatch = useAppDispatch();
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await onResend();
      setCodeSent(true);
      notifySuccess(`Verification code sent to your ${label.toLowerCase()}.`);
    } catch (error) {
      notifyError(error);
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    setVerifying(true);
    try {
      const updatedUser = await onVerify(code.trim());
      dispatch(setUser(updatedUser));
      notifySuccess(`${label} verified successfully.`);
      setCodeSent(false);
      setCode('');
    } catch (error) {
      notifyError(error);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Stack gap={4} py="xs">
      <Group justify="space-between">
        <div>
          <Text size="sm" c="dimmed">
            {label}
          </Text>
          <Text size="sm" fw={500}>
            {value}
          </Text>
        </div>
        <Group gap="xs">
          <Badge color={verified ? 'brandGreen' : 'red'} size="sm">
            {verified ? 'Verified' : 'Unverified'}
          </Badge>
          {!verified && !codeSent && (
            <Button size="xs" variant="light" onClick={handleResend} loading={sending}>
              Verify
            </Button>
          )}
        </Group>
      </Group>

      {!verified && codeSent && (
        <Stack gap="xs" mt={4}>
          <PinInput length={6} value={code} onChange={setCode} />
          <Group gap="xs" mt={12}>
            <Button size="xs" onClick={handleVerify} loading={verifying}>
              Confirm
            </Button>
            <Anchor
              component="button"
              type="button"
              size="xs"
              onClick={handleResend}
              disabled={sending}
            >
              Resend
            </Anchor>
          </Group>
        </Stack>
      )}
    </Stack>
  );
};

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordCard = () => {
  const form = useForm<ChangePasswordFormValues>({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: {
      currentPassword: (value) => (value ? null : 'Current password is required'),
      newPassword: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters'),
      confirmPassword: (value, values) =>
        value === values.newPassword ? null : 'Passwords do not match',
    },
  });

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      notifySuccess('Password changed successfully.');
      form.reset();
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <Paper p="lg" withBorder>
      <Text fw={600} mb="md">
        Change password
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <PasswordInput
            label="Current password"
            placeholder="Enter current password"
            {...form.getInputProps('currentPassword')}
          />
          <PasswordInput
            label="New password"
            placeholder="Enter new password"
            {...form.getInputProps('newPassword')}
          />
          <PasswordInput
            label="Confirm new password"
            placeholder="Confirm new password"
            {...form.getInputProps('confirmPassword')}
          />
          <Group justify="flex-end">
            <Button type="submit" loading={form.submitting}>
              Update password
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export const ProfilePage = () => {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return (
    <Stack gap="lg">
      <Paper p="lg" withBorder>
        <Text fw={600} mb="md">
          Profile details
        </Text>
        <Stack gap={0}>
          <InfoRow label="Name" value={[user.firstName, user.lastName].filter(Boolean).join(' ')} />
          <InfoRow label="Role" value={formatRole(user.role)} />
        </Stack>
      </Paper>

      <Paper p="lg" withBorder>
        <Text fw={600} mb="md">
          Verification
        </Text>
        <Stack gap={0} className="divide-y divide-[var(--mantine-color-default-border)]">
          <VerifyRow
            label="Email"
            value={user.email}
            verified={user.isEmailVerified}
            onResend={authApi.resendEmailCode}
            onVerify={authApi.verifyEmail}
          />
          <VerifyRow
            label="Mobile"
            value={user.phone}
            verified={user.isMobileVerified}
            onResend={authApi.resendMobileCode}
            onVerify={authApi.verifyMobile}
          />
        </Stack>
      </Paper>

      <ChangePasswordCard />
    </Stack>
  );
};
