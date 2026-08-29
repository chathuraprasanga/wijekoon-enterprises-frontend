import { Anchor, Button, Center, Group, PinInput, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';

export type OtpFormValues = {
  code: string;
};

export type OtpFormProps = {
  identifier: string;
  onSubmit: (values: OtpFormValues) => void;
  loading: boolean;
  onResend: () => void;
  resending: boolean;
  resendCooldown: number;
};

export const OtpForm = ({
  identifier,
  onSubmit,
  loading,
  onResend,
  resending,
  resendCooldown,
}: OtpFormProps) => {
  const form = useForm<OtpFormValues>({
    mode: 'controlled',
    initialValues: { code: '' },
    validate: {
      code: (value) => (value.length === 6 ? null : 'Enter the 6-digit code'),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap={4} mb="xl">
        <Title order={2}>Verify code</Title>
        <Text size="sm" c="dimmed">
          Enter the 6-digit code sent to {identifier}
        </Text>
      </Stack>
      <Stack gap="md">
        <Center>
          <PinInput size="lg" gap="md" length={6} {...form.getInputProps('code')} />
        </Center>
        {form.errors.code && (
          <Text size="sm" c="red" ta="center">
            {form.errors.code}
          </Text>
        )}
        <Button type="submit" loading={loading} fullWidth mt="xs">
          Verify
        </Button>
        <Group justify="center" gap={4}>
          <Anchor
            component="button"
            type="button"
            size="sm"
            disabled={resending || resendCooldown > 0}
            onClick={onResend}
          >
            {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
          </Anchor>
        </Group>
        <Anchor component={Link} to="/login" size="sm" ta="center">
          Back to sign in
        </Anchor>
      </Stack>
    </form>
  );
};
