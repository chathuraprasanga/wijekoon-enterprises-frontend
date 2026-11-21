import { Anchor, Checkbox, Group, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLock, IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { AuthFormShell } from '@/components/AuthFormShell';
import { AuthSubmitButton } from '@/components/AuthSubmitButton';
import { InlineAlert } from '@/components/InlineAlert';
import { required } from '@/utils/validators';

export type LoginFormValues = { identifier: string; password: string; rememberMe: boolean };

export type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void;
  loading: boolean;
  /** Form-level failure from the server (e.g. wrong credentials). */
  error?: string | null;
};

const touch = { size: 'md', styles: { input: { height: 44 } } } as const;

export const LoginForm = ({ onSubmit, loading, error }: LoginFormProps) => {
  const form = useForm<LoginFormValues>({
    initialValues: { identifier: '', password: '', rememberMe: false },
    validate: {
      identifier: required('Enter your email address or phone number.'),
      password: required('Enter your password.'),
    },
  });

  return (
    <AuthFormShell
      title="Sign in"
      subtitle="Use your Wijekoon Enterprises account."
      onSubmit={form.onSubmit(onSubmit)}
    >
      {error && (
        <InlineAlert tone="danger" title="Sign-in failed">
          {error}
        </InlineAlert>
      )}
      <TextInput
        {...touch}
        label="Email or phone"
        withAsterisk
        autoFocus
        autoComplete="username"
        disabled={loading}
        placeholder="Enter your email or phone number"
        leftSection={<IconUser size={16} aria-hidden />}
        {...form.getInputProps('identifier')}
      />
      <PasswordInput
        {...touch}
        label="Password"
        placeholder="Enter your password"
        withAsterisk
        autoComplete="current-password"
        disabled={loading}
        leftSection={<IconLock size={16} aria-hidden />}
        {...form.getInputProps('password')}
      />
      <Group justify="space-between">
        <Checkbox
          label="Remember me for 30 days"
          disabled={loading}
          {...form.getInputProps('rememberMe', { type: 'checkbox' })}
        />
        <Anchor component={Link} to="/forgot-password" size="sm" fw={500}>
          Forgot password?
        </Anchor>
      </Group>
      <AuthSubmitButton loading={loading} loadingLabel="Signing in…">
        Sign in
      </AuthSubmitButton>
    </AuthFormShell>
  );
};
