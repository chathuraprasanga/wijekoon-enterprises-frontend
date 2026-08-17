import { Anchor, Button, Group, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconLock, IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export type LoginFormValues = {
  identifier: string;
  password: string;
};

export type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void;
  loading: boolean;
};

export const LoginForm = ({ onSubmit, loading }: LoginFormProps) => {
  const form = useForm<LoginFormValues>({
    initialValues: { identifier: '', password: '' },
    validate: {
      identifier: (value) => (value.trim() ? null : 'Email or phone is required'),
      password: (value) => (value ? null : 'Password is required'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap={4} mb="xl">
        <Title order={2}>Log in to your account</Title>
        <Text size="sm" c="dimmed">
          Please enter your details
        </Text>
      </Stack>
      <Stack gap="md">
        <TextInput
          label="Email or phone"
          placeholder="Enter your email or phone"
          leftSection={<IconMail size={16} />}
          {...form.getInputProps('identifier')}
        />
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          leftSection={<IconLock size={16} />}
          {...form.getInputProps('password')}
        />
        <Group justify="flex-end">
          <Anchor component={Link} to="/forgot-password" size="sm">
            Forgot password?
          </Anchor>
        </Group>
        <Button type="submit" loading={loading} fullWidth mt="xs">
          Log in
        </Button>
      </Stack>
    </form>
  );
};
