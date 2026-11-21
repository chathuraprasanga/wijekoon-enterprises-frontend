import { useState } from 'react';
import { Button } from '@mantine/core';
import { StatusPage } from '@/pages/errors/StatusPage';

// Shown for every route while the system has no Super Admin yet. Deliberately gives no hint about
// how to reach the setup page: that is handed to the person who performs it.
const SystemSetupRequiredPage = ({ onRetry }: { onRetry: () => Promise<void> }) => {
  const [checking, setChecking] = useState(false);
  return (
    <StatusPage
      code="Setup"
      title="System Setup Required"
      actions={
        <Button
          variant="default"
          loading={checking}
          onClick={async () => {
            setChecking(true);
            await onRetry();
            setChecking(false);
          }}
        >
          Check again
        </Button>
      }
    >
      The application has not been initialized. Please contact your system administrator to complete
      the initial setup.
    </StatusPage>
  );
};

export default SystemSetupRequiredPage;
