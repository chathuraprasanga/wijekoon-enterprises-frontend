import { PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLock } from '@tabler/icons-react';
import { AuthFormShell } from '@/components/AuthFormShell';
import { AuthSteps } from '@/components/AuthSteps';
import { AuthSubmitButton } from '@/components/AuthSubmitButton';
import { password } from '@/utils/validators';

export type ResetPasswordFormValues = { newPassword: string; confirmPassword: string };

export type ResetPasswordFormProps = {
  onSubmit: (values: ResetPasswordFormValues) => void;
  loading: boolean;
};

const touch = { size: 'md', styles: { input: { height: 44 } } } as const;

export const ResetPasswordForm = ({ onSubmit, loading }: ResetPasswordFormProps) => {
  const form = useForm<ResetPasswordFormValues>({
    initialValues: { newPassword: '', confirmPassword: '' },
    validate: {
      newPassword: password,
      confirmPassword: (v, values) => (v === values.newPassword ? null : 'Passwords do not match.'),
    },
  });

  return (
    <AuthFormShell
      steps={<AuthSteps current={2} />}
      title="Set a new password"
      subtitle="Choose a password you don't use anywhere else."
      onSubmit={form.onSubmit(onSubmit)}
    >
      <PasswordInput
        {...touch}
        label="New password"
        placeholder="Enter a new password"
        withAsterisk
        autoFocus
        autoComplete="new-password"
        disabled={loading}
        description="At least 8 characters."
        leftSection={<IconLock size={16} aria-hidden />}
        {...form.getInputProps('newPassword')}
      />
      <PasswordInput
        {...touch}
        label="Confirm new password"
        placeholder="Re-enter the new password"
        withAsterisk
        autoComplete="new-password"
        disabled={loading}
        leftSection={<IconLock size={16} aria-hidden />}
        {...form.getInputProps('confirmPassword')}
      />
      <AuthSubmitButton loading={loading} loadingLabel="Resetting…">
        Reset password
      </AuthSubmitButton>
    </AuthFormShell>
  );
};
