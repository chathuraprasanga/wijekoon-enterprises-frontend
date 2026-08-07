import { Anchor, Button, Group, PasswordInput, Stack, Title } from '@mantine/core';
import { IconArrowLeft, IconLock } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { Link, Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import { resetPassword } from '@/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/notify';
import type { ResetPasswordWizardContext } from '@/pages/auth/ResetPasswordWizardLayout';

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordStep = () => {
  const navigate = useNavigate();
  const { identifier, resetToken } = useOutletContext<ResetPasswordWizardContext>();

  const form = useForm<ResetPasswordFormValues>({
    initialValues: { newPassword: '', confirmPassword: '' },
    validate: {
      newPassword: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters'),
      confirmPassword: (value, values) =>
        value === values.newPassword ? null : 'Passwords do not match',
    },
  });

  if (!identifier || !resetToken) {
    return <Navigate to="/reset-password/request" replace />;
  }

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await resetPassword({ identifier, resetToken, newPassword: values.newPassword });
      notifySuccess('Password reset successfully. Please sign in.');
      navigate('/login');
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <Stack gap="xl">
      <Title order={2}>Set a new password</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <PasswordInput
            label="New password"
            placeholder="Enter new password"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('newPassword')}
          />
          <PasswordInput
            label="Confirm password"
            placeholder="Confirm new password"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('confirmPassword')}
          />
          <Button type="submit" loading={form.submitting} fullWidth mt="xs">
            Reset password
          </Button>
        </Stack>
      </form>

      <Group justify="center" gap={4}>
        <Anchor
          component={Link}
          to="/reset-password/otp"
          size="sm"
          display="flex"
          style={{ alignItems: 'center', gap: 4 }}
        >
          <IconArrowLeft size={14} />
          Back to code entry
        </Anchor>
      </Group>
    </Stack>
  );
};
