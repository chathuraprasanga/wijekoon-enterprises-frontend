import {
  Anchor,
  Button,
  Checkbox,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconLock, IconMail } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { Link, type Location, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { useAppDispatch } from '@/store/hooks';
import { loginThunk } from '@/features/auth/authSlice';
import { notifyError } from '@/utils/notify';

interface LoginFormValues {
  identifier: string;
  password: string;
  remember: boolean;
}

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginFormValues>({
    initialValues: { identifier: '', password: '', remember: false },
    validate: {
      identifier: (value) => (value.trim() ? null : 'Email or phone is required'),
      password: (value) => (value ? null : 'Password is required'),
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(
        loginThunk({ identifier: values.identifier, password: values.password }),
      ).unwrap();
      const from = (location.state as { from?: Location })?.from;
      navigate(from ? `${from.pathname}${from.search}` : '/dashboard', { replace: true });
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <AuthLayout>
      <Stack gap={4} mb="xl">
        <Title order={2}>Log in to your account</Title>
        <Text size="sm" c="dimmed">
          Please enter your details
        </Text>
      </Stack>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Email"
            placeholder="Enter your email"
            leftSection={<IconMail size={16} />}
            {...form.getInputProps('identifier')}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            leftSection={<IconLock size={16} />}
            {...form.getInputProps('password')}
          />

          <Group justify="space-between">
            <Checkbox
              label="Remember for 30 days"
              {...form.getInputProps('remember', { type: 'checkbox' })}
            />
            <Anchor component={Link} to="/reset-password/request" size="sm">
              Forgot password
            </Anchor>
          </Group>

          <Button type="submit" loading={form.submitting} fullWidth mt="xs">
            Log in
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
};
