import { useState } from 'react';
import { Box, Button, Group, Stack } from '@mantine/core';
import { IconAlertOctagon, IconRefresh } from '@tabler/icons-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Wordmark } from '@/components/Wordmark';
import { ErrorCard } from './ErrorCard';

const makeReference = () => {
  const hex = () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
  return `ERR-${hex()}-${hex()}`;
};

// Root errorElement: a crash in any route lands here instead of a blank screen.
const RouteErrorPage = () => {
  const error = useRouteError();
  const [report] = useState(() => {
    const ref = makeReference();
    // Logged with the same reference so a screenshot of this page can be matched to the console.
    console.error(`[${ref}]`, error);
    return { ref, at: new Date() };
  });
  const status = isRouteErrorResponse(error) ? error.status : null;

  return (
    <Box mih="100vh" p="md" style={{ background: 'var(--ldg-surface)' }}>
      <Stack align="center" gap="md" maw={620} mx="auto" pt={{ base: 40, sm: 100 }}>
        <Wordmark />
        <Box w="100%">
          <ErrorCard
            tone="danger"
            icon={<IconAlertOctagon size={22} />}
            title="Something went wrong on this page"
            actions={
              <Group gap="xs" justify="center">
                <Button
                  leftSection={<IconRefresh size={16} aria-hidden />}
                  onClick={() => window.location.reload()}
                >
                  Reload page
                </Button>
                <Button component={Link} to="/app/dashboard" variant="default">
                  Back to Dashboard
                </Button>
              </Group>
            }
            footnote={
              <>
                Reference <span className="mono">{report.ref}</span> ·{' '}
                {report.at.toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
                {status ? ` · ${status}` : ''}
              </>
            }
          >
            The page stopped unexpectedly. Records you&apos;ve already saved are safe. Reload to try
            again.
          </ErrorCard>
        </Box>
      </Stack>
    </Box>
  );
};

export default RouteErrorPage;
