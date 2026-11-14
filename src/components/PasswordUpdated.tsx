import { Box, Button, Stack, Text, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { AuthSteps } from '@/components/AuthSteps';

// Final recovery state: every step complete, one way forward.
export const PasswordUpdated = () => (
  <Stack gap="md" role="status">
    <AuthSteps current={3} />
    <Box
      w={32}
      h={32}
      aria-hidden
      style={{
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        border: '1.5px solid var(--ldg-success-text)',
        color: 'var(--ldg-success-text)',
      }}
    >
      <IconCheck size={16} stroke={2.5} />
    </Box>
    <Stack gap={4}>
      <Title order={1}>Password updated</Title>
      <Text size="sm" c="dimmed">
        You can now sign in with your new password.
      </Text>
    </Stack>
    <Button component={Link} to="/login" size="md" h={44} fullWidth>
      Back to sign in
    </Button>
  </Stack>
);
