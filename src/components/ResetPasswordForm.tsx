import { Button, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLock } from '@tabler/icons-react';

export type ResetPasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

export type ResetPasswordFormProps = {
  onSubmit: (values: ResetPasswordFormValues) => void;
  loading: boolean;
};

export const ResetPasswordForm = ({ onSubmit, loading }: ResetPasswordFormProps) => {
  const form = useForm<ResetPasswordFormValues>({
    initialValues: { newPassword: '', confirmPassword: '' },
    validate: {
      newPassword: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters'),
      confirmPassword: (value, values) =>
        value === values.newPassword ? null : 'Passwords do not match',
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap={4} mb="xl">
        <Title order={2}>Reset password</Title>
        <Text size="sm" c="dimmed">
          Choose a new password for your account
        </Text>
      </Stack>
      <Stack gap="md">
        <PasswordInput
          label="New password"
          placeholder="Enter your new password"
          leftSection={<IconLock size={16} />}
          {...form.getInputProps('newPassword')}
        />
        <PasswordInput
          label="Confirm password"
          placeholder="Re-enter your new password"
          leftSection={<IconLock size={16} />}
          {...form.getInputProps('confirmPassword')}
        />
        <Button type="submit" loading={loading} fullWidth mt="xs">
          Reset password
        </Button>
      </Stack>
    </form>
  );
};
