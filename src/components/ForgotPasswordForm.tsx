import { Anchor, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { AuthFormShell } from '@/components/AuthFormShell';
import { AuthSteps } from '@/components/AuthSteps';
import { AuthSubmitButton } from '@/components/AuthSubmitButton';
import { required } from '@/utils/validators';

export type ForgotPasswordFormValues = { identifier: string };

export type ForgotPasswordFormProps = {
  onSubmit: (values: ForgotPasswordFormValues) => void;
  loading: boolean;
};

export const ForgotPasswordForm = ({ onSubmit, loading }: ForgotPasswordFormProps) => {
  const form = useForm<ForgotPasswordFormValues>({
    initialValues: { identifier: '' },
    validate: { identifier: required('Enter your email address or phone number.') },
  });

  return (
    <AuthFormShell
      steps={<AuthSteps current={0} />}
      title="Forgot your password?"
      subtitle="Enter your email or phone and we'll send a 6-digit code."
      onSubmit={form.onSubmit(onSubmit)}
    >
      <TextInput
        size="md"
        styles={{ input: { height: 44 } }}
        label="Email or phone"
        withAsterisk
        autoFocus
        autoComplete="username"
        disabled={loading}
        placeholder="ruwan@wijekoon.lk or 077 123 4567"
        leftSection={<IconUser size={16} aria-hidden />}
        {...form.getInputProps('identifier')}
      />
      <AuthSubmitButton loading={loading} loadingLabel="Sending code…">
        Send code
      </AuthSubmitButton>
      <Group>
        <Anchor component={Link} to="/login" size="sm" fw={500}>
          <Group gap={6} wrap="nowrap">
            <IconArrowLeft size={16} aria-hidden /> Back to sign in
          </Group>
        </Anchor>
      </Group>
    </AuthFormShell>
  );
};
