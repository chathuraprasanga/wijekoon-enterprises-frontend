import { Anchor, Button, Group, Input, PinInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { AuthFormShell } from '@/components/AuthFormShell';
import { AuthSteps } from '@/components/AuthSteps';
import { AuthSubmitButton } from '@/components/AuthSubmitButton';
import { formatCountdown, maskIdentifier } from '@/utils/format';

export type OtpFormValues = { code: string };

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
  // PinInput isn't uncontrolled-compatible with @mantine/form, so this form is controlled.
  const form = useForm<OtpFormValues>({
    mode: 'controlled',
    initialValues: { code: '' },
    validate: { code: (v) => (v.length === 6 ? null : 'Enter all 6 digits to continue.') },
  });
  const complete = form.values.code.length === 6;

  return (
    <AuthFormShell
      steps={<AuthSteps current={1} />}
      title="Enter the 6-digit code"
      subtitle={`We sent a code to ${maskIdentifier(identifier)}. It may take a minute to arrive.`}
      onSubmit={form.onSubmit(onSubmit)}
    >
      <Input.Wrapper
        label="Verification code"
        error={form.errors.code}
        description={form.errors.code ? undefined : 'Enter all 6 digits to continue.'}
        inputWrapperOrder={['label', 'input', 'description', 'error']}
      >
        <PinInput
          mt={4}
          autoFocus
          placeholder=""
          oneTimeCode
          size="lg"
          gap="xs"
          length={6}
          type="number"
          inputMode="numeric"
          disabled={loading}
          aria-label="6-digit verification code"
          error={!!form.errors.code}
          {...form.getInputProps('code')}
        />
      </Input.Wrapper>
      <AuthSubmitButton
        loading={loading}
        disabled={!complete && !loading}
        loadingLabel="Verifying…"
      >
        Verify code
      </AuthSubmitButton>
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Text size="sm" c="dimmed" aria-live="polite" className="num">
          {resendCooldown > 0
            ? `Resend code in ${formatCountdown(resendCooldown)}`
            : 'Didn’t get it?'}
        </Text>
        <Button
          variant="default"
          size="xs"
          disabled={resending || resendCooldown > 0}
          loading={resending}
          onClick={onResend}
        >
          Resend code
        </Button>
      </Group>
      <Group>
        <Anchor component={Link} to="/forgot-password" size="sm" fw={500}>
          <Group gap={6} wrap="nowrap">
            <IconArrowLeft size={16} aria-hidden /> Back
          </Group>
        </Anchor>
      </Group>
    </AuthFormShell>
  );
};
