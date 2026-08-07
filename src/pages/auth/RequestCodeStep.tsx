import { Anchor, Button, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconArrowLeft, IconMail } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { forgotPassword } from '@/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/notify';
import { msFromNow } from '@/utils/time';
import type { ResetPasswordWizardContext } from '@/pages/auth/ResetPasswordWizardLayout';

const RESEND_COOLDOWN_SECONDS = 60;

interface RequestCodeFormValues {
  identifier: string;
}

export const RequestCodeStep = () => {
  const navigate = useNavigate();
  const { setIdentifier, setCooldownEndsAt } = useOutletContext<ResetPasswordWizardContext>();

  const form = useForm<RequestCodeFormValues>({
    initialValues: { identifier: '' },
    validate: {
      identifier: (value) => (value.trim() ? null : 'Email or phone is required'),
    },
  });

  const handleSubmit = async (values: RequestCodeFormValues) => {
    try {
      await forgotPassword(values.identifier);
      setIdentifier(values.identifier);
      setCooldownEndsAt(msFromNow(RESEND_COOLDOWN_SECONDS));
      notifySuccess('If an account exists, a reset code has been sent.');
      navigate('/reset-password/otp');
    } catch (error) {
      notifyError(error);
    }
  };

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>Forgot password</Title>
        <Text size="sm" c="dimmed">
          Enter your email or phone and we&apos;ll send you a reset code.
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
          <Button type="submit" loading={form.submitting} fullWidth mt="xs">
            Send code
          </Button>
        </Stack>
      </form>

      <Group justify="center" gap={4}>
        <Anchor
          component={Link}
          to="/login"
          size="sm"
          display="flex"
          style={{ alignItems: 'center', gap: 4 }}
        >
          <IconArrowLeft size={14} />
          Back to sign in
        </Anchor>
      </Group>
    </Stack>
  );
};
