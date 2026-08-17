import { Button, Center, PinInput, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';

export type OtpFormValues = {
  code: string;
};

export type OtpFormProps = {
  identifier: string;
  onSubmit: (values: OtpFormValues) => void;
  loading: boolean;
};

export const OtpForm = ({ identifier, onSubmit, loading }: OtpFormProps) => {
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
          <PinInput length={6} {...form.getInputProps('code')} />
        </Center>
        {form.errors.code && (
          <Text size="sm" c="red" ta="center">
            {form.errors.code}
          </Text>
        )}
        <Button type="submit" loading={loading} fullWidth mt="xs">
          Verify
        </Button>
      </Stack>
    </form>
  );
};
