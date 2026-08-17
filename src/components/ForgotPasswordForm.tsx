import { Anchor, Button, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconMail } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

export type ForgotPasswordFormValues = {
  identifier: string;
};

export type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordFormValues) => void;
  loading: boolean;
};

export const ForgotPasswordForm = ({ onSubmit, loading }: ForgotPasswordFormProps) => {
  const form = useForm<ForgotPasswordFormValues>({
    initialValues: { identifier: '' },
    validate: {
      identifier: (value) => (value.trim() ? null : 'Email or phone is required'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap={4} mb="xl">
        <Title order={2}>Forgot password</Title>
        <Text size="sm" c="dimmed">
          Enter your email or phone and we&apos;ll send you a code to reset your password
        </Text>
      </Stack>
      <Stack gap="md">
        <TextInput
          label="Email or phone"
          placeholder="Enter your email or phone"
          leftSection={<IconMail size={16} />}
          {...form.getInputProps('identifier')}
        />
        <Button type="submit" loading={loading} fullWidth mt="xs">
          Send code
        </Button>
        <Anchor component={Link} to="/login" size="sm" ta="center">
          Back to log in
        </Anchor>
      </Stack>
    </form>
  );
};
