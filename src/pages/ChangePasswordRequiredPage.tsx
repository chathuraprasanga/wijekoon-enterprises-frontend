import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLock } from '@tabler/icons-react';
import { AuthFormShell } from '@/components/AuthFormShell';
import { AuthSubmitButton } from '@/components/AuthSubmitButton';
import { InlineAlert } from '@/components/InlineAlert';
import { toNotify } from '@/hooks/toNotify';
import { changePassword, logOut } from '@/store/authSlice/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { password, required } from '@/utils/validators';

const touch = { size: 'md', styles: { input: { height: 44 } } } as const;

type Values = { currentPassword: string; newPassword: string; confirmPassword: string };

// A temporary (generated) password must be replaced before the app opens. The server enforces it too:
// every other API call is refused until this is done.
const ChangePasswordRequiredPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: {
      currentPassword: required('Enter the temporary password from your email.'),
      newPassword: (v, values) =>
        password(v) ?? (v === values.currentPassword ? 'Choose a different password.' : null),
      confirmPassword: (v, values) => (v === values.newPassword ? null : 'Passwords do not match.'),
    },
  });

  const handleSubmit = async (values: Values) => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(
        changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      ).unwrap();
      // Changing the password ends every session: sign in again with the new one.
      dispatch(logOut());
      toNotify('Password changed', 'Sign in with your new password.', 'SUCCESS');
      navigate('/login', { replace: true });
    } catch (e) {
      setError(e as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormShell
      title="Choose a new password"
      subtitle="You signed in with a temporary password. Set your own to continue."
      onSubmit={form.onSubmit(handleSubmit)}
    >
      {error && (
        <InlineAlert tone="danger" title="Couldn't change the password">
          {error}
        </InlineAlert>
      )}
      <PasswordInput
        {...touch}
        label="Temporary password"
        placeholder="From the email we sent you"
        withAsterisk
        autoFocus
        autoComplete="current-password"
        disabled={loading}
        leftSection={<IconLock size={16} aria-hidden />}
        {...form.getInputProps('currentPassword')}
      />
      <PasswordInput
        {...touch}
        label="New password"
        placeholder="Enter a new password"
        withAsterisk
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
      <AuthSubmitButton loading={loading} loadingLabel="Saving…">
        Change password
      </AuthSubmitButton>
    </AuthFormShell>
  );
};

export default ChangePasswordRequiredPage;
