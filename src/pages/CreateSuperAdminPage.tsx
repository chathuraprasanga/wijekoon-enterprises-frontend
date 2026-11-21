import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Box, Button, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconKey, IconMail, IconPhone, IconShieldCheck, IconUser } from '@tabler/icons-react';
import { AuthFormShell } from '@/components/AuthFormShell';
import { AuthSubmitButton } from '@/components/AuthSubmitButton';
import { InlineAlert } from '@/components/InlineAlert';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import { toNotify } from '@/hooks/toNotify';
import { submitSetup } from '@/utils/systemApi';
import { digitsOnly, email, phone, required } from '@/utils/validators';

const touch = { size: 'md', styles: { input: { height: 44 } } } as const;

type Values = { fullName: string; email: string; phone: string; setupToken: string };

// First-time setup: creates the one and only Super Admin. The server is the gatekeeper (setup token,
// "not initialized yet", one account); this page only collects the details and explains the result.
const CreateSuperAdminPage = () => {
  const { status, refresh } = useSystemStatus();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Values>({
    initialValues: { fullName: '', email: '', phone: '', setupToken: '' },
    validate: {
      fullName: (v) => (v.trim().length >= 2 ? null : 'Enter your full name.'),
      email,
      phone,
      setupToken: required('Enter the setup token you were given.'),
    },
  });

  if (status.initialized) {
    return (
      <Stack gap="md" role="status">
        <Box
          w={32}
          h={32}
          aria-hidden
          style={{
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            border: '1.5px solid var(--ldg-accent-text)',
            color: 'var(--ldg-accent-text)',
          }}
        >
          <IconShieldCheck size={16} stroke={2.5} />
        </Box>
        <Stack gap={4}>
          <Title order={1}>System Already Initialized</Title>
          <Text size="sm" c="dimmed">
            The initial setup has already been completed. Super Admin creation is no longer
            available.
          </Text>
        </Stack>
        <Button component={Link} to="/login" size="md" h={44} fullWidth>
          Go to sign in
        </Button>
      </Stack>
    );
  }

  const handleSubmit = async (values: Values) => {
    setLoading(true);
    setError(null);
    try {
      await submitSetup({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: digitsOnly(values.phone),
        setupToken: values.setupToken.trim(),
      });
      toNotify(
        'Setup complete',
        'The Super Admin account was created. Its temporary password was emailed; sign in and choose a new one.',
        'SUCCESS',
      );
      navigate('/login', { replace: true });
      void refresh();
    } catch (e) {
      const data = isAxiosError(e)
        ? (e.response?.data as { message?: string; code?: string } | undefined)
        : undefined;
      if (data?.code === 'INVALID_SETUP_TOKEN') {
        form.setFieldError('setupToken', 'The setup token is incorrect.');
      } else if (data?.code === 'SYSTEM_ALREADY_INITIALIZED') {
        await refresh(); // the page switches to "System Already Initialized"
      } else if (data?.code === 'SETUP_DISABLED') {
        setError(
          "Initial setup isn't enabled on this server. Ask your system administrator to configure the setup token.",
        );
      } else {
        setError(data?.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFormShell
      title="Create the Super Admin"
      subtitle="First-time setup. A strong temporary password is generated and emailed to this address."
      onSubmit={form.onSubmit(handleSubmit)}
    >
      {error && (
        <InlineAlert tone="danger" title="Setup failed">
          {error}
        </InlineAlert>
      )}
      <TextInput
        {...touch}
        label="Full name"
        placeholder="Enter your full name"
        withAsterisk
        autoFocus
        autoComplete="name"
        disabled={loading}
        leftSection={<IconUser size={16} aria-hidden />}
        {...form.getInputProps('fullName')}
      />
      <TextInput
        {...touch}
        label="Email address"
        placeholder="name@example.lk"
        withAsterisk
        type="email"
        autoComplete="email"
        disabled={loading}
        description="The temporary password is sent here."
        leftSection={<IconMail size={16} aria-hidden />}
        {...form.getInputProps('email')}
      />
      <TextInput
        {...touch}
        label="Mobile number"
        placeholder="077 123 4567"
        withAsterisk
        inputMode="tel"
        autoComplete="tel"
        disabled={loading}
        leftSection={<IconPhone size={16} aria-hidden />}
        {...form.getInputProps('phone')}
      />
      <PasswordInput
        {...touch}
        label="Setup token"
        placeholder="Enter the setup token"
        withAsterisk
        autoComplete="off"
        disabled={loading}
        description="Provided by your system administrator."
        leftSection={<IconKey size={16} aria-hidden />}
        {...form.getInputProps('setupToken')}
      />
      <AuthSubmitButton loading={loading} loadingLabel="Creating…">
        Create Super Admin
      </AuthSubmitButton>
    </AuthFormShell>
  );
};

export default CreateSuperAdminPage;
